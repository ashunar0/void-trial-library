/** The steps for members (How) */
import { err, ok, type Result } from "../../lib/result";
import {
  DuplicateEmail,
  newMemberId,
  type Member,
  type MemberCreateInput,
  type MemberId,
} from "./model";

export type MembersRepository = {
  /** "emailTaken" when the email is registered */
  insert(member: Member): Promise<Member | "emailTaken">;
};

export function membersService(repo: MembersRepository) {
  return {
    async create(
      input: MemberCreateInput,
      now: Date,
    ): Promise<Result<MemberId, typeof DuplicateEmail.code>> {
      const inserted = await repo.insert({ id: newMemberId(), ...input, createdAt: now });
      if (inserted === "emailTaken") return err(DuplicateEmail.code);

      return ok(inserted.id);
    },
  };
}
