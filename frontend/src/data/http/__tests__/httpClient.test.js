// src/data/http/__tests__/httpClient.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { fetchJsonWithTimeout, fetchWithRetry } from "../httpClient";

function makeResponse({ ok, status, jsonData, jsonThrows = false }) {
  return {
    ok,
    status,
    json: jsonThrows
      ? vi.fn().mockRejectedValue(new Error("Invalid JSON"))
      : vi.fn().mockResolvedValue(jsonData),
  };
}

describe("httpClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // تنظيف أفضل لتجنب أي آثار جانبية بين التستات
    try {
      vi.runOnlyPendingTimers();
    } catch {
      // لو مش شغالين fake timers في التست ده، ignore
    }
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("fetchJsonWithTimeout", () => {
    it("returns parsed JSON when response is ok", async () => {
      const data = { hello: "world" };

      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(makeResponse({ ok: true, status: 200, jsonData: data }))
      );

      const result = await fetchJsonWithTimeout("https://example.com");
      expect(result).toEqual(data);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("throws an error with status/body when response is not ok (with JSON body)", async () => {
      const body = { message: "Server says no" };

      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(makeResponse({ ok: false, status: 500, jsonData: body }))
      );

      await expect(fetchJsonWithTimeout("https://example.com")).rejects.toMatchObject({
        status: 500,
        body,
      });
    });

    it("throws ABORTED when request times out", async () => {
      vi.useFakeTimers();

      // fetch never resolves; rejects with AbortError when signal aborts
      vi.stubGlobal(
        "fetch",
        vi.fn((url, { signal }) => {
          return new Promise((resolve, reject) => {
            if (signal?.aborted) {
              const err = new Error("Aborted");
              err.name = "AbortError";
              reject(err);
              return;
            }

            signal?.addEventListener(
              "abort",
              () => {
                const err = new Error("Aborted");
                err.name = "AbortError";
                reject(err);
              },
              { once: true }
            );
          });
        })
      );

      const p = fetchJsonWithTimeout("https://example.com", { timeoutMs: 10 });

      // ✅ اربط الـ rejection handler قبل ما تحرك الوقت
      const assertion = expect(p).rejects.toMatchObject({
        code: "ABORTED",
        message: "Request aborted or timed out",
      });

      await vi.advanceTimersByTimeAsync(10);
      await assertion;

      // ✅ فلّش أي تايمرز/مهام لسه معلقة
      await vi.runOnlyPendingTimersAsync();
    });
  });

  describe("fetchWithRetry", () => {
    it("retries on retryable status (500) then succeeds", async () => {
      vi.useFakeTimers();

      const okData = { ok: true };

      // First call -> 500, Second call -> 200
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce(
            makeResponse({ ok: false, status: 500, jsonData: { message: "fail" } })
          )
          .mockResolvedValueOnce(makeResponse({ ok: true, status: 200, jsonData: okData }))
      );

      const promise = fetchWithRetry("https://example.com", {
        retries: 2,
        retryDelayMs: 100,
        timeoutMs: 1000,
      });

      // sleep uses setTimeout -> advance time enough for first retry delay (100 * attempt=1)
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;

      expect(result).toEqual(okData);
      expect(fetch).toHaveBeenCalledTimes(2);

      await vi.runOnlyPendingTimersAsync();
    });

    it("does NOT retry on non-retryable status (400)", async () => {
      vi.useFakeTimers();

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          makeResponse({ ok: false, status: 400, jsonData: { message: "bad request" } })
        )
      );

      // (اختياري) هنا مفيش تايمرز، بس مش هتضر
      const assertion = expect(
        fetchWithRetry("https://example.com", { retries: 3, retryDelayMs: 50 })
      ).rejects.toMatchObject({ status: 400 });

      await assertion;

      expect(fetch).toHaveBeenCalledTimes(1);
      await vi.runOnlyPendingTimersAsync();
    });

    it("retries up to retries count then throws if still failing", async () => {
      vi.useFakeTimers();

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          makeResponse({ ok: false, status: 500, jsonData: { message: "still failing" } })
        )
      );

      const p = fetchWithRetry("https://example.com", {
        retries: 2, // total attempts = 1 initial + 2 retries = 3 fetch calls
        retryDelayMs: 100,
        timeoutMs: 1000,
      });

      // ✅ اربط الـ handler بدري قبل ما تحرك الوقت
      const assertion = expect(p).rejects.toMatchObject({ status: 500 });

      // attempt 1 -> delay 100
      await vi.advanceTimersByTimeAsync(100);
      // attempt 2 -> delay 200
      await vi.advanceTimersByTimeAsync(200);

      await assertion;
      expect(fetch).toHaveBeenCalledTimes(3);

      await vi.runOnlyPendingTimersAsync();
    });
  });
});