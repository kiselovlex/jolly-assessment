import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "jest.config.js", "testTheFlow.ts"]
  },
  { 
    files: ["**/*.{js,mjs,cjs,ts}"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020
      },
      ecmaVersion: 2020,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@stylistic": stylistic
    },
    rules: {
      "strict": ["error", "global"],
      "@stylistic/indent": ["error", 2]
    }
  }
); 