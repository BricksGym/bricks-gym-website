"use server";

import { z } from "zod";
import { afterTerm, business, rules } from "@/config/gym";
import { issuesToErrors } from "@/lib/application-schema";
import { emailLayout, escapeHtml, rowsTable, rowsText, sendEmail } from "@/lib/server/email";
import { clientIp, formatTimestamp, rateLimited, referenceId, verifyTurnstile } from "@/lib/server/guard";
import type { FormResult } from "@/app/contact/actions";

const cancelSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().max(120).pipe(z.email("Enter the email on your account")),
  phone: z.string().trim().max(30),
  memberNumber: z.string().trim().max(30),
  reason: z.string().trim().max(1000),
  confirm: z.literal(true, { error: "Please confirm you want to cancel." }),
  turnstileToken: z.string().max(4096).optional(),
  company: z.string().max(0).optional(),
});

/**
 * Online cancellation (California Automatic Renewal Law). Creates a
 * timestamped request, emails the gym and the member immediately. The gym
 * then processes it in Club Systems. No retention offer, no call required.
 */
export async function submitCancellation(input: unknown): Promise<FormResult> {
  const ip = await clientIp();
  if (rateLimited(`cancel:${ip}`)) return { ok: false, message: "Too many attempts. Please try again in a few minutes." };
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: issuesToErrors(parsed.error.issues) };
  const c = parsed.data;
  if (c.company) return { ok: true, reference: referenceId("CX"), timestamp: formatTimestamp() };
  if (!(await verifyTurnstile(c.turnstileToken, ip))) return { ok: false, message: "Bot check failed. Please try again." };

  const reference = referenceId("CX");
  const timestamp = formatTimestamp();
  const rows: [string, string][] = [
    ["Request #", reference],
    ["Received", timestamp],
    ["Name", `${c.firstName} ${c.lastName}`],
    ["Email", c.email],
    ["Phone", c.phone],
    ["Member #", c.memberNumber],
    ["Reason (optional)", c.reason],
  ];

  try {
    await sendEmail({
      to: business.inboxEmail,
      subject: `CANCELLATION REQUEST ${reference}: ${c.firstName} ${c.lastName}`,
      replyTo: c.email,
      html: emailLayout(
        "Online cancellation request",
        `<p style="background:#FFF4E5;border:1px solid #F0C27B;padding:10px;font-size:14px"><strong>To do:</strong> process this cancellation in Club Systems. Do not require a call or visit. The ${afterTerm.noticeDays}-day notice period starts from the time received below. If the member signed within the last ${rules.rightToCancelBusinessDays} business days, refund all payments within 10 days. Confirm the email matches the one on the account.</p>` +
          rowsTable(rows),
      ),
      text: `ONLINE CANCELLATION REQUEST\n${rowsText(rows)}`,
    });
    await sendEmail({
      to: c.email,
      subject: `We received your cancellation request (${reference})`,
      replyTo: business.email || business.inboxEmail,
      html: emailLayout(
        "Your cancellation request was received",
        `<p>Hi ${escapeHtml(c.firstName)}, we received your request to cancel your ${escapeHtml(business.name)} membership on <strong>${escapeHtml(timestamp)}</strong>. Your request number is <strong>${escapeHtml(reference)}</strong>. Keep this email as your proof of cancellation.</p>
         <p>Your written notice period (${afterTerm.noticeDays} days) starts from the time above. If you are still within your initial term, the early cancellation fee for your plan applies, as described in your agreement. If you signed up within the last ${rules.rightToCancelBusinessDays} business days, you'll receive a full refund.</p>
         <p>We'll confirm when your cancellation has been processed. Questions? Call ${escapeHtml(business.phone)}.</p>`,
      ),
      text: `We received your request to cancel your ${business.name} membership on ${timestamp}. Request number: ${reference}. Keep this email as proof of cancellation.`,
    });
  } catch {
    return {
      ok: false,
      message: `Sorry, we couldn't submit your request. Please try again${business.email ? `, email ${business.email}` : ""}, call ${business.phone}, or mail your notice to ${business.noticeAddress}.`,
    };
  }
  return { ok: true, reference, timestamp };
}
