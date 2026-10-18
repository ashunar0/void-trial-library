/**
 * Storage for members. Fulfills the MembersRepository declared in service.ts with D1.
 * Row shapes never leave this file; rows are mapped to the domain Member
 */
import type { db as voidDb } from "void/db";
import { membersTable } from "@schema";
import type { ReadDb } from "../../deps";
import { memberId, type Member } from "./model";
import type { MembersRepository } from "./service";

type Db = typeof voidDb;

type MemberRow = typeof membersTable.$inferSelect;

/** Row → thing */
const toMember = (row: MemberRow): Member => ({
  id: memberId(row.id),
  name: row.name,
  email: row.email,
  createdAt: row.createdAt,
});

/** D1 reports a unique violation only in the message */
const isEmailTaken = (error: unknown) =>
  String((error as { cause?: unknown })?.cause ?? error).includes(
    "UNIQUE constraint failed: members.email",
  );

/** Every member, as a table to read */
export const membersWithin = (db: ReadDb) => db.select().from(membersTable).as("members_within");

export function membersRepository(db: Db): MembersRepository {
  return {
    async insert(member) {
      try {
        const [row] = await db.insert(membersTable).values(member).returning();
        if (!row) throw new Error(`member ${member.id} was not returned after insert`);

        return toMember(row);
      } catch (error) {
        if (isEmailTaken(error)) return "emailTaken";
        throw error;
      }
    },
  };
}
