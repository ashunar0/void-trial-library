import { defineHandler, ValidationError } from "void/handler";
import { asc, desc, eq } from "void/db";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { loans, readDb } from "../../src/deps";
import { booksWithin } from "../../src/domains/books/repo";
import {
  AlreadyBorrowed,
  AlreadyReturned,
  isOverdue,
  loanCreateSchema,
  loanIdSchema,
  MemberHasOverdue,
  OutOfStock,
  todayOf,
} from "../../src/domains/loans/model";
import { loansWithin } from "../../src/domains/loans/repo";
import { membersWithin } from "../../src/domains/members/repo";
import { NotFound } from "../../src/lib/failures";

export const loader = defineHandler(async () => {
  const today = todayOf(new Date());
  const loan = loansWithin(readDb);
  const book = booksWithin(readDb);
  const member = membersWithin(readDb);

  const rows = await readDb
    .select({
      id: loan.id,
      loanedOn: loan.loanedOn,
      dueOn: loan.dueOn,
      returnedOn: loan.returnedOn,
      bookTitle: book.title,
      memberName: member.name,
    })
    .from(loan)
    .innerJoin(book, eq(book.id, loan.bookId))
    .innerJoin(member, eq(member.id, loan.memberId))
    .orderBy(desc(loan.loanedOn), desc(loan.id));

  // The choices of the lending form
  const [members, books] = await Promise.all([
    readDb.select({ id: member.id, name: member.name }).from(member).orderBy(asc(member.createdAt)),
    readDb.select({ id: book.id, title: book.title }).from(book).orderBy(asc(book.createdAt)),
  ]);

  return {
    loans: rows.map((row) => ({ ...row, overdue: isOverdue(row, today) })),
    members,
    books,
  };
});

export const actions = {
  create: defineHandler.withValidator({ body: loanCreateSchema })(async (_c, { body }) => {
    // The member and the book belong to other domains: read them here and hand them in
    const members = membersWithin(readDb);
    const [member] = await readDb
      .select({ id: members.id })
      .from(members)
      .where(eq(members.id, body.memberId));
    if (!member) throw new ValidationError({ memberId: NotFound.message });
    const books = booksWithin(readDb);
    const [book] = await readDb
      .select({ id: books.id, stock: books.stock })
      .from(books)
      .where(eq(books.id, body.bookId));
    if (!book) throw new ValidationError({ bookId: NotFound.message });

    const created = await loans.create({ member, book }, new Date());
    if (created.ok) return;
    switch (created.error) {
      case MemberHasOverdue.code:
        throw new ValidationError({ memberId: MemberHasOverdue.message });
      case AlreadyBorrowed.code:
        throw new ValidationError({ bookId: AlreadyBorrowed.message });
      case OutOfStock.code:
        throw new ValidationError({ bookId: OutOfStock.message });
    }
  }),

  return: defineHandler.withValidator({ body: z.strictObject({ loanId: loanIdSchema }) })(
    async (_c, { body }) => {
      const returned = await loans.returnBook(body.loanId, new Date());
      if (returned.ok) return;
      if (returned.error === NotFound.code) throw new HTTPException(404);
      throw new ValidationError({ loanId: AlreadyReturned.message });
    },
  ),
};
