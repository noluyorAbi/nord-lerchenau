import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const HERO_EYEBROW = "Der Verein";
const HERO_TITLE = "SV Nord München-Lerchenau e.V.";
const HERO_LEDE =
  "Traditionsverein im Münchner Norden seit 1947: über 600 Mitglieder, fünf Abteilungen.";

const STATS = [
  { value: "1947", label: "Gegründet" },
  { value: "600+", label: "Mitglieder" },
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
    tone: "paper",
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
  {
    href: "/verein/jugendschutz",
    eyebrow: "Schutzkonzept",
    title: "Kinder- & Jugendschutz",
    desc: "Erweitertes Führungszeugnis für alle Trainer, klare Prävention und Ansprechstellen im Verdachtsfall.",
    meta: "Schutz & Prävention",
    tone: "navy",
  },
];

const SOCIAL_MEDIA_LABEL = "Social Media";

const SOCIAL_MEDIA_TEAM = [
  "Tobias Tins",
  "Tobias Treffer",
  "Dominik Besel",
  "Andi Weiß",
  "Marko Rakita",
  "Tamay Piker",
];

const CTA_EYEBROW = "Mitglied werden";
const CTA_TITLE = "Einmal Nordler, immer Nordler.";
const CTA_TEXT =
  "Mitgliedsantrag, SEPA-Mandat, Spielerpass. Drei Schritte und du bist dabei.";
const CTA_BUTTON_LABEL = "Antrag öffnen →";
const CTA_BUTTON_HREF = "/mitgliedschaft";

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

export default async function VereinPage() {
  const payload = await getPayloadClient();
  const cms = await payload.findGlobal({ slug: "verein-page" });

  const heroEyebrow = cms.hero?.eyebrow ?? HERO_EYEBROW;
  const heroTitle = cms.hero?.title ?? HERO_TITLE;
  const heroLede = cms.hero?.lede ?? HERO_LEDE;

  const stats =
    cms.stats && cms.stats.length > 0
      ? cms.stats.map((s) => ({ value: s.value, label: s.label }))
      : STATS;

  const cards: FeatureCard[] =
    cms.cards && cms.cards.length > 0
      ? cms.cards.map((c) => ({
          href: c.href,
          eyebrow: c.eyebrow,
          title: c.title,
          desc: c.desc,
          meta: c.meta,
          tone: c.tone,
        }))
      : CARDS;

  const socialMediaLabel = cms.socialMediaLabel ?? SOCIAL_MEDIA_LABEL;
  const socialMediaTeam =
    cms.socialMediaTeam && cms.socialMediaTeam.length > 0
      ? cms.socialMediaTeam.map((m) => m.name)
      : SOCIAL_MEDIA_TEAM;

  const ctaEyebrow = cms.cta?.eyebrow ?? CTA_EYEBROW;
  const ctaTitle = cms.cta?.title ?? CTA_TITLE;
  const ctaText = cms.cta?.text ?? CTA_TEXT;
  const ctaButtonLabel = cms.cta?.buttonLabel ?? CTA_BUTTON_LABEL;
  const ctaButtonHref = cms.cta?.buttonHref ?? CTA_BUTTON_HREF;

  return (
    <>
      <PageHero eyebrow={heroEyebrow} title={heroTitle} lede={heroLede} />

      <section className="mx-auto max-w-7xl px-6 pt-8 pb-14 md:px-10 md:pt-12 md:pb-20">
        <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-nord-line bg-white p-5 text-nord-ink transition duration-300 ease-out hover:-translate-y-0.5 hover:border-nord-gold/60 hover:shadow-[0_18px_36px_-22px_rgba(212,160,23,0.45)] md:p-6"
            >
              <div className="font-display text-4xl font-black leading-none tracking-tight transition-colors duration-300 group-hover:text-nord-gold md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(220px,auto)] lg:gap-5">
          {cards.map((card, idx) => {
            const tones = TONE_CLASSES[card.tone];
            const span =
              idx === 0
                ? "md:col-span-4 md:row-span-2"
                : idx === 1
                  ? "md:col-span-2 md:row-span-2"
                  : "md:col-span-2";
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

        <section className="mt-12 border-t border-nord-line pt-6">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-muted">
              {socialMediaLabel}
            </span>
            <span className="font-mono text-[11px] tracking-[0.15em] text-nord-muted/60">
              {socialMediaTeam.length}
            </span>
          </div>
          <ul className="mt-5 grid gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {socialMediaTeam.map((name, i) => (
              <li
                key={name}
                className="group flex items-baseline gap-3 border-b border-nord-line/70 py-3"
              >
                <span className="font-mono text-[11px] tabular-nums tracking-[0.15em] text-nord-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg font-bold tracking-tight text-nord-ink transition-colors group-hover:text-nord-gold">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="mt-12 rounded-2xl border border-dashed border-nord-line bg-white p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-gold">
                {ctaEyebrow}
              </div>
              <h3 className="mt-3 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                {ctaTitle}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-nord-muted md:text-base">
                {ctaText}
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link
                href={ctaButtonHref}
                className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
              >
                {ctaButtonLabel}
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
