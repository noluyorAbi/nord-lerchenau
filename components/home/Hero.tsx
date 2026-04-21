import Link from "next/link";

import { HeroMatchCard } from "@/components/home/HeroMatchCard";
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
    <section className="relative -mt-[72px] flex min-h-[100svh] items-start overflow-hidden text-white md:items-center">
      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      {/* Darken the left/bottom for text legibility, let the right breathe */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,14,36,0.94)_0%,rgba(11,27,63,0.78)_45%,rgba(11,27,63,0.35)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,14,36,0.1)_0%,rgba(5,14,36,0)_35%,rgba(5,14,36,0.55)_100%)]" />

      <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-10 px-6 pb-14 pt-[calc(72px+2.5rem)] md:grid-cols-[1.2fr_1fr] md:px-7 md:pb-20 md:pt-[calc(72px+3.5rem)]">
        {/* LEFT — headline */}
        <div className="relative flex flex-col justify-between gap-8">
          <HeroStagger>
            <HeroItem>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
                  <span
                    className="size-1.5 rounded-full bg-nord-red"
                    style={{ animation: "live-pulse 1.8s infinite" }}
                  />
                  {isHome ? "Heimspieltag · Eschengarten" : "Auswärts · Ligaspiel"}
                </span>
                {matchDayBadge ? (
                  <span className="font-mono text-[11px] text-white/60">
                    {matchDayBadge.toUpperCase()}
                  </span>
                ) : null}
              </div>
            </HeroItem>

            <HeroItem>
              <h1
                className="font-display font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                style={{
                  fontSize: "clamp(38px, 4.6vw, 80px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                <span className="block uppercase">{line1}</span>
                <span className="block font-serif italic font-bold text-nord-gold">
                  {line2}
                </span>
              </h1>
            </HeroItem>
          </HeroStagger>

          <HeroStagger className="flex flex-wrap items-end gap-6 md:gap-10">
            <HeroItem>
              <div className="max-w-[440px]">
                <p className="m-0 text-base leading-relaxed text-white/75">
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
                    className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/5 px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-white backdrop-blur-sm transition hover:bg-white hover:text-nord-navy"
                  >
                    {secondary.label}
                  </Link>
                </div>
              </div>
            </HeroItem>

            <HeroItem>
              <div className="border-l border-white/20 pl-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Gegründet
                </div>
                <div className="font-display text-[32px] font-black leading-none text-white">
                  1947
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Tabelle
                </div>
                <div className="font-display text-[32px] font-black leading-tight text-white">
                  {ourRank ?? "—"}
                  <span className="text-nord-gold">.</span>
                </div>
              </div>
            </HeroItem>
          </HeroStagger>
        </div>

        {/* RIGHT — 3D tilt / shine match card */}
        <HeroMatchCard
          nextMatch={nextMatch}
          opponent={opponent}
          opponentCrest={opponentCrest}
          kickoffTime={kickoffTime}
          compLabel={compLabel}
          matchDateLine={matchDateLine}
        />
      </div>
    </section>
  );
}
