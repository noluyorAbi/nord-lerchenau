import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    // Local tooling caches (gitignored), not part of the app:
    ".remember/**",
    "graphify-out/**",
    // Remotion workspace for the admin tutorial video: own package.json, own
    // eslint config, own dependencies. Not part of the Next app.
    "video/**",
  ]),
]);

export default eslintConfig;
