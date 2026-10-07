import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        lucide: "readonly",
        Chart: "readonly",
        InputField: "readonly",
        PasswordToggle: "readonly",
        CheckboxField: "readonly",
        SubmitButton: "readonly",
        initInputField: "readonly",
        initCheckboxField: "readonly",
        initSubmitButton: "readonly",
        initPasswordToggles: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-var": "warn",
      "no-redeclare": "warn",
      "prefer-const": "warn",
    },
  },
  {
    ignores: ["node_modules/", "dist/", "public/"],
  },
];
