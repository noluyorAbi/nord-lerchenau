"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// A Lovable-style chat tab inside the Payload admin. The club types website
// change wishes; each becomes a `change-requests` record (via the access-
// controlled REST API). Status, preview link, and approve/reject live here.
// All writes go through Payload access control — the dev fields stay locked.

type ChangeRequest = {
  id: number | string;
  prompt: string;
  title?: string | null;
  status?: string | null;
  clientDecision?: string | null;
  previewUrl?: string | null;
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
  const endRef = useRef<HTMLDivElement>(null);

  const isAdmin = me?.role === "admin";

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
          <li>Wunsch unten beschreiben und auf „Senden“ klicken.</li>
          <li>
            Der Website-Betreuer startet die Umsetzung — die KI baut eine
            Vorschau.
          </li>
          <li>
            Du öffnest die Vorschau und klickst „Passt ✓“ oder „Passt nicht ✗“
            (mit Rückmeldung, was noch anders soll).
          </li>
        </ol>

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
                      Vorschau ansehen ↗
                    </a>
                  ) : null}
                </div>

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
            placeholder="Was möchtest du an der Website ändern? (Strg/Cmd+Enter zum Senden)"
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
          <button
            type="button"
            onClick={() => void submit()}
            disabled={sending || !prompt.trim()}
            style={btn("#0b1b3f", sending || !prompt.trim())}
          >
            {sending ? "Sendet…" : "Senden"}
          </button>
        </div>
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
