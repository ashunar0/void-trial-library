/**
 * Storage for loans. Fulfills the LoansRepository declared in service.ts with D1.
 * Row shapes never leave this file; rows are mapped to the domain Loan
 */
import { and, count, eq, isNull, lt, type db as voidDb } from "void/db";
import { loansTable } from "@schema";
import type { ReadDb } from "../../deps";
import { loanId, type Loan } from "./model";
import type { LoansRepository } from "./service";

type Db = typeof voidDb;

type LoanRow = typeof loansTable.$inferSelect;

/** Row → thing */
const toLoan = (row: LoanRow): Loan => ({
  id: loanId(row.id),
  memberId: row.memberId,
  bookId: row.bookId,
  loanedOn: row.loanedOn,
  dueOn: row.dueOn,
  returnedOn: row.returnedOn,
});

/** D1 reports a unique violation only in the message */
const isAlreadyBorrowed = (error: unknown) =>
  String((error as { cause?: unknown })?.cause ?? error).includes(
    "UNIQUE constraint failed: loans.member_id, loans.book_id",
  );

/** Every loan, as a table to read */
export const loansWithin = (db: ReadDb) => db.select().from(loansTable).as("loans_within");

/**
 * Copies out on loan, per book (books with none out are absent). What "on loan" means is decided here
 */
export const onLoanByBookWithin = (db: ReadDb) =>
  db
    .select({ bookId: loansTable.bookId, onLoan: count().as("on_loan") })
    .from(loansTable)
    .where(isNull(loansTable.returnedOn))
    .groupBy(loansTable.bookId)
    .as("on_loan_by_book");

export function loansRepository(db: Db): LoansRepository {
  const countWhere = async (where: ReturnType<typeof and>) => {
    const [row] = await db.select({ total: count() }).from(loansTable).where(where);

    return row?.total ?? 0;
  };
  const out = (memberId: string) =>
    and(eq(loansTable.memberId, memberId), isNull(loansTable.returnedOn));

  return {
    async find(id) {
      const [row] = await db.select().from(loansTable).where(eq(loansTable.id, id)).limit(1);

      return row ? toLoan(row) : null;
    },

    async insert(loan) {
      try {
        const [row] = await db.insert(loansTable).values(loan).returning();
        if (!row) throw new Error(`loan ${loan.id} was not returned after insert`);

        return toLoan(row);
      } catch (error) {
        if (isAlreadyBorrowed(error)) return "alreadyBorrowed";
        throw error;
      }
    },

    async markReturned(id, returnedOn) {
      const [row] = await db
        .update(loansTable)
        .set({ returnedOn })
        .where(and(eq(loansTable.id, id), isNull(loansTable.returnedOn)))
        .returning();

      return row ? toLoan(row) : null;
    },

    async hasOverdue(memberId, today) {
      return (await countWhere(and(out(memberId), lt(loansTable.dueOn, today)))) > 0;
    },

    async hasOut(memberId, bookId) {
      return (await countWhere(and(out(memberId), eq(loansTable.bookId, bookId)))) > 0;
    },

    countOutOfBook(bookId) {
      return countWhere(and(eq(loansTable.bookId, bookId), isNull(loansTable.returnedOn)));
    },
  };
}
