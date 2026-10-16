import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests for the pure learning logic (src/lib/learning). UI flows are checked in a real browser.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
