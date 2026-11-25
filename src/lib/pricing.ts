/**
 * Price calculations. All math is done in whole cents to avoid rounding errors.
 * Prices themselves live in src/config/gym.ts.
 */
import {
  additionalMember,
  fees,
  plans,
  type Plan,
  type PlanId,
} from "@/config/gym";

export const toCents = (dollars: number) => Math.round(dollars * 100);

/** $49 for whole dollars, $44.99 otherwise. */
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export const money = (dollars: number) => formatMoney(toCents(dollars));

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && plans.some((p) => p.id === value);
}

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function termLabel(plan: Plan): string {
  return plan.termMonths ? `${plan.termMonths} months` : "Month to month";
}

export function earlyCancellationText(plan: Plan): string {
  const ec = plan.earlyCancellation;
  if (!ec) return "None — cancel with 30 days' written notice";
  return ec.orRemainingDuesIfLess
    ? `${money(ec.fee)} or your remaining dues, whichever is less`
    : money(ec.fee);
}

export type QuoteLine = { label: string; cents: number };

export type Quote = {
  plan: Plan;
  additionalMembers: number;
  memberCount: number;
  /** Itemized amounts due at signup. */
  dueTodayLines: QuoteLine[];
  dueTodayCents: number;
  enrollmentCents: number;
  firstMonthCents: number;
  lastMonthCents: number;
  /** Recurring monthly amount for everyone on the membership. */
  monthlyCents: number;
  /**
   * Monthly payments still owed during the initial term after what's paid
   * today. null = month-to-month (continues until cancelled).
   */
  remainingPayments: number | null;
  /** Sum of all monthly dues over the initial term. null for month-to-month. */
  termDuesTotalCents: number | null;
  annualFeeCents: number;
  annualFeeMonth: string;
  earlyCancellation: string;
};

export function quote(planId: PlanId, additionalMembers = 0): Quote {
  const plan = getPlan(planId);
  const extra = Math.max(0, Math.floor(additionalMembers));
  const memberCount = 1 + extra;

  const primaryMonthly = toCents(plan.monthlyDues);
  const extraMonthly = toCents(additionalMember.monthlyDues[planId]) * extra;
  const monthlyCents = primaryMonthly + extraMonthly;

  const enrollmentCents =
    toCents(plan.enrollmentFee) + toCents(additionalMember.enrollmentFee) * extra;
  const firstMonthCents = monthlyCents;
  const lastMonthCents = plan.lastMonthDueAtSignup ? monthlyCents : 0;

  const dueTodayLines: QuoteLine[] = [
    { label: "Enrollment fee", cents: enrollmentCents },
    { label: "First month's dues", cents: firstMonthCents },
  ];
  if (plan.lastMonthDueAtSignup) {
    dueTodayLines.push({ label: "Last month's dues", cents: lastMonthCents });
  }
  const dueTodayCents = dueTodayLines.reduce((sum, l) => sum + l.cents, 0);

  let remainingPayments: number | null = null;
  let termDuesTotalCents: number | null = null;
  if (plan.termMonths) {
    remainingPayments = Math.max(
      0,
      plan.termMonths - 1 - (plan.lastMonthDueAtSignup ? 1 : 0),
    );
    termDuesTotalCents = monthlyCents * plan.termMonths;
  }

  const annual = fees.annualClubImprovement;
  const annualFeeCents = toCents(annual.amount) * (annual.perMember ? memberCount : 1);

  return {
    plan,
    additionalMembers: extra,
    memberCount,
    dueTodayLines,
    dueTodayCents,
    enrollmentCents,
    firstMonthCents,
    lastMonthCents,
    monthlyCents,
    remainingPayments,
    termDuesTotalCents,
    annualFeeCents,
    annualFeeMonth: annual.month,
    earlyCancellation: earlyCancellationText(plan),
  };
}
