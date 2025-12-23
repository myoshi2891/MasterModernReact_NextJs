import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  esbuild: {
    include: /\.[jt]sx?$/,
    jsx: "automatic",
    loader: "jsx",
  },
  test: {
    setupFiles: ["./tests/setup.ts"],
    exclude: ["tests/e2e/**"],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.*"],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["tests/component/**/*.test.*"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
