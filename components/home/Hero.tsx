import Link from "next/link";

import { HeroMatchCard } from "@/components/home/HeroMatchCard";
import { HeroItem, HeroStagger } from "@/components/motion/HeroStagger";
import { formatKickoff, formatShortDate } from "@/lib/format-date";
import {
  fupaImage,
  fupaMatchUrl,
  getFupaStandingForTeam,
  getFupaUpcoming,
  isOurClub,
  isOurTeam,
  pickNext,
  resolveLiveFupaSlug,
  resolveLiveHerrenSlug,
} from "@/lib/fupa";
import { getPayloadClient } from "@/lib/payload";
import {
  fetchUpcomingAcrossTeams,
  type WeekendFupaEntry,
  type WeekendTeam,
} from "@/lib/weekend";
import type { HomePage, Team } from "@/payload-types";

type Props = { hero: HomePage["hero"] };

// Hero-Bilderlauf: starke Querformat-Fotos aus /public. Zum Tauschen
// einfach die Pfade ändern oder Einträge ergänzen/entfernen; die Animation
// passt sich automatisch an die Anzahl der Bilder an. Erstes Bild wird bei
// aktivierter Bewegungsreduktion (prefers-reduced-motion) statisch gezeigt.
const HERO_SLIDES = [
  "/news/historischer-aufstieg-in-die-landesliga.jpg",
  "/fans/spieltag-garmisch.jpg",
  "/sport/u8/tiger.jpg",
  "/sport/u8/loewen.jpg",
  "/fans/tribuene-garmisch.jpg",
  "/sport/u8/team-5.jpg",
] as const;

// Sekunden pro Bild; die Überblendung dauert HERO_FADE_MS.
const HERO_PER_SLIDE_S = 5.5;
const HERO_FADE_MS = 800;

export async function Hero({ hero }: Props) {
  // Slug der 1. Herren in der aktuellsten auf fupa existierenden Saison.
  const herrenSlug = await resolveLiveHerrenSlug();
  const [upcoming, standings] = await Promise.all([
    getFupaUpcoming(herrenSlug),
    getFupaStandingForTeam(herrenSlug),
  ]);
  const herrenMatch = pickNext(upcoming);
  const ourRank = standings?.standings.find((r) => isOurClub(r.team))?.rank;

  // Fallback: keine 1.-Herren-Partie → nächste Partie einer anderen
  // Mannschaft (Jugend, 2. Herren etc.) in den kommenden 60 Tagen.
  let fallbackEntry: WeekendFupaEntry | null = null;
  if (!herrenMatch) {
    try {
      const payload = await getPayloadClient();
      const now = new Date();
      const teamsRes = await payload.find({
        collection: "teams",
        where: { sport: { equals: "fussball" } },
        sort: "order",
        limit: 100,
        depth: 0,
      });
      const teams: WeekendTeam[] = (
        await Promise.all(
          (teamsRes.docs as Team[]).map<Promise<WeekendTeam | null>>(
            async (t) => {
              const fupaSlug = await resolveLiveFupaSlug(t.fupa, now);
              if (!fupaSlug || fupaSlug === herrenSlug) return null;
              return {
                name: t.name,
                slug: t.slug,
                fupaSlug,
                bfvTeamId: t.bfv?.teamId ?? null,
              };
            },
          ),
        )
      ).filter((t): t is WeekendTeam => t !== null);
      if (teams.length > 0) {
        const entries = await fetchUpcomingAcrossTeams(teams, now, 60);
        fallbackEntry =
          entries.find((e): e is WeekendFupaEntry => e.source === "fupa") ??
          null;
      }
    } catch {
      fallbackEntry = null;
    }
  }

  const usingFallback = !herrenMatch && Boolean(fallbackEntry);
  const nextMatch = herrenMatch ?? fallbackEntry?.fupa ?? null;
  const matchSlug = usingFallback
    ? (fallbackEntry?.team.fupaSlug ?? herrenSlug)
    : herrenSlug;
  const teamLabel = usingFallback ? (fallbackEntry?.team.name ?? null) : null;

  const isHome = nextMatch ? isOurTeam(nextMatch.homeTeam, matchSlug) : false;
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
        timeZone: "Europe/Berlin",
      })
    : "—";
  const venueLabel = isHome ? "Eschengarten" : "Auswärts";
  const compLabel =
    nextMatch?.competition?.shortName ??
    nextMatch?.competition?.middleName ??
    (usingFallback ? "Jugend-Liga" : "Landesliga");
  const matchDayBadge = kickoffDate ? formatKickoff(kickoffDate) : "";
  const matchDateLine = kickoffDate
    ? usingFallback && teamLabel
      ? `${teamLabel} · ${formatShortDate(kickoffDate)} · ${venueLabel}`
      : `${formatShortDate(kickoffDate)} · ${venueLabel}`
    : "Noch kein Spiel geplant";

  const line1 = hero?.headlineLine1 ?? "Einmal Nordler,";
  const line2 = hero?.headlineLine2 ?? "immer Nordler.";
  const subline =
    hero?.subline ??
    "Seit 1947 zuhause im Münchner Norden. Über 600 Mitglieder, sechs Sportarten, ein Verein — familiär, frech und fair.";
  const primary = {
    label: hero?.primaryCtaLabel ?? "Spielplan ansehen →",
    href: hero?.primaryCtaHref ?? "/fussball",
  };
  const secondary = {
    label: hero?.secondaryCtaLabel ?? "Der Verein",
    href: hero?.secondaryCtaHref ?? "/verein",
  };

  const slideCount = HERO_SLIDES.length;
  const totalS = slideCount * HERO_PER_SLIDE_S;
  // Anteil eines Bildes am Gesamtzyklus und Anteil der Überblendung.
  const visiblePct = 100 / slideCount;
  const fadePct = (HERO_FADE_MS / 1000 / totalS) * 100;
  // Reiner CSS-Bilderlauf (kein Client-JS): N gestapelte Layer teilen sich
  // eine Keyframe-Animation, jedes Layer per negativem animation-delay in
  // sein Zeitfenster verschoben. Überblendung nur via opacity (GPU). Bei
  // prefers-reduced-motion wird die Animation gestoppt; nur Bild 1 bleibt
  // sichtbar (alle weiteren Layer auf opacity:0).
  const heroSlideshowCss = `
    .hero-slide {
      opacity: 0;
      animation: hero-crossfade ${totalS}s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    }
    .hero-slide:first-child { opacity: 1; }
    @keyframes hero-crossfade {
      0% { opacity: 1; }
      ${(visiblePct - fadePct).toFixed(3)}% { opacity: 1; }
      ${visiblePct.toFixed(3)}% { opacity: 0; }
      ${(100 - fadePct).toFixed(3)}% { opacity: 0; }
      100% { opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-slide { animation: none; opacity: 0; }
      .hero-slide:first-child { opacity: 1; }
    }
    @keyframes hero-scroll-bob {
      0%, 100% { transform: translateY(0); opacity: 0.55; }
      50% { transform: translateY(6px); opacity: 1; }
    }
    .hero-scroll-cue {
      animation: hero-scroll-bob 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-scroll-cue { animation: none; opacity: 0.7; }
    }
  `;

  return (
    <section className="relative -mt-[88px] flex min-h-[100svh] items-start overflow-hidden text-white md:items-center">
      {/* Full-bleed Bilderlauf: gestapelte Layer mit CSS-Crossfade */}
      <style dangerouslySetInnerHTML={{ __html: heroSlideshowCss }} />
      <div className="absolute inset-0" aria-hidden="true">
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            className="hero-slide absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${src})`,
              // Vorwärts-Reihenfolge: Layer i wird ab i*HERO_PER_SLIDE_S sichtbar.
              // Negativer Delay verschiebt rückwärts, daher (slideCount - i).
              animationDelay:
                i === 0 ? "0s" : `-${(slideCount - i) * HERO_PER_SLIDE_S}s`,
            }}
          />
        ))}
      </div>
      {/* Darken the left/bottom for text legibility, let the right breathe */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,14,36,0.94)_0%,rgba(11,27,63,0.78)_45%,rgba(11,27,63,0.35)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,14,36,0.1)_0%,rgba(5,14,36,0)_35%,rgba(5,14,36,0.55)_100%)]" />

      <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-10 px-6 pb-14 pt-[calc(88px+2.5rem)] md:grid-cols-[1.2fr_1fr] md:px-7 md:pb-20 md:pt-[calc(88px+3.5rem)]">
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
                  {usingFallback
                    ? `Herren spielfrei · ${teamLabel ?? "Jugend"} am Ball`
                    : isHome
                      ? "Heimspieltag · Eschengarten"
                      : "Auswärts · Ligaspiel"}
                </span>
                {matchDayBadge ? (
                  <span className="font-mono text-[11px] text-white/60">
                    {matchDayBadge.toUpperCase()}
                  </span>
                ) : null}
              </div>
            </HeroItem>

            <HeroItem>
              {/* Vollständiger Vereinsname als Kicker, schmales geschütztes
                  Leerzeichen (U+202F) vor „e. V." */}
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
                SV Nord München-Lerchenau e.&#8239;V.
              </p>
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
          matchUrl={fupaMatchUrl(nextMatch?.slug)}
        />
      </div>

      {/* Sanfter Scroll-Hinweis: reine CSS-Bewegung (kein Client-JS),
          bei prefers-reduced-motion ruhend sichtbar. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center md:flex"
        aria-hidden="true"
      >
        <svg
          className="hero-scroll-cue size-6 text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
