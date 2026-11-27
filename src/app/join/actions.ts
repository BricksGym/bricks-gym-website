"use server";

import { business, onlineApplication, rules } from "@/config/gym";
import { AGREEMENT_VERSION, agreementPlainText, initialedSections } from "@/content/agreement";
import { applicationSchema, issuesToErrors, type Application } from "@/lib/application-schema";
import { ageOn, ageStatus } from "@/lib/age";
import { formatMoney, hasEnrollmentDeal, money, quote, type Quote } from "@/lib/pricing";
import { annualFeeMonth, autoDraft, formatYmd, gymToday } from "@/lib/billing";
import { emailLayout, escapeHtml, rowsTable, rowsText, sendEmail } from "@/lib/server/email";
import { clientIp, formatTimestamp, rateLimited, referenceId, verifyTurnstile } from "@/lib/server/guard";

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; message: string; errors?: Record<string, string> };

type Rows = [string, string][];

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
      message: "Please fix the highlighted items.",
      errors: issuesToErrors(parsed.error.issues),
    };
  }
  const app = parsed.data;
  if (app.company) return { ok: true, reference: referenceId() }; // spam trap: pretend success

  if (!(await verifyTurnstile(app.turnstileToken, ip))) {
    return { ok: false, message: "We couldn't verify you're not a robot. Please try again." };
  }

  const reference = referenceId();
  const signedAt = formatTimestamp();
  try {
    await sendEmail(setupEmail(app, reference, signedAt));
  } catch {
    return {
      ok: false,
      message: `Sorry, something went wrong sending your sign-up. Please try again or call us at ${business.phone}.`,
    };
  }
  // Signed copies: one for the member (they must receive a copy of the
  // contract) and one for the gym to keep on file. If either fails, the
  // sign-up itself still went through.
  for (const who of ["member", "gym"] as const) {
    try {
      await sendEmail(signedCopyEmail(app, reference, signedAt, who, ip));
    } catch {
      console.error(`Signed copy (${who}) not sent for ${reference}`);
    }
  }
  return { ok: true, reference };
}

/** The costs, laid out like the "Membership summary" on the paper agreement. */
function summaryRows(app: Application, q: Quote): Rows {
  const today = gymToday();
  const draft = autoDraft(today);
  return [
    ["Membership type", `${q.plan.name}${app.family.length ? ` + ${app.family.length} additional` : ""}`],
    ["Initial number of months", q.plan.termMonths ? String(q.plan.termMonths) : "Month-to-month"],
    [
      "Enrollment fee",
      hasEnrollmentDeal(q.plan)
        ? `${formatMoney(q.enrollmentCents)} (normally ${money(q.plan.regularEnrollmentFee)})`
        : formatMoney(q.enrollmentCents),
    ],
    ["First month's dues", formatMoney(q.firstMonthCents)],
    ["Last month's dues", q.plan.lastMonthDueAtSignup ? formatMoney(q.lastMonthCents) : "Not required"],
    ["Total due at signing", formatMoney(q.dueTodayCents)],
    ["Monthly amount", formatMoney(q.monthlyCents)],
    ["Monthly auto-draft", `${draft.dayLabel.replace(/^the /, "The ")}, starting ${formatYmd(draft.first)}`],
    ["Annual fee", q.plan.annualFee ? `${q.annualFeeText}, billed each ${annualFeeMonth(today)} (based on sign-up date)` : "None"],
    ["Cancellation fee", q.plan.termMonths ? `${q.earlyCancellation} (before the term ends)` : "None"],
  ];
}

const section = (title: string, rows: Rows) =>
  `<h2 style="font-size:15px;margin:24px 0 8px;color:#8B1E22;text-transform:uppercase;letter-spacing:1px">${escapeHtml(title)}</h2>${rowsTable(rows)}`;

/**
 * For the gym: everything needed to enter the member in Club Systems, in the
 * order of the paper form. Contains the driver's license number.
 */
function setupEmail(app: Application, reference: string, signedAt: string) {
  const q = quote(app.plan, app.family.length);
  const p = app.primary;
  const addr = `${p.street}, ${p.city}, ${p.state} ${p.zip}`;

  const membership: Rows = [
    ["Membership #", "________ (assign in Club Systems)"],
    ["Primary #", "________ (assign in Club Systems)"],
    ["Consultant", "Online sign-up"],
    ...summaryRows(app, q),
    ["Payment schedule: initial # of payments", q.remainingPayments === null ? "Ongoing (month-to-month)" : String(q.remainingPayments)],
    ["Payment schedule: monthly amount", formatMoney(q.monthlyCents)],
    ["Payment schedule: first auto-draft", formatYmd(autoDraft(gymToday()).first)],
  ];

  const primary: Rows = [
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
        ? `MINOR (age ${age}): parent/guardian signed${s.mustBeAccompanied ? "; MUST BE ACCOMPANIED by parent/guardian" : ""}`
        : "";
    const rows: Rows = [
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
      ...(flags ? ([["⚠ Flag on record", flags]] as Rows) : []),
    ];
    return { title: `Additional member ${i + 1}`, rows };
  });

  const other: Rows = [
    ["Notes from member", app.notes],
    ["Agreement", `Signed online by ${app.signatureName} on ${signedAt} (signed copy sent in a separate email)`],
    ["Submitted", signedAt],
    ["Reference", reference],
  ];

  const html = emailLayout(
    `New member sign-up: ${p.firstName} ${p.lastName}`,
    `<p style="font-size:14px;background:#FFF4E5;border:1px solid #F0C27B;padding:10px">
      <strong>To do:</strong> 1) Enter this member in Club Systems and assign the member number.
      2) Call ${escapeHtml(fmtPhone(p.cellPhone))} to take their payment card over the phone and enter it directly into Club Systems.
      3) Let them know they can come in.
      <br><strong>This email contains a driver's license number: delete it once entered.</strong>
      Keep the separate "Signed agreement" email on file.</p>` +
      section("Membership summary", membership) +
      section("Primary member (financially responsible)", primary) +
      familyBlocks.map((b) => section(b.title, b.rows)).join("") +
      section("Other", other),
  );
  const text = [
    `NEW MEMBER SIGN-UP (${reference})`,
    "",
    "MEMBERSHIP SUMMARY",
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
    subject: `New member sign-up: ${p.firstName} ${p.lastName} (${q.plan.name})`,
    html,
    text,
    replyTo: p.email,
  };
}

/**
 * The signed agreement: summary, signature record and the full agreement
 * text with the member's initials. No driver's license number.
 */
function signedCopyEmail(app: Application, reference: string, signedAt: string, who: "member" | "gym", ip: string) {
  const q = quote(app.plan, app.family.length);
  const p = app.primary;
  const hasMinor = app.family.some((m) => ageStatus(m.birthdate).kind === "minor");
  const sectionCount = initialedSections().length;

  const members: Rows = [
    ["Primary member", `${p.firstName} ${p.lastName} · ${p.email} · ${fmtPhone(p.cellPhone)}`],
    ...app.family.map((m, i) => [`Additional member ${i + 1}`, `${m.firstName} ${m.lastName} (${m.relationship})`] as [string, string]),
  ];
  const signature: Rows = [
    ["Signed by (typed signature)", app.signatureName],
    ["Signed on", signedAt],
    ["Initials", `${app.initials} on all ${sectionCount} sections marked for initials`],
    ["Agreed to automatic renewal (separate checkbox)", "Yes"],
    ["Agreed to sign electronically", "Yes"],
    ...(hasMinor ? ([["Signed as parent/guardian of members under 18", "Yes"]] as Rows) : []),
    ["Agreement version", AGREEMENT_VERSION],
    ["Reference", reference],
    ...(who === "gym" ? ([["Signed from IP address", ip]] as Rows) : []),
  ];
  const cancelDay =
    ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh"][rules.rightToCancelBusinessDays] ??
    String(rules.rightToCancelBusinessDays);
  const rightToCancel = `YOUR RIGHT TO CANCEL: You may cancel this agreement for a full refund before midnight of the ${cancelDay} business day after the date you signed it, not counting Sundays and holidays. To cancel, deliver or mail a signed and dated notice to ${business.noticeAddress}, or email ${business.email || business.inboxEmail}.`;
  const agreement = agreementPlainText({ initials: app.initials });
  const steps = onlineApplication.nextSteps;

  const intro =
    who === "member"
      ? `<p>Thanks, ${escapeHtml(p.firstName)}! Here is your signed ${escapeHtml(business.name)} membership agreement. Please keep this email for your records.</p>
         <p><strong>Nothing has been charged yet.</strong> We'll call you to set up your payment card.</p>
         <h2 style="font-size:15px;margin:24px 0 8px">What happens next</h2>
         <ol style="padding-left:20px;font-size:14px">${steps.map((s) => `<li style="margin:4px 0">${escapeHtml(s)}</li>`).join("")}</ol>`
      : `<p style="font-size:14px;background:#EEF6EE;border:1px solid #9CC79C;padding:10px"><strong>Keep this email on file.</strong> It is the member's signed agreement (no driver's license number).</p>`;

  const html = emailLayout(
    who === "member" ? "Your signed membership agreement" : `Signed agreement: ${p.firstName} ${p.lastName}`,
    intro +
      section("Membership summary", summaryRows(app, q)) +
      section("Members", members) +
      section("Signature", signature) +
      `<p style="border:3px solid #141111;padding:10px;font-weight:bold;font-size:14px;margin-top:20px">${escapeHtml(rightToCancel)}</p>` +
      `<h2 style="font-size:15px;margin:24px 0 8px;color:#8B1E22;text-transform:uppercase;letter-spacing:1px">Full agreement</h2>` +
      `<pre style="white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#2A2524;background:#FAF7F2;padding:12px;border:1px solid #e5ded3">${escapeHtml(agreement)}</pre>` +
      `<p style="font-size:13px;color:#6E6663">Questions? Call ${escapeHtml(business.phone)} or reply to this email.<br>${escapeHtml(business.name)} · ${escapeHtml(business.address.street)}, ${escapeHtml(business.address.city)}, ${escapeHtml(business.address.state)}</p>`,
  );
  const text = [
    who === "member" ? `Your signed ${business.name} membership agreement (${reference})` : `SIGNED AGREEMENT (keep on file): ${p.firstName} ${p.lastName} (${reference})`,
    "",
    "MEMBERSHIP SUMMARY",
    rowsText(summaryRows(app, q)),
    "",
    "MEMBERS",
    rowsText(members),
    "",
    "SIGNATURE",
    rowsText(signature),
    "",
    rightToCancel,
    "",
    agreement,
  ].join("\n");

  return who === "member"
    ? {
        to: p.email,
        subject: `Your signed ${business.name} membership agreement (${reference})`,
        html,
        text,
        replyTo: business.email || business.inboxEmail,
      }
    : {
        to: business.inboxEmail,
        subject: `Signed agreement (keep on file): ${p.firstName} ${p.lastName} (${reference})`,
        html,
        text,
        replyTo: p.email,
      };
}
