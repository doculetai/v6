import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@phosphor-icons/react",
              message:
                "Import from '@/components/icons' instead. Direct Phosphor imports break React Server Components.",
            },
            {
              name: "@phosphor-icons/react/dist/ssr",
              message:
                "Import from '@/components/icons' instead. The barrel re-export ensures a single import path.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/icons.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
