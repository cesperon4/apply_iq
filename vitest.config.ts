import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Avoid loading root postcss.config.mjs (Tailwind v4) during tests — not needed for lib tests.
  css: {
    postcss: {
      plugins: [],
    },
  },
});
