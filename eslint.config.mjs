import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "dist/**", "src/client/generated"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
      import: pluginImport,
    },
    rules: {
      "prettier/prettier": "error",
      indent: ["error", "tab", { SwitchCase: 1 }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      // Import plugin rules - simplified for now
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["sibling", "parent"],
            "index",
            "unknown",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        node: "readonly",
        jest: "readonly",
      },
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
  // Special rules for test files
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintConfigPrettier
);
