import { ValidationError } from "void/handler";

/**
 * Turns a domain failure into the form field it is about. Which field is the entry point's choice,
 * so the domain never knows the form. The table must name every failure the call can return
 */
export const fieldError = <E extends string>(error: E, fields: Record<E, Record<string, string>>) =>
  new ValidationError(fields[error]);
