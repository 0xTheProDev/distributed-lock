import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";
import tslint from "typescript-eslint";
import unusedImportPlugin from "eslint-plugin-unused-imports";

export default tslint.config(
  {
    ignores: ["**/eslint.config.mjs", "**/dist/**"],
  },
  eslint.configs.recommended,
  ...tslint.configs.strict,
  {
    name: "TypeScript Source Files",
    plugins: {
      "@typescript-eslint": tslint.plugin,
      import: importPlugin,
      "unused-imports": unusedImportPlugin,
    },
    languageOptions: {
      parser: tslint.parser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "class-methods-use-this": "off",
      "import/no-named-as-default": "off",
    },
  },
  {
    name: "JavaScript Configuration Files",
    files: ["**/*.{cjs,js,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        module: "readonly",
        process: "readonly",
      },
    },
  },
  prettierConfig,
);
