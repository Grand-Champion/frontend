import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default [
    includeIgnoreFile(gitignorePath),

    // ESLint built-in recommended rules
    js.configs.recommended,

    // TypeScript rules (balanced, not strict)
    ...ts.configs.recommendedTypeChecked,
    ...ts.configs.stylistic,

    // Svelte recommended rules
    ...svelte.configs["flat/recommended"],

    // Disable all Prettier-conflicting rules
    prettierConfig,

    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                project: "./tsconfig.json",
                extraFileExtensions: [".svelte"]
            }
        },

        rules: {
            // ============================
            // JS / TS GOOD PRACTICES
            // ============================

            "no-var": "error",
            "prefer-const": "warn",
            "no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],

            // ============================
            // RELAXED RULES (remove noise)
            // ============================

            indent: "off", // Prettier handles this
            "no-mixed-spaces-and-tabs": "off",

            // TypeScript noise reducers
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/explicit-function-return-type": "off",

            // Balanced unused vars
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
            ],

            // ============================
            // SVELTE RULE TWEAKS
            // ============================

            "svelte/no-target-blank": "warn",
            "svelte/no-reactive-reassign": "warn",
            "svelte/no-unused-svelte-ignore": "warn",

            // ============================
            // OPTIONAL NOISE REDUCTIONS
            // ============================

            curly: ["warn", "multi-line"],
            "sort-imports": "off"
        }
    },

    // Svelte parser setup
    {
  files: ["**/*.svelte"],
  languageOptions: {
    parser: svelte.parser,
    parserOptions: {
      parser: ts.parser // Use TypeScript parser for script tags
    }
  }
}
];