import Link from "next/link";

import { ClubLogo } from "@/components/ClubLogo";
import { HeroItem, HeroStagger } from "@/components/motion/HeroStagger";
import { formatKickoff, formatShortDate } from "@/lib/format-date";
import {
  FUPA_TEAM_SLUG,
  fupaImage,
  getFupaStanding,
  getFupaUpcoming,
  isOurTeam,
  pickNext,
} from "@/lib/fupa";
import type { HomePage } from "@/payload-types";

type Props = { hero: HomePage["hero"] };

const HERO_BG =
  "https://image.fupa.net/team-image/HV6MiTsJZKMu/1920x1080.webp";

export async function Hero({ hero }: Props) {
  const [upcoming, standings] = await Promise.all([
    getFupaUpcoming(),
    getFupaStanding(),
  ]);
  const nextMatch = pickNext(upcoming);
  const ourRank = standings?.standings.find((r) =>
    isOurTeam(r.team, FUPA_TEAM_SLUG),
  )?.rank;

  const isHome = nextMatch ? isOurTeam(nextMatch.homeTeam) : false;
  const opponent = nextMatch
    ? isHome
      ? nextMatch.awayTeam
      : nextMatch.homeTeam
    : null;
  const kickoffDate = nextMatch ? new Date(nextMatch.kickoff) : null;
  const opponentCrest = opponent
    ? fupaImage(opponent.image, "128x128", "webp")
    : null;
  const kickoffTime = kickoffDate
    ? kickoffDate.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "—";
  const venueLabel = isHome ? "Eschengarten" : "Auswärts";
  const compLabel =
    nextMatch?.competition?.shortName ??
    nextMatch?.competition?.middleName ??
    "Bezirksliga";
  const matchDayBadge = kickoffDate ? formatKickoff(kickoffDate) : "";
  const matchDateLine = kickoffDate
    ? `${formatShortDate(kickoffDate)} · ${venueLabel}`
    : "Noch kein Spiel geplant";

  const line1 = hero?.headlineLine1 ?? "Einmal Nordler,";
  const line2 = hero?.headlineLine2 ?? "immer Nordler.";
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
                  {isHome ? "Heimspieltag · Eschengarten" : "Auswärts · Ligaspiel"}
                </span>
                {matchDayBadge ? (
                  <span className="font-mono text-[11px] text-nord-muted">
                    {matchDayBadge.toUpperCase()}
                  </span>
                ) : null}
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
                <span className="block uppercase">{line1}</span>
                <span className="block font-serif italic font-bold text-nord-navy">
                  {line2}
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
                <div className="font-display text-[44px] font-black leading-tight text-nord-ink">
                  {ourRank ?? "—"}
                  <span className="text-nord-gold">.</span>
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
                Nächstes Spiel
              </div>
              <span className="inline-flex items-center rounded-full border border-nord-gold px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold">
                {compLabel}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] opacity-70">
                {matchDateLine}
              </div>

              {nextMatch && opponent ? (
                <>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div className="flex flex-col items-center gap-2.5">
                      <ClubLogo
                        size={64}
                        className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                      />
                      <div className="text-center font-display text-[18px] font-extrabold leading-tight">
                        SV Nord
                        <br />
                        Lerchenau
                      </div>
                    </div>
                    <div className="font-display text-[56px] font-black leading-none text-nord-gold">
                      vs
                    </div>
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="flex size-16 items-center justify-center overflow-hidden rounded-md bg-white/95 p-1.5">
                        {opponentCrest ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={opponentCrest}
                            alt={`Wappen ${opponent.name.full}`}
                            className="size-full object-contain"
                          />
                        ) : (
                          <span className="font-display text-[18px] font-black text-nord-navy">
                            {opponent.name.short}
                          </span>
                        )}
                      </div>
                      <div className="text-center font-display text-[18px] font-extrabold leading-tight">
                        {opponent.name.full}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                        Anstoß
                      </div>
                      <div className="font-display text-[32px] font-black leading-none text-nord-gold">
                        {kickoffTime}
                      </div>
                    </div>
                    <Link
                      href="/fussball"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:bg-nord-gold"
                    >
                      Spielinfo →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-lg border border-white/15 bg-white/5 p-6 text-center text-sm text-white/70">
                  Aktuell kein Spiel angesetzt. Tabellen & News findest du
                  weiter unten.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
