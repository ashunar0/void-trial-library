import { integer, sqliteTable, text, uniqueIndex } from "void/schema-d1";

export const booksTable = sqliteTable(
  "books",
  {
    id: text("id").primaryKey(),
    isbn: text("isbn").notNull(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    stock: integer("stock").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("books_isbn").on(t.isbn)],
);
