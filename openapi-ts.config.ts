import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi-spec.json",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./src/client/generated",
  },
  plugins: [
    "@hey-api/client-axios",
    "@hey-api/schemas",
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    {
      enums: "javascript",
      name: "@hey-api/typescript",
    },
    {
      name: "@hey-api/sdk",
      transformer: true,
    },
  ],
});
