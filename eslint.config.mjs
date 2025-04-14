import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable all rules that typically cause issues in Next.js
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "typescript/no-type-errors": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      // Disable TypeScript type checking in ESLint
      "@typescript-eslint/typedef": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/promise-function-async": "off",
    },
    parserOptions: {
      project: null, // Disable TypeScript type checking
    },
  },
];

export default eslintConfig;
