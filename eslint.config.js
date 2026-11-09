import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules", "dist", "coverage"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  sonarjs.configs.recommended,
  {
    // Node scripts run by GitHub Actions
    files: [".github/scripts/**/*.js"],
    languageOptions: { globals: { process: "readonly" } },
  }
);
