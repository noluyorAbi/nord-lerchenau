import Link from "next/link";

import { Crest } from "@/components/Crest";
import { HeroItem, HeroStagger } from "@/components/motion/HeroStagger";
import type { HomePage } from "@/payload-types";

type Props = { hero: HomePage["hero"] };

// Sample next fixture — will be wired to Payload Fixtures collection
// when P4 data is populated.
const NEXT_MATCH = {
  competition: "Bezirksliga",
  date: "Sa · 08.03.26",
  venue: "Eschengarten",
  home: "SV Nord\nLerchenau",
  away: "SVA\nPalzing",
  kickoff: "14:30",
};

const HERO_BG =
  "https://static.wixstatic.com/media/c475b1_1be2a5f0ae1345f99411d200dc28631d~mv2_d_5184_3456_s_4_2.jpg/v1/fill/w_1600,h_1000,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/c475b1_1be2a5f0ae1345f99411d200dc28631d~mv2_d_5184_3456_s_4_2.jpg";

export function Hero({ hero }: Props) {
  const line1 = hero?.headlineLine1 ?? "EINMAL";
  const line2 = hero?.headlineLine2 ?? "NORDLER";
  const subline =
    hero?.subline ??
    "Seit 1947 zuhause im Münchner Norden. 500 Mitglieder, sechs Sportarten, ein Verein — familiär, frech und fair.";
  const primary = {
    label: hero?.primaryCtaLabel ?? "Spielplan ansehen →",
    href: hero?.primaryCtaHref ?? "/fussball",
  };
  const secondary = {
    label: hero?.secondaryCtaLabel ?? "Der Verein",
    href: hero?.secondaryCtaHref ?? "/verein",
  };

  return (
    <section className="relative overflow-hidden bg-nord-paper">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-6 pb-20 pt-14 md:grid-cols-[1.2fr_1fr] md:px-7 md:pb-[72px] md:pt-14">
        {/* LEFT — headline */}
        <div className="relative flex min-h-[520px] flex-col justify-between">
          <HeroStagger>
            <HeroItem>
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-nord-line px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-muted">
                  <span
                    className="size-1.5 rounded-full bg-nord-red"
                    style={{ animation: "live-pulse 1.8s infinite" }}
                  />
                  Heimspieltag · Eschengarten
                </span>
                <span className="font-mono text-[11px] text-nord-muted">
                  {NEXT_MATCH.date.toUpperCase()}
                </span>
              </div>
            </HeroItem>

            <HeroItem>
              <h1
                className="font-display font-black text-nord-ink"
                style={{
                  fontSize: "clamp(68px, 10vw, 168px)",
                  lineHeight: 0.86,
                  letterSpacing: "-0.03em",
                  margin: 0,
                }}
              >
                {line1}
                <br />
                <span className="text-nord-gold">{line2},</span>
                <br />
                IMMER
                <br />
                <span className="font-serif italic font-bold text-nord-navy">
                  Nordler.
                </span>
              </h1>
            </HeroItem>
          </HeroStagger>

          <HeroStagger className="mt-8 flex flex-wrap items-end gap-10">
            <HeroItem>
              <div className="max-w-[440px]">
                <p className="m-0 text-base leading-relaxed text-nord-muted">
                  {subline}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link
                    href={primary.href}
                    className="inline-flex items-center gap-2.5 rounded-full bg-nord-gold px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)]"
                  >
                    {primary.label}
                  </Link>
                  <Link
                    href={secondary.href}
                    className="inline-flex items-center gap-2.5 rounded-full border border-nord-line bg-transparent px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper"
                  >
                    {secondary.label}
                  </Link>
                </div>
              </div>
            </HeroItem>

            <HeroItem>
              <div className="border-l border-nord-line pl-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-nord-muted">
                  Gegründet
                </div>
                <div className="font-display text-[44px] font-black leading-none text-nord-ink">
                  1947
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-nord-muted">
                  Tabelle
                </div>
                <div className="font-display text-[44px] font-black leading-none text-nord-ink">
                  3
                  <sup className="text-[20px] align-top text-nord-muted">
                    rd
                  </sup>
                </div>
              </div>
            </HeroItem>
          </HeroStagger>
        </div>

        {/* RIGHT — match card */}
        <div className="relative min-h-[480px] md:min-h-[520px]">
          <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-nord-line">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${HERO_BG})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,63,0.2)_0%,rgba(11,27,63,0.92)_85%)]" />

            <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-white">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">
                Next Match
              </div>
              <span className="inline-flex items-center rounded-full border border-nord-gold px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold">
                {NEXT_MATCH.competition}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
                {NEXT_MATCH.date} · {NEXT_MATCH.venue}
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="flex flex-col items-center gap-2.5">
                  <Crest size={56} navy="#ffffff" gold="var(--color-nord-gold)" textColor="var(--color-nord-navy)" />
                  <div className="text-center font-display text-[22px] font-extrabold leading-none">
                    {NEXT_MATCH.home.split("\n").map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </div>
                </div>
                <div className="font-display text-[56px] font-black leading-none text-nord-gold">
                  vs
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="flex h-[67px] w-[56px] items-center justify-center rounded-md bg-white font-display text-[22px] font-black text-nord-navy">
                    SVA
                  </div>
                  <div className="text-center font-display text-[22px] font-extrabold leading-none">
                    {NEXT_MATCH.away.split("\n").map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                    Anstoss
                  </div>
                  <div className="font-display text-[32px] font-black leading-none text-nord-gold">
                    {NEXT_MATCH.kickoff}
                  </div>
                </div>
                <Link
                  href="/fussball"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:bg-nord-gold"
                >
                  Spielinfo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
