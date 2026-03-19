import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "index.ts",
  clean: true, // FYI: doesn't work (https://github.com/rolldown/tsdown/issues/843)
  fixedExtension: false,
  format: {
    esm: {
      outDir: "esm/",
    },
    cjs: {
      outDir: "cjs/",
    },
  },
});
