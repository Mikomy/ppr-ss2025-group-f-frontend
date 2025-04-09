import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig({
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
  overrides: [
    {
      files: ["**/*.{js,mjs,cjs,ts}"],
      plugins: { js },
      extends: ["js/recommended"],
      languageOptions: {
        globals: globals.browser,
      },
    },
    tseslint.configs.recommended,
  ],
});
