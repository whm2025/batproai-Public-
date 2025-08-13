import js from "@eslint/js";
import pluginImport from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
    },
  },
  {
    plugins: { import: pluginImport },
    rules: {
      "import/order": ["warn", { "newlines-between": "always" }],
    },
  },
];
