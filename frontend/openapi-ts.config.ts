import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: `http://localhost:8000/api/v1/openapi.json`,
  output: {
    path: "./src/lib/client",
    format: "prettier",
    lint: "eslint",
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
    },
    {
      name: "@hey-api/typescript",
    },
    {
      name: "@tanstack/react-query",
    },
    {
      name: "zod",
      exportFromIndex: true,
    },
    {
      name: "@hey-api/schemas",
      type: "form",
    },
    {
      name: "@hey-api/sdk",
      validator: true,
    },
  ],
});
