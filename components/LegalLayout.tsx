import Link from "next/link";
import type { ReactNode } from "react";

import { PageHero } from "@/components/PageHero";

type SideLink = { href: string; label: string };
type Fact = { label: string; value: string };

type Props = {
  eyebrow: string;
  title: string;
  lede: string;
  lastUpdated: string;
  facts: Fact[];
  sideLinks?: SideLink[];
  contact?: {
    name: string;
    streetLines: string[];
    email?: string | null;
    phone?: string | null;
  };
  children: ReactNode;
};

export function LegalLayout({
  eyebrow,
  title,
  lede,
  lastUpdated,
  facts,
  sideLinks,
  contact,
  children,
}: Props) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lede={lede} />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-nord-line pb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-nord-muted">
          <span className="rounded-full border border-nord-line bg-white px-3 py-1">
            Stand · {lastUpdated}
          </span>
          <span className="rounded-full border border-nord-gold/40 bg-nord-gold/10 px-3 py-1 text-nord-navy">
            Rechtlich verbindlich
          </span>
          <span className="rounded-full border border-nord-line bg-white px-3 py-1">
            DSGVO · TMG · MStV
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_280px] md:gap-12">
          <article className="min-w-0">
            <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-h2:mt-12 prose-h2:scroll-mt-24 prose-h2:border-b prose-h2:border-nord-line prose-h2:pb-2 prose-h3:mt-8 prose-h3:scroll-mt-24 prose-a:text-nord-navy hover:prose-a:text-nord-gold prose-strong:text-nord-ink prose-li:my-1">
              {children}
            </div>
          </article>

          <aside className="space-y-5 md:sticky md:top-24 md:h-fit md:self-start">
            {contact ? (
              <div className="rounded-2xl bg-nord-ink p-6 text-white">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                  Verantwortlicher
                </div>
                <div className="mt-2 font-display text-lg font-black leading-tight">
                  {contact.name}
                </div>
                <div className="mt-3 text-xs leading-relaxed text-white/75">
                  {contact.streetLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="block truncate text-white/85 transition hover:text-nord-gold"
                    >
                      ✉ {contact.email}
                    </a>
                  ) : null}
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="block text-white/85 transition hover:text-nord-gold"
                    >
                      ☎ {contact.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {facts.length > 0 ? (
              <div className="rounded-2xl border border-nord-line bg-white p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                  Auf einen Blick
                </div>
                <dl className="mt-3 divide-y divide-nord-line/70 text-sm">
                  {facts.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                        {f.label}
                      </dt>
                      <dd className="text-right font-display text-[13px] font-bold text-nord-ink">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {sideLinks && sideLinks.length > 0 ? (
              <div className="rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                  Auch nützlich
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {sideLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex items-center gap-1.5 font-display font-semibold text-nord-navy transition hover:text-nord-gold"
                      >
                        {l.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
