import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.jsx", "**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      react,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],

      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      camelcase: ["error", { properties: "always" }],
      "no-duplicate-imports": "error",

      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",

      "no-alert": "warn",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-redeclare": "error",

      complexity: ["warn", 20],
      "max-depth": ["warn", 5],
      "max-lines-per-function": ["warn", 400],
      "max-params": ["warn", 10],
    },
  },

  {
    files: ["**/config/**/*.js"],
    rules: {
      "no-magic-numbers": "off",
    },
  },

  {
    files: ["**/*.jsx"],
    rules: {
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^React$|^[A-Z]|^a$",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
];
