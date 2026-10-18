/**
 * The member. What it is and which rules it has (What).
 * It knows no steps, HTTP or DB. Every other file points here.
 */
import { z } from "zod";

declare const memberIdBrand: unique symbol;

export type MemberId = string & { readonly [memberIdBrand]: true };

/** Brands a string from outside or from the DB as a member ID. The only place that writes `as` */
export const memberId = (value: string) => value as MemberId;

export const newMemberId = () => memberId(crypto.randomUUID());

/** An ID in the input (URL or body). Branded once it passes validation */
export const memberIdSchema = z.string().min(1).transform(memberId);

export type Member = {
  id: MemberId;
  name: string;
  /** Stored in lower case, so addresses that differ only in case are the same */
  email: string;
  createdAt: Date;
};

export const memberCreateSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
});

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;

export const DuplicateEmail = {
  code: "DUPLICATE_EMAIL",
  message: "A member with this email is already registered",
} as const;
