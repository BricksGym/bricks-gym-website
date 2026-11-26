import { fees } from "@/config/gym";
import { money, plansWithoutAnnualFee } from "@/lib/pricing";

/** Plain-English list of every other fee, built from the config. */
export function otherFees(): { name: string; amount: string; note?: string }[] {
  const f = fees;
  return [
    {
      name: "Annual fee",
      amount: `${money(f.annualClubImprovement.amount)} per year${f.annualClubImprovement.perMember ? " per member" : ""}`,
      note: `Billed each ${f.annualClubImprovement.month}. The Primary member pays for all additional members.${plansWithoutAnnualFee() ? ` Not charged on ${plansWithoutAnnualFee()} memberships.` : ""}`,
    },
    { name: "Day pass (non-members)", amount: money(f.dayPass) },
    {
      name: "Membership freeze",
      amount: `${money(f.freeze.perMonth)} per month`,
      note: `${f.freeze.minMonths}–${f.freeze.maxMonthsPerYear} months per year, paid in advance.`,
    },
    {
      name: "Medical hold",
      amount: "Free",
      note: `Up to ${f.freeze.medicalHoldMaxMonths} months with a doctor's note.`,
    },
    {
      name: "Medical cancellation",
      amount: f.medicalCancellation.orRemainingDuesIfLess
        ? `${money(f.medicalCancellation.fee)} or remaining dues, whichever is less`
        : money(f.medicalCancellation.fee),
      note: "With a doctor's note.",
    },
    {
      name: "Moving away",
      amount: money(f.relocationCancellation.fee),
      note: `If you move more than ${f.relocationCancellation.minMiles} miles away, with proof of the move.`,
    },
    { name: "Returned or failed payment", amount: money(f.returnedPayment) },
    {
      name: "Late charge",
      amount: money(f.lateCharge.amount),
      note: `When a payment is more than ${f.lateCharge.afterDays} days past due.`,
    },
    {
      name: "Paying without auto-pay",
      amount: `${money(f.manualBilling.monthlyProcessingFee)} per month processing fee`,
      note: `Payment due by the ${ordinal(f.manualBilling.dueDayOfMonth)} of each month.`,
    },
  ];
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
