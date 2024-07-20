import eslint from "@eslint/js";
import tslint from "typescript-eslint";

export default tslint.config(
  {
    ignores: ["**/eslint.config.mjs", "**/dist/**"],
  },
  eslint.configs.recommended,
  {
    name: "TypeScript Source Files",
    plugins: {
      "@typescript-eslint": tslint.plugin,
    },
    languageOptions: {
      parser: tslint.parser,
    },
    rules: {
      "class-methods-use-this": ["off"],
      "import/no-named-as-default": ["off"],
      "jest/no-deprecated-functions": ["off"],
    },
  },
  {
    name: "JavaScript Configuration Files",
    files: ["**/*.{cjs,js,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
);
