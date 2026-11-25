/**
 * Spam and abuse protection for the website's forms.
 *
 * Cloudflare Turnstile (a privacy-friendly "are you human" check) is used
 * when these settings exist:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY  (shown in the browser)
 *   TURNSTILE_SECRET_KEY            (server only)
 */
import { headers } from "next/headers";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not set up yet
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/**
 * Basic per-visitor limit: at most `max` submissions per `windowMs`.
 * (Best effort: each server instance keeps its own count.)
 */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

/** Short reference like BG-261125-7KQ2 (no personal data in it). */
export function referenceId(prefix = "BG"): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${prefix}-${ymd}-${rand}`;
}

export function formatTimestamp(d = new Date()): string {
  return d.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "long" });
}
