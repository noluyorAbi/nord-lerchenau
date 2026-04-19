"use client";

import { useState, type FormEvent } from "react";

type FieldErrors = Partial<{
  name: string[];
  email: string[];
  subject: string[];
  message: string[];
}>;

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string; fieldErrors?: FieldErrors };

type Props = { defaultSubject?: string };

export function ContactForm({ defaultSubject }: Props) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "submitting" });

    const form = event.currentTarget;
    const fd = new FormData(form);

    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setStatus({
          state: "error",
          message: data?.error ?? "Senden fehlgeschlagen.",
          fieldErrors: data?.fieldErrors,
        });
        return;
      }
      form.reset();
      setStatus({ state: "success" });
    } catch {
      setStatus({ state: "error", message: "Netzwerkfehler." });
    }
  }

  const isSubmitting = status.state === "submitting";
  const fieldErrors = status.state === "error" ? status.fieldErrors : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field
        name="name"
        label="Name"
        error={fieldErrors?.name?.[0]}
        required
        autoComplete="name"
      />
      <Field
        name="email"
        type="email"
        label="E-Mail"
        error={fieldErrors?.email?.[0]}
        required
        autoComplete="email"
      />
      <Field
        name="subject"
        label="Betreff"
        defaultValue={defaultSubject}
        error={fieldErrors?.subject?.[0]}
      />
      <Field
        name="message"
        label="Nachricht"
        error={fieldErrors?.message?.[0]}
        required
        textarea
      />

      <div
        aria-live="polite"
        className={`text-sm ${
          status.state === "success"
            ? "text-emerald-600"
            : status.state === "error"
              ? "text-red-600"
              : "sr-only"
        }`}
      >
        {status.state === "success"
          ? "Danke! Wir melden uns bald zurück."
          : status.state === "error"
            ? status.message
            : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-lg bg-nord-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Wird gesendet…" : "Nachricht senden →"}
      </button>
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  defaultValue?: string;
  autoComplete?: string;
};

function Field({
  name,
  label,
  error,
  required,
  type = "text",
  textarea,
  defaultValue,
  autoComplete,
}: FieldProps) {
  const common =
    "mt-1.5 w-full rounded-lg border border-nord-line bg-white px-3 py-2.5 text-sm text-nord-ink placeholder:text-nord-muted focus:border-nord-navy-2 focus:outline-none focus:ring-2 focus:ring-nord-sky/50";

  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-nord-muted">
        {label}
        {required ? <span className="text-nord-navy-2"> *</span> : null}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          defaultValue={defaultValue}
          rows={5}
          className={common}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          className={common}
          aria-invalid={Boolean(error)}
        />
      )}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
