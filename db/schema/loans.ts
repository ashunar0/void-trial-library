import { sql } from "void/db";
import { index, sqliteTable, text, uniqueIndex } from "void/schema-d1";
import { booksTable } from "./books";
import { membersTable } from "./members";

export const loansTable = sqliteTable(
  "loans",
  {
    id: text("id").primaryKey(),
    memberId: text("member_id")
      .notNull()
      .references(() => membersTable.id),
    bookId: text("book_id")
      .notNull()
      .references(() => booksTable.id),
    /** `YYYY-MM-DD` */
    loanedOn: text("loaned_on").notNull(),
    /** `YYYY-MM-DD` */
    dueOn: text("due_on").notNull(),
    /** `YYYY-MM-DD`, null while the book is out */
    returnedOn: text("returned_on"),
  },
  (t) => [
    // One member never has the same book out twice, even when two requests come at once
    uniqueIndex("loans_member_book_out")
      .on(t.memberId, t.bookId)
      .where(sql`${t.returnedOn} is null`),
    index("loans_member_id").on(t.memberId),
    index("loans_book_id").on(t.bookId),
  ],
);
