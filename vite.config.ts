import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";

export default defineConfig({
  // Tests import the domains as plain modules. Void's plugin would start a Worker runtime
  plugins: process.env.VITEST ? [] : [voidPlugin(), voidReact({ react: { compiler: true } })],
  // Void's plugin gives @schema; tests run without it
  resolve: process.env.VITEST
    ? { alias: { "@schema": fileURLToPath(new URL("./db/schema", import.meta.url)) } }
    : {},
  lint: {
    jsPlugins: ["./lint/index.mjs"],
    rules: {
      // The gate: only src/deps.ts takes db. Operators (eq, asc ...) and type imports are free
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "void/db",
              importNames: ["db"],
              allowTypeImports: true,
              message: "Use the services or readDb from src/deps.ts",
            },
          ],
        },
      ],
    },
    overrides: [
      { files: ["src/deps.ts"], rules: { "no-restricted-imports": "off" } },
      // Only the entry points read the clock. Tests may too
      { files: ["src/**"], rules: { "library/no-clock": "error" } },
      { files: ["**/*.test.ts"], rules: { "library/no-clock": "off" } },
    ],
  },
});
