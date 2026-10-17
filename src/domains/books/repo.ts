/**
 * Storage for books. Fulfills the BooksRepository declared in service.ts with D1.
 * Row shapes never leave this file; rows are mapped to the domain Book
 */
// Type only: void/db is generated from db/schema.ts, which imports this file. A value import is a cycle
import type { db as voidDb } from "void/db";
import { integer, sqliteTable, text, uniqueIndex } from "void/schema-d1";
import { bookId, type Book } from "./model";
import type { BooksRepository } from "./service";

type Db = typeof voidDb;

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

type BookRow = typeof booksTable.$inferSelect;

/** Row → thing */
const toBook = (row: BookRow): Book => ({
  id: bookId(row.id),
  isbn: row.isbn,
  title: row.title,
  author: row.author,
  stock: row.stock,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

/** D1 reports a unique violation only in the message */
const isIsbnTaken = (error: unknown) =>
  String((error as { cause?: unknown })?.cause ?? error).includes(
    "UNIQUE constraint failed: books.isbn",
  );

/** Every book, as a table to read */
export const booksWithin = (db: Db) => db.select().from(booksTable).as("books_within");

export function booksRepository(db: Db): BooksRepository {
  return {
    async insert(book) {
      try {
        const [row] = await db.insert(booksTable).values(book).returning();
        if (!row) throw new Error(`book ${book.id} was not returned after insert`);

        return toBook(row);
      } catch (error) {
        if (isIsbnTaken(error)) return "isbnTaken";
        throw error;
      }
    },
  };
}
