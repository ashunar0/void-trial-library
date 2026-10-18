import { defineHandler } from "void";
import { eq } from "void/db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { books, readDb } from "../../src/deps";
import { bookIdSchema, bookUpdateSchema } from "../../src/domains/books/model";
import { booksWithin } from "../../src/domains/books/repo";

const params = z.object({ id: bookIdSchema });

// Not withValidator: its type keeps Promise and Response, so InferProps breaks
export const loader = defineHandler(async (c) => {
  const parsed = params.safeParse(c.req.param());
  if (!parsed.success) return c.notFound();

  const within = booksWithin(readDb);
  const [book] = await readDb
    .select({
      id: within.id,
      isbn: within.isbn,
      title: within.title,
      author: within.author,
      stock: within.stock,
    })
    .from(within)
    .where(eq(within.id, parsed.data.id))
    .limit(1);
  if (!book) return c.notFound();

  return { book };
});

export const actions = {
  update: defineHandler.withValidator({ params, body: bookUpdateSchema })(
    async (_c, { params, body }) => {
      const updated = await books.update(params.id, body, new Date());
      if (!updated.ok) throw new HTTPException(404);
    },
  ),

  delete: defineHandler.withValidator({ params })(async (c, { params }) => {
    const removed = await books.remove(params.id);
    if (!removed.ok) throw new HTTPException(404);

    // Void carries the request query into a redirect (here "?delete"). A trailing "?" drops it
    return c.redirect("/books?");
  }),
};
