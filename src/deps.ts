/**
 * The gate between entry points (pages, routes, jobs) and the domains.
 * Entry points use only what is exported here: services to write, readDb to read.
 * db itself is not exported, because entry points could then choose where to write.
 *
 * Built once at module scope: Void's db is a proxy that is per request, so nothing is shared.
 * This is the only file that imports void/db as a value (lint: no-restricted-imports)
 */
import { db } from "void/db";
import { booksRepository } from "./domains/books/repo";
import { booksService } from "./domains/books/service";

type Db = typeof db;

/** A db that can only read */
export type ReadDb = Pick<Db, "select">;

/** Wires every domain to one db. Tests call it with their own db */
export function makeDeps(db: Db) {
  return {
    readDb: db as ReadDb,
    books: booksService(booksRepository(db)),
  };
}

export const { readDb, books } = makeDeps(db);
