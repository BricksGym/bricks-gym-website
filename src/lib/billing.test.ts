import { describe, expect, it } from "vitest";
import { annualFeeMonth, autoDraft, gymToday } from "./billing";

const d = (year: number, month: number, day: number) => ({ year, month, day });

describe("annual fee month (by sign-up month)", () => {
  it("January–March is billed in June", () => {
    expect(annualFeeMonth(d(2027, 1, 5))).toBe("June");
    expect(annualFeeMonth(d(2027, 3, 31))).toBe("June");
  });
  it("April–August is billed in November", () => {
    expect(annualFeeMonth(d(2027, 4, 1))).toBe("November");
    expect(annualFeeMonth(d(2027, 8, 31))).toBe("November");
  });
  it("September–December is billed in March", () => {
    expect(annualFeeMonth(d(2026, 9, 1))).toBe("March");
    expect(annualFeeMonth(d(2026, 12, 31))).toBe("March");
  });
});

describe("monthly auto-draft (by sign-up day)", () => {
  it("8th–22nd: the 14th of next month", () => {
    expect(autoDraft(d(2026, 11, 8)).first).toEqual(d(2026, 12, 14));
    expect(autoDraft(d(2026, 12, 22)).first).toEqual(d(2027, 1, 14));
  });
  it("23rd–end of month: last day of next month", () => {
    expect(autoDraft(d(2026, 11, 25)).first).toEqual(d(2026, 12, 31));
    expect(autoDraft(d(2027, 1, 23)).first).toEqual(d(2027, 2, 28));
    expect(autoDraft(d(2027, 12, 31)).first).toEqual(d(2028, 1, 31));
  });
  it("1st–7th: last day of the same month (same billing group as the 23rd–31st)", () => {
    expect(autoDraft(d(2026, 12, 3)).first).toEqual(d(2026, 12, 31));
    expect(autoDraft(d(2028, 2, 7)).first).toEqual(d(2028, 2, 29));
  });
  it("uses Pacific time for today", () => {
    // 6:30 AM UTC on Nov 26 is still Nov 25 in Watsonville.
    expect(gymToday(new Date("2026-11-26T06:30:00Z"))).toEqual(d(2026, 11, 25));
  });
});
