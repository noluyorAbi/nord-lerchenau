"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import {
  CLUB_CHANGE,
  EXPERIENCE,
  PLAYED_BEFORE,
  TOPICS,
  isProbetrainingTopic,
} from "@/lib/contact-topics";

type FieldErrors = Partial<{
  name: string[];
  email: string[];
  phone: string[];
  address: string[];
  subject: string[];
  message: string[];
  birthYear: string[];
  playedBefore: string[];
  experience: string[];
  clubChange: string[];
  currentClub: string[];
}>;

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string; fieldErrors?: FieldErrors };

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
  const [topic, setTopic] = useState(initialTopic);
  const [playedBefore, setPlayedBefore] = useState("");
  const [clubChange, setClubChange] = useState("");
  const isProbetraining = isProbetrainingTopic(topic);
  const initialDetail =
    defaultSubject && !initialTopic ? defaultSubject : undefined;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "submitting" });

    const form = event.currentTarget;
    const fd = new FormData(form);

    const selectedTopic = String(fd.get("topic") ?? "");
    const detail = String(fd.get("subjectDetail") ?? "");
    const subject = [selectedTopic, detail].filter(Boolean).join(" · ");

    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      topic: selectedTopic,
      subject,
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
      // Felder anderer Anliegen sind nicht im DOM und kommen leer an.
      birthYear: String(fd.get("birthYear") ?? ""),
      playedBefore: String(fd.get("playedBefore") ?? ""),
      experience: String(fd.get("experience") ?? ""),
      clubChange: String(fd.get("clubChange") ?? ""),
      currentClub: String(fd.get("currentClub") ?? ""),
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
      setTopic(initialTopic);
      setPlayedBefore("");
      setClubChange("");
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
        value={topic}
        onChange={setTopic}
        options={TOPICS}
        placeholder="Bitte auswählen…"
        required
      />
      {isProbetraining ? (
        <div className="form-reveal space-y-4 rounded-lg border border-nord-line bg-nord-paper-2 p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-nord-muted">
            Mit ein paar Angaben zum Spieler können wir deine Anfrage dem
            passenden Trainer geben.
          </p>
          <Field
            name="birthYear"
            label="Geburtsjahr des Spielers"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="z. B. 2014"
            error={fieldErrors?.birthYear?.[0]}
            required
          />
          <RadioGroup
            name="playedBefore"
            legend="Hat der Spieler schon Fußball gespielt?"
            options={PLAYED_BEFORE}
            value={playedBefore}
            onChange={setPlayedBefore}
            error={fieldErrors?.playedBefore?.[0]}
            required
          />
          {playedBefore === "ja" ? (
            <div className="form-reveal space-y-4">
              <SelectField
                name="experience"
                label="Wie lange schon?"
                options={EXPERIENCE.map((o) => o.label)}
                values={EXPERIENCE.map((o) => o.value)}
                placeholder="Bitte auswählen…"
                error={fieldErrors?.experience?.[0]}
                required
              />
              <RadioGroup
                name="clubChange"
                legend="Möchte der Spieler den Verein wechseln?"
                options={CLUB_CHANGE}
                value={clubChange}
                onChange={setClubChange}
                error={fieldErrors?.clubChange?.[0]}
                required
              />
              {clubChange === "ja" ? (
                <div className="form-reveal">
                  <Field
                    name="currentClub"
                    label="Aktueller Verein"
                    error={fieldErrors?.currentClub?.[0]}
                    required
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
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
  /** Gesendete Werte, wenn sie sich von den angezeigten Texten unterscheiden. */
  values?: readonly string[];
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
};

function SelectField({
  name,
  label,
  options,
  values,
  value,
  onChange,
  defaultValue,
  placeholder,
  required,
  error,
}: SelectFieldProps) {
  const valueProps =
    value !== undefined
      ? {
          value,
          onChange: (e: ChangeEvent<HTMLSelectElement>) =>
            onChange?.(e.target.value),
        }
      : { defaultValue: defaultValue ?? "" };
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-nord-muted">
        {label}
        {required ? <span className="text-nord-navy-2"> *</span> : null}
      </span>
      <select
        name={name}
        required={required}
        {...valueProps}
        aria-invalid={Boolean(error)}
        className="mt-1.5 w-full appearance-none rounded-lg border border-nord-line bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%230b1b3f%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M5 8l5 5 5-5%22/></svg>')] bg-[length:18px_18px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2.5 pr-10 text-sm text-nord-ink focus:border-nord-navy-2 focus:outline-none focus:ring-2 focus:ring-nord-sky/50"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt, i) => (
          <option key={opt} value={values?.[i] ?? opt}>
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
  inputMode?: "numeric" | "text";
  pattern?: string;
  maxLength?: number;
  placeholder?: string;
};

export function Field({
  name,
  label,
  error,
  required,
  type = "text",
  textarea,
  rows,
  defaultValue,
  autoComplete,
  inputMode,
  pattern,
  maxLength,
  placeholder,
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
          inputMode={inputMode}
          pattern={pattern}
          maxLength={maxLength}
          placeholder={placeholder}
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

type RadioGroupProps = {
  name: string;
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
};

function RadioGroup({
  name,
  legend,
  options,
  value,
  onChange,
  required,
  error,
}: RadioGroupProps) {
  return (
    <fieldset aria-invalid={Boolean(error)}>
      <legend className="text-[11px] font-semibold uppercase tracking-[0.1em] text-nord-muted">
        {legend}
        {required ? <span className="text-nord-navy-2"> *</span> : null}
      </legend>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-nord-line bg-white px-3 py-2.5 text-sm text-nord-ink transition-colors has-[:checked]:border-nord-navy-2 has-[:checked]:bg-nord-sky/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-nord-sky/50"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 shrink-0 accent-nord-navy"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}
