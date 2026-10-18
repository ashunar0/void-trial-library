import { defineHandler, ValidationError } from "void/handler";
import { asc } from "void/db";
import { members, readDb } from "../../src/deps";
import { DuplicateEmail, memberCreateSchema } from "../../src/domains/members/model";
import { membersWithin } from "../../src/domains/members/repo";

export const loader = defineHandler(async () => {
  const within = membersWithin(readDb);
  const rows = await readDb
    .select({ id: within.id, name: within.name, email: within.email })
    .from(within)
    .orderBy(asc(within.createdAt), asc(within.id));

  return { members: rows };
});

export const action = defineHandler.withValidator({ body: memberCreateSchema })(
  async (_c, { body }) => {
    const created = await members.create(body, new Date());
    if (!created.ok) throw new ValidationError({ email: DuplicateEmail.message });
  },
);
