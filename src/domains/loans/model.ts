/**
 * The loan. What it is and which rules it has (What).
 * It knows no steps, HTTP or DB. Every other file points here.
 */
import { z } from "zod";
import { addDays, dateIn } from "../../lib/date";

declare const loanIdBrand: unique symbol;

export type LoanId = string & { readonly [loanIdBrand]: true };

/** Brands a string from outside or from the DB as a loan ID. The only place that writes `as` */
export const loanId = (value: string) => value as LoanId;

export const newLoanId = () => loanId(crypto.randomUUID());

/** An ID in the input (URL or body). Branded once it passes validation */
export const loanIdSchema = z.string().min(1).transform(loanId);

/** The library's calendar: "today" is the day it is here */
export const LIBRARY_TIME_ZONE = "Asia/Tokyo";

/** How many days a book may be kept. There is no extension */
export const LOAN_DAYS = 14;

/** A loan. The dates are days (`YYYY-MM-DD`); `returnedOn` is null while the book is out */
export type Loan = {
  id: LoanId;
  /** A member's ID: a plain string, as it belongs to the members domain */
  memberId: string;
  /** A book's ID: a plain string, as it belongs to the books domain */
  bookId: string;
  loanedOn: string;
  dueOn: string;
  returnedOn: string | null;
};

/** The day it is at `now` */
export const todayOf = (now: Date) => dateIn(now, LIBRARY_TIME_ZONE);

/** The day a book lent on `loanedOn` is due back */
export const dueOnOf = (loanedOn: string) => addDays(loanedOn, LOAN_DAYS);

/** Out on loan and past its due day. The due day itself is not yet overdue */
export const isOverdue = (loan: Pick<Loan, "dueOn" | "returnedOn">, today: string) =>
  loan.returnedOn === null && loan.dueOn < today;

export const loanCreateSchema = z.strictObject({
  memberId: z.string().min(1),
  bookId: z.string().min(1),
});

export const MemberHasOverdue = {
  code: "MEMBER_HAS_OVERDUE",
  message: "A member with an overdue loan cannot borrow",
} as const;

export const AlreadyBorrowed = {
  code: "ALREADY_BORROWED",
  message: "This member already has this book out",
} as const;

export const OutOfStock = {
  code: "OUT_OF_STOCK",
  message: "No copy of this book is available",
} as const;

export const AlreadyReturned = {
  code: "ALREADY_RETURNED",
  message: "This loan is already returned",
} as const;
