/** The steps for books (How) */
import { NotFound } from "../../lib/failures";
import { err, ok, type Result } from "../../lib/result";
import {
  DuplicateIsbn,
  newBookId,
  type Book,
  type BookCreateInput,
  type BookId,
  type BookUpdateInput,
} from "./model";

export type BooksRepository = {
  /** "isbnTaken" when the ISBN is registered */
  insert(book: Book): Promise<Book | "isbnTaken">;
  /** null if absent */
  update(
    id: BookId,
    changes: Partial<Pick<Book, "title" | "author" | "stock">>,
    now: Date,
  ): Promise<Book | null>;
  /** false if absent */
  delete(id: BookId): Promise<boolean>;
};

export function booksService(repo: BooksRepository) {
  return {
    async create(
      input: BookCreateInput,
      now: Date,
    ): Promise<Result<BookId, typeof DuplicateIsbn.code>> {
      const inserted = await repo.insert({
        id: newBookId(),
        ...input,
        createdAt: now,
        updatedAt: now,
      });
      if (inserted === "isbnTaken") return err(DuplicateIsbn.code);

      return ok(inserted.id);
    },

    async update(
      id: BookId,
      input: BookUpdateInput,
      now: Date,
    ): Promise<Result<void, typeof NotFound.code>> {
      const updated = await repo.update(id, input, now);
      if (updated === null) return err(NotFound.code);

      return ok(undefined);
    },

    async remove(id: BookId): Promise<Result<void, typeof NotFound.code>> {
      if (!(await repo.delete(id))) return err(NotFound.code);

      return ok(undefined);
    },
  };
}
