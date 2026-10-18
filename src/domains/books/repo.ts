/**
 * Storage for books. Fulfills the BooksRepository declared in service.ts with D1.
 * Row shapes never leave this file; rows are mapped to the domain Book
 */
import { eq, type db as voidDb } from "void/db";
import { booksTable } from "@schema";
import type { ReadDb } from "../../deps";
import { bookId, type Book } from "./model";
import type { BooksRepository } from "./service";

type Db = typeof voidDb;

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
export const booksWithin = (db: ReadDb) => db.select().from(booksTable).as("books_within");

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

    async update(id, changes, now) {
      const [row] = await db
        .update(booksTable)
        .set({ ...changes, updatedAt: now })
        .where(eq(booksTable.id, id))
        .returning();

      return row ? toBook(row) : null;
    },

    async delete(id) {
      const rows = await db
        .delete(booksTable)
        .where(eq(booksTable.id, id))
        .returning({ id: booksTable.id });

      return rows.length > 0;
    },
  };
}
