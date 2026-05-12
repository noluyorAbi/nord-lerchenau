import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export const dynamic = "force-dynamic";

const STATS = [
  { value: "1947", label: "Gegründet" },
  { value: "500+", label: "Mitglieder" },
  { value: "5", label: "Abteilungen" },
  { value: "78", label: "Jahre" },
];

type CardTone = "navy" | "paper" | "sky" | "gold";

type FeatureCard = {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  meta: string;
  tone: CardTone;
};

const CARDS: FeatureCard[] = [
  {
    href: "/verein/chronik",
    eyebrow: "Geschichte",
    title: "Chronik",
    desc: "Von 38 Gründern und einer Kuhhaut zu heute. 78 Jahre SV Nord in 7 Kapiteln, Zeittafel und Ehrentafel.",
    meta: "1947 → heute",
    tone: "navy",
  },
  {
    href: "/verein/vorstand",
    eyebrow: "Menschen",
    title: "Vorstand",
    desc: "Vorstandschaft, sportliche Leitung und Jugendleitung. Direkt erreichbar mit Telefon und Mail.",
    meta: "Ehrenamtlich · 22 Personen",
    tone: "sky",
  },
  {
    href: "/verein/vereinsheim",
    eyebrow: "Treffpunkt",
    title: "Vereinsheim Eschengarten",
    desc: "Selbst gebaut in 15.000 freiwilligen Arbeitsstunden. Heute der gesellschaftliche Mittelpunkt der Lerchenau.",
    meta: "Eröffnet 19.07.1986",
    tone: "paper",
  },
  {
    href: "/verein/jugendfoerderverein",
    eyebrow: "Förderung",
    title: "Jugendförderverein",
    desc: "Damit jedes Kind kicken kann. Mindest­beitrag 24 € im Jahr, Spendenquittung möglich.",
    meta: "Ab 24 € jährlich",
    tone: "gold",
  },
];

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

export default function VereinPage() {
  return (
    <>
      <PageHero
        eyebrow="Der Verein"
        title="SV Nord München-Lerchenau e.V."
        lede="Traditionsverein im Münchner Norden seit 1947. Über 500 Mitglieder in fünf Abteilungen, getragen von ehrenamtlichem Engagement."
      />

      <section className="mx-auto max-w-7xl px-6 pt-8 pb-14 md:px-10 md:pt-12 md:pb-20">
        <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map((stat, idx) => (
            <div
              key={stat.label}
              className={`rounded-2xl p-5 md:p-6 ${
                idx === 0
                  ? "bg-nord-navy text-white"
                  : "border border-nord-line bg-white text-nord-ink"
              }`}
            >
              <div
                className={`font-display text-4xl font-black leading-none tracking-tight md:text-5xl ${
                  idx === 0 ? "text-nord-gold" : ""
                }`}
              >
                {stat.value}
              </div>
              <div
                className={`mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  idx === 0 ? "text-white/70" : "text-nord-muted"
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(220px,auto)] lg:gap-5">
          {CARDS.map((card, idx) => {
            const tones = TONE_CLASSES[card.tone];
            const span =
              idx === 0
                ? "md:col-span-4 md:row-span-2"
                : idx === 1
                  ? "md:col-span-2 md:row-span-2"
                  : idx === 2
                    ? "md:col-span-3"
                    : "md:col-span-3";
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-7 transition hover:-translate-y-0.5 hover:shadow-xl md:p-9 ${tones.card} ${span}`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 opacity-0 blur-2xl transition group-hover:opacity-100"
                />
                <div className="relative">
                  <div
                    className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${tones.eyebrow}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {card.eyebrow}
                  </div>
                  <h2
                    className={`mt-4 font-display font-black leading-[1.02] tracking-tight ${
                      idx === 0
                        ? "text-4xl md:text-6xl"
                        : "text-3xl md:text-4xl"
                    }`}
                  >
                    {card.title}
                  </h2>
                  <p
                    className={`mt-4 max-w-prose text-sm leading-relaxed md:text-base ${
                      card.tone === "navy" ? "text-white/80" : "text-current/80"
                    }`}
                  >
                    {card.desc}
                  </p>
                </div>
                <div className="relative mt-8 flex items-end justify-between gap-3">
                  <span
                    className={`font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${tones.meta}`}
                  >
                    {card.meta}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition group-hover:translate-x-0.5 ${tones.arrow}`}
                  >
                    Mehr lesen →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <aside className="mt-12 rounded-2xl border border-dashed border-nord-line bg-white p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-gold">
                Mitglied werden
              </div>
              <h3 className="mt-3 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                Einmal Nordler, immer Nordler.
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-nord-muted md:text-base">
                Mitgliedsantrag, SEPA-Mandat, Spielerpass. Drei Schritte und du
                bist dabei.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link
                href="/mitgliedschaft"
                className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
              >
                Antrag öffnen →
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <ScrollToTopButton />
    </>
  );
}
