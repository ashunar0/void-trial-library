/**
 * Calendar days as `YYYY-MM-DD` text. Knows nothing of this app: the time zone is given by the caller
 */

/** The calendar day it is at `now` in `timeZone` (an IANA name such as "Asia/Tokyo") */
export const dateIn = (now: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

/** The day `days` after `date`. Calendar arithmetic, so no time zone is involved */
export const addDays = (date: string, days: number) => {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);

  return moved.toISOString().slice(0, 10);
};
