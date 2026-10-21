import { defineHandler } from "void/handler";
import { bookQueries, books } from "../../src/deps";
import { bookCreateSchema, DuplicateIsbn } from "../../src/domains/books/model";
import { fieldError } from "../../src/lib/field-error";

export const loader = defineHandler(async () => ({ books: await bookQueries.list() }));

export const action = defineHandler.withValidator({ body: bookCreateSchema })(async (
  _c,
  { body },
) => {
  const created = await books.create(body, new Date());
  if (!created.ok)
    throw fieldError(created.error, { DUPLICATE_ISBN: { isbn: DuplicateIsbn.message } });
});
