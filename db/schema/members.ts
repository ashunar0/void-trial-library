import { integer, sqliteTable, text, uniqueIndex } from "void/schema-d1";

export const membersTable = sqliteTable(
  "members",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("members_email").on(t.email)],
);
