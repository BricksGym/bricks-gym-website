"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { additionalMember, afterTerm, business, fees, onlineApplication, plans, rules, type PlanId } from "@/config/gym";
import {
  applicationSchema,
  familyMemberSchema,
  issuesToErrors,
  primarySchema,
  type FamilyInput,
  type PrimaryInput,
} from "@/lib/application-schema";
import { ageStatus } from "@/lib/age";
import { formatMoney, isPlanId, money, quote, termLabel } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import { buttonClass, PrelaunchNote } from "@/components/ui";
import { Checkbox, FormAlert, Honeypot, TextArea, TextField, Turnstile } from "@/components/form";
import { submitApplication } from "./actions";

const emptyPrimary: PrimaryInput = {
  firstName: "",
  lastName: "",
  birthdate: "",
  street: "",
  city: "",
  state: "CA",
  zip: "",
  cellPhone: "",
  homePhone: "",
  email: "",
  dlNumber: "",
  dlState: "CA",
};
const emptyMember = (): FamilyInput => ({
  firstName: "",
  lastName: "",
  birthdate: "",
  relationship: "",
  sameAddress: true,
  street: "",
  city: "",
  state: "CA",
  zip: "",
  cellPhone: "",
  email: "",
  dlNumber: "",
  dlState: "CA",
});

type Step = "plan" | "you" | "family" | "review";

export function JoinForm() {
  const params = useSearchParams();
  const initialPlan = params.get("plan");
  const [plan, setPlan] = useState<PlanId>(
    isPlanId(initialPlan) ? initialPlan : (plans.find((p) => p.featured)?.id ?? plans[0].id),
  );
  const [primary, setPrimary] = useState<PrimaryInput>(emptyPrimary);
  const [family, setFamily] = useState<FamilyInput[]>([]);
  const [childCareKids, setChildCareKids] = useState(0);
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState({ terms: false, autoRenew: false, guardian: false, contact: false });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("plan");
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const steps: Step[] = family.length > 0 ? ["plan", "you", "family", "review"] : ["plan", "you", "review"];
  const stepIndex = steps.indexOf(step);
  const labels: Record<Step, string> = { plan: "Plan", you: "Your info", family: "Family", review: "Review" };
  const q = quote(plan, family.length);
  const hasMinor = family.some((m) => ageStatus(m.birthdate).kind === "minor");

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, done]);

  const setFamilyCount = (n: number) => {
    setFamily((f) => (n > f.length ? [...f, ...Array.from({ length: n - f.length }, emptyMember)] : f.slice(0, n)));
  };
  const updatePrimary = (k: keyof PrimaryInput) => (v: string) => setPrimary((p) => ({ ...p, [k]: v }));
  const updateMember = (i: number, k: keyof FamilyInput) => (v: string | boolean) =>
    setFamily((f) => f.map((m, j) => (j === i ? { ...m, [k]: v } : m)));

  function validate(current: Step): Record<string, string> {
    if (current === "you") {
      const r = primarySchema.safeParse(primary);
      return r.success ? {} : issuesToErrors(r.error.issues, "primary.");
    }
    if (current === "family") {
      let errs: Record<string, string> = {};
      family.forEach((m, i) => {
        const r = familyMemberSchema.safeParse(m);
        if (!r.success) errs = { ...errs, ...issuesToErrors(r.error.issues, `family.${i}.`) };
      });
      return errs;
    }
    return {};
  }

  function next() {
    const errs = validate(step);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setAlert(`Please fix ${Object.keys(errs).length === 1 ? "the highlighted field" : "the highlighted fields"}.`);
      return;
    }
    setAlert(null);
    if (step === "plan") track("Application Started", { plan });
    setStep(steps[stepIndex + 1]);
  }
  function back() {
    setErrors({});
    setAlert(null);
    setStep(steps[stepIndex - 1]);
  }

  function submit() {
    const payload = {
      plan,
      primary,
      family,
      childCareKids,
      notes,
      agreeTermsReviewed: agree.terms,
      agreeAutoRenew: agree.autoRenew,
      agreeGuardian: agree.guardian,
      agreeContact: agree.contact,
      turnstileToken: turnstileToken || undefined,
      company,
    };
    const local = applicationSchema.safeParse(payload);
    if (!local.success || (hasMinor && !agree.guardian)) {
      const errs = local.success ? {} : issuesToErrors(local.error.issues);
      if (hasMinor && !agree.guardian) {
        errs.agreeGuardian = `Please confirm you are the parent or legal guardian of the members under ${rules.adultAge}.`;
      }
      setErrors(errs);
      setAlert("Please fix the highlighted items.");
      // Jump back to the step that has a problem.
      const firstKey = Object.keys(errs)[0] ?? "";
      if (firstKey.startsWith("primary.")) setStep("you");
      else if (firstKey.startsWith("family.")) setStep("family");
      return;
    }
    startTransition(async () => {
      const res = await submitApplication(payload);
      if (res.ok) {
        track("Application Submitted", { plan });
        setDone(res.reference);
      } else {
        setErrors(res.errors ?? {});
        setAlert(res.message);
      }
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink focus:outline-none">
          Application received!
        </h2>
        <p className="mt-3 text-lg text-iron">
          Thanks, {primary.firstName}. Your reference number is <strong className="text-ink">{done}</strong>. We sent a
          copy to {primary.email}.
        </p>
        <p className="mt-2 font-semibold">Nothing has been charged.</p>
        <ol className="mx-auto mt-8 max-w-lg space-y-3 text-left">
          {onlineApplication.nextSteps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brick font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-1 text-iron">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-concrete">
          Questions? Call <a className="font-semibold text-brick" href={`tel:${business.phone.replace(/[^0-9+]/g, "")}`}>{business.phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div>
        {/* Progress */}
        <ol className="mb-8 flex gap-2" aria-label="Application progress">
          {steps.map((s, i) => (
            <li key={s} className="flex-1" aria-current={s === step ? "step" : undefined}>
              <div className={`h-2 rounded ${i <= stepIndex ? "bg-brick" : "bg-ink/10"}`} />
              <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${i <= stepIndex ? "text-brick" : "text-concrete"}`}>
                {i + 1}. {labels[s]}
              </p>
            </li>
          ))}
        </ol>

        <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink focus:outline-none">
          {step === "plan" && "Choose your plan"}
          {step === "you" && "Your information"}
          {step === "family" && "Family members"}
          {step === "review" && "Review & submit"}
        </h2>
        <p className="mt-1 text-sm text-concrete">
          Step {stepIndex + 1} of {steps.length}
        </p>

        <div className="mt-4">
          <FormAlert message={alert} />
        </div>

        <form
          className="mt-6 space-y-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step === "review") submit();
            else next();
          }}
        >
          {step === "plan" && (
            <>
              <PrelaunchNote>Prices shown are sample numbers until final pricing is set.</PrelaunchNote>
              <fieldset>
                <legend className="font-semibold">Membership plan</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {plans.map((p) => (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer gap-3 rounded-md border-2 p-4 ${plan === p.id ? "border-brick bg-brick/5" : "border-ink/15"}`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p.id}
                        checked={plan === p.id}
                        onChange={() => setPlan(p.id)}
                        className="mt-1 h-5 w-5 accent-brick"
                      />
                      <span>
                        <span className="block font-semibold">{p.name}</span>
                        <span className="block text-sm text-concrete">
                          {money(p.monthlyDues)}/mo · {termLabel(p)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="family-count" className="block font-semibold">
                    Additional family members
                  </label>
                  <select
                    id="family-count"
                    value={family.length}
                    onChange={(e) => setFamilyCount(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-2 border-ink/20 bg-white px-3 py-2.5"
                  >
                    {Array.from({ length: additionalMember.maxOnlineApplication + 1 }, (_, n) => (
                      <option key={n} value={n}>
                        {n === 0 ? "Just me" : `${n} (+${money(additionalMember.monthlyDues[plan] * n)}/mo)`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-concrete">You&apos;ll be the Primary member and pay for everyone.</p>
                </div>
                <div>
                  <label htmlFor="childcare" className="block font-semibold">
                    Interested in child care?
                  </label>
                  <select
                    id="childcare"
                    value={childCareKids}
                    onChange={(e) => setChildCareKids(Number(e.target.value))}
                    className="mt-1 block w-full rounded border-2 border-ink/20 bg-white px-3 py-2.5"
                  >
                    <option value={0}>No</option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        Yes, {n} {n === 1 ? "child" : "children"}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-concrete">
                    {money(fees.childCare.perVisit)}/visit or {money(fees.childCare.monthly)}/month per child, billed separately.
                  </p>
                </div>
              </div>
            </>
          )}

          {step === "you" && (
            <>
              <p className="text-iron">
                You&apos;re the <strong>Primary member</strong>: the person responsible for the membership and its
                payments. You must be {rules.adultAge} or older.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="First name" name="primary.firstName" autoComplete="given-name" value={primary.firstName} onValue={updatePrimary("firstName")} error={errors["primary.firstName"]} />
                <TextField label="Last name" name="primary.lastName" autoComplete="family-name" value={primary.lastName} onValue={updatePrimary("lastName")} error={errors["primary.lastName"]} />
                <TextField label="Birthdate" name="primary.birthdate" type="date" autoComplete="bday" value={primary.birthdate} onValue={updatePrimary("birthdate")} error={errors["primary.birthdate"]} />
                <TextField label="Email" name="primary.email" type="email" autoComplete="email" value={primary.email} onValue={updatePrimary("email")} error={errors["primary.email"]} />
                <TextField label="Cell phone" name="primary.cellPhone" type="tel" autoComplete="tel" value={primary.cellPhone} onValue={updatePrimary("cellPhone")} error={errors["primary.cellPhone"]} />
                <TextField label="Home phone" optional name="primary.homePhone" type="tel" value={primary.homePhone} onValue={updatePrimary("homePhone")} error={errors["primary.homePhone"]} />
              </div>
              <fieldset className="grid gap-4 sm:grid-cols-6">
                <legend className="mb-2 font-semibold sm:col-span-6">Mailing address</legend>
                <TextField className="sm:col-span-6" label="Street address" name="primary.street" autoComplete="street-address" value={primary.street} onValue={updatePrimary("street")} error={errors["primary.street"]} />
                <TextField className="sm:col-span-3" label="City" name="primary.city" autoComplete="address-level2" value={primary.city} onValue={updatePrimary("city")} error={errors["primary.city"]} />
                <TextField className="sm:col-span-1" label="State" name="primary.state" autoComplete="address-level1" maxLength={2} value={primary.state} onValue={updatePrimary("state")} error={errors["primary.state"]} />
                <TextField className="sm:col-span-2" label="ZIP" name="primary.zip" autoComplete="postal-code" inputMode="numeric" value={primary.zip} onValue={updatePrimary("zip")} error={errors["primary.zip"]} />
              </fieldset>
              {rules.collectDriversLicense && (
                <fieldset className="grid gap-4 sm:grid-cols-6">
                  <legend className="mb-2 font-semibold sm:col-span-6">Driver&apos;s license</legend>
                  <TextField className="sm:col-span-4" label="License number" name="primary.dlNumber" autoComplete="off" value={primary.dlNumber ?? ""} onValue={updatePrimary("dlNumber")} error={errors["primary.dlNumber"]} hint="Used only to verify your identity. Never shown on the website." />
                  <TextField className="sm:col-span-2" label="State" name="primary.dlState" maxLength={2} value={primary.dlState ?? ""} onValue={updatePrimary("dlState")} error={errors["primary.dlState"]} />
                </fieldset>
              )}
            </>
          )}

          {step === "family" &&
            family.map((m, i) => {
              const s = ageStatus(m.birthdate);
              const prefix = `family.${i}.`;
              return (
                <fieldset key={i} className="space-y-4 rounded-md border-2 border-ink/15 p-4">
                  <legend className="px-1 font-display text-xl">Member {i + 2}</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label="First name" name={`${prefix}firstName`} value={m.firstName} onValue={updateMember(i, "firstName")} error={errors[`${prefix}firstName`]} />
                    <TextField label="Last name" name={`${prefix}lastName`} value={m.lastName} onValue={updateMember(i, "lastName")} error={errors[`${prefix}lastName`]} />
                    <TextField label="Birthdate" name={`${prefix}birthdate`} type="date" value={m.birthdate} onValue={updateMember(i, "birthdate")} error={errors[`${prefix}birthdate`]} />
                    <TextField label="Relationship to you" name={`${prefix}relationship`} placeholder="e.g. Spouse, Son" value={m.relationship} onValue={updateMember(i, "relationship")} error={errors[`${prefix}relationship`]} />
                    <TextField label="Cell phone" optional name={`${prefix}cellPhone`} type="tel" value={m.cellPhone} onValue={updateMember(i, "cellPhone")} error={errors[`${prefix}cellPhone`]} />
                    <TextField label="Email" optional name={`${prefix}email`} type="email" value={m.email} onValue={updateMember(i, "email")} error={errors[`${prefix}email`]} />
                  </div>
                  {s.kind === "minor" && (
                    <p className="rounded bg-paper p-3 text-sm text-iron">
                      <strong>Under {rules.adultAge}:</strong> you&apos;ll sign as their parent or guardian.
                      {s.mustBeAccompanied && ` Members aged ${rules.minimumAge}–${rules.accompaniedThroughAge} must be accompanied by a parent or guardian in the gym.`}
                    </p>
                  )}
                  <Checkbox name={`${prefix}sameAddress`} checked={m.sameAddress} onChecked={updateMember(i, "sameAddress")}>
                    Same mailing address as me
                  </Checkbox>
                  {!m.sameAddress && (
                    <div className="grid gap-4 sm:grid-cols-6">
                      <TextField className="sm:col-span-6" label="Street address" name={`${prefix}street`} value={m.street} onValue={updateMember(i, "street")} error={errors[`${prefix}street`]} />
                      <TextField className="sm:col-span-3" label="City" name={`${prefix}city`} value={m.city} onValue={updateMember(i, "city")} error={errors[`${prefix}city`]} />
                      <TextField className="sm:col-span-1" label="State" name={`${prefix}state`} maxLength={2} value={m.state} onValue={updateMember(i, "state")} error={errors[`${prefix}state`]} />
                      <TextField className="sm:col-span-2" label="ZIP" name={`${prefix}zip`} inputMode="numeric" value={m.zip} onValue={updateMember(i, "zip")} error={errors[`${prefix}zip`]} />
                    </div>
                  )}
                  {rules.collectDriversLicense && s.kind === "adult" && (
                    <div className="grid gap-4 sm:grid-cols-6">
                      <TextField className="sm:col-span-4" label="Driver's license number" name={`${prefix}dlNumber`} autoComplete="off" value={m.dlNumber} onValue={updateMember(i, "dlNumber")} error={errors[`${prefix}dlNumber`]} />
                      <TextField className="sm:col-span-2" label="State" name={`${prefix}dlState`} maxLength={2} value={m.dlState} onValue={updateMember(i, "dlState")} error={errors[`${prefix}dlState`]} />
                    </div>
                  )}
                </fieldset>
              );
            })}

          {step === "review" && (
            <>
              <section aria-labelledby="review-cost" className="rounded-md border-2 border-ink/15">
                <h3 id="review-cost" className="border-b border-ink/10 bg-paper px-4 py-3 font-condensed text-lg font-semibold uppercase tracking-wide">
                  Your costs: {q.plan.name}, {q.memberCount} {q.memberCount === 1 ? "member" : "members"}
                </h3>
                <dl className="divide-y divide-ink/10 px-4 text-[15px]">
                  {q.dueTodayLines.map((l) => (
                    <Row key={l.label} label={l.label} value={formatMoney(l.cents)} />
                  ))}
                  <Row label="Total due when you sign" value={formatMoney(q.dueTodayCents)} strong />
                  <Row label="Monthly amount" value={formatMoney(q.monthlyCents)} />
                  <Row
                    label="Monthly payments after signing"
                    value={q.remainingPayments === null ? "Every month until you cancel" : `${q.remainingPayments}`}
                  />
                  <Row label="First monthly payment" value="1 month after you sign" />
                  {q.termDuesTotalCents !== null && (
                    <Row label={`Total dues for the ${q.plan.termMonths}-month term`} value={formatMoney(q.termDuesTotalCents)} />
                  )}
                  <Row label="Club Improvement fee" value={`${formatMoney(q.annualFeeCents)} each ${q.annualFeeMonth}`} />
                  <Row label="Early cancellation fee" value={q.earlyCancellation} />
                </dl>
                <p className="border-t border-ink/10 px-4 py-3 text-sm text-concrete">
                  <strong className="text-ink">Nothing is charged online.</strong> You&apos;ll pay when you sign your agreement with us.
                </p>
              </section>

              <section aria-labelledby="review-people" className="rounded-md border-2 border-ink/15 p-4 text-[15px]">
                <h3 id="review-people" className="font-condensed text-lg font-semibold uppercase tracking-wide">
                  Members
                </h3>
                <ul className="mt-2 space-y-1">
                  <li>
                    <strong>{primary.firstName} {primary.lastName}</strong> (Primary) · {primary.email}
                  </li>
                  {family.map((m, i) => (
                    <li key={i}>
                      {m.firstName} {m.lastName} · {m.relationship}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setStep("you")} className="mt-2 text-sm font-semibold text-brick underline">
                  Edit details
                </button>
              </section>

              <section aria-labelledby="review-terms" className="space-y-4">
                <h3 id="review-terms" className="font-condensed text-lg font-semibold uppercase tracking-wide">
                  Terms
                </h3>
                <div className="rounded-md bg-paper p-4 text-sm text-iron">
                  <p>
                    <strong className="text-ink">Automatic renewal:</strong>{" "}
                    {q.plan.termMonths
                      ? `After your ${q.plan.termMonths}-month term, your membership continues automatically month to month at ${formatMoney(q.monthlyCents)} per month until you cancel with ${afterTerm.noticeDays} days' written notice.`
                      : `Your membership renews automatically every month at ${formatMoney(q.monthlyCents)} until you cancel with ${afterTerm.noticeDays} days' written notice.`}{" "}
                    You can cancel online any time.
                  </p>
                  <p className="mt-2">
                    <strong className="text-ink">Right to cancel:</strong> after you sign your agreement, you can cancel for a full refund
                    before midnight of the {rules.rightToCancelBusinessDays}th business day (not counting Sundays and holidays).
                  </p>
                </div>
                <Checkbox name="agreeTermsReviewed" checked={agree.terms} onChecked={(v) => setAgree((a) => ({ ...a, terms: v }))} error={errors.agreeTermsReviewed}>
                  I have reviewed the{" "}
                  <Link href="/legal/membership-terms" target="_blank" className="font-semibold text-brick underline">
                    Membership Terms
                  </Link>{" "}
                  and understand I will sign the full agreement before my membership starts.
                </Checkbox>
                <Checkbox name="agreeAutoRenew" checked={agree.autoRenew} onChecked={(v) => setAgree((a) => ({ ...a, autoRenew: v }))} error={errors.agreeAutoRenew}>
                  I understand my membership will <strong>renew automatically</strong> each month as described above until I cancel.
                </Checkbox>
                {hasMinor && (
                  <Checkbox name="agreeGuardian" checked={agree.guardian} onChecked={(v) => setAgree((a) => ({ ...a, guardian: v }))} error={errors.agreeGuardian}>
                    I am the parent or legal guardian of the members under {rules.adultAge} on this application.
                  </Checkbox>
                )}
                <Checkbox name="agreeContact" checked={agree.contact} onChecked={(v) => setAgree((a) => ({ ...a, contact: v }))} error={errors.agreeContact}>
                  {business.name} may contact me by phone, text or email about this application.
                </Checkbox>
              </section>

              <TextArea label="Anything we should know?" optional name="notes" value={notes} onValue={setNotes} rows={3} />
              <Turnstile onToken={setTurnstileToken} />
              <Honeypot value={company} onValue={setCompany} />
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
            {stepIndex > 0 && (
              <button type="button" onClick={back} className={buttonClass("outline")}>
                Back
              </button>
            )}
            <button type="submit" disabled={pending} className={`${buttonClass("primary")} disabled:opacity-60`}>
              {step === "review" ? (pending ? "Sending…" : "Submit application") : "Continue"}
            </button>
          </div>
          <p className="text-sm text-concrete">
            We never ask for card or bank details on this website. Payment is set up securely with our member system when you sign.
          </p>
        </form>
      </div>

      {/* Running summary */}
      <aside className="h-fit rounded-md border-2 border-ink/15 bg-paper p-5 lg:sticky lg:top-28" aria-label="Cost summary">
        <p className="stamp text-xs text-brick">Your plan</p>
        <p className="mt-1 font-display text-2xl">{q.plan.name}</p>
        <p className="text-concrete">
          {q.memberCount} {q.memberCount === 1 ? "member" : "members"}
        </p>
        <dl className="mt-4 space-y-2 text-[15px]">
          <div className="flex justify-between">
            <dt>Due at signing</dt>
            <dd className="font-bold">{formatMoney(q.dueTodayCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Then monthly</dt>
            <dd className="font-bold">{formatMoney(q.monthlyCents)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-concrete">Nothing is charged online.</p>
      </aside>
    </div>
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
