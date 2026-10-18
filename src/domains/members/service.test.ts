import { afterAll, beforeEach, describe, expect, it } from "vite-plus/test";
import { createTestDb } from "../../../test/db";
import { makeDeps } from "../../deps";
import { memberCreateSchema } from "./model";

const testDb = await createTestDb();
const { members } = makeDeps(testDb.db);
beforeEach(() => testDb.reset());
afterAll(() => testDb.dispose());

const now = new Date("2026-10-18T10:00:00Z");

describe("members.create", () => {
  it("refuses an email that differs only in case", async () => {
    await members.create(memberCreateSchema.parse({ name: "山田", email: "yamada@example.com" }), now);
    const again = memberCreateSchema.parse({ name: "山田", email: " Yamada@Example.com " });

    expect(await members.create(again, now)).toEqual({ ok: false, error: "DUPLICATE_EMAIL" });
  });
});
