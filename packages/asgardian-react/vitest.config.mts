import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    dir: "./",
    globals: true,
    // silent: true, // Disable console logs
    passWithNoTests: true,
    typecheck: {
      tsconfig: "./tsconfig.json",
    },
    environment: "jsdom",
    mockReset: true,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
    setupFiles: "./tests/setup.ts",
  },
});
