import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  esbuild: {
    include: /\.[jt]sx?$/,
    exclude: [],
    jsx: "automatic",
    loader: "jsx",
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["tests/component/**", "jsdom"]],
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.*", "tests/component/**/*.test.*"],
    exclude: ["tests/e2e/**"],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
