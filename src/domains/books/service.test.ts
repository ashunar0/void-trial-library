import { afterAll, beforeEach, describe, expect, it } from "vite-plus/test";
import { createTestDb } from "../../../test/db";
import { makeDeps } from "../../deps";
import { bookId } from "./model";

const testDb = await createTestDb();
const { books } = makeDeps(testDb.db);
beforeEach(() => testDb.reset());
afterAll(() => testDb.dispose());

const now = new Date("2026-10-18T10:00:00Z");
const input = { isbn: "9784873119038", title: "リーダブルコード", author: "Dustin Boswell", stock: 2 };

describe("books.create", () => {
  it("registers a book", async () => {
    const created = await books.create(input, now);

    expect(created.ok).toBe(true);
  });

  it("refuses an ISBN that is already registered", async () => {
    await books.create(input, now);

    expect(await books.create({ ...input, title: "別の本" }, now)).toEqual({ ok: false, error: "DUPLICATE_ISBN" });
  });
});

describe("books.update", () => {
  it("is NOT_FOUND for a book that does not exist", async () => {
    expect(await books.update(bookId("missing"), { stock: 3 }, now)).toEqual({ ok: false, error: "NOT_FOUND" });
  });
});
