"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const GREETING =
  "Servus! Ich bin der Nord-Assistent. Frag mich zu Mannschaften, Probetraining, Mitgliedschaft, Vereinsheim — was du wissen willst.";

const SUGGESTIONS = [
  "Wie kann ich Probetraining vereinbaren?",
  "Was kostet die Mitgliedschaft?",
  "Welche Jugendmannschaften gibt es?",
  "Wo ist das Vereinsheim?",
];

const MD_COMPONENTS: Components = {
  a: ({ href, children, ...rest }) => {
    const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a
        {...rest}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="font-semibold text-nord-navy underline decoration-nord-gold/60 underline-offset-2 hover:text-nord-gold"
      >
        {children}
      </a>
    );
  },
  p: ({ children }) => <p className="my-1 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-bold text-nord-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1.5 list-decimal space-y-0.5 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  h1: ({ children }) => (
    <h3 className="mt-2 mb-1 font-display text-base font-black tracking-tight">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-2 mb-1 font-display text-[15px] font-black tracking-tight">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-2 mb-1 font-display text-sm font-black tracking-tight">
      {children}
    </h4>
  ),
  code: ({ children, ...props }) => {
    const text = String(children).trim();
    const inline = !(props as { node?: { position?: unknown } })?.node
      ? true
      : !text.includes("\n");
    if (inline) {
      // [Label](/path) wrapped in backticks → render as actual link.
      const mdLink = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (mdLink) {
        const href = mdLink[2];
        const isExternal = /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-semibold text-nord-navy underline decoration-nord-gold/60 underline-offset-2 hover:text-nord-gold"
          >
            {mdLink[1]}
          </a>
        );
      }
      // Bare /path wrapped in backticks → link.
      if (/^\/[a-zA-Z0-9/_-]*$/.test(text)) {
        return (
          <a
            href={text}
            className="font-semibold text-nord-navy underline decoration-nord-gold/60 underline-offset-2 hover:text-nord-gold"
          >
            {text}
          </a>
        );
      }
      return (
        <code className="rounded bg-nord-paper-2 px-1 py-0.5 font-mono text-[11px] text-nord-navy">
          {children}
        </code>
      );
    }
    return (
      <code className="block overflow-x-auto rounded-lg bg-nord-ink p-3 font-mono text-[11px] text-nord-paper">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-nord-ink p-3 text-[11px] text-nord-paper">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-nord-gold/60 pl-3 italic text-nord-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-nord-line" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-nord-line bg-nord-paper-2 px-2 py-1 text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-nord-line px-2 py-1">{children}</td>
  ),
};

function normalizeLinks(content: string): string {
  return (
    content
      // `[Label](/path)` → [Label](/path)
      .replace(/`\[([^\]]+)\]\(([^)]+)\)`/g, "[$1]($2)")
      // `/path` (alone) → [/path](/path)
      .replace(/`(\/[a-zA-Z0-9/_-]+)`/g, (_, p1: string) => `[${p1}](${p1})`)
  );
}

function renderContent(content: string) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
      {normalizeLinks(content)}
    </ReactMarkdown>
  );
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setError(null);
      const next: Message[] = [...messages, { role: "user", content: trimmed }];
      setMessages(next);
      setInput("");
      setBusy(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error ?? `Anfrage fehlgeschlagen (${res.status})`,
          );
        }

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Etwas ist schiefgelaufen.",
        );
        setMessages((prev) =>
          prev[prev.length - 1]?.role === "assistant" &&
          prev[prev.length - 1]?.content === ""
            ? prev.slice(0, -1)
            : prev,
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, messages],
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Assistent schließen" : "Assistent öffnen"}
        aria-expanded={open}
        className={`fixed bottom-24 right-6 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-nord-navy pl-4 pr-5 text-white shadow-[0_14px_30px_-10px_rgba(26,61,188,0.55)] transition hover:-translate-y-0.5 hover:bg-nord-navy-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold md:bottom-28 md:right-8 ${
          open ? "scale-95 opacity-0 pointer-events-none" : ""
        }`}
      >
        <span className="relative flex size-9 items-center justify-center rounded-full bg-nord-gold text-nord-navy">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-nord-navy" />
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-[0.06em]">
          Nord-Assistent
        </span>
      </button>

      <div
        aria-hidden={!open}
        className={`fixed inset-x-3 bottom-3 z-50 origin-bottom-right rounded-2xl border border-nord-line bg-white shadow-[0_24px_60px_-20px_rgba(11,27,63,0.45)] transition md:inset-x-auto md:bottom-6 md:right-6 md:w-[400px] ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-nord-navy px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center rounded-full bg-nord-gold text-nord-navy">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-nord-navy" />
            </span>
            <div>
              <div className="font-display text-sm font-black uppercase tracking-[0.06em]">
                Nord-Assistent
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/65">
                meist in Sekunden online
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Schließen"
            className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          ref={scrollRef}
          className="max-h-[60vh] min-h-[280px] overflow-y-auto bg-nord-paper-2/40 p-4"
        >
          <div className="mb-3 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-nord-ink shadow-sm">
            {GREETING}
          </div>

          {messages.length === 0 ? (
            <div className="grid gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-xl border border-nord-line bg-white px-3 py-2 text-left text-[13px] font-medium text-nord-ink transition hover:-translate-y-0.5 hover:border-nord-gold hover:text-nord-navy"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-nord-navy text-white"
                        : "rounded-bl-sm bg-white text-nord-ink"
                    }`}
                  >
                    {m.content === "" ? (
                      <span className="inline-flex gap-1">
                        <span
                          className="size-1.5 animate-bounce rounded-full bg-nord-muted"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="size-1.5 animate-bounce rounded-full bg-nord-muted"
                          style={{ animationDelay: "120ms" }}
                        />
                        <span
                          className="size-1.5 animate-bounce rounded-full bg-nord-muted"
                          style={{ animationDelay: "240ms" }}
                        />
                      </span>
                    ) : (
                      renderContent(m.content)
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 border-t border-nord-line bg-white p-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frag den Verein…"
            disabled={busy}
            className="flex-1 rounded-full border border-nord-line bg-nord-paper-2/50 px-4 py-2.5 text-sm text-nord-ink placeholder:text-nord-muted focus:border-nord-navy-2 focus:outline-none focus:ring-2 focus:ring-nord-sky/40 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Senden"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-nord-navy text-white transition hover:bg-nord-navy-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        <div className="border-t border-nord-line bg-nord-paper-2/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
          Powered by OpenAI · Keine personenbezogenen Antworten
        </div>
      </div>
    </>
  );
}
