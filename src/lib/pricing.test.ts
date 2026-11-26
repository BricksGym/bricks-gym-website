import { describe, expect, it } from "vitest";
import { additionalMember, fees, plans } from "@/config/gym";
import { formatMoney, quote, toCents } from "./pricing";
import { ageStatus } from "./age";

describe("formatMoney", () => {
  it("drops cents for whole dollars", () => {
    expect(formatMoney(4900)).toBe("$49");
    expect(formatMoney(4499)).toBe("$44.99");
    expect(formatMoney(0)).toBe("$0");
  });
});

describe("quote", () => {
  for (const plan of plans) {
    it(`adds up the ${plan.name} plan correctly`, () => {
      const q = quote(plan.id, 2);
      const monthly =
        toCents(plan.monthlyDues) + 2 * toCents(additionalMember.monthlyDues[plan.id]);
      const enrollment = toCents(plan.enrollmentFee) + 2 * toCents(additionalMember.enrollmentFee);
      expect(q.memberCount).toBe(3);
      expect(q.monthlyCents).toBe(monthly);
      expect(q.enrollmentCents).toBe(enrollment);
      expect(q.dueTodayCents).toBe(
        enrollment + monthly + (plan.lastMonthDueAtSignup ? monthly : 0),
      );
      expect(q.dueTodayLines.reduce((s, l) => s + l.cents, 0)).toBe(q.dueTodayCents);
      expect(q.annualFeeCents).toBe(
        plan.annualFee
          ? toCents(fees.annualClubImprovement.amount) * (fees.annualClubImprovement.perMember ? 3 : 1)
          : 0,
      );
      if (plan.termMonths) {
        // Payments today + remaining payments never exceed the term.
        const paidToday = 1 + (plan.lastMonthDueAtSignup ? 1 : 0);
        expect(q.remainingPayments).toBe(plan.termMonths - paidToday);
        expect(q.termDuesTotalCents).toBe(monthly * plan.termMonths);
      } else {
        expect(q.remainingPayments).toBeNull();
      }
    });
  }

  it("month-to-month has no annual fee; 24-month has no enrollment fee", () => {
    expect(quote("month-to-month").annualFeeCents).toBe(0);
    expect(quote("month-to-month").annualFeeText).toBe("None on this plan");
    const q24 = quote("24-month");
    expect(q24.enrollmentCents).toBe(0);
    expect(q24.dueTodayCents).toBe(toCents(29.99));
    expect(quote("12-month").dueTodayCents).toBe(toCents(49.99) + toCents(34.99));
  });

  it("ignores negative or fractional member counts", () => {
    expect(quote("12-month", -3).additionalMembers).toBe(0);
    expect(quote("12-month", 1.7).additionalMembers).toBe(1);
  });
});

describe("ageStatus", () => {
  const today = new Date(2026, 10, 25); // Nov 25, 2026
  it("rejects under 14", () => {
    expect(ageStatus("2013-01-01", today).kind).toBe("too-young");
  });
  it("flags 14–16 as needing a parent present", () => {
    const s = ageStatus("2012-11-25", today); // turns 14 today
    expect(s).toEqual({ kind: "minor", age: 14, mustBeAccompanied: true });
  });
  it("17-year-olds need a guardian signature but not an escort", () => {
    expect(ageStatus("2009-06-01", today)).toEqual({ kind: "minor", age: 17, mustBeAccompanied: false });
  });
  it("adults", () => {
    expect(ageStatus("2008-11-25", today)).toEqual({ kind: "adult", age: 18 });
  });
  it("invalid dates", () => {
    expect(ageStatus("2001-02-30", today).kind).toBe("invalid");
    expect(ageStatus("nope", today).kind).toBe("invalid");
  });
});
