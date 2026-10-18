import { afterAll, beforeEach, describe, expect, it } from "vite-plus/test";
import { createTestDb } from "../../../test/db";
import { makeDeps } from "../../deps";
import { loanId } from "./model";

const testDb = await createTestDb();
const deps = makeDeps(testDb.db);
const { loans } = deps;
beforeEach(() => testDb.reset());
afterAll(() => testDb.dispose());

/** A moment on a day in Tokyo (noon, so no time zone question) */
const on = (day: string) => new Date(`${day}T12:00:00+09:00`);

// Rows of other domains are made through their own services
const aBook = async (stock: number, isbn = "9784873119038") => {
  const created = await deps.books.create(
    { isbn, title: "本", author: "著者", stock },
    on("2026-09-01"),
  );
  if (!created.ok) throw new Error(created.error);

  return { id: created.value, stock };
};
const aMember = async (email = "yamada@example.com") => {
  const created = await deps.members.create({ name: "山田", email }, on("2026-09-01"));
  if (!created.ok) throw new Error(created.error);

  return { id: created.value };
};

describe("loans.create", () => {
  it("is overdue only after the due day, 14 days later", async () => {
    const member = await aMember();
    await loans.create({ member, book: await aBook(1) }, on("2026-10-01"));
    const other = await aBook(1, "9784297124557");

    // Due 2026-10-15: on that day the member may still borrow
    expect((await loans.create({ member, book: other }, on("2026-10-15"))).ok).toBe(true);
  });

  it("refuses a member with an overdue loan", async () => {
    const member = await aMember();
    await loans.create({ member, book: await aBook(1) }, on("2026-10-01"));
    const other = await aBook(1, "9784297124557");

    expect(await loans.create({ member, book: other }, on("2026-10-16"))).toEqual({
      ok: false,
      error: "MEMBER_HAS_OVERDUE",
    });
  });

  it("decides the day in Tokyo, not in UTC", async () => {
    const member = await aMember();
    // 2026-10-01 00:30 in Tokyo, while UTC is still 09-30: due 2026-10-15, not 10-14
    await loans.create({ member, book: await aBook(1) }, new Date("2026-09-30T15:30:00Z"));
    const other = await aBook(1, "9784297124557");

    // 2026-10-15 in Tokyo is the due day, so not yet overdue
    expect((await loans.create({ member, book: other }, on("2026-10-15"))).ok).toBe(true);
  });

  it("refuses the same book twice to one member", async () => {
    const member = await aMember();
    const book = await aBook(2);
    await loans.create({ member, book }, on("2026-10-01"));

    expect(await loans.create({ member, book }, on("2026-10-01"))).toEqual({
      ok: false,
      error: "ALREADY_BORROWED",
    });
  });

  it("refuses a book with no copy left", async () => {
    const book = await aBook(1);
    await loans.create({ member: await aMember(), book }, on("2026-10-01"));

    expect(
      await loans.create({ member: await aMember("sato@example.com"), book }, on("2026-10-01")),
    ).toEqual({
      ok: false,
      error: "OUT_OF_STOCK",
    });
  });

  it("checks overdue before stock", async () => {
    const member = await aMember();
    await loans.create({ member, book: await aBook(1) }, on("2026-10-01"));
    const full = await aBook(1, "9784297124557");
    await loans.create({ member: await aMember("sato@example.com"), book: full }, on("2026-10-16"));

    expect(await loans.create({ member, book: full }, on("2026-10-16"))).toEqual({
      ok: false,
      error: "MEMBER_HAS_OVERDUE",
    });
  });
});

describe("loans.returnBook", () => {
  it("gives the copy back, once", async () => {
    const book = await aBook(1);
    const lent = await loans.create({ member: await aMember(), book }, on("2026-10-01"));
    if (!lent.ok) throw new Error(lent.error);

    expect(await loans.returnBook(lent.value, on("2026-10-05"))).toEqual({
      ok: true,
      value: undefined,
    });
    expect(await loans.returnBook(lent.value, on("2026-10-05"))).toEqual({
      ok: false,
      error: "ALREADY_RETURNED",
    });
    // The copy is free again
    expect(
      (await loans.create({ member: await aMember("sato@example.com"), book }, on("2026-10-05")))
        .ok,
    ).toBe(true);
  });

  it("is NOT_FOUND for a loan that does not exist", async () => {
    expect(await loans.returnBook(loanId("missing"), on("2026-10-05"))).toEqual({
      ok: false,
      error: "NOT_FOUND",
    });
  });
});
