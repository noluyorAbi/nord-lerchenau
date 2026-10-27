"use client";

import { useState } from "react";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "done"; photoHidden: boolean }
  | { state: "error"; message: string };

export type ConsentSummary = {
  childName: string;
  teamName: string;
  confirmed: boolean;
};

type Props = {
  action: "bestaetigen" | "widerrufen";
  token: string;
  consent: ConsentSummary;
};

/**
 * Bestaetigen und Widerrufen brauchen einen echten Klick: Mail-Scanner rufen
 * Links vorab auf, ein GET darf deshalb nichts aendern.
 */
export function PhotoConsentAction({ action, token, consent }: Props) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const revoke = action === "widerrufen";

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
      setStatus({ state: "done", photoHidden: Boolean(data.photoHidden) });
    } catch {
      setStatus({
        state: "error",
        message: "Keine Verbindung. Bitte versuche es gleich noch einmal.",
      });
    }
  }

  if (status.state === "done") {
    return (
      <ResultPanel
        title={revoke ? "Erledigt." : "Danke, das war's."}
        body={doneText(revoke, status.photoHidden, consent)}
      />
    );
  }

  return (
    <div>
      <ConsentFor consent={consent} />
      <p className="mt-5 max-w-prose text-sm leading-relaxed text-nord-muted">
        {revoke
          ? consent.confirmed
            ? "Nach dem Widerruf zeigen wir das Mannschaftsfoto dieser Mannschaft nicht mehr auf der Website. Der Verein wird automatisch informiert und blendet es erst wieder ein, wenn es ein Foto ohne dein Kind gibt."
            : "Diese Zustimmung ist noch nicht bestätigt und wurde bisher nicht verwendet. Mit dem Widerruf ist sie endgültig vom Tisch."
          : "Mit der Bestätigung darf das Mannschaftsfoto, auf dem dein Kind zu sehen ist, auf svnord.de erscheinen. Widerrufen kannst du jederzeit über den Link in deiner Mail."}
      </p>
      <button
        type="button"
        onClick={run}
        disabled={status.state === "submitting"}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-nord-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
      >
        {status.state === "submitting"
          ? revoke
            ? "Wird widerrufen…"
            : "Wird bestätigt…"
          : revoke
            ? "Zustimmung widerrufen"
            : "Zustimmung bestätigen →"}
      </button>
      <div
        aria-live="polite"
        className={`mt-3 text-sm ${status.state === "error" ? "text-red-600" : "sr-only"}`}
      >
        {status.state === "error" ? status.message : null}
      </div>
    </div>
  );
}

function doneText(
  revoke: boolean,
  photoHidden: boolean,
  consent: ConsentSummary,
): string {
  if (!revoke) {
    return `Deine Zustimmung für ${consent.childName} (${consent.teamName}) ist bestätigt. Den Link zum Widerrufen findest du in deiner Mail, bewahre sie am besten auf.`;
  }
  return photoHidden
    ? `Deine Zustimmung für ${consent.childName} ist widerrufen. Das Foto der Mannschaft ${consent.teamName} ist ab sofort nicht mehr auf der Website zu sehen, und der Verein ist informiert.`
    : `Deine Zustimmung für ${consent.childName} ist widerrufen. Sie war noch nicht bestätigt, es wurde also nie etwas auf ihrer Grundlage veröffentlicht.`;
}

function ConsentFor({ consent }: { consent: ConsentSummary }) {
  return (
    <div className="rounded-xl border border-nord-line bg-nord-paper-2/60 px-5 py-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold-ink">
        Zustimmung für
      </div>
      <div className="mt-1 font-display text-xl font-black text-nord-ink">
        {consent.childName}
      </div>
      <div className="text-sm text-nord-muted">{consent.teamName}</div>
    </div>
  );
}

export function ResultPanel({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="consent-result">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nord-navy text-white">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 10.5l3.2 3.2L15 7" />
        </svg>
      </div>
      <p className="mt-4 font-display text-2xl font-black text-nord-ink">
        {title}
      </p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-nord-muted">
        {body}
      </p>
    </div>
  );
}
