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

export const bookCreateSchema = z.strictObject({
  isbn: z.string().refine(isValidIsbn13, "isbn must be 13 digits with a correct check digit"),
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(100),
  stock: z.number().int().min(1),
});

export type BookCreateInput = z.infer<typeof bookCreateSchema>;

export const DuplicateIsbn = {
  code: "DUPLICATE_ISBN",
  message: "A book with this ISBN is already registered",
} as const;
