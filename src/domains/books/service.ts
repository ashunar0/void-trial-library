/** The steps for books (How) */
import { err, ok, type Result } from "../../lib/result";
import { DuplicateIsbn, newBookId, type Book, type BookCreateInput, type BookId } from "./model";

export type BooksRepository = {
  /** "isbnTaken" when the ISBN is registered */
  insert(book: Book): Promise<Book | "isbnTaken">;
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
  };
}
