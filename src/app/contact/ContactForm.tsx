"use client";

import { useState, useTransition } from "react";
import { FormAlert, Honeypot, TextArea, TextField, Turnstile } from "@/components/form";
import { buttonClass } from "@/components/ui";
import { submitContact } from "./actions";

export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", phone: "", message: "" });
  const [token, setToken] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  if (sent) {
    return (
      <div role="status" className="rounded-md border-2 border-brick p-6">
        <p className="font-display text-2xl">Message sent.</p>
        <p className="mt-2 text-iron">Thanks, {v.name}. We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await submitContact({ ...v, turnstileToken: token || undefined, company });
          if (res.ok) setSent(true);
          else {
            setErrors(res.errors ?? {});
            setAlert(res.message);
          }
        });
      }}
    >
      <FormAlert message={alert} />
      <TextField label="Name" name="name" autoComplete="name" value={v.name} onValue={set("name")} error={errors.name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" value={v.email} onValue={set("email")} error={errors.email} />
      <TextField label="Phone" optional name="phone" type="tel" autoComplete="tel" value={v.phone} onValue={set("phone")} error={errors.phone} />
      <TextArea label="Message" name="message" value={v.message} onValue={set("message")} error={errors.message} />
      <Turnstile onToken={setToken} />
      <Honeypot value={company} onValue={setCompany} />
      <button type="submit" disabled={pending} className={`${buttonClass("primary")} disabled:opacity-60`}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
