// @ts-check

import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  tseslint.configs.strictTypeChecked,
  {
    ignores: ["esm/**", "cjs/**"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "eslint.config.ts",
            "tsdown.config.ts",
            "test.ts",
          ],
        },
      },
    },
  },
);
