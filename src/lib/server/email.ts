/**
 * Sends email through Resend (resend.com).
 *
 * Settings (in Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY  your Resend API key
 *   EMAIL_FROM      e.g. "Bricks Gym <hello@bricksgym.com>" (a domain verified in Resend)
 *
 * On your own computer, without those settings, emails are saved as files in
 * the ".local-submissions" folder instead, so you can see what would be sent.
 * That folder holds personal data: it is never uploaded or committed.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendEmail(email: Email): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured (RESEND_API_KEY / EMAIL_FROM).");
    }
    await saveLocally(email);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    }),
  });
  if (!res.ok) {
    // Log the status only — never the message contents (personal data).
    console.error(`Email send failed: HTTP ${res.status}`);
    throw new Error("Email send failed");
  }
}

async function saveLocally(email: Email) {
  const dir = path.join(process.cwd(), ".local-submissions");
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = email.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  const file = path.join(dir, `${stamp}-${slug}.html`);
  const header = `<p style="font:13px monospace;background:#eee;padding:8px">LOCAL TEST — not sent.<br>To: ${escapeHtml(email.to)}<br>Subject: ${escapeHtml(email.subject)}</p>`;
  await writeFile(file, header + email.html, "utf8");
  console.log(`[dev] Email saved to .local-submissions/${path.basename(file)} (not sent)`);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Simple branded email layout. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#FAF7F2;font-family:Arial,Helvetica,sans-serif;color:#141111">
<div style="max-width:640px;margin:0 auto;background:#fff;border-top:6px solid #8B1E22">
<div style="padding:20px 24px;border-bottom:1px solid #eee"><strong style="font-size:22px;color:#8B1E22;letter-spacing:1px">BRICKS GYM</strong></div>
<div style="padding:24px"><h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>${bodyHtml}</div>
</div></body></html>`;
}

/** Two-column table of label/value rows. Values are escaped. */
export function rowsTable(rows: [string, string][]): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;color:#6E6663;width:42%;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;vertical-align:top">${escapeHtml(v) || "&nbsp;"}</td></tr>`,
    )
    .join("")}</table>`;
}

export function rowsText(rows: [string, string][]): string {
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}
