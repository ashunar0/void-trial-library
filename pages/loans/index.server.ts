import { defineHandler, ValidationError } from "void/handler";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { loanQueries, loans } from "../../src/deps";
import {
  AlreadyBorrowed,
  AlreadyReturned,
  loanCreateSchema,
  loanIdSchema,
  MemberHasOverdue,
  OutOfStock,
  todayOf,
} from "../../src/domains/loans/model";
import { NotFound } from "../../src/lib/failures";
import { fieldError } from "../../src/lib/field-error";

export const loader = defineHandler(async () => {
  const [list, choices] = await Promise.all([
    loanQueries.list(todayOf(new Date())),
    loanQueries.choices(),
  ]);

  return { loans: list, ...choices };
});

export const actions = {
  create: defineHandler.withValidator({ body: loanCreateSchema })(async (_c, { body }) => {
    // The member and the book belong to other domains: read them here and hand them in
    const member = await loanQueries.member(body.memberId);
    if (!member) throw new ValidationError({ memberId: NotFound.message });
    const book = await loanQueries.book(body.bookId);
    if (!book) throw new ValidationError({ bookId: NotFound.message });

    const created = await loans.create({ member, book }, new Date());
    if (!created.ok)
      throw fieldError(created.error, {
        MEMBER_HAS_OVERDUE: { memberId: MemberHasOverdue.message },
        ALREADY_BORROWED: { bookId: AlreadyBorrowed.message },
        OUT_OF_STOCK: { bookId: OutOfStock.message },
      });
  }),

  return: defineHandler.withValidator({ body: z.strictObject({ loanId: loanIdSchema }) })(
    async (_c, { body }) => {
      const returned = await loans.returnBook(body.loanId, new Date());
      if (returned.ok) return;
      if (returned.error === NotFound.code) throw new HTTPException(404);
      throw fieldError(returned.error, { ALREADY_RETURNED: { loanId: AlreadyReturned.message } });
    },
  ),
};
