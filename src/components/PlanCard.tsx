import { afterTerm, fees, type Plan } from "@/config/gym";
import { formatMoney, hasEnrollmentDeal, money, quote, termLabel } from "@/lib/pricing";
import { joinHref } from "@/lib/links";
import { JoinLink } from "@/components/JoinLink";

/** Plan card: price and Join up front, full costs one click away. */
export function PlanCard({ plan, location }: { plan: Plan; location: string }) {
  const q = quote(plan.id);
  const featured = plan.featured;
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-md ${
        featured
          ? "border-[3px] border-brick bg-[#fff6f4] shadow-xl shadow-brick/20 xl:-my-3"
          : "border-2 border-ink/15 bg-white"
      }`}
      aria-labelledby={`plan-${plan.id}`}
    >
      {plan.badge && (
        <p className="stamp bg-brick px-3 py-2 text-center text-sm tracking-wider text-white">{plan.badge}</p>
      )}
      <div className={`flex-1 px-5 pb-4 ${plan.badge ? "pt-4" : "pt-6"}`}>
        <h3 id={`plan-${plan.id}`} className="font-display text-2xl text-ink">
          {plan.name}
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-1">
          <span className={`font-display text-brick ${featured ? "text-6xl" : "text-4xl"}`}>{money(plan.monthlyDues)}</span>
          <span className="whitespace-nowrap text-concrete">/ month</span>
        </p>
        {featured && (
          <p className="mt-2 inline-block rounded bg-brick/10 px-2 py-1 text-sm font-semibold text-brick">
            Our lowest monthly rate
          </p>
        )}
        <p className="mt-1 text-sm text-concrete">
          {termLabel(plan)} · {formatMoney(q.dueTodayCents)} due at signup
        </p>
        <p className="mt-2 text-sm">
          {hasEnrollmentDeal(plan) ? (
            <>
              <s className="text-concrete">{money(plan.regularEnrollmentFee)} enrollment</s>{" "}
              <strong className="text-brick">{plan.enrollmentFee > 0 ? `${money(plan.enrollmentFee)} enrollment` : "No enrollment fee"}</strong>
            </>
          ) : (
            <span className="text-iron">
              {plan.enrollmentFee > 0 ? `${money(plan.enrollmentFee)} enrollment` : "No enrollment fee"}
            </span>
          )}
        </p>
        <p className="mt-3 text-sm text-iron">{plan.blurb}</p>
      </div>

      <div className="px-5 pb-5">
        <JoinLink href={joinHref(plan.id)} plan={plan.id} location={location} className="w-full" variant={featured ? "primary" : "dark"}>
          Join {plan.name}
        </JoinLink>
        <details className="group mt-3 text-sm">
          <summary className="cursor-pointer list-none text-center font-semibold text-brick underline underline-offset-4">
            See full costs
          </summary>
          <dl className="mt-3 divide-y divide-ink/10 border-t border-ink/10">
            <Row
              label="Enrollment fee"
              value={
                hasEnrollmentDeal(plan) ? (
                  <>
                    <s className="text-concrete">{money(plan.regularEnrollmentFee)}</s> {money(plan.enrollmentFee)}
                  </>
                ) : (
                  money(plan.enrollmentFee)
                )
              }
            />
            <Row label="First month's dues" value={money(plan.monthlyDues)} />
            {plan.lastMonthDueAtSignup && <Row label="Last month's dues" value={money(plan.monthlyDues)} />}
            <Row label="Due at signup" value={formatMoney(q.dueTodayCents)} strong />
            <Row
              label="Club Improvement fee"
              value={
                plan.annualFee
                  ? `${money(fees.annualClubImprovement.amount)}/yr (${fees.annualClubImprovement.month})`
                  : "None"
              }
            />
            <Row label="Early cancellation" value={q.earlyCancellation} />
          </dl>
          <p className="mt-2 text-concrete">
            {plan.termMonths ? afterTerm.description : "Either you or the gym can end it with 30 days' written notice."}
          </p>
        </details>
      </div>
    </article>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="text-concrete">{label}</dt>
      <dd className={`text-right ${strong ? "font-bold text-ink" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
