/**
 * The one place that gathers how domains are built.
 * Built once at module scope: Void's db is a proxy that is per request, so nothing is shared.
 */
import { db } from "void/db";
import { booksRepository } from "./domains/books/repo";
import { booksService } from "./domains/books/service";

export const books = booksService(booksRepository(db));
