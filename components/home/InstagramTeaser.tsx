"use client";

import Link from "next/link";
import { useState } from "react";

import { SectionEyebrow } from "@/components/SectionEyebrow";

const IG_HANDLE = "svnord_lerchenau";
const IG_PROFILE_URL = `https://www.instagram.com/${IG_HANDLE}/`;
const IG_EMBED_URL = `https://www.instagram.com/${IG_HANDLE}/embed/`;

type GalleryShot = {
  src: string;
  caption: string;
  sub: string;
  span?: "wide" | "tall" | "default";
};

const GALLERY: GalleryShot[] = [
  {
    src: "/news/historischer-aufstieg-in-die-landesliga.jpg",
    caption: "Historischer Aufstieg",
    sub: "1. Herren · Bezirksliga → Landesliga",
    span: "wide",
  },
  {
    src: "/sport/u8/trainerteam.jpg",
    caption: "Trainerteam U8",
    sub: "Bambini & F-Junioren",
  },
  {
    src: "/sport/u8/loewen.jpg",
    caption: "U8 Löwen",
    sub: "F-Junioren · U8-I",
  },
  {
    src: "/sport/u8/tiger.jpg",
    caption: "U8 Tiger",
    sub: "F-Junioren · U8-II",
  },
  {
    src: "/news/karger-kommt.jpg",
    caption: "Neuzugang",
    sub: "Karger kommt",
    span: "tall",
  },
  {
    src: "/sport/ski-action.jpg",
    caption: "Ski-Abteilung",
    sub: "Tagesfahrten & Camps",
  },
  {
    src: "/sport/ski-gruppe.jpg",
    caption: "Ski-Gruppe",
    sub: "Vom Einsteiger bis zum Könner",
  },
  {
    src: "/sport/gymnastik-gruppe.jpg",
    caption: "Gymnastik",
    sub: "Seit 1967 in der Waldmeisterschule",
    span: "wide",
  },
  {
    src: "/sport/gymnastik-hero.jpg",
    caption: "Gymnastik in Bewegung",
    sub: "Montag & Mittwoch · 19–20 Uhr",
  },
  {
    src: "/sport/ski-hero.jpg",
    caption: "Auf der Piste",
    sub: "Skifahren mit dem SV Nord",
  },
];

const SOCIAL_LINKS: Array<{
  label: string;
  href: string;
  desc: string;
}> = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/svnordlerchenau/",
    desc: "Ankündigungen, Termine, Vereinsnachrichten.",
  },
  {
    label: "fupa.net",
    href: "https://www.fupa.net/club/sv-nord-muenchen-lerchenau",
    desc: "Live-Spielplan, Tabelle, Spielerstatistiken.",
  },
  {
    label: "BFV-Profil",
    href: "https://www.bfv.de/vereine/sv-nord-muenchen-lerchenau/00ES8GNHD400000DVV0AG08LVUPGND5I",
    desc: "Offizielle Spielpläne aller Mannschaften.",
  },
];

const HIGHLIGHT_TAGS = [
  "#einmalnordlerimmernordler",
  "#svnord",
  "#muenchnernorden",
  "#lerchenau",
  "#bezirksliga",
  "#jugendfussball",
];

function spanClasses(span?: GalleryShot["span"]): string {
  if (span === "wide") return "sm:col-span-2 aspect-[16/9]";
  if (span === "tall") return "row-span-2 aspect-[3/4]";
  return "aspect-square";
}

export function InstagramTeaser() {
  const [consent, setConsent] = useState(false);

  return (
    <section className="border-b border-nord-line bg-nord-paper-2">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <SectionEyebrow number="04" label="Social" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Instagram &amp;{" "}
              <span className="text-nord-gold">Vereinsleben.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-nord-muted md:text-base">
              Vom Heimspiel im Eschengarten bis zum Trainerteam der U8 — alles,
              was uns als Verein bewegt, sammeln wir hier. Folge{" "}
              <Link
                href={IG_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-nord-navy underline-offset-2 hover:underline"
              >
                @{IG_HANDLE}
              </Link>{" "}
              für tägliche Einblicke.
            </p>
          </div>
          <Link
            href={IG_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-nord-line bg-white px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper md:inline-flex"
          >
            Profil öffnen ↗
          </Link>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[1.1fr_1fr]">
          {/* Phone-frame embed column */}
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[36px] bg-gradient-to-tr from-[#fdc468]/30 via-[#e1306c]/25 to-[#5851db]/25 blur-2xl" />
            <div className="mx-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-nord-line bg-white p-3 shadow-[0_22px_50px_-20px_rgba(11,27,63,0.45)]">
              <div className="overflow-hidden rounded-[20px] border border-nord-line bg-nord-paper-2">
                {consent ? (
                  <iframe
                    src={IG_EMBED_URL}
                    title={`Instagram-Beiträge von @${IG_HANDLE}`}
                    loading="lazy"
                    className="block h-[1080px] w-full border-0"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="encrypted-media"
                  />
                ) : (
                  <div className="flex h-[1080px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#fdc468] via-[#e1306c] to-[#5851db] text-white shadow-lg">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="size-8"
                        aria-hidden
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="17.5"
                          cy="6.5"
                          r="1.2"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-black text-nord-ink">
                      Feed von @{IG_HANDLE}
                    </h3>
                    <p className="mt-2 text-sm text-nord-muted">
                      Beim Laden werden Daten an Meta Platforms Ireland Ltd.
                      übertragen (Cookies, IP-Adresse). Erst nach deinem Klick.
                      Details in der{" "}
                      <Link
                        href="/datenschutz"
                        className="font-semibold text-nord-navy underline-offset-2 hover:underline"
                      >
                        Datenschutzerklärung
                      </Link>
                      .
                    </p>
                    <div className="mt-5 flex flex-col items-stretch gap-2 self-stretch">
                      <button
                        type="button"
                        onClick={() => setConsent(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e1306c] to-[#5851db] px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.04em] text-white shadow transition hover:opacity-90"
                      >
                        Feed laden →
                      </button>
                      <Link
                        href={IG_PROFILE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-nord-line bg-white px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-white"
                      >
                        Auf Instagram öffnen ↗
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: stats + tags + related socials */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-nord-line bg-white p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#fdc468] via-[#e1306c] to-[#5851db] text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-6"
                    aria-hidden
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg font-black tracking-tight text-nord-ink">
                    @{IG_HANDLE}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
                    Hauptkanal · SV Nord
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-nord-muted">
                Matchday, Vereinsleben, Jugendarbeit, Aufstieg und Ankündigungen
                — direkt aus dem Eschengarten.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-nord-line pt-5">
                <Stat label="Abteilungen" value="5" sub="aktiv" />
                <Stat label="Teams" value="26" sub="auf den Plätzen" />
                <Stat label="Mitglieder" value="600+" sub="Nordler" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {HIGHLIGHT_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-nord-paper-2 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-nord-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-nord-line bg-nord-ink p-6 text-white md:p-7">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                Mehr vom SV Nord
              </div>
              <h3 className="mt-2 font-display text-xl font-black tracking-tight">
                Folge uns auf allen Kanälen
              </h3>
              <ul className="mt-4 divide-y divide-white/10">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.href} className="py-3 first:pt-0 last:pb-0">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-display text-sm font-black tracking-tight">
                          {s.label}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-white/60">
                          {s.desc}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-gold transition group-hover:translate-x-0.5">
                        Öffnen ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Vereinsleben gallery — local images, no IG API dependency */}
        <div className="mt-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                Galerie
              </div>
              <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                Aus dem Vereinsleben
              </h3>
            </div>
            <Link
              href={IG_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-nord-muted transition hover:text-nord-navy"
            >
              Mehr auf Instagram ↗
            </Link>
          </div>
          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:auto-rows-[200px]">
            {GALLERY.map((shot) => (
              <a
                key={shot.src}
                href={IG_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2 ${spanClasses(shot.span)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.caption}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,63,0)_45%,rgba(11,27,63,0.78)_100%)]" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <div className="font-display text-[15px] font-black leading-tight drop-shadow">
                    {shot.caption}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/75">
                    {shot.sub}
                  </div>
                </div>
                <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/85 text-nord-navy opacity-0 backdrop-blur transition group-hover:opacity-100">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-3.5"
                    aria-hidden
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-nord-paper-2 p-3 text-center">
      <div className="font-display text-2xl font-black leading-none text-nord-navy">
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-nord-muted">
        {label}
      </div>
      <div className="mt-0.5 text-[10px] text-nord-muted/80">{sub}</div>
    </div>
  );
}
