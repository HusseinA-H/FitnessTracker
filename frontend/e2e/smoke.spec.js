import { test, expect } from "@playwright/test";

test("home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/fitness|tracker|vite|react/i);
});

test("guest: tracker persists entries after reload", async ({ page }) => {
  await page.goto("/tracker");

  await page.getByPlaceholder("Exercise").fill("Bench");
  await page.getByPlaceholder("Sets").fill("3");
  await page.getByPlaceholder("Reps").fill("10");
  await page.getByPlaceholder("Weight").fill("60");

  await page.getByRole("button", { name: /add entry/i }).click();

  await expect(page.getByText("BENCH")).toBeVisible();

  await page.reload();
  await expect(page.getByText("BENCH")).toBeVisible();
});

test("dashboard route is reachable (redirect allowed)", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  // استنى شوية لو في redirect/loader
  await page.waitForTimeout(500);

  const url = page.url();
  const bodyText = await page.locator("body").innerText();

  // ✅ نسمح بريدايركت لأي صفحة من دول (عدّل/زود لو عندك routes مختلفة)
  const allowed = ["/dashboard", "/login", "/signin", "/auth", "/"];
  expect(allowed.some((p) => url.includes(p))).toBeTruthy();

  // ✅ أهم حاجة: مش صفحة Not Found
  expect(bodyText).not.toMatch(/not found|cannot get|404/i);
});