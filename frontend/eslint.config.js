import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";
import promise from "eslint-plugin-promise";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
    "test-results",
    "playwright-report",
  ]),

  // ==============================
  // ✅ Config / Node files
  // ==============================
  {
    files: [
      "*.config.{js,mjs,cjs}",
      "eslint.config.js",
      "vite.config.{js,mjs,cjs}",
      "vitest.config.{js,mjs,cjs}",
      "playwright.config.{js,mjs,cjs}",
      "playwright.local.config.{js,mjs,cjs}",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "import/order": "off",
      "import/no-unresolved": "off",
      "no-console": "off",
    },
  },

  // ==============================
  // ✅ App Code
  // ==============================
  {
    files: ["src/**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      importPlugin.flatConfigs.recommended,
      promise.configs["flat/recommended"],
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    settings: {
      react: { version: "detect" },

      // ✅ Vite aliases resolver
      "import/resolver": {
        alias: {
          map: [
            ["@", "./src"],
            ["@app", "./src/app"],
            ["@features", "./src/features"],
            ["@shared", "./src/shared"],
            ["@data", "./src/data"],
            ["@domain", "./src/domain"],
          ],
          extensions: [".js", ".jsx", ".json", ".png", ".jpg", ".jpeg", ".svg"],
        },
        node: true,
      },
    },

    plugins: {
      "unused-imports": unusedImports,
    },

    rules: {
      // ==============================
      // Clean Code
      // ==============================
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // ==============================
      // React
      // ==============================
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": "warn",

      // ==============================
      // Imports
      // ==============================
      "import/no-unresolved": [
        "error",
        {
          ignore: ["\\.png$", "\\.jpg$", "\\.jpeg$", "\\.svg$"],
        },
      ],

      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      "promise/param-names": "off",

      // ==============================
      // 🚀 Architecture Rules
      // ==============================

      // ❌ منع feature → feature مباشرة
      "no-restricted-imports": [
        "error",
        {
         patterns: [
  {
    group: [
      "@features/*/*",
      "@features/*/*/*",
      "@features/*/*/*/*",
      "../features/*/*",
      "../../features/*/*",
    ],
    message:
      "Do not import feature internals. Import from the feature public API (e.g. @features/auth).",
  },
],
        },
      ],

      // ❌ shared لازم يبقى مستقل
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/shared",
              from: ["./src/app", "./src/features"],
              message:
                "Shared layer must stay independent. Do not import app/features into shared.",
            },
            {
              target: "./src/data",
              from: ["./src/app", "./src/features", "./src/shared"],
              message:
                "Data layer is infrastructure only. Do not import UI layers into data.",
            },
          ],
        },
      ],
    },
  },

  // ==============================
  // ✅ Context override
  // ==============================
  {
    files: ["src/**/context/**/*.{js,jsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  // ==============================
  // ✅ Tests / E2E
  // ==============================
  {
    files: ["**/*.{test,spec}.{js,jsx}", "e2e/**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "import/no-unresolved": "off",
      "no-unused-expressions": "off",
    },
  },
]);