"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { additionalMember, afterTerm, business, onlineApplication, plans, rules, type PlanId } from "@/config/gym";
import { AgreementText } from "@/components/AgreementText";
import { initialedSections } from "@/content/agreement";
import { annualFeeMonth, autoDraft, formatYmd, gymToday } from "@/lib/billing";
import {
  applicationSchema,
  familyMemberSchema,
  issuesToErrors,
  primarySchema,
  type FamilyInput,
  type PrimaryInput,
} from "@/lib/application-schema";
import { ageStatus } from "@/lib/age";
import { formatMoney, hasEnrollmentDeal, isPlanId, money, quote, termLabel } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import { buttonClass, PrelaunchNote, Prose, RatesNote } from "@/components/ui";
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

type Step = "plan" | "you" | "family" | "sign";

const SECTIONS = initialedSections();

export function JoinForm() {
  const params = useSearchParams();
  const initialPlan = params.get("plan");
  const [plan, setPlan] = useState<PlanId>(
    isPlanId(initialPlan) ? initialPlan : (plans.find((p) => p.featured)?.id ?? plans[0].id),
  );
  const [primary, setPrimary] = useState<PrimaryInput>(emptyPrimary);
  const [family, setFamily] = useState<FamilyInput[]>([]);
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState({ read: false, autoRenew: false, guardian: false, contact: false, eSign: false });
  const [initials, setInitials] = useState("");
  const [initialed, setInitialed] = useState<string[]>([]);
  const [signatureName, setSignatureName] = useState("");
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const agreementBox = useRef<HTMLDivElement>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("plan");
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const steps: Step[] = family.length > 0 ? ["plan", "you", "family", "sign"] : ["plan", "you", "sign"];
  const stepIndex = steps.indexOf(step);
  const labels: Record<Step, string> = { plan: "Plan", you: "Your info", family: "Family", sign: "Agreement" };
  const q = quote(plan, family.length);
  const hasMinor = family.some((m) => ageStatus(m.birthdate).kind === "minor");
  const today = gymToday();
  const draft = autoDraft(today);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, done]);

  // The "I have read" box unlocks once the agreement has been scrolled to the end.
  useEffect(() => {
    if (step !== "sign") return;
    const el = agreementBox.current;
    if (el && el.scrollHeight <= el.clientHeight + 8) setScrolledToEnd(true);
  }, [step]);
  const onAgreementScroll = () => {
    const el = agreementBox.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setScrolledToEnd(true);
  };
  const toggleInitial = (id: string, on: boolean) =>
    setInitialed((list) => (on ? [...new Set([...list, id])] : list.filter((x) => x !== id)));

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
      notes,
      agreeTermsRead: agree.read,
      initials,
      initialedSections: initialed,
      agreeAutoRenew: agree.autoRenew,
      agreeGuardian: agree.guardian,
      agreeContact: agree.contact,
      signatureName,
      agreeESign: agree.eSign,
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
          You&apos;re signed up!
        </h2>
        <p className="mt-3 text-lg text-iron">
          Thanks, {primary.firstName}. Your reference number is <strong className="text-ink">{done}</strong>. A copy of
          your signed agreement was emailed to {primary.email}.
        </p>
        <p className="mt-2 font-semibold">Nothing has been charged yet.</p>
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
          {step === "sign" && "Review & sign your agreement"}
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
            if (step === "sign") submit();
            else next();
          }}
        >
          {step === "plan" && (
            <>
              <RatesNote />
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
                        {p.badge && (
                          <span className="mt-1 inline-block rounded bg-brick px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                            {p.badge}
                          </span>
                        )}
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

          {step === "sign" && (
            <>
              {/* Membership summary, laid out like the paper agreement */}
              <section aria-labelledby="sign-summary" className="rounded-md border-2 border-ink/15">
                <h3 id="sign-summary" className="border-b border-ink/10 bg-paper px-4 py-3 font-condensed text-lg font-semibold uppercase tracking-wide">
                  Membership summary
                </h3>
                <dl className="divide-y divide-ink/10 px-4 text-[15px]">
                  <Row
                    label="Membership type"
                    value={`${q.plan.name}${family.length ? ` + ${family.length} additional ${family.length === 1 ? "member" : "members"}` : ""}`}
                  />
                  <Row label="Initial number of months" value={q.plan.termMonths ? String(q.plan.termMonths) : "Month to month"} />
                  <Row
                    label="Enrollment fee"
                    value={
                      hasEnrollmentDeal(q.plan)
                        ? `${formatMoney(q.enrollmentCents)} (normally ${money(q.plan.regularEnrollmentFee)})`
                        : formatMoney(q.enrollmentCents)
                    }
                  />
                  <Row label="First month's dues" value={formatMoney(q.firstMonthCents)} />
                  <Row label="Last month's dues" value={q.plan.lastMonthDueAtSignup ? formatMoney(q.lastMonthCents) : "Not required"} />
                  <Row label="Total due at signing" value={formatMoney(q.dueTodayCents)} strong />
                  <Row label="Monthly amount" value={formatMoney(q.monthlyCents)} />
                  <Row
                    label="Monthly auto-draft"
                    value={`${draft.dayLabel.replace(/^the /, "The ")}, starting ${formatYmd(draft.first)}`}
                  />
                  <Row
                    label="Annual fee"
                    value={q.plan.annualFee ? `${q.annualFeeText}, billed each ${annualFeeMonth(today)} (based on your sign-up date)` : "None"}
                  />
                  <Row label="Cancellation fee" value={q.plan.termMonths ? `${q.earlyCancellation} (before the term ends)` : "None"} />
                </dl>
                <div className="border-t border-ink/10 px-4 py-3 text-sm">
                  <p className="font-semibold text-ink">Members</p>
                  <ul className="mt-1 text-iron">
                    <li>
                      {primary.firstName} {primary.lastName} (Primary, financially responsible)
                    </li>
                    {family.map((m, i) => (
                      <li key={i}>
                        {m.firstName} {m.lastName} ({m.relationship})
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => setStep("you")} className="mt-1 font-semibold text-brick underline">
                    Edit details
                  </button>
                </div>
              </section>

              {/* Full agreement */}
              <section aria-labelledby="sign-agreement" className="space-y-3">
                <h3 id="sign-agreement" className="font-condensed text-lg font-semibold uppercase tracking-wide">
                  Membership agreement: please read it all
                </h3>
                <div
                  ref={agreementBox}
                  onScroll={onAgreementScroll}
                  tabIndex={0}
                  role="region"
                  aria-label="Membership agreement"
                  className="max-h-[28rem] overflow-y-auto rounded-md border-2 border-ink/15 bg-white p-4"
                >
                  <Prose>
                    <AgreementText />
                  </Prose>
                </div>
                {!scrolledToEnd && (
                  <p className="text-sm font-semibold text-brick">Scroll to the end of the agreement to continue.</p>
                )}
                <Checkbox
                  name="agreeTermsRead"
                  checked={agree.read}
                  disabled={!scrolledToEnd}
                  onChecked={(v) => setAgree((a) => ({ ...a, read: v }))}
                  error={errors.agreeTermsRead}
                >
                  I have read the entire membership agreement, including the Conditions of Membership.
                </Checkbox>
              </section>

              {/* Initials */}
              <section aria-labelledby="sign-initials" className="space-y-3">
                <h3 id="sign-initials" className="font-condensed text-lg font-semibold uppercase tracking-wide">
                  Initial each section
                </h3>
                <TextField
                  className="max-w-[12rem]"
                  label="Your initials"
                  name="initials"
                  autoComplete="off"
                  maxLength={4}
                  value={initials}
                  onValue={(v) => setInitials(v.toUpperCase().replace(/[^A-Z]/g, ""))}
                  error={errors.initials}
                />
                <ul className="divide-y divide-ink/10 rounded-md border-2 border-ink/15">
                  {SECTIONS.map((sec) => {
                    const on = initialed.includes(sec.id);
                    return (
                      <li key={sec.id}>
                        <label
                          className={`flex items-center justify-between gap-3 px-4 py-2.5 ${initials ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                        >
                          <span className="text-[15px]">{sec.title}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span
                              className={`min-w-[3.5rem] border-b-2 px-2 text-center font-display ${on ? "border-brick text-brick" : "border-ink/30 text-concrete/50"}`}
                            >
                              {on ? initials : "initial"}
                            </span>
                            <input
                              type="checkbox"
                              className="h-5 w-5 accent-brick"
                              checked={on}
                              disabled={!initials}
                              onChange={(e) => toggleInitial(sec.id, e.target.checked)}
                              aria-label={`Initial: ${sec.title}`}
                            />
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                {!initials && <p className="text-sm text-concrete">Enter your initials first, then check each section.</p>}
                {errors.initialedSections && (
                  <p className="text-sm font-semibold text-brick">{errors.initialedSections}</p>
                )}
              </section>

              {/* Right to cancel, auto-renewal and other consents */}
              <section className="space-y-4">
                <div className="rounded-md border-4 border-ink p-4 text-[15px] font-bold text-ink">
                  Your right to cancel: you may cancel this agreement for a full refund before midnight of the{" "}
                  {["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh"][rules.rightToCancelBusinessDays] ??
                    rules.rightToCancelBusinessDays}{" "}
                  business day after you sign it, not counting Sundays and holidays. Section 9 of the agreement explains how.
                </div>
                <Checkbox
                  name="agreeAutoRenew"
                  checked={agree.autoRenew}
                  onChecked={(v) => setAgree((a) => ({ ...a, autoRenew: v }))}
                  error={errors.agreeAutoRenew}
                >
                  <strong>Automatic renewal:</strong>{" "}
                  {q.plan.termMonths
                    ? `I agree that after my ${q.plan.termMonths}-month term, my membership continues automatically month to month at ${formatMoney(q.monthlyCents)} a month until I cancel with ${afterTerm.noticeDays} days' written notice.`
                    : `I agree that my membership renews automatically every month at ${formatMoney(q.monthlyCents)} until I cancel with ${afterTerm.noticeDays} days' written notice.`}
                </Checkbox>
                {hasMinor && (
                  <Checkbox
                    name="agreeGuardian"
                    checked={agree.guardian}
                    onChecked={(v) => setAgree((a) => ({ ...a, guardian: v }))}
                    error={errors.agreeGuardian}
                  >
                    I am the parent or legal guardian of the members under {rules.adultAge} on this membership, and I sign this
                    agreement for them.
                  </Checkbox>
                )}
                <Checkbox
                  name="agreeContact"
                  checked={agree.contact}
                  onChecked={(v) => setAgree((a) => ({ ...a, contact: v }))}
                  error={errors.agreeContact}
                >
                  {business.name} may contact me by phone, text or email to set up my membership and payment.
                </Checkbox>
              </section>

              {/* Signature */}
              <section aria-labelledby="sign-signature" className="space-y-3 rounded-md border-2 border-brick/40 bg-[#fff6f4] p-4">
                <h3 id="sign-signature" className="font-condensed text-lg font-semibold uppercase tracking-wide">
                  Member signature
                </h3>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <TextField
                    label="Type your full name to sign"
                    name="signatureName"
                    autoComplete="name"
                    value={signatureName}
                    onValue={setSignatureName}
                    error={errors.signatureName}
                  />
                  <p className="pb-3 text-sm text-concrete">
                    Date: <strong className="text-ink">{new Date().toLocaleDateString("en-US")}</strong>
                  </p>
                </div>
                {signatureName.trim() && (
                  <p className="font-display text-2xl text-ink" aria-hidden="true">
                    {signatureName}
                  </p>
                )}
                <Checkbox
                  name="agreeESign"
                  checked={agree.eSign}
                  onChecked={(v) => setAgree((a) => ({ ...a, eSign: v }))}
                  error={errors.agreeESign}
                >
                  I agree that typing my name above is my electronic signature on this membership agreement
                  {hasMinor ? ", as the Primary member and as parent or guardian" : ""}.
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
              {step === "sign" ? (pending ? "Sending…" : "Sign & submit") : "Continue"}
            </button>
          </div>
          <p className="text-sm text-concrete">
            We never ask for card or bank details on this website. We&apos;ll call you to set up payment securely after you sign up.
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
