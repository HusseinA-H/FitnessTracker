import { API_BASE_URL } from "./config";

import { getAccessToken, hasRefreshToken, refreshTokens } from "@data/auth/authSession";
import { fetchWithRetry } from "@data/http/httpClient";


const MAX_AUTH_RETRY = 1;
const requestQueue = [];
let isRefreshing = false;

function enqueueRequest(callback) {
  requestQueue.push(callback);
}

function flushQueue(error, token) {
  while (requestQueue.length) {
    const callback = requestQueue.shift();
    callback(error, token);
  }
}

/**
 * Reusable client for communicating with the Django backend API.
 * Injects JWT Access Token and intercepts 401 Unauthorized to refresh session.
 */
async function request(endpoint, { method = "GET", body = null, headers = {}, ...customOptions } = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const accessToken = getAccessToken();
  const requestHeaders = {
    ...headers,
  };

  // Skip JSON content type if uploading FormData (browser sets boundary)
  if (!(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const fetchOptions = {
    ...customOptions,
    method,
    headers: requestHeaders,
  };

  if (body) {
    fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetchWithRetry(url, fetchOptions);
    return response;
  } catch (err) {
    if (err.status !== 401 || !hasRefreshToken()) {
      throw err;
    }

    const attempts = Number(customOptions.__authRetryCount || 0);
    if (attempts >= MAX_AUTH_RETRY) {
      throw err;
    }

    return new Promise((resolve, reject) => {
      enqueueRequest(async (refreshError, freshToken) => {
        if (refreshError) {
          reject(refreshError);
          return;
        }

        try {
          const retryHeaders = {
            ...fetchOptions.headers,
            Authorization: `Bearer ${freshToken}`,
          };
          const retryRes = await fetchWithRetry(url, {
            ...fetchOptions,
            headers: retryHeaders,
            __authRetryCount: attempts + 1,
          });
          resolve(retryRes);
        } catch (retryErr) {
          reject(retryErr);
        }
      });

      if (!isRefreshing) {
        isRefreshing = true;
        const doRefresh = async () => {
          try {
            const tokens = await refreshTokens();
            flushQueue(null, tokens.access);
          } catch (refreshErr) {
            flushQueue(refreshErr);
          } finally {
            isRefreshing = false;
          }
        };
        doRefresh().catch((err) => {
          console.error("Token refresh failed:", err);
        });
      }
    });
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PUT", body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};
