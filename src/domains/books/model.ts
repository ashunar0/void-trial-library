/**
 * The book. What it is and which rules it has (What).
 * It knows no steps, HTTP or DB. Every other file points here.
 */
import { z } from "zod";

declare const bookIdBrand: unique symbol;

export type BookId = string & { readonly [bookIdBrand]: true };

/** Brands a string from outside or from the DB as a book ID. The only place that writes `as` */
export const bookId = (value: string) => value as BookId;

export const newBookId = () => bookId(crypto.randomUUID());

/** An ID in the input (URL or body). Branded once it passes validation */
export const bookIdSchema = z.string().min(1).transform(bookId);

export type Book = {
  id: BookId;
  isbn: string;
  title: string;
  author: string;
  /** Copies the library owns. At least 1 */
  stock: number;
  createdAt: Date;
  updatedAt: Date;
};

/** ISBN-13: 13 digits whose weighted sum (1, 3, 1, 3, ...) is a multiple of 10 */
export const isValidIsbn13 = (isbn: string): boolean => {
  if (!/^\d{13}$/.test(isbn)) return false;
  const sum = [...isbn].reduce(
    (total, digit, i) => total + Number(digit) * (i % 2 === 0 ? 1 : 3),
    0,
  );

  return sum % 10 === 0;
};

const titleSchema = z.string().trim().min(1).max(200);
const authorSchema = z.string().trim().min(1).max(100);
const stockSchema = z.number().int().min(1);

export const bookCreateSchema = z.strictObject({
  isbn: z.string().refine(isValidIsbn13, "isbn must be 13 digits with a correct check digit"),
  title: titleSchema,
  author: authorSchema,
  stock: stockSchema,
});

/** The isbn cannot change, so sending it is a 400 (strict) */
export const bookUpdateSchema = z.strictObject({
  title: titleSchema.optional(),
  author: authorSchema.optional(),
  stock: stockSchema.optional(),
});

export type BookCreateInput = z.infer<typeof bookCreateSchema>;
export type BookUpdateInput = z.infer<typeof bookUpdateSchema>;

export const DuplicateIsbn = {
  code: "DUPLICATE_ISBN",
  message: "A book with this ISBN is already registered",
} as const;
