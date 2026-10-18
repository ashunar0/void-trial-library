import { defineHandler, ValidationError } from "void/handler";
import { asc, eq } from "void/db";
import { books, readDb } from "../../src/deps";
import { bookCreateSchema, DuplicateIsbn } from "../../src/domains/books/model";
import { booksWithin } from "../../src/domains/books/repo";
import { onLoanByBookWithin } from "../../src/domains/loans/repo";

export const loader = defineHandler(async () => {
  const within = booksWithin(readDb);
  const onLoan = onLoanByBookWithin(readDb);
  const rows = await readDb
    .select({
      id: within.id,
      isbn: within.isbn,
      title: within.title,
      author: within.author,
      stock: within.stock,
      onLoan: onLoan.onLoan,
    })
    .from(within)
    .leftJoin(onLoan, eq(onLoan.bookId, within.id))
    .orderBy(asc(within.createdAt), asc(within.id));

  return {
    books: rows.map(({ onLoan, ...book }) => ({
      ...book,
      availableCount: book.stock - (onLoan ?? 0),
    })),
  };
});

export const action = defineHandler.withValidator({ body: bookCreateSchema })(async (
  _c,
  { body },
) => {
  const created = await books.create(body, new Date());
  if (!created.ok) throw new ValidationError({ isbn: DuplicateIsbn.message });
});
