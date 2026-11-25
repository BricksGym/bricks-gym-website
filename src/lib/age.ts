import { rules } from "@/config/gym";

/** Parse "YYYY-MM-DD" as a calendar date (no time-zone shifting). */
export function parseDate(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

/** Age in whole years on a given day (defaults to today). */
export function ageOn(birthdate: string, on: Date = new Date()): number | null {
  const b = parseDate(birthdate);
  if (!b) return null;
  const y = on.getFullYear();
  const m = on.getMonth() + 1;
  const d = on.getDate();
  let age = y - b.y;
  if (m < b.m || (m === b.m && d < b.d)) age -= 1;
  return age;
}

export type AgeStatus =
  | { kind: "invalid" }
  | { kind: "too-young"; age: number }
  | { kind: "minor"; age: number; mustBeAccompanied: boolean }
  | { kind: "adult"; age: number };

export function ageStatus(birthdate: string, on: Date = new Date()): AgeStatus {
  const age = ageOn(birthdate, on);
  if (age === null || age > 120) return { kind: "invalid" };
  if (age < rules.minimumAge) return { kind: "too-young", age };
  if (age < rules.adultAge) {
    return { kind: "minor", age, mustBeAccompanied: age <= rules.accompaniedThroughAge };
  }
  return { kind: "adult", age };
}
