import { defineConfig } from "vite";
import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";

export default defineConfig({
  plugins: [
    voidPlugin(),
    voidReact({ react: { compiler: true } }),
  ],
  lint: {
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
    overrides: [{ files: ["src/deps.ts"], rules: { "no-restricted-imports": "off" } }],
  },
});
