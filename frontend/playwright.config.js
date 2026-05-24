import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  use: {
  baseURL: "http://localhost:5173",
  headless: true,
  trace: "on-first-retry",
  screenshot: "only-on-failure",
  video: "retain-on-failure"
},
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true
  }
});