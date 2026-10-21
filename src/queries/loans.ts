/**
 * The reads for /loans: the list, the choices of the lending form,
 * and the member and the book a loan is decided from (they belong to other domains)
 */
import { asc, desc, eq } from "void/db";
import type { ReadDb } from "../deps";
import { booksWithin } from "../domains/books/repo";
import { isOverdue } from "../domains/loans/model";
import { loansWithin } from "../domains/loans/repo";
import type { Borrowing } from "../domains/loans/service";
import { membersWithin } from "../domains/members/repo";

export function loansQueries(db: ReadDb) {
  return {
    /** Every loan, newest first, with the titles and names to show. today decides overdue */
    async list(today: string) {
      const loans = loansWithin(db);
      const books = booksWithin(db);
      const members = membersWithin(db);
      const rows = await db
        .select({
          id: loans.id,
          loanedOn: loans.loanedOn,
          dueOn: loans.dueOn,
          returnedOn: loans.returnedOn,
          bookTitle: books.title,
          memberName: members.name,
        })
        .from(loans)
        .innerJoin(books, eq(books.id, loans.bookId))
        .innerJoin(members, eq(members.id, loans.memberId))
        .orderBy(desc(loans.loanedOn), desc(loans.id));

      return rows.map((row) => ({ ...row, overdue: isOverdue(row, today) }));
    },

    /** The choices of the lending form */
    async choices() {
      const members = membersWithin(db);
      const books = booksWithin(db);
      const [memberChoices, bookChoices] = await Promise.all([
        db
          .select({ id: members.id, name: members.name })
          .from(members)
          .orderBy(asc(members.createdAt)),
        db.select({ id: books.id, title: books.title }).from(books).orderBy(asc(books.createdAt)),
      ]);

      return { members: memberChoices, books: bookChoices };
    },

    /** The member a loan is decided from. null if absent */
    async member(id: string): Promise<Borrowing["member"] | null> {
      const members = membersWithin(db);
      const [row] = await db.select({ id: members.id }).from(members).where(eq(members.id, id));

      return row ?? null;
    },

    /** The book a loan is decided from, with its copies. null if absent */
    async book(id: string): Promise<Borrowing["book"] | null> {
      const books = booksWithin(db);
      const [row] = await db
        .select({ id: books.id, stock: books.stock })
        .from(books)
        .where(eq(books.id, id));

      return row ?? null;
    },
  };
}
