import { defineHandler } from "void/handler";
import { memberQueries, members } from "../../src/deps";
import { DuplicateEmail, memberCreateSchema } from "../../src/domains/members/model";
import { fieldError } from "../../src/lib/field-error";

export const loader = defineHandler(async () => ({ members: await memberQueries.list() }));

export const action = defineHandler.withValidator({ body: memberCreateSchema })(async (
  _c,
  { body },
) => {
  const created = await members.create(body, new Date());
  if (!created.ok)
    throw fieldError(created.error, { DUPLICATE_EMAIL: { email: DuplicateEmail.message } });
});
