/**
 * Billing dates that depend on the day a member signs up.
 * The rules themselves live in src/config/gym.ts (section 5b).
 */
import { billing } from "@/config/gym";

export type Ymd = { year: number; month: number; day: number }; // month: 1-12

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Today's date at the gym (Pacific time), so the form and the emails agree. */
export function gymToday(now = new Date()): Ymd {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

const lastDayOf = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const addMonths = (year: number, month: number, n: number) => {
  const i = year * 12 + (month - 1) + n;
  return { year: Math.floor(i / 12), month: (i % 12) + 1 };
};

/** "December 14, 2026" */
export function formatYmd(d: Ymd): string {
  return `${MONTHS[d.month - 1]} ${d.day}, ${d.year}`;
}

/** The month the annual fee is billed, based on the month the member signed up. */
export function annualFeeMonth(signup: Ymd): string {
  const rule = billing.annualFeeMonthBySignupMonth.find((r) => r.signupMonths.includes(signup.month));
  return rule?.billedIn ?? "";
}

/**
 * When monthly dues are auto-drafted.
 * - Signed up between the 8th and the 22nd: the 14th of each month, starting next month.
 * - Signed up between the 23rd and the 7th: the last day of each month. That
 *   window is one billing group, so the 23rd–31st start at the end of next
 *   month and the 1st–7th start at the end of the current month.
 */
export function autoDraft(signup: Ymd): { first: Ymd; dayLabel: string } {
  const mid = billing.midMonth;
  if (signup.day >= mid.fromDay && signup.day <= mid.toDay) {
    const next = addMonths(signup.year, signup.month, 1);
    return { first: { ...next, day: mid.draftDay }, dayLabel: `the ${ordinalDay(mid.draftDay)} of each month` };
  }
  const target = signup.day > mid.toDay ? addMonths(signup.year, signup.month, 1) : { year: signup.year, month: signup.month };
  return { first: { ...target, day: lastDayOf(target.year, target.month) }, dayLabel: "the last day of each month" };
}

function ordinalDay(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
