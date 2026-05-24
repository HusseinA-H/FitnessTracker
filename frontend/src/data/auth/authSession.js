// src/data/auth/authSession.js
import { API_BASE_URL, ENDPOINTS } from "@data/api/config";
import { fetchJsonWithTimeout } from "@data/http/httpClient";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const AUTH_EVENT_KEY = "fitness_tracker_auth_event";
const AUTH_CHANNEL_NAME = "fitness_tracker_auth";
const REFRESH_COOLDOWN_MS = 8000;

const listeners = new Set();
const instanceId =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `auth_${Math.random().toString(36).slice(2)}`;

let channel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
  channel.addEventListener("message", (event) => {
    handleExternalEvent(event?.data);
  });
}

function notify(event) {
  listeners.forEach((listener) => listener(event));
}

function handleExternalEvent(event) {
  if (!event || event.senderId === instanceId) return;
  notify({ ...event, source: "external" });
}

function broadcast(event) {
  const payload = {
    ...event,
    senderId: instanceId,
    ts: Date.now(),
  };

  notify({ ...payload, source: "local" });

  try {
    channel?.postMessage(payload);
  } catch {
    // ignore broadcast channel errors
  }

  try {
    localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== AUTH_EVENT_KEY || !event.newValue) return;
    try {
      handleExternalEvent(JSON.parse(event.newValue));
    } catch {
      // ignore invalid payloads
    }
  });
}

export function subscribeAuthEvents(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function hasRefreshToken() {
  return Boolean(getRefreshToken());
}

export function setTokens(tokens, { context = "update" } = {}) {
  const { access, refresh } = tokens || {};
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  broadcast({ type: "tokens_updated", context });
}

export function clearTokens(reason = "manual") {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  broadcast({ type: "logout", reason });
}

let refreshPromise = null;
let refreshCooldownUntil = 0;

export async function refreshTokens({ force = false } = {}) {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    const err = new Error("Missing refresh token");
    err.code = "NO_REFRESH_TOKEN";
    throw err;
  }

  const now = Date.now();
  if (!force && now < refreshCooldownUntil) {
    const err = new Error("Refresh cooldown active");
    err.code = "REFRESH_COOLDOWN";
    throw err;
  }

  refreshPromise = (async () => {
    refreshCooldownUntil = Date.now() + REFRESH_COOLDOWN_MS;
    const refreshUrl = `${API_BASE_URL}${ENDPOINTS.auth.refresh}`;

    const response = await fetchJsonWithTimeout(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = response?.data || response;
    const newAccess = data?.access;
    const newRefresh = data?.refresh || refreshToken;

    if (!newAccess) {
      const err = new Error("Refresh response missing access token");
      err.code = "INVALID_REFRESH_RESPONSE";
      throw err;
    }

    setTokens({ access: newAccess, refresh: newRefresh }, { context: "refresh" });
    return { access: newAccess, refresh: newRefresh };
  })();

  try {
    return await refreshPromise;
  } catch (err) {
    const status = err?.status;
    if (status === 401 || status === 403) {
      clearTokens("refresh_failed");
    }
    broadcast({ type: "refresh_failed", reason: err?.message || "refresh_failed" });
    throw err;
  } finally {
    refreshPromise = null;
  }
}
