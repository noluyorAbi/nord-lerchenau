"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// --- Web Speech API: not in the TS DOM libs. Declare only the surface we use,
// so voice input type-checks in strict mode without a dependency or `any`. ---
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultListLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string; // "not-allowed" | "no-speech" | "aborted" | ...
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

// A Lovable-style chat tab inside the Payload admin. The club types website
// change wishes; each becomes a `change-requests` record (via the access-
// controlled REST API). Status, preview link, and approve/reject live here.
// All writes go through Payload access control — the dev fields stay locked.

type PreviewShot = { label: string; url: string };

type ChangeRequest = {
  id: number | string;
  prompt: string;
  title?: string | null;
  status?: string | null;
  clientDecision?: string | null;
  previewUrl?: string | null;
  previewShots?: PreviewShot[] | null;
  createdAt?: string;
};

type Me = { id: number | string; role?: string | null } | null;

const STATUS_LABEL: Record<string, string> = {
  neu: "Eingereicht — wird geprüft",
  triage: "Wird eingeordnet",
  inhalt_cms: "Inhalt → im CMS ändern",
  geplant: "Geplant",
  in_arbeit: "Wird umgesetzt",
  review: "Vorschau wird gebaut",
  vorschau_bereit: "Vorschau bereit",
  aenderung_erwuenscht: "Änderung erwünscht",
  freigegeben: "Freigegeben",
  wird_live: "Wird live geschaltet",
  live: "Live",
  fehlgeschlagen: "Fehlgeschlagen",
  braucht_dev: "Wird vom Entwickler geprüft",
  abgelehnt: "Abgelehnt",
};

// Statuses that show a "working" hourglass. `neu` is included so a freshly
// submitted wish reads as received-and-pending, not ignored.
const BUSY = new Set([
  "neu",
  "triage",
  "geplant",
  "in_arbeit",
  "review",
  "wird_live",
]);

// Statuses on which an admin may (re)start the KI pipeline for a wish.
const ENQUEUEABLE = new Set([
  "neu",
  "aenderung_erwuenscht",
  "fehlgeschlagen",
  "braucht_dev",
]);

// Starter examples — clicking one fills the input, so a first-time user sees
// the KIND of wish that belongs here (structure/design, not content).
const EXAMPLES = [
  "Mach den Hero-Bereich auf der Startseite dunkler.",
  "Füge auf der Startseite eine neue Foto-Galerie-Sektion hinzu.",
  "Erstelle eine neue Seite für unser Sommerturnier.",
  "Ordne die Sportarten-Kacheln auf der Startseite neu an.",
];

const chipStyle: React.CSSProperties = {
  border: "1px solid var(--theme-elevation-150, #ddd)",
  background: "var(--theme-bg, #fff)",
  color: "inherit",
  borderRadius: 999,
  padding: "5px 11px",
  fontSize: 12,
  cursor: "pointer",
  textAlign: "left",
};

const shotThumb: React.CSSProperties = {
  display: "block",
  width: 170,
  height: 108,
  objectFit: "cover",
  objectPosition: "top",
  borderRadius: 8,
  border: "1px solid var(--theme-elevation-150, #e5e7eb)",
  background: "var(--theme-elevation-100, #eee)",
};

// German UX copy for the voice input.
const MIC_START_LABEL = "Spracheingabe starten";
const MIC_STOP_LABEL = "Spracheingabe stoppen";
const MIC_DENIED =
  "Mikrofon-Zugriff wurde blockiert. Bitte im Browser erlauben und erneut versuchen.";
const MIC_NO_SPEECH = "Nichts gehört — bitte noch einmal sprechen.";
const MIC_GENERIC =
  "Spracheingabe gerade nicht möglich. Bitte tippe stattdessen.";
const MIC_PRIVACY_NOTE =
  "Spracheingabe nutzt die Spracherkennung deines Browsers (in Chrome/Edge über Google). Sprich in ganzen Sätzen, so genau wie möglich.";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function StudioChat() {
  const [items, setItems] = useState<ChangeRequest[]>([]);
  const [me, setMe] = useState<Me>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [enqueuing, setEnqueuing] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [embedFor, setEmbedFor] = useState<string | number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [speechSupported, setSpeechSupported] = useState(false);

  const isAdmin = me?.role === "admin";

  // Detect Web Speech support AFTER mount only. Doing it during render would make
  // the server (no window → false) and client (true) disagree → hydration error.
  useEffect(() => {
    setSpeechSupported(
      !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    );
  }, []);

  const load = useCallback(async () => {
    try {
      // Fetch the newest 100 (sort desc so recent wishes are never dropped),
      // then reverse for oldest→newest chat order.
      const data = await api(
        "/change-requests?sort=-createdAt&limit=100&depth=0",
      );
      const docs: ChangeRequest[] = Array.isArray(data?.docs) ? data.docs : [];
      setItems(docs.slice().reverse());
      setError(null);
    } catch {
      setError("Konnte die Anfragen nicht laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Confirm there is a logged-in session before rendering the tool.
    void (async () => {
      try {
        const data = await api("/users/me");
        setMe(data?.user ?? null);
      } catch {
        setMe(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!me) return;
    void load();
    // Poll so the club sees status move (queued -> preview ready) without reload.
    const t = setInterval(() => void load(), 8000);
    return () => clearInterval(t);
  }, [load, me]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  async function submit() {
    const text = prompt.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await api("/change-requests", {
        method: "POST",
        body: JSON.stringify({ prompt: text }),
      });
      setPrompt("");
      await load();
    } catch {
      setError("Senden fehlgeschlagen.");
    } finally {
      setSending(false);
    }
  }

  async function enqueue(id: ChangeRequest["id"]) {
    if (enqueuing) return;
    setEnqueuing(id);
    try {
      await api("/agent/enqueue", {
        method: "POST",
        body: JSON.stringify({ requestId: id }),
      });
      await load();
    } catch {
      setError("KI-Umsetzung konnte nicht gestartet werden.");
    } finally {
      setEnqueuing(null);
    }
  }

  async function decide(
    id: ChangeRequest["id"],
    decision: "passt" | "passt_nicht",
  ) {
    let feedback = "";
    if (decision === "passt_nicht") {
      const answer = window.prompt("Was soll noch anders sein?");
      // Cancel (null) aborts entirely; empty string is treated as "no detail".
      if (answer === null) return;
      feedback = answer.trim();
    }
    try {
      await api(`/change-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          clientDecision: decision,
          ...(feedback ? { clientFeedback: feedback } : {}),
        }),
      });
      await load();
    } catch {
      setError("Konnte die Bewertung nicht speichern.");
    }
  }

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    setMicError(null);
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = "de-DE";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? "";
        if (r.isFinal) finalChunk += t;
        else interimChunk += t;
      }
      if (finalChunk) {
        const add = finalChunk.trim();
        // Append onto the LIVE field value (functional update) so text the user
        // typed during recording is preserved, not overwritten.
        setPrompt((prev) =>
          prev ? prev.replace(/\s*$/, "") + " " + add + " " : add + " ",
        );
      }
      setInterim(interimChunk);
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicError(MIC_DENIED);
      } else if (e.error === "no-speech") {
        setMicError(MIC_NO_SPEECH);
      } else if (e.error !== "aborted") {
        setMicError(MIC_GENERIC);
      }
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      // start() throws if already started — ignore.
    }
  }, []);

  // Discard any in-flight recognition when the tab unmounts.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  if (authChecked && !me) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <h1 style={{ marginBottom: 4 }}>KI-Studio</h1>
        <p style={{ opacity: 0.7, fontSize: 14 }}>
          Bitte zuerst <Link href="/admin/login">einloggen</Link>, um
          Änderungswünsche zu stellen.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem 7rem" }}
    >
      <h1 style={{ marginBottom: 4 }}>KI-Studio</h1>
      <p style={{ opacity: 0.7, marginTop: 0, fontSize: 14 }}>
        Beschreibe einen Wunsch an der Website (z. B. neue Sektion, anderes
        Layout). Texte, Bilder, Termine und Sponsoren änderst du direkt im CMS —
        hier nur strukturelle/Design-Wünsche. Jeder Wunsch wird zuerst vom
        Website-Betreuer geprüft; danach baut die KI eine Vorschau, die du hier
        bewertest. Live geschaltet wird erst nach Freigabe.
      </p>

      <div
        style={{
          border: "1px solid var(--theme-elevation-150, #e5e7eb)",
          borderLeft: "3px solid var(--theme-success-500, #d4a017)",
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          background: "var(--theme-elevation-50, #fafafa)",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          So funktioniert’s
        </div>
        <ol style={{ margin: "0 0 14px", paddingLeft: 18 }}>
          <li>
            Wunsch unten beschreiben (tippen oder <strong>🎤 sprechen</strong>)
            und auf „Senden“ klicken. <strong>Je genauer, desto besser</strong>:
            sag was, wo und wie es aussehen soll (z. B. Farbe, Reihenfolge,
            welche Seite).
          </li>
          <li>
            Der Website-Betreuer startet die Umsetzung — die KI baut eine echte
            Vorschau (Preview-Deployment).
          </li>
          <li>
            Du siehst hier <strong>Screenshots</strong> und kannst die Vorschau{" "}
            <strong>interaktiv</strong> ansehen; dann klickst du „Passt ✓“ oder
            „Passt nicht ✗“ (mit Rückmeldung, was noch anders soll).
          </li>
          <li>
            Live geschaltet wird erst, wenn <strong>du zustimmst</strong> — den
            finalen Schritt macht der Website-Betreuer.
          </li>
        </ol>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>🎤 Spracheingabe</div>
        <p style={{ margin: "0 0 14px", opacity: 0.85 }}>
          Klick auf <strong>„🎤 Sprechen“</strong> und beschreibe deinen Wunsch
          laut — der Text erscheint automatisch im Feld. Nochmal klicken (oder
          „● Stopp“) beendet die Aufnahme. Du kannst gesprochenen und getippten
          Text mischen. (Funktioniert in Chrome, Edge und Safari.)
        </p>

        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          Inhalt oder Struktur?
        </div>
        <p style={{ margin: "0 0 14px", opacity: 0.85 }}>
          <strong>Text, Bild, Termin oder Sponsor ändern?</strong> → nutze die
          Bereiche im Menü links (geht sofort, ohne KI).
          <br />
          <strong>Aussehen oder Aufbau ändern</strong> (neue Sektion, Farben,
          Reihenfolge, neue Seite)? → hier beschreiben.
        </p>

        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          Beispiele (zum Übernehmen anklicken)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              style={chipStyle}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div style={{ color: "#b00", fontSize: 13, margin: "8px 0" }}>
          {error}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 16,
        }}
      >
        {loading ? (
          <div style={{ opacity: 0.6 }}>Lädt…</div>
        ) : items.length === 0 ? (
          <div style={{ opacity: 0.6 }}>
            Noch keine Wünsche. Schreib unten den ersten.
          </div>
        ) : (
          items.map((it) => {
            const status = it.status ?? "neu";
            return (
              <div
                key={String(it.id)}
                style={{
                  border: "1px solid var(--theme-elevation-150, #e5e7eb)",
                  borderRadius: 10,
                  padding: 14,
                  background: "var(--theme-elevation-50, #fafafa)",
                }}
              >
                <div style={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
                  {it.prompt}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 10,
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "var(--theme-elevation-100, #eee)",
                      fontWeight: 600,
                    }}
                  >
                    {BUSY.has(status) ? "⏳ " : ""}
                    {STATUS_LABEL[status] ?? status}
                  </span>
                  {it.previewUrl ? (
                    <a href={it.previewUrl} target="_blank" rel="noreferrer">
                      Vorschau in neuem Tab öffnen ↗
                    </a>
                  ) : null}
                </div>

                {status === "vorschau_bereit" &&
                (it.previewShots?.length || it.previewUrl) ? (
                  <div style={{ marginTop: 12 }}>
                    {it.previewShots?.length ? (
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          marginBottom: 6,
                        }}
                      >
                        So sieht deine Änderung aus:
                      </div>
                    ) : null}
                    {it.previewShots?.length ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          overflowX: "auto",
                          paddingBottom: 4,
                        }}
                      >
                        {it.previewShots.map((shot) => (
                          <a
                            key={shot.url}
                            href={shot.url}
                            target="_blank"
                            rel="noreferrer"
                            title={`${shot.label} — größer öffnen`}
                            style={{ flex: "0 0 auto", textAlign: "center" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shot.url}
                              alt={`Vorschau (${shot.label})`}
                              style={shotThumb}
                            />
                            <span
                              style={{
                                fontSize: 11,
                                opacity: 0.7,
                                display: "block",
                                marginTop: 2,
                              }}
                            >
                              {shot.label}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : null}

                    {it.previewUrl ? (
                      embedFor === it.id ? (
                        <figure style={{ margin: "10px 0 0" }}>
                          <iframe
                            src={it.previewUrl}
                            title="Interaktive Vorschau"
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            style={{
                              width: "100%",
                              height: 460,
                              border:
                                "1px solid var(--theme-elevation-150, #e5e7eb)",
                              borderRadius: 8,
                              background: "#fff",
                            }}
                          />
                          <figcaption
                            style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}
                          >
                            Interaktive Vorschau — hier klickbar. Falls nichts
                            erscheint (Vorschau ist passwortgeschützt), nutze
                            die Screenshots oben oder{" "}
                            <a
                              href={it.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              in neuem Tab öffnen ↗
                            </a>
                            .
                          </figcaption>
                        </figure>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEmbedFor(it.id)}
                          style={{ ...chipStyle, marginTop: 10 }}
                        >
                          ▶ Interaktive Vorschau hier laden
                        </button>
                      )
                    ) : null}
                  </div>
                ) : null}

                {isAdmin && ENQUEUEABLE.has(status) ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => void enqueue(it.id)}
                      disabled={enqueuing === it.id}
                      style={btn("#0b1b3f", enqueuing === it.id)}
                    >
                      {enqueuing === it.id
                        ? "Startet…"
                        : status === "neu"
                          ? "KI-Umsetzung starten"
                          : "Erneut umsetzen"}
                    </button>
                    <span style={{ fontSize: 12, opacity: 0.6 }}>
                      Nur Admin — startet die automatische Umsetzung.
                    </span>
                  </div>
                ) : null}

                {status === "vorschau_bereit" &&
                it.clientDecision === "offen" &&
                it.previewUrl ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => void decide(it.id, "passt")}
                      style={btn("#0a7d2c")}
                    >
                      Passt ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => void decide(it.id, "passt_nicht")}
                      style={btn("#9a3412")}
                    >
                      Passt nicht ✗
                    </button>
                  </div>
                ) : it.clientDecision && it.clientDecision !== "offen" ? (
                  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
                    Deine Bewertung:{" "}
                    {it.clientDecision === "passt"
                      ? "Passt ✓"
                      : "Passt nicht ✗"}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--theme-bg, #fff)",
          borderTop: "1px solid var(--theme-elevation-150, #e5e7eb)",
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void submit();
            }}
            rows={2}
            placeholder="Was möchtest du an der Website ändern? Beschreibe es ruhig ausführlich — je genauer, desto besser. (Strg/Cmd+Enter zum Senden)"
            style={{
              flex: 1,
              resize: "vertical",
              padding: 10,
              borderRadius: 8,
              border: "1px solid var(--theme-elevation-150, #ccc)",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          />
          {speechSupported ? (
            <button
              type="button"
              onClick={() => (listening ? stopListening() : startListening())}
              aria-label={listening ? MIC_STOP_LABEL : MIC_START_LABEL}
              aria-pressed={listening}
              title={listening ? MIC_STOP_LABEL : MIC_START_LABEL}
              style={btn(listening ? "#9a3412" : "#3a4a6b")}
            >
              {listening ? "● Stopp" : "🎤 Sprechen"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={sending || !prompt.trim()}
            style={btn("#0b1b3f", sending || !prompt.trim())}
          >
            {sending ? "Sendet…" : "Senden"}
          </button>
        </div>
        {listening ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              maxWidth: 760,
              margin: "6px auto 0",
              fontSize: 13,
              color: "#9a3412",
            }}
          >
            ● Aufnahme läuft — sprich deinen Wunsch.{" "}
            {interim ? <span style={{ opacity: 0.6 }}>{interim}…</span> : null}
          </div>
        ) : null}
        {micError ? (
          <div
            role="alert"
            style={{
              maxWidth: 760,
              margin: "6px auto 0",
              fontSize: 12,
              color: "#b00",
            }}
          >
            {micError}
          </div>
        ) : null}
        {speechSupported ? (
          <div
            style={{
              maxWidth: 760,
              margin: "4px auto 0",
              fontSize: 11,
              opacity: 0.5,
            }}
          >
            {MIC_PRIVACY_NOTE}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function btn(bg: string, disabled = false): React.CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
