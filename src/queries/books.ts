/**
 * The reads for /books: the list with the copies that can be lent, and one book.
 * Books are read through booksWithin; the copies out come from loans
 */
import { asc, eq } from "void/db";
import type { ReadDb } from "../deps";
import type { BookId } from "../domains/books/model";
import { booksWithin } from "../domains/books/repo";
import { availableCountOf } from "../domains/loans/model";
import { onLoanByBookWithin } from "../domains/loans/repo";

/** The columns of a book the screens show */
const columnsOf = (books: ReturnType<typeof booksWithin>) => ({
  id: books.id,
  isbn: books.isbn,
  title: books.title,
  author: books.author,
  stock: books.stock,
});

export function booksQueries(db: ReadDb) {
  return {
    /** Every book, oldest first, with how many copies can be lent now */
    async list() {
      const books = booksWithin(db);
      const onLoan = onLoanByBookWithin(db);
      const rows = await db
        .select({ ...columnsOf(books), onLoan: onLoan.onLoan })
        .from(books)
        .leftJoin(onLoan, eq(onLoan.bookId, books.id))
        .orderBy(asc(books.createdAt), asc(books.id));

      return rows.map(({ onLoan, ...book }) => ({
        ...book,
        availableCount: availableCountOf(book.stock, onLoan ?? 0),
      }));
    },

    /** null if absent */
    async get(id: BookId) {
      const books = booksWithin(db);
      const [row] = await db
        .select(columnsOf(books))
        .from(books)
        .where(eq(books.id, id))
        .limit(1);

      return row ?? null;
    },
  };
}
