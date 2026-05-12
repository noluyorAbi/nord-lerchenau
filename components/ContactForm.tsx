"use client";

import { useState, type FormEvent } from "react";

type FieldErrors = Partial<{
  name: string[];
  email: string[];
  phone: string[];
  address: string[];
  subject: string[];
  message: string[];
}>;

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string; fieldErrors?: FieldErrors };

const TOPICS = [
  "Probetraining · Großfeld (Herren)",
  "Probetraining · Großfeld (Damen)",
  "Probetraining · Kleinfeld (Jugend)",
  "Mitgliedschaft",
  "Vereinsheim / Veranstaltung",
  "Sponsoring",
  "Allgemeine Anfrage",
] as const;

function resolveDefaultTopic(value: string | undefined): string {
  if (!value) return "";
  if ((TOPICS as readonly string[]).includes(value)) return value;
  const lower = value.toLowerCase();
  const hit = TOPICS.find((t) => t.toLowerCase().includes(lower));
  return hit ?? "";
}

type Props = { defaultSubject?: string };

export function ContactForm({ defaultSubject }: Props) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const initialTopic = resolveDefaultTopic(defaultSubject);
  const initialDetail =
    defaultSubject && !initialTopic ? defaultSubject : undefined;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "submitting" });

    const form = event.currentTarget;
    const fd = new FormData(form);

    const topic = String(fd.get("topic") ?? "");
    const detail = String(fd.get("subjectDetail") ?? "");
    const subject = [topic, detail].filter(Boolean).join(" · ");

    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      subject,
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
        name="phone"
        type="tel"
        label="Telefon"
        error={fieldErrors?.phone?.[0]}
        autoComplete="tel"
        required
      />
      <Field
        name="address"
        label="Adresse"
        error={fieldErrors?.address?.[0]}
        autoComplete="street-address"
        textarea
        rows={2}
        required
      />
      <SelectField
        name="topic"
        label="Anliegen"
        defaultValue={initialTopic}
        options={TOPICS}
        placeholder="Bitte auswählen…"
        required
      />
      <Field
        name="subjectDetail"
        label="Betreff"
        defaultValue={initialDetail}
        error={fieldErrors?.subject?.[0]}
        required
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

type SelectFieldProps = {
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
};

function SelectField({
  name,
  label,
  options,
  defaultValue,
  placeholder,
  required,
  error,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-nord-muted">
        {label}
        {required ? <span className="text-nord-navy-2"> *</span> : null}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        className="mt-1.5 w-full appearance-none rounded-lg border border-nord-line bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%231a3dbc%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M5 8l5 5 5-5%22/></svg>')] bg-[length:18px_18px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2.5 pr-10 text-sm text-nord-ink focus:border-nord-navy-2 focus:outline-none focus:ring-2 focus:ring-nord-sky/50"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  rows?: number;
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
  rows,
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
          rows={rows ?? 5}
          autoComplete={autoComplete}
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
