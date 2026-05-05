//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";

export default [
  {
    ignores: [
      "out/**",
      "release/**",
      "src/routeTree.gen.ts",
      "src/types/database.ts",
      "eslint.config.js",
      "prettier.config.js",
    ],
  },
  ...tanstackConfig,
  {
    rules: {
      "import/consistent-type-specifier-style": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
];
