import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import reactPlugin from "eslint-plugin-react";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.js",
    "tools/**",
    "scripts/**",
    "public/**",
  ]),
  {
    plugins: {
      react: reactPlugin
    },
    rules: {
      "no-magic-numbers": ["warn", {
        "ignore": [-1, 0, 1, 2, 3, 4, 8, 16, 24, 32, 64, 100],
        "ignoreArrayIndexes": true,
        "enforceConst": true,
        "detectObjects": false
      }],
      "react/forbid-dom-props": ["warn", { "forbid": ["style"] }],
      "react/forbid-component-props": ["warn", { "forbid": ["style"] }]
    }
  }
]);

export default eslintConfig;
