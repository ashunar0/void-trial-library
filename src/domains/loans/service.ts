/** The steps for loans (How) */
import { NotFound } from "../../lib/failures";
import { err, ok, type Result } from "../../lib/result";
import {
  AlreadyBorrowed,
  AlreadyReturned,
  dueOnOf,
  MemberHasOverdue,
  newLoanId,
  OutOfStock,
  todayOf,
  type Loan,
  type LoanId,
} from "./model";

export type LoansRepository = {
  /** null if absent */
  find(id: LoanId): Promise<Loan | null>;
  /** "alreadyBorrowed" when the member has this book out already, even if another request got there first */
  insert(loan: Loan): Promise<Loan | "alreadyBorrowed">;
  /** Gives the book back, only if it is still out: one statement. null if absent or already returned */
  markReturned(id: LoanId, returnedOn: string): Promise<Loan | null>;
  hasOverdue(memberId: string, today: string): Promise<boolean>;
  hasOut(memberId: string, bookId: string): Promise<boolean>;
  countOutOfBook(bookId: string): Promise<number>;
};

/**
 * What a loan is decided from: the member who borrows, and the book with the copies it has.
 * Both belong to other domains, so the entry point reads them and hands them in
 */
export type Borrowing = {
  member: { id: string };
  book: { id: string; stock: number };
};

export function loansService(repo: LoansRepository) {
  return {
    /**
     * Lends a book. The first rule broken is the one returned, in the same order every time:
     * overdue → same book twice → stock
     */
    async create(
      { member, book }: Borrowing,
      now: Date,
    ): Promise<
      Result<
        LoanId,
        typeof MemberHasOverdue.code | typeof AlreadyBorrowed.code | typeof OutOfStock.code
      >
    > {
      const today = todayOf(now);

      if (await repo.hasOverdue(member.id, today)) return err(MemberHasOverdue.code);
      if (await repo.hasOut(member.id, book.id)) return err(AlreadyBorrowed.code);
      if ((await repo.countOutOfBook(book.id)) >= book.stock) return err(OutOfStock.code);

      const inserted = await repo.insert({
        id: newLoanId(),
        memberId: member.id,
        bookId: book.id,
        loanedOn: today,
        dueOn: dueOnOf(today),
        returnedOn: null,
      });
      if (inserted === "alreadyBorrowed") return err(AlreadyBorrowed.code);

      return ok(inserted.id);
    },

    /** Takes a book back. Always possible while it is out, even for an overdue member */
    async returnBook(
      id: LoanId,
      now: Date,
    ): Promise<Result<void, typeof NotFound.code | typeof AlreadyReturned.code>> {
      const found = await repo.find(id);
      if (found === null) return err(NotFound.code);
      if (found.returnedOn !== null) return err(AlreadyReturned.code);

      // Another request may have returned it between the find and here: the same answer
      if ((await repo.markReturned(id, todayOf(now))) === null) return err(AlreadyReturned.code);

      return ok(undefined);
    },
  };
}
