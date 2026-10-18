/**
 * The db for tests: a real local D1 (miniflare), with every migration applied.
 * The one place to change when the app moves to another database
 */
import { readdirSync, readFileSync } from "node:fs";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import { createDb } from "void/db";

const migrations = "db/migrations";

export async function createTestDb() {
  const mf = new Miniflare(
    convertV4MiniflareOptions({ modules: true, script: "export default {}", d1Databases: ["DB"] }),
  );
  const d1 = await mf.getD1Database("DB");
  for (const file of readdirSync(migrations).filter((f) => f.endsWith(".sql")).sort()) {
    for (const statement of readFileSync(`${migrations}/${file}`, "utf8").split("--> statement-breakpoint")) {
      if (statement.trim()) await d1.prepare(statement).run();
    }
  }

  return {
    db: createDb(d1),
    /** Empties every table, so each test starts from nothing */
    async reset() {
      const { results } = await d1
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'")
        .all<{ name: string }>();
      for (const { name } of results) await d1.prepare(`DELETE FROM "${name}"`).run();
    },
    dispose: () => mf.dispose(),
  };
}
