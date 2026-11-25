"use server";

import { business, onlineApplication, rules } from "@/config/gym";
import { applicationSchema, issuesToErrors, type Application } from "@/lib/application-schema";
import { ageOn, ageStatus } from "@/lib/age";
import { formatMoney, quote, termLabel } from "@/lib/pricing";
import { emailLayout, escapeHtml, rowsTable, rowsText, sendEmail } from "@/lib/server/email";
import { clientIp, formatTimestamp, rateLimited, referenceId, verifyTurnstile } from "@/lib/server/guard";

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; message: string; errors?: Record<string, string> };

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};
const fmtPhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p;
};

export async function submitApplication(input: unknown): Promise<SubmitResult> {
  const ip = await clientIp();
  if (rateLimited(`join:${ip}`)) {
    return { ok: false, message: "Too many attempts. Please wait a few minutes and try again, or call us." };
  }

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: issuesToErrors(parsed.error.issues),
    };
  }
  const app = parsed.data;
  if (app.company) return { ok: true, reference: referenceId() }; // spam trap: pretend success

  if (!(await verifyTurnstile(app.turnstileToken, ip))) {
    return { ok: false, message: "We couldn't verify you're not a robot. Please try again." };
  }

  const reference = referenceId();
  const submittedAt = formatTimestamp();
  try {
    await sendEmail(gymEmail(app, reference, submittedAt));
    await sendEmail(applicantEmail(app, reference));
  } catch {
    return {
      ok: false,
      message: `Sorry, something went wrong sending your application. Please try again or call us at ${business.phone}.`,
    };
  }
  return { ok: true, reference };
}

/** Full details for the gym, laid out in the order of the membership form. */
function gymEmail(app: Application, reference: string, submittedAt: string) {
  const q = quote(app.plan, app.family.length);
  const p = app.primary;
  const addr = `${p.street}, ${p.city}, ${p.state} ${p.zip}`;

  const membership: [string, string][] = [
    ["Membership #", "________ (assign in Club Systems)"],
    ["Primary #", "________ (assign in Club Systems)"],
    ["Consultant", "Online application"],
    ["Membership type", `${q.plan.name}${app.family.length ? ` + ${app.family.length} additional` : ""}`],
    ["Initial number of months", q.plan.termMonths ? String(q.plan.termMonths) : "Month-to-month"],
    ["Enrollment fee", formatMoney(q.enrollmentCents)],
    ["First month's dues", formatMoney(q.firstMonthCents)],
    ["Last month's dues", q.plan.lastMonthDueAtSignup ? formatMoney(q.lastMonthCents) : "Not required"],
    ["Total due at signing", formatMoney(q.dueTodayCents)],
    ["Initial number of payments", q.remainingPayments === null ? "Ongoing (month-to-month)" : String(q.remainingPayments)],
    ["Monthly amount", formatMoney(q.monthlyCents)],
    ["First payment due", "1 month after signing"],
    ["Club Improvement fee", `${formatMoney(q.annualFeeCents)} each ${q.annualFeeMonth}`],
    ["Early cancellation fee", q.earlyCancellation],
  ];

  const primary: [string, string][] = [
    ["Last name", p.lastName],
    ["First name", p.firstName],
    ["Birthdate", `${fmtDate(p.birthdate)} (age ${ageOn(p.birthdate) ?? "?"})`],
    ["Address", addr],
    ["Cell phone", fmtPhone(p.cellPhone)],
    ["Home phone", p.homePhone ? fmtPhone(p.homePhone) : ""],
    ["Email", p.email],
    ["Driver's license #", p.dlNumber ? `${p.dlNumber} (${p.dlState})` : ""],
  ];

  const familyBlocks = app.family.map((m, i) => {
    const s = ageStatus(m.birthdate);
    const age = "age" in s ? s.age : 0;
    const flags =
      s.kind === "minor"
        ? `MINOR (age ${age}): parent/guardian signature required${s.mustBeAccompanied ? "; MUST BE ACCOMPANIED by parent/guardian" : ""}`
        : "";
    const rows: [string, string][] = [
      ["Last name", m.lastName],
      ["First name", m.firstName],
      ["Birthdate", `${fmtDate(m.birthdate)} (age ${age})`],
      ["Relationship to Primary", m.relationship],
      ["Address", m.sameAddress ? `Same as Primary (${addr})` : `${m.street}, ${m.city}, ${m.state} ${m.zip}`],
      ["Cell phone", m.cellPhone ? fmtPhone(m.cellPhone) : ""],
      ["Email", m.email],
      [
        "Driver's license #",
        s.kind === "minor" ? "Minor: use Primary's (parent/guardian)" : m.dlNumber ? `${m.dlNumber} (${m.dlState})` : "",
      ],
      ...(flags ? ([["⚠ Flag on record", flags]] as [string, string][]) : []),
    ];
    return { title: `Additional member ${i + 1}`, rows };
  });

  const other: [string, string][] = [
    ["Child care interest", app.childCareKids ? `${app.childCareKids} child(ren)` : "None"],
    ["Notes from applicant", app.notes],
    ["Reviewed membership terms", "Yes"],
    ["Acknowledged automatic renewal (separate checkbox)", "Yes"],
    ...(app.family.some((m) => ageStatus(m.birthdate).kind === "minor")
      ? ([["Confirmed parent/guardian of minors", "Yes"]] as [string, string][])
      : []),
    ["Submitted", submittedAt],
    ["Reference", reference],
  ];

  const section = (title: string, rows: [string, string][]) =>
    `<h2 style="font-size:15px;margin:24px 0 8px;color:#8B1E22;text-transform:uppercase;letter-spacing:1px">${escapeHtml(title)}</h2>${rowsTable(rows)}`;

  const html = emailLayout(
    `New membership application: ${p.firstName} ${p.lastName}`,
    `<p style="font-size:14px;background:#FFF4E5;border:1px solid #F0C27B;padding:10px">
      <strong>To do:</strong> enter this member in Club Systems, assign the member number, then contact the applicant to sign the agreement and set up payment.
      <br><strong>Contains a driver's license number: delete this email once entered.</strong></p>` +
      section("Membership", membership) +
      section("Primary member (financially responsible)", primary) +
      familyBlocks.map((b) => section(b.title, b.rows)).join("") +
      section("Other", other),
  );
  const text = [
    `NEW MEMBERSHIP APPLICATION (${reference})`,
    "",
    "MEMBERSHIP",
    rowsText(membership),
    "",
    "PRIMARY MEMBER",
    rowsText(primary),
    ...familyBlocks.flatMap((b) => ["", b.title.toUpperCase(), rowsText(b.rows)]),
    "",
    "OTHER",
    rowsText(other),
  ].join("\n");

  return {
    to: business.inboxEmail,
    subject: `New membership application: ${p.firstName} ${p.lastName} (${q.plan.name})`,
    html,
    text,
    replyTo: p.email,
  };
}

/** Confirmation for the applicant. No license number or other sensitive data. */
function applicantEmail(app: Application, reference: string) {
  const q = quote(app.plan, app.family.length);
  const p = app.primary;
  const cost: [string, string][] = [
    ["Plan", `${q.plan.name} (${termLabel(q.plan)})`],
    ["Members", String(q.memberCount)],
    ...q.dueTodayLines.map((l) => [l.label, formatMoney(l.cents)] as [string, string]),
    ["Total due when you sign", formatMoney(q.dueTodayCents)],
    ["Monthly amount", formatMoney(q.monthlyCents)],
    [
      "Monthly payments after signing",
      q.remainingPayments === null ? "Every month until you cancel" : String(q.remainingPayments),
    ],
    ["Club Improvement fee", `${formatMoney(q.annualFeeCents)} each ${q.annualFeeMonth}`],
    ["Early cancellation fee", q.earlyCancellation],
  ];
  const steps = onlineApplication.nextSteps;
  const html = emailLayout(
    `Thanks, ${p.firstName}! We got your application.`,
    `<p>Your reference number is <strong>${escapeHtml(reference)}</strong>. We'll be in touch ${escapeHtml(onlineApplication.responseTime)}.</p>
     <p><strong>Nothing has been charged.</strong> Your membership starts when you sign your agreement and set up payment with us.</p>
     <h2 style="font-size:15px;margin:24px 0 8px">What happens next</h2>
     <ol style="padding-left:20px;font-size:14px">${steps.map((s) => `<li style="margin:4px 0">${escapeHtml(s)}</li>`).join("")}</ol>
     <h2 style="font-size:15px;margin:24px 0 8px">Your estimated costs</h2>${rowsTable(cost)}
     <p style="font-size:13px;color:#6E6663;margin-top:16px">Your membership renews automatically each month after any initial term until you cancel. After you sign, you have ${rules.rightToCancelBusinessDays} business days (not counting Sundays and holidays) to cancel for a full refund. You can cancel any time online at ${escapeHtml(business.siteUrl)}/cancel.</p>
     <p style="font-size:13px;color:#6E6663">Questions? Call ${escapeHtml(business.phone)} or reply to this email.<br>${escapeHtml(business.name)} · ${escapeHtml(business.address.street)}, ${escapeHtml(business.address.city)}, ${escapeHtml(business.address.state)}</p>`,
  );
  const text = [
    `Thanks, ${p.firstName}! We got your Bricks Gym membership application.`,
    `Reference: ${reference}. Nothing has been charged.`,
    "",
    "What happens next:",
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Your estimated costs:",
    rowsText(cost),
    "",
    `Questions? Call ${business.phone}.`,
  ].join("\n");
  return {
    to: p.email,
    subject: `We got your ${business.name} application (${reference})`,
    html,
    text,
    replyTo: business.email || business.inboxEmail,
  };
}
