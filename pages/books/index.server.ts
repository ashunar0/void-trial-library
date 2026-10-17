import { defineHandler, ValidationError } from "void/handler";
import { asc, db } from "void/db";
import { books } from "../../src/deps";
import { bookCreateSchema, DuplicateIsbn } from "../../src/domains/books/model";
import { booksWithin } from "../../src/domains/books/repo";

export const loader = defineHandler(async () => {
  const within = booksWithin(db);
  const rows = await db
    .select({
      id: within.id,
      isbn: within.isbn,
      title: within.title,
      author: within.author,
      stock: within.stock,
    })
    .from(within)
    .orderBy(asc(within.createdAt), asc(within.id));

  return { books: rows };
});

export const action = defineHandler.withValidator({ body: bookCreateSchema })(
  async (_c, { body }) => {
    const created = await books.create(body, new Date());
    if (!created.ok) throw new ValidationError({ isbn: DuplicateIsbn.message });
  },
);
