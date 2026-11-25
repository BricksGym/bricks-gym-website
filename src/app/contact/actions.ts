"use server";

import { z } from "zod";
import { business } from "@/config/gym";
import { issuesToErrors } from "@/lib/application-schema";
import { emailLayout, escapeHtml, rowsTable, rowsText, sendEmail } from "@/lib/server/email";
import { clientIp, formatTimestamp, rateLimited, verifyTurnstile } from "@/lib/server/guard";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().max(120).pipe(z.email("Enter a valid email")),
  phone: z.string().trim().max(30),
  message: z.string().trim().min(5, "Please write a short message").max(1000),
  turnstileToken: z.string().max(4096).optional(),
  company: z.string().max(0).optional(),
});

export type FormResult = { ok: true; reference?: string; timestamp?: string } | { ok: false; message: string; errors?: Record<string, string> };

export async function submitContact(input: unknown): Promise<FormResult> {
  const ip = await clientIp();
  if (rateLimited(`contact:${ip}`)) return { ok: false, message: "Too many messages. Please try again later." };
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: issuesToErrors(parsed.error.issues) };
  const c = parsed.data;
  if (c.company) return { ok: true };
  if (!(await verifyTurnstile(c.turnstileToken, ip))) return { ok: false, message: "Bot check failed. Please try again." };

  const rows: [string, string][] = [
    ["Name", c.name],
    ["Email", c.email],
    ["Phone", c.phone],
    ["Sent", formatTimestamp()],
  ];
  try {
    await sendEmail({
      to: business.inboxEmail,
      subject: `Website message from ${c.name}`,
      replyTo: c.email,
      html: emailLayout("New website message", rowsTable(rows) + `<p style="white-space:pre-wrap;margin-top:16px">${escapeHtml(c.message)}</p>`),
      text: `${rowsText(rows)}\n\n${c.message}`,
    });
  } catch {
    return { ok: false, message: `Sorry, your message couldn't be sent. Please call ${business.phone}.` };
  }
  return { ok: true };
}
