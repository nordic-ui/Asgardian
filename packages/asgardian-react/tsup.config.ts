import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "!src/**/*.test.*", "!src/__tests__"],
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  outExtension: (ctx) => {
    return { js: `.${ctx.format}.js` };
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react"],
  ...options,
}));
