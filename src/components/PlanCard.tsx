import { afterTerm, fees, type Plan } from "@/config/gym";
import { formatMoney, money, quote, termLabel } from "@/lib/pricing";
import { joinHref } from "@/lib/links";
import { JoinLink } from "@/components/JoinLink";

/** A plan card that shows the full cost up front. */
export function PlanCard({ plan, location }: { plan: Plan; location: string }) {
  const q = quote(plan.id);
  const featured = plan.featured;
  return (
    <article
      className={`relative flex flex-col rounded-md border-2 bg-white ${featured ? "border-brick" : "border-ink/15"}`}
      aria-labelledby={`plan-${plan.id}`}
    >
      {featured && (
        <p className="stamp absolute -top-3 left-4 rounded bg-brick px-2 py-0.5 text-xs text-white">Most popular</p>
      )}
      <div className="px-5 pb-4 pt-6">
        <h3 id={`plan-${plan.id}`} className="font-display text-2xl text-ink">
          {plan.name}
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-1">
          <span className="font-display text-4xl text-brick">{money(plan.monthlyDues)}</span>
          <span className="whitespace-nowrap text-concrete">/ month</span>
        </p>
        <p className="mt-2 text-sm text-iron">{plan.blurb}</p>
      </div>

      <dl className="flex-1 divide-y divide-ink/10 border-t border-ink/10 px-5 py-2 text-[15px]">
        <Row label="Term" value={termLabel(plan)} />
        <Row label="Enrollment fee" value={money(plan.enrollmentFee)} />
        <Row label="Last month's dues up front" value={plan.lastMonthDueAtSignup ? "Yes" : "No"} />
        <Row label="Due at signup" value={formatMoney(q.dueTodayCents)} strong />
        <Row
          label="Club Improvement fee"
          value={`${money(fees.annualClubImprovement.amount)}/yr (${fees.annualClubImprovement.month})`}
        />
        <Row label="Early cancellation" value={q.earlyCancellation} />
      </dl>
      <p className="px-5 pb-4 text-sm text-concrete">
        {plan.termMonths ? afterTerm.description : "Either you or the gym can end it with 30 days' written notice."}
      </p>
      <div className="px-5 pb-5">
        <JoinLink href={joinHref(plan.id)} plan={plan.id} location={location} className="w-full" variant={featured ? "primary" : "dark"}>
          Join {plan.name}
        </JoinLink>
      </div>
    </article>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-concrete">{label}</dt>
      <dd className={`text-right ${strong ? "font-bold text-ink" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
