import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "dist/**",
    "coverage/**",
    ".worktrees/**",
    ".superpowers/**",
    "node_modules/**",
    "test-results/**",
    "playwright-report/**",
    "blob-report/**",
  ]),
  {
    files: ["**/*.ts"],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },
  {
    files: ["src/game/domain/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "window", message: "Domain code cannot access browser globals." },
        { name: "document", message: "Domain code cannot access browser globals." },
        { name: "localStorage", message: "Domain code cannot access storage." },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "phaser",
                "phaser/*",
                "**/app/**",
                "**/rendering/**",
                "**/ui/**",
                "**/infrastructure/**",
                "**/storage/**"
              ],
              message: "Domain code must remain framework and adapter independent."
            }
          ]
        }
      ]
    }
  }
);
