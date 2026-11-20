import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "test-results/", "playwright-report/", "metrics-site/", ".agent-trust/", ".claude/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { rules: { "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }] } },
  { files: ["public/**/*.js"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.ts", "**/*.js", "**/*.mjs", "**/*.cjs"], ignores: ["public/**"], languageOptions: { globals: globals.node } },
);
