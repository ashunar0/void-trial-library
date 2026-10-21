/**
 * The gate between entry points (pages, routes, jobs) and the domains.
 * Entry points use only what is exported here: services to write, queries to read.
 * No db is exported, not even one that only reads: the selects and joins live in src/queries,
 * so entry points only call named functions.
 *
 * Built once at module scope: Void's db is a proxy that is per request, so nothing is shared.
 * This is the only file that imports void/db as a value (lint: no-restricted-imports)
 */
import { db } from "void/db";
import { booksRepository } from "./domains/books/repo";
import { booksService } from "./domains/books/service";
import { loansRepository } from "./domains/loans/repo";
import { loansService } from "./domains/loans/service";
import { membersRepository } from "./domains/members/repo";
import { membersService } from "./domains/members/service";
import { booksQueries } from "./queries/books";
import { loansQueries } from "./queries/loans";
import { membersQueries } from "./queries/members";

type Db = typeof db;

/** A db that can only read. Taken by the queries and the …Within tables */
export type ReadDb = Pick<Db, "select">;

/** Wires every domain to one db. Tests call it with their own db */
export function makeDeps(db: Db) {
  return {
    books: booksService(booksRepository(db)),
    members: membersService(membersRepository(db)),
    loans: loansService(loansRepository(db)),
    bookQueries: booksQueries(db),
    memberQueries: membersQueries(db),
    loanQueries: loansQueries(db),
  };
}

export const { books, members, loans, bookQueries, memberQueries, loanQueries } = makeDeps(db);
