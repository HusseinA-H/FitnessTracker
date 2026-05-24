import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@data": path.resolve(__dirname, "src/data"),
      "@features": path.resolve(__dirname, "src/features"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@app": path.resolve(__dirname, "src/app"),
      "@services": path.resolve(__dirname, "src/services"),
      "@domain": path.resolve(__dirname, "src/domain"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setupTests.js"],
    globals: true,
    css: true,

    // ✅ أهم سطرين هنا
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "e2e/**",
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.jsx",
        "src/main.tsx",
        "src/**/__tests__/**",
        "src/**/assets/**",
      ],
    },
  },
});