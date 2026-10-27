"use client";

import { useState, type FormEvent } from "react";

import { Field } from "@/components/ContactForm";

type FieldErrors = Partial<
  Record<"team" | "childName" | "parentName" | "email" | "consent", string[]>
>;

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; email: string }
  | { state: "error"; message: string; fieldErrors?: FieldErrors };

export type ConsentTeamOption = { id: number; label: string };

type Props = { teams: ConsentTeamOption[]; consentText: string };

export function PhotoConsentForm({ teams, consentText }: Props) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "submitting" });

    const form = event.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const body = {
      team: String(fd.get("team") ?? ""),
      childName: String(fd.get("childName") ?? ""),
      parentName: String(fd.get("parentName") ?? ""),
      email,
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/foto-zustimmung", {
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
      setStatus({ state: "success", email });
    } catch {
      setStatus({ state: "error", message: "Netzwerkfehler." });
    }
  }

  if (status.state === "success") {
    return (
      <div
        role="status"
        className="consent-result rounded-xl border border-nord-line bg-nord-paper-2 p-6"
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold-ink">
          Fast geschafft
        </div>
        <p className="mt-2 font-display text-xl font-black text-nord-ink">
          Bitte schau in dein Postfach.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-nord-muted">
          {/* Bewusst dieselbe Antwort, ob neu oder schon vorhanden: sonst
              verraet die Seite, ob fuer ein Kind eine Zustimmung existiert. */}
          Wir haben einen Bestätigungslink an{" "}
          <span className="font-semibold text-nord-ink">{status.email}</span>{" "}
          geschickt, sofern für dieses Kind nicht schon einer unterwegs ist oder
          die Zustimmung bereits vorliegt. Erst mit dem Klick gilt sie, der Link
          ist 7 Tage gültig. Nichts angekommen? Bitte auch im Spam-Ordner
          nachsehen oder beim Verein melden.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ state: "idle" })}
          className="mt-5 text-sm font-semibold text-nord-navy hover:text-nord-navy-2"
        >
          Weiteres Kind eintragen →
        </button>
      </div>
    );
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

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-nord-muted">
          Mannschaft<span className="text-nord-navy-2"> *</span>
        </span>
        <select
          name="team"
          required
          defaultValue=""
          aria-invalid={Boolean(fieldErrors?.team)}
          className="mt-1.5 w-full appearance-none rounded-lg border border-nord-line bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%230b1b3f%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M5 8l5 5 5-5%22/></svg>')] bg-[length:18px_18px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2.5 pr-10 text-sm text-nord-ink focus:border-nord-navy-2 focus:outline-none focus:ring-2 focus:ring-nord-sky/50"
        >
          <option value="" disabled>
            Bitte auswählen…
          </option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {fieldErrors?.team?.[0] ? (
          <span role="alert" className="mt-1 block text-xs text-red-600">
            {fieldErrors.team[0]}
          </span>
        ) : null}
      </label>

      <Field
        name="childName"
        label="Vor- und Nachname des Kindes"
        error={fieldErrors?.childName?.[0]}
        required
      />
      <Field
        name="parentName"
        label="Dein Name (erziehungsberechtigt)"
        error={fieldErrors?.parentName?.[0]}
        required
        autoComplete="name"
      />
      <Field
        name="email"
        type="email"
        label="Deine E-Mail"
        error={fieldErrors?.email?.[0]}
        required
        autoComplete="email"
      />

      <label className="flex gap-3 rounded-lg border border-nord-line bg-nord-paper-2 p-4">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={Boolean(fieldErrors?.consent)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-nord-navy"
        />
        <span className="text-sm leading-relaxed text-nord-ink">
          {consentText}
          {fieldErrors?.consent?.[0] ? (
            <span role="alert" className="mt-1 block text-xs text-red-600">
              {fieldErrors.consent[0]}
            </span>
          ) : null}
        </span>
      </label>

      <div
        aria-live="polite"
        className={`text-sm ${status.state === "error" ? "text-red-600" : "sr-only"}`}
      >
        {status.state === "error" ? status.message : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-lg bg-nord-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Wird gesendet…" : "Zustimmung senden →"}
      </button>
    </form>
  );
}
