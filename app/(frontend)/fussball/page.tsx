import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { BFV_CLUB_URL } from "@/lib/bfv";
import {
  FUSSBALL_CATEGORIES,
  type FussballCategorySlug,
} from "@/lib/fussball-categories";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

type CardTone = "navy" | "paper" | "sky" | "gold";

const CARD_TONES: Record<
  FussballCategorySlug | "schiedsrichter",
  { tone: CardTone; eyebrowOverride?: string }
> = {
  herren: { tone: "navy" },
  junioren: { tone: "sky" },
  juniorinnen: { tone: "paper" },
  bambini: { tone: "gold" },
  schiedsrichter: { tone: "paper", eyebrowOverride: "Spielbetrieb" },
};

const TONE_CLASSES: Record<
  CardTone,
  { card: string; eyebrow: string; meta: string; arrow: string }
> = {
  navy: {
    card: "bg-nord-navy text-white",
    eyebrow: "text-nord-gold",
    meta: "text-white/70",
    arrow: "text-nord-gold",
  },
  paper: {
    card: "bg-nord-paper-2 text-nord-ink border border-nord-line",
    eyebrow: "text-nord-gold",
    meta: "text-nord-muted",
    arrow: "text-nord-navy",
  },
  sky: {
    card: "bg-gradient-to-br from-[#dff0fb] via-white to-white text-nord-ink border border-nord-line",
    eyebrow: "text-nord-navy",
    meta: "text-nord-muted",
    arrow: "text-nord-navy",
  },
  gold: {
    card: "bg-gradient-to-br from-nord-gold via-[#f0c44c] to-[#e6b035] text-nord-ink",
    eyebrow: "text-nord-navy",
    meta: "text-nord-ink/70",
    arrow: "text-nord-navy",
  },
};

export default async function FussballPage() {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "teams",
    where: { sport: { equals: "fussball" } },
    sort: "order",
    limit: 200,
    depth: 0,
  });

  const counts = {
    senioren: result.docs.filter((t) => t.category === "senioren").length,
    junioren: result.docs.filter((t) => t.category === "junioren").length,
    juniorinnen: result.docs.filter((t) => t.category === "juniorinnen").length,
    bambini: result.docs.filter((t) => t.category === "bambini").length,
  };

  const bfvCount = result.docs.filter((t) => t.bfv?.teamId).length;

  const cats = Object.values(FUSSBALL_CATEGORIES);

  return (
    <>
      <PageHero
        eyebrow="Fußball"
        title="Unsere Mannschaften"
        lede="Unsere Fußballabteilung existiert seit 1947. In der Saison 2025/26 stellen wir 15 Jugendmannschaften, 5 Herrenmannschaften und eine Ehrenligamannschaft."
      />
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <section className="mb-12 grid gap-6 rounded-2xl bg-nord-paper-2 p-8 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Herzlich Willkommen bei der Fußball-Abteilung
            </div>
            <p className="text-base leading-relaxed text-nord-ink">
              Unsere Fußballabteilung existiert seit dem Jahre 1947. Wir stellen
              in der Saison 2025/2026 fünfzehn Jugendmannschaften, fünf
              Herrenmannschaften und eine Ehrenligamannschaft. Wir freuen uns
              über alle Fußballbegeisterten von Jung bis Alt.
            </p>
            <p className="mt-3 text-sm italic text-nord-muted">
              Eure SV Nord Fußballer.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={BFV_CLUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
              >
                BFV-Vereinsprofil ↗
              </a>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                {bfvCount} Mannschaften · live beim BFV gemeldet
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-nord-line bg-white p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Sportliche Leitung
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <div className="font-semibold text-nord-ink">
                  Felix Kirmeyer
                </div>
                <div className="text-xs text-nord-muted">
                  Sportlicher Leiter
                </div>
              </li>
              <li>
                <div className="font-semibold text-nord-ink">
                  Tobias Treffer
                </div>
                <div className="text-xs text-nord-muted">
                  Jugendleitung Großfeld
                </div>
              </li>
              <li>
                <div className="font-semibold text-nord-ink">Ergin Piker</div>
                <div className="text-xs text-nord-muted">
                  Jugendleitung Kleinfeld
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
            <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
              Kategorien
            </h2>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
              {result.docs.length} Teams insgesamt
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(200px,auto)] lg:gap-5">
            {cats.map((c, idx) => {
              const tone = CARD_TONES[c.slug].tone;
              const tones = TONE_CLASSES[tone];
              const count = counts[c.category];
              const span =
                idx === 0
                  ? "md:col-span-4"
                  : idx === 1
                    ? "md:col-span-2"
                    : "md:col-span-2";
              return (
                <Link
                  key={c.slug}
                  href={`/fussball/${c.slug}`}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-xl md:p-8 ${tones.card} ${span}`}
                >
                  <div className="relative">
                    <div
                      className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${tones.eyebrow}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {c.eyebrow}
                    </div>
                    <h3
                      className={`mt-3 font-display font-black leading-[1.02] tracking-tight ${
                        idx === 0
                          ? "text-3xl md:text-5xl"
                          : "text-2xl md:text-3xl"
                      }`}
                    >
                      {c.label}
                    </h3>
                    <p
                      className={`mt-3 max-w-prose text-sm leading-relaxed ${
                        tone === "navy" ? "text-white/80" : "text-current/80"
                      }`}
                    >
                      {c.lede}
                    </p>
                  </div>
                  <div className="relative mt-6 flex items-end justify-between gap-3">
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${tones.meta}`}
                    >
                      {count} {count === 1 ? "Team" : "Teams"}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition group-hover:translate-x-0.5 ${tones.arrow}`}
                    >
                      Ansehen →
                    </span>
                  </div>
                </Link>
              );
            })}

            <Link
              href="/schiedsrichter"
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-xl md:col-span-6 md:p-8 ${TONE_CLASSES.paper.card}`}
            >
              <div className="relative">
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-gold">
                  <span className="size-1.5 rounded-full bg-current" />
                  Spielbetrieb
                </div>
                <h3 className="mt-3 font-display text-2xl font-black leading-tight tracking-tight md:text-3xl">
                  Schiedsrichter
                </h3>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-nord-muted">
                  Unsere Schiedsrichter pfeifen aktiv im BFV-Spielbetrieb und
                  sorgen für faire Bedingungen auf den Plätzen.
                </p>
              </div>
              <div className="relative mt-6 flex items-end justify-end gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-nord-navy transition group-hover:translate-x-0.5">
                  Zur Seite →
                </span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
