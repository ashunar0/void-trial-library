/** The reads for /members */
import { asc } from "void/db";
import type { ReadDb } from "../deps";
import { membersWithin } from "../domains/members/repo";

export function membersQueries(db: ReadDb) {
  return {
    /** Every member, oldest first */
    async list() {
      const members = membersWithin(db);

      return db
        .select({ id: members.id, name: members.name, email: members.email })
        .from(members)
        .orderBy(asc(members.createdAt), asc(members.id));
    },
  };
}
