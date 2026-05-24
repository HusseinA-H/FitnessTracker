import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "dist/stats.html",
      open: process.env.NODE_ENV !== "production",
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
    }),
  ],

resolve: {
  alias: {
    "@": path.resolve(__dirname, "src"),
    "@app": path.resolve(__dirname, "src/app"),
    "@features": path.resolve(__dirname, "src/features"),
    "@shared": path.resolve(__dirname, "src/shared"),
    "@services": path.resolve(__dirname, "src/services"),
    "@data": path.resolve(__dirname, "src/data"),
    "@domain": path.resolve(__dirname, "src/domain"),
  },
},

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ✅ اجبار chunk خاص بالـ Premium Tracker (يبقى واضح في stats)
          if (!id.includes("node_modules")) {
            if (id.includes("/src/features/tracker/")) return "premium-tracker";
            return;
          }

          if (id.includes("firebase")) return "firebase";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("recharts")) return "charts";
          if (id.includes("html2canvas") || id.includes("jspdf"))
            return "exportTools";

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom")
          )
            return "react";

          return "vendor";
        },
      },
    },
  },
});