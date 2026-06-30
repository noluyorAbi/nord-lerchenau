"use client";

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

const STATUS_LABEL: Record<string, string> = {
  neu: "Eingereicht",
  triage: "Wird eingeordnet",
  inhalt_cms: "Inhalt → im CMS ändern",
  geplant: "Geplant",
  in_arbeit: "Wird umgesetzt",
  review: "Wird geprüft",
  vorschau_bereit: "Vorschau bereit",
  aenderung_erwuenscht: "Änderung erwünscht",
  freigegeben: "Freigegeben",
  wird_live: "Wird live geschaltet",
  live: "Live",
  fehlgeschlagen: "Fehlgeschlagen",
  braucht_dev: "Wird vom Entwickler geprüft",
  abgelehnt: "Abgelehnt",
};

const BUSY = new Set(["triage", "geplant", "in_arbeit", "review", "wird_live"]);

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
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api(
        "/change-requests?sort=createdAt&limit=100&depth=0",
      );
      setItems(Array.isArray(data?.docs) ? data.docs : []);
      setError(null);
    } catch {
      setError("Konnte die Anfragen nicht laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // Poll so the club sees status move (queued -> preview ready) without reload.
    const t = setInterval(() => void load(), 8000);
    return () => clearInterval(t);
  }, [load]);

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

  async function decide(
    id: ChangeRequest["id"],
    decision: "passt" | "passt_nicht",
  ) {
    let feedback = "";
    if (decision === "passt_nicht") {
      feedback = window.prompt("Was soll noch anders sein?") ?? "";
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

  return (
    <div
      style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem 7rem" }}
    >
      <h1 style={{ marginBottom: 4 }}>KI-Studio</h1>
      <p style={{ opacity: 0.7, marginTop: 0, fontSize: 14 }}>
        Beschreibe einen Wunsch an der Website (z. B. neue Sektion, anderes
        Layout). Texte, Bilder, Termine und Sponsoren änderst du direkt im CMS —
        hier nur strukturelle/Design-Wünsche. Du bekommst eine Vorschau und
        gibst Rückmeldung; live geschaltet wird erst nach Freigabe.
      </p>

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

                {status === "vorschau_bereit" &&
                it.clientDecision === "offen" ? (
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
