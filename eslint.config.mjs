import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import reactPlugin from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";

// eslint-config-next/core-web-vitals[0] registers "jsx-a11y" plugin with 6 rules.
// We inject additional recommended rules directly into that config entry.
const nextBase = [...nextVitals];
if (nextBase[0]?.plugins?.["jsx-a11y"]) {
  nextBase[0] = {
    ...nextBase[0],
    rules: {
      ...nextBase[0].rules,
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-static-element-interactions": "error",
    },
  };
}

const eslintConfig = defineConfig([
  ...nextBase,
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
      react: reactPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      // Let unused-imports handle import removal (auto-fixable)
      "unused-imports/no-unused-imports": "warn",
      // Prefix unused vars with _ to suppress (non-import vars only)
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "ignoreRestSiblings": true,
      }],
      "no-magic-numbers": "off",
      "react/forbid-dom-props": ["warn", { "forbid": ["style"] }],
      "react/forbid-component-props": ["warn", { "forbid": ["style"] }]
    }
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);

export default eslintConfig;
