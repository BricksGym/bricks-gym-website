"use client";

import { useState, useTransition } from "react";
import { Checkbox, FormAlert, Honeypot, TextArea, TextField, Turnstile } from "@/components/form";
import { buttonClass } from "@/components/ui";
import { submitCancellation } from "./actions";

export function CancelForm() {
  const [v, setV] = useState({ firstName: "", lastName: "", email: "", phone: "", memberNumber: "", reason: "" });
  const [confirm, setConfirm] = useState(false);
  const [token, setToken] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference?: string; timestamp?: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  if (done) {
    return (
      <div role="status" className="rounded-md border-2 border-brick p-6">
        <p className="font-display text-2xl">Cancellation request received.</p>
        <p className="mt-2 text-iron">
          Request number <strong>{done.reference}</strong>, received {done.timestamp}. A confirmation has been emailed to{" "}
          {v.email}. Keep it as your proof of cancellation.
        </p>
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
          const res = await submitCancellation({ ...v, confirm, turnstileToken: token || undefined, company });
          if (res.ok) setDone({ reference: res.reference, timestamp: res.timestamp });
          else {
            setErrors(res.errors ?? {});
            setAlert(res.message);
          }
        });
      }}
    >
      <FormAlert message={alert} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="First name" name="firstName" autoComplete="given-name" value={v.firstName} onValue={set("firstName")} error={errors.firstName} />
        <TextField label="Last name" name="lastName" autoComplete="family-name" value={v.lastName} onValue={set("lastName")} error={errors.lastName} />
      </div>
      <TextField label="Email on your account" name="email" type="email" autoComplete="email" value={v.email} onValue={set("email")} error={errors.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Phone" optional name="phone" type="tel" autoComplete="tel" value={v.phone} onValue={set("phone")} error={errors.phone} />
        <TextField label="Member number" optional name="memberNumber" value={v.memberNumber} onValue={set("memberNumber")} error={errors.memberNumber} />
      </div>
      <TextArea label="Reason for cancelling" optional name="reason" rows={3} value={v.reason} onValue={set("reason")} />
      <Checkbox name="confirm" checked={confirm} onChecked={setConfirm} error={errors.confirm}>
        I want to cancel my Bricks Gym membership.
      </Checkbox>
      <Turnstile onToken={setToken} />
      <Honeypot value={company} onValue={setCompany} />
      <button type="submit" disabled={pending} className={`${buttonClass("dark")} disabled:opacity-60`}>
        {pending ? "Submitting…" : "Cancel my membership"}
      </button>
    </form>
  );
}
