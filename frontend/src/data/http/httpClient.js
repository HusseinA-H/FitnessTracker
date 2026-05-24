// src/data/http/httpClient.js

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

export async function fetchJsonWithTimeout(
  url,
  options = {}
) {
  const { timeoutMs = 12000, signal, ...fetchOptions } = options;
  const controller = new AbortController();

  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      const err = new Error(
        body?.detail || body?.message || `Request failed with status ${res.status}`
      );
      err.status = res.status;
      err.body = body;
      throw err;
    }

    return body;
  } catch (e) {
    if (e.name === "AbortError") {
      const err = new Error("Request aborted or timed out");
      err.code = "ABORTED";
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

export async function fetchWithRetry(url, options = {}) {
  const {
    retries = 2,
    retryDelayMs = 600,
    timeoutMs = 12000,
    signal,
    ...fetchOptions
  } = options;

  let attempt = 0;
  while (true) {
    try {
      return await fetchJsonWithTimeout(url, { timeoutMs, signal, ...fetchOptions });
    } catch (e) {
      attempt += 1;

      const status = e?.status;
      const retryable = status == null ? true : isRetryableStatus(status);

      if (e.code === "ABORTED" || attempt > retries || !retryable) {
        throw e;
      }

      await sleep(retryDelayMs * attempt);
    }
  }
}