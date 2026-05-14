import Link from "next/link";
import type { ReactNode } from "react";

export type LegalBlock =
  | { kind: "lead"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | {
      kind: "kv";
      rows: Array<{ k: string; v: string; href?: string }>;
    }
  | { kind: "h3"; text: string }
  | {
      kind: "callout";
      tone?: "info" | "warning" | "key";
      title?: string;
      text: string;
    }
  | {
      kind: "linkRow";
      label: string;
      href: string;
      sub?: string;
    };

export type LegalIcon =
  | "shield"
  | "user"
  | "server"
  | "cookie"
  | "mail"
  | "scale"
  | "lock"
  | "globe"
  | "doc"
  | "building"
  | "gavel"
  | "key";

export type LegalSection = {
  id: string;
  num: string;
  title: string;
  icon: LegalIcon;
  intro?: string;
  blocks: LegalBlock[];
};

function parseInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  let buf = "";
  let key = 0;
  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };
  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 1) {
        flush();
        out.push(
          <strong key={`b-${key++}`} className="font-semibold text-nord-ink">
            {text.slice(i + 2, end)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "[") {
      const close = text.indexOf("]", i);
      if (close > i && text[close + 1] === "(") {
        const paren = text.indexOf(")", close);
        if (paren > close) {
          flush();
          const label = text.slice(i + 1, close);
          const url = text.slice(close + 2, paren);
          const isExternal = /^https?:\/\//.test(url);
          out.push(
            <a
              key={`l-${key++}`}
              href={url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="font-semibold text-nord-navy underline-offset-2 transition hover:text-nord-gold hover:underline"
            >
              {label}
              {isExternal ? (
                <span aria-hidden className="ml-0.5 text-[0.85em]">
                  ↗
                </span>
              ) : null}
            </a>,
          );
          i = paren + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return out;
}

const ICONS: Record<LegalIcon, ReactNode> = {
  shield: <path d="M12 2 4 5v6c0 5 3.5 9.4 8 11 4.5-1.6 8-6 8-11V5l-8-3z" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0H5z" />,
  server: (
    <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6zm0 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3zM7 7.5h.01M7 16.5h.01" />
  ),
  cookie: (
    <path d="M12 2a10 10 0 1 0 10 10 5 5 0 0 1-5-5 5 5 0 0 1-5-5zM8 12h.01M12 16h.01M16 12h.01" />
  ),
  mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  scale: (
    <path d="M12 3v18M6 7h12M5 7l-3 6a4 4 0 0 0 8 0L7 7zm12 0-3 6a4 4 0 0 0 8 0l-3-6" />
  ),
  lock: <path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" />,
  globe: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20" />
  ),
  doc: <path d="M6 2h9l4 4v16H6zM15 2v4h4" />,
  building: <path d="M4 22V4h10v18M14 8h6v14M8 8h2M8 12h2M8 16h2" />,
  gavel: <path d="M14 6 8 12l4 4 6-6zM3 21l6-6M2 8l6-6 4 4-6 6zM14 14l6 6" />,
  key: (
    <path d="M14 9a4 4 0 1 1-3.5 6h-1.5l-1.5 1.5-1.5-1.5L4 17l3-3 1.5-1.5h1.5A4 4 0 0 1 14 9zm2 5h.01" />
  ),
};

function Icon({ name }: { name: LegalIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

function CalloutBlock({
  tone,
  title,
  text,
}: {
  tone?: "info" | "warning" | "key";
  title?: string;
  text: string;
}) {
  const palette =
    tone === "warning"
      ? {
          bg: "bg-amber-50",
          border: "border-amber-300",
          tag: "text-amber-700",
          label: "Wichtig",
        }
      : tone === "key"
        ? {
            bg: "bg-nord-gold/10",
            border: "border-nord-gold/40",
            tag: "text-nord-navy",
            label: "Kern­aussage",
          }
        : {
            bg: "bg-nord-paper-2",
            border: "border-nord-line",
            tag: "text-nord-muted",
            label: "Hinweis",
          };
  return (
    <div
      className={`mt-5 rounded-xl border ${palette.border} ${palette.bg} p-4`}
    >
      <div
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${palette.tag}`}
      >
        {title ?? palette.label}
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-nord-ink">
        {parseInline(text)}
      </p>
    </div>
  );
}

function renderBlock(block: LegalBlock, idx: number): ReactNode {
  switch (block.kind) {
    case "lead":
      return (
        <p
          key={idx}
          className="text-[16px] leading-relaxed text-nord-ink first:mt-0"
        >
          {parseInline(block.text)}
        </p>
      );
    case "p":
      return (
        <p
          key={idx}
          className="mt-4 text-[14.5px] leading-relaxed text-nord-muted first:mt-0"
        >
          {parseInline(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul
          key={idx}
          className="mt-4 space-y-2 text-[14px] leading-relaxed text-nord-muted"
        >
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-nord-gold" />
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "kv":
      return (
        <dl
          key={idx}
          className="mt-4 divide-y divide-nord-line/70 overflow-hidden rounded-xl border border-nord-line bg-nord-paper-2"
        >
          {block.rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[120px_1fr] items-baseline gap-3 px-4 py-2.5 sm:grid-cols-[160px_1fr] sm:px-5"
            >
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-muted">
                {row.k}
              </dt>
              <dd className="text-[14px] text-nord-ink">
                {row.href ? (
                  <a
                    href={row.href}
                    target={
                      /^https?:\/\//.test(row.href) ? "_blank" : undefined
                    }
                    rel={
                      /^https?:\/\//.test(row.href)
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="font-semibold text-nord-navy underline-offset-2 hover:text-nord-gold hover:underline"
                  >
                    {row.v}
                  </a>
                ) : (
                  <span className="font-semibold">{parseInline(row.v)}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      );
    case "h3":
      return (
        <h3
          key={idx}
          className="mt-7 font-display text-[18px] font-extrabold tracking-tight text-nord-ink"
        >
          {parseInline(block.text)}
        </h3>
      );
    case "callout":
      return (
        <CalloutBlock
          key={idx}
          tone={block.tone}
          title={block.title}
          text={block.text}
        />
      );
    case "linkRow":
      return (
        <a
          key={idx}
          href={block.href}
          target={/^https?:\/\//.test(block.href) ? "_blank" : undefined}
          rel={
            /^https?:\/\//.test(block.href) ? "noopener noreferrer" : undefined
          }
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-nord-line bg-white px-4 py-3 transition hover:border-nord-gold hover:bg-nord-paper-2"
        >
          <div className="min-w-0">
            <div className="font-display text-[14px] font-bold text-nord-ink">
              {block.label}
            </div>
            {block.sub ? (
              <div className="mt-0.5 truncate text-[12px] text-nord-muted">
                {block.sub}
              </div>
            ) : null}
          </div>
          <span className="text-nord-gold" aria-hidden>
            ↗
          </span>
        </a>
      );
  }
}

export function LegalToc({ sections }: { sections: LegalSection[] }) {
  return (
    <nav className="mb-10 -mx-2 overflow-x-auto rounded-2xl border border-nord-line bg-white p-2">
      <div className="flex min-w-max items-center gap-1 sm:flex-wrap sm:min-w-0">
        {sections.map((s) => (
          <Link
            key={s.id}
            href={`#${s.id}`}
            className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted transition hover:bg-nord-paper-2 hover:text-nord-ink"
          >
            <span className="font-display text-[12px] font-black text-nord-gold group-hover:text-nord-navy">
              {s.num}
            </span>
            <span className="font-display text-[11px] font-bold tracking-tight">
              {s.title}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <>
      <LegalToc sections={sections} />
      <div className="space-y-6">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-nord-line bg-white"
          >
            <header className="flex items-start gap-4 border-b border-nord-line bg-gradient-to-br from-nord-paper-2 to-white px-5 py-5 md:px-7 md:py-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-nord-navy text-nord-gold">
                <Icon name={s.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                    § {s.num}
                  </span>
                  {s.intro ? (
                    <span className="hidden truncate text-[11px] text-nord-muted sm:inline">
                      · {s.intro}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-1 font-display text-[20px] font-black tracking-tight text-nord-ink md:text-[24px]">
                  {s.title}
                </h2>
              </div>
              <a
                href={`#${s.id}`}
                className="hidden shrink-0 items-center gap-1 self-center rounded-full border border-nord-line bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted transition hover:border-nord-gold hover:text-nord-navy md:inline-flex"
                aria-label={`Direktlink zu Abschnitt ${s.num}`}
              >
                #
              </a>
            </header>
            <div className="px-5 py-6 md:px-7 md:py-7">
              {s.blocks.map((b, i) => renderBlock(b, i))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
