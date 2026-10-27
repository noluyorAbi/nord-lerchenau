"use client";

import { useState } from "react";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "done"; teamName: string }
  | { state: "error"; message: string };

type Props = { action: "bestaetigen" | "widerrufen"; token: string };

const COPY = {
  bestaetigen: {
    button: "Zustimmung bestätigen",
    busy: "Wird bestätigt…",
    done: (team: string) =>
      `Danke! Deine Zustimmung für ${team} ist bestätigt. Widerrufen kannst du jederzeit über den Link in der Mail.`,
  },
  widerrufen: {
    button: "Zustimmung widerrufen",
    busy: "Wird widerrufen…",
    done: (team: string) =>
      `Deine Zustimmung ist widerrufen. Das Mannschaftsfoto von ${team} ist ab sofort ausgeblendet.`,
  },
} as const;

/**
 * Bestaetigen und Widerrufen brauchen einen echten Klick: Mail-Scanner rufen
 * Links vorab auf, ein GET darf deshalb nichts aendern.
 */
export function PhotoConsentAction({ action, token }: Props) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const copy = COPY[action];

  async function run() {
    setStatus({ state: "submitting" });
    try {
      const res = await fetch(`/api/foto-zustimmung/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setStatus({
          state: "error",
          message: data?.error ?? "Das hat nicht geklappt.",
        });
        return;
      }
      setStatus({ state: "done", teamName: data.teamName });
    } catch {
      setStatus({ state: "error", message: "Netzwerkfehler." });
    }
  }

  if (status.state === "done") {
    return (
      <p role="status" className="text-sm leading-relaxed text-nord-ink">
        {copy.done(status.teamName)}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={run}
        disabled={status.state === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-lg bg-nord-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {status.state === "submitting" ? copy.busy : copy.button}
      </button>
      <div
        aria-live="polite"
        className={`text-sm ${status.state === "error" ? "text-red-600" : "sr-only"}`}
      >
        {status.state === "error" ? status.message : null}
      </div>
    </div>
  );
}
