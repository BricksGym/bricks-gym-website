"use client";

import Script from "next/script";
import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";

export const inputClass =
  "mt-1 block w-full rounded border-2 border-ink/20 bg-white px-3 py-2.5 text-base text-ink placeholder:text-concrete/60 focus:border-brick focus:outline-none aria-[invalid=true]:border-brick-bright aria-[invalid=true]:bg-brick/5";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  name: string;
  value: string;
  onValue: (v: string) => void;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
};

export function TextField({ label, name, value, onValue, error, hint, optional, className = "", ...rest }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-medium text-ink">
        {label} {optional && <span className="font-normal text-concrete">(optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? errId : "", hint ? hintId : ""].filter(Boolean).join(" ") || undefined}
        data-field={name}
        className={inputClass}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-concrete">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1 text-sm font-medium text-brick-bright">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  name,
  value,
  onValue,
  error,
  optional,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onValue: (v: string) => void;
  error?: string;
  optional?: boolean;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-ink">
        {label} {optional && <span className="font-normal text-concrete">(optional)</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        maxLength={1000}
        onChange={(e) => onValue(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        data-field={name}
        className={inputClass}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-medium text-brick-bright">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({
  name,
  checked,
  onChecked,
  error,
  disabled,
  children,
}: {
  name: string;
  checked: boolean;
  onChecked: (v: boolean) => void;
  error?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChecked(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          data-field={name}
          className="mt-1 h-5 w-5 shrink-0 accent-brick"
        />
        <label htmlFor={id} className={disabled ? "text-concrete" : "text-iron"}>
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-err`} className="ml-8 mt-1 text-sm font-medium text-brick-bright">
          {error}
        </p>
      )}
    </div>
  );
}

/** Error box at the top of a form; moves keyboard/screen-reader focus to itself. */
export function FormAlert({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);
  if (!message) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="rounded border-2 border-brick-bright bg-brick/5 p-3 font-medium text-brick-dark">
      {message}
    </div>
  );
}

/** Cloudflare Turnstile bot check. Renders nothing until a site key is set. */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  }, [onToken]);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let widget: string | undefined;
    const tryRender = () => {
      if (!ref.current || !window.turnstile) return false;
      widget = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t: string) => cb.current(t),
        "expired-callback": () => cb.current(""),
      });
      return true;
    };
    const timer = setInterval(() => tryRender() && clearInterval(timer), 300);
    return () => {
      clearInterval(timer);
      if (widget) window.turnstile?.remove(widget);
    };
  }, []);
  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div ref={ref} />
    </>
  );
}

/** Hidden field that only bots fill in. */
export function Honeypot({ value, onValue }: { value: string; onValue: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onValue(e.target.value)} />
      </label>
    </div>
  );
}
