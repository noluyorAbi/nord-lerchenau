"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SectionEyebrow } from "@/components/SectionEyebrow";

const IG_HANDLE = "svnord_lerchenau";
const IG_PROFILE_URL = `https://www.instagram.com/${IG_HANDLE}/`;

type GalleryShot = {
  src: string;
  caption: string;
  sub: string;
  /** Intrinsic pixel size — lets next/image reserve space and avoid layout shift. */
  w: number;
  h: number;
  span?: "wide" | "tall" | "default";
};

const GALLERY: GalleryShot[] = [
  {
    src: "/fans/spieltag-garmisch.jpg",
    caption: "Spieltag in den Bergen",
    sub: "Auswärtsfahrt der Nordler",
    w: 1600,
    h: 1200,
    span: "wide",
  },
  {
    src: "/fans/tribuene-garmisch.jpg",
    caption: "Volle Tribüne",
    sub: "Mitgereiste Fans des SV Nord",
    w: 1600,
    h: 1200,
  },
  {
    src: "/fans/fans-garmisch.jpg",
    caption: "Mitten unter Nordlern",
    sub: "Einmal Nordler, immer Nordler",
    w: 1600,
    h: 1200,
  },
  {
    src: "/trainingslager/trainingslager-teamabend.jpg",
    caption: "Trainingslager Garmisch",
    sub: "Teamabend in Weiß",
    w: 1600,
    h: 1200,
    span: "wide",
  },
  {
    src: "/trainingslager/trainingslager-feier.jpg",
    caption: "Mannschaftsabend",
    sub: "Trainingslager 2026",
    w: 1600,
    h: 1200,
  },
  {
    src: "/sport/u8/loewen.jpg",
    caption: "U8 Löwen",
    sub: "F-Junioren · U8-I",
    w: 1674,
    h: 1148,
    span: "wide",
  },
  {
    src: "/sport/u8/trainerteam.jpg",
    caption: "Trainerteam U8",
    sub: "Unsere Jugendtrainer",
    w: 900,
    h: 1600,
  },
  {
    src: "/sport/u8/tiger.jpg",
    caption: "U8 Tiger",
    sub: "F-Junioren · U8-II",
    w: 1829,
    h: 1148,
  },
  {
    src: "/sport/u8/team-2.jpg",
    caption: "Trainer U8",
    sub: "Eschengarten",
    w: 900,
    h: 1600,
  },
  {
    src: "/news/historischer-aufstieg-in-die-landesliga.jpg",
    caption: "Historischer Aufstieg",
    sub: "1. Herren · Bezirksliga → Landesliga",
    w: 1600,
    h: 1066,
    span: "tall",
  },
  {
    src: "/sport/u8/team-3.jpg",
    caption: "Trainer U8",
    sub: "Jugendarbeit beim SV Nord",
    w: 900,
    h: 1600,
  },
  {
    src: "/sport/ski-action.jpg",
    caption: "Ski-Abteilung",
    sub: "Tagesfahrten & Camps",
    w: 1600,
    h: 1200,
  },
  {
    src: "/sport/u8/team-4.jpg",
    caption: "Trainer U8",
    sub: "Die jüngsten Nordler",
    w: 900,
    h: 1600,
  },
  {
    src: "/sport/ski-gruppe.jpg",
    caption: "Ski-Gruppe",
    sub: "Vom Einsteiger bis zum Könner",
    w: 800,
    h: 600,
  },
  {
    src: "/sport/gymnastik-gruppe.jpg",
    caption: "Gymnastik",
    sub: "Seit 1967 in der Waldmeisterschule",
    w: 1000,
    h: 666,
    span: "wide",
  },
  {
    src: "/sport/u8/team-5.jpg",
    caption: "Trainer U8",
    sub: "Fußballkindergarten & F-Junioren",
    w: 1600,
    h: 900,
  },
  {
    src: "/news/karger-kommt.jpg",
    caption: "Neuzugang",
    sub: "Karger kommt",
    w: 1600,
    h: 2280,
  },
  {
    src: "/sport/gymnastik-hero.jpg",
    caption: "Gymnastik in Bewegung",
    sub: "Montag & Mittwoch · 19–20 Uhr",
    w: 1600,
    h: 1085,
  },
  {
    src: "/sport/ski-hero.jpg",
    caption: "Auf der Piste",
    sub: "Skifahren mit dem SV Nord",
    w: 1408,
    h: 792,
  },
  {
    src: "/teams/d2-2014.jpg",
    caption: "D-Junioren D2 · 2014",
    sub: "Mannschaftsfoto · Archiv",
    w: 1600,
    h: 1200,
  },
  {
    src: "/jugend-bg.jpg",
    caption: "Jugend am Eschengarten",
    sub: "Von den Bambini bis zur A-Jugend",
    w: 1600,
    h: 1200,
    span: "wide",
  },
];

const IG_HIGHLIGHTS: Array<{ label: string; src: string }> = [
  { label: "U8 Löwen", src: "/sport/u8/loewen.jpg" },
  { label: "U8 Tiger", src: "/sport/u8/tiger.jpg" },
  {
    label: "Aufstieg",
    src: "/news/historischer-aufstieg-in-die-landesliga.jpg",
  },
  { label: "Ski", src: "/sport/ski-action.jpg" },
  { label: "Gymnastik", src: "/sport/gymnastik-gruppe.jpg" },
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

/** In-phone Instagram profile clone — own UI, own photos, no Meta embed. */
function IgScreenClone({ onOpen }: { onOpen: (idx: number) => void }) {
  return (
    <div className="flex h-full flex-col bg-white text-[#0b0b0c]">
      {/* Scroll area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Profile head */}
        <div className="flex items-center gap-6 px-4 pt-5">
          <div className="rounded-full bg-[linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)] p-[2.5px]">
            <div className="rounded-full bg-white p-[2px]">
              <Image
                src="/svnord-logo.png"
                alt="SV Nord Wappen"
                width={74}
                height={74}
                className="size-[74px] rounded-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          {/* Honest CTA instead of fabricated follower counts. */}
          <a
            href={IG_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-[13px] leading-snug"
          >
            <div className="font-bold">Folge uns auf Instagram</div>
            <div className="mt-0.5 text-[#1f3a8a]">@{IG_HANDLE}</div>
            <div className="mt-0.5 text-black/55">
              Tägliche Einblicke aus dem Eschengarten.
            </div>
          </a>
        </div>

        {/* Name + bio */}
        <div className="px-4 pt-3 text-[13px] leading-snug">
          <div className="font-bold">SV Nord München-Lerchenau e.V.</div>
          <div className="text-black/55">Sportverein</div>
          <div className="mt-0.5">
            Der Sportverein im Münchner Norden in den Farben 🔵⚪️
          </div>
          <div className="mt-0.5">⚽️🥊⛷️🏐🎽🎿</div>
          <div className="font-semibold text-[#1f3a8a]">
            #einmalnordlerimmernordler
          </div>
          <a
            href="https://www.svnord-lerchenau.de"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#1f3a8a]"
          >
            www.svnord-lerchenau.de
          </a>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 px-4 pt-3">
          <a
            href={IG_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-[#0095f6] py-1.5 text-center text-[13px] font-semibold text-white"
          >
            Folgen
          </a>
          <a
            href={IG_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-black/[0.06] py-1.5 text-center text-[13px] font-semibold"
          >
            Nachricht
          </a>
          <span className="grid size-8 place-items-center rounded-lg bg-black/[0.06]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M16 11a4 4 0 1 0-4-4M3 21v-2a5 5 0 0 1 5-5h2M19 14v6M22 17h-6" />
            </svg>
          </span>
        </div>

        {/* Highlights */}
        <div className="flex gap-4 overflow-x-auto px-4 py-4">
          {IG_HIGHLIGHTS.map((h) => (
            <div
              key={h.label}
              className="flex w-14 shrink-0 flex-col items-center gap-1"
            >
              <div className="rounded-full border border-black/15 p-[2px]">
                <Image
                  src={h.src}
                  alt={h.label}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="max-w-[56px] truncate text-[10px]">
                {h.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-t border-black/[0.08] text-black/70">
          <div className="flex flex-1 justify-center border-t-2 border-black py-2 text-black">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
          </div>
          <div className="flex flex-1 justify-center py-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="m10 9 5 3-5 3V9Z" />
            </svg>
          </div>
          <div className="flex flex-1 justify-center py-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="M12 3 3 8v8l9 5 9-5V8l-9-5Z" />
              <circle cx="12" cy="11" r="2.5" />
            </svg>
          </div>
        </div>

        {/* Post grid — WhatsApp & club photos */}
        <div className="grid grid-cols-3 gap-[2px] pb-4">
          {GALLERY.map((shot, idx) => (
            <button
              key={shot.src}
              type="button"
              onClick={() => onOpen(idx)}
              className="relative aspect-square overflow-hidden bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0095f6]"
            >
              <Image
                src={shot.src}
                alt={shot.caption}
                fill
                loading="lazy"
                sizes="128px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InstagramTeaser() {
  const [clock, setClock] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    const first = setTimeout(() => setClock(fmt()), 0);
    const id = setInterval(() => setClock(fmt()), 15000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      else if (e.key === "ArrowRight")
        setLightboxIdx((i) => (i === null ? null : (i + 1) % GALLERY.length));
      else if (e.key === "ArrowLeft")
        setLightboxIdx((i) =>
          i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length,
        );
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx]);

  const activeShot = lightboxIdx !== null ? GALLERY[lightboxIdx] : null;

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
          {/* iPhone mockup embed column */}
          <div className="relative flex justify-center">
            <div className="absolute -inset-2 -z-10 rounded-[60px] bg-gradient-to-tr from-[#fdc468]/30 via-[#e1306c]/25 to-[#5851db]/25 blur-3xl" />

            {/* Titanium chassis */}
            <div className="relative w-full max-w-[384px]">
              <div className="relative rounded-[3.4rem] bg-[linear-gradient(145deg,#43444a_0%,#202024_28%,#34353b_52%,#161618_78%,#3a3b41_100%)] p-[3px] shadow-[0_30px_70px_-25px_rgba(11,27,63,0.7),0_8px_24px_-12px_rgba(0,0,0,0.55)]">
                {/* Side buttons — left: action + volume up/down */}
                <span
                  aria-hidden
                  className="absolute -left-[3px] top-[120px] h-9 w-[3px] rounded-l-md bg-[linear-gradient(180deg,#2a2a2e,#0d0d0f)]"
                />
                <span
                  aria-hidden
                  className="absolute -left-[3px] top-[176px] h-14 w-[3px] rounded-l-md bg-[linear-gradient(180deg,#2a2a2e,#0d0d0f)]"
                />
                <span
                  aria-hidden
                  className="absolute -left-[3px] top-[244px] h-14 w-[3px] rounded-l-md bg-[linear-gradient(180deg,#2a2a2e,#0d0d0f)]"
                />
                {/* Right: power button */}
                <span
                  aria-hidden
                  className="absolute -right-[3px] top-[200px] h-20 w-[3px] rounded-r-md bg-[linear-gradient(180deg,#2a2a2e,#0d0d0f)]"
                />

                {/* Inner black bezel */}
                <div className="rounded-[3.2rem] bg-black p-[10px]">
                  {/* Screen */}
                  <div className="relative h-[760px] overflow-hidden rounded-[2.6rem] bg-white md:h-[800px]">
                    {/* Status bar */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between px-7 text-nord-ink">
                      <span className="font-display text-[15px] font-bold tracking-tight tabular-nums">
                        {clock || "—:—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {/* cellular */}
                        <svg
                          width="18"
                          height="12"
                          viewBox="0 0 18 12"
                          fill="currentColor"
                          aria-hidden
                        >
                          <rect x="0" y="8" width="3" height="4" rx="1" />
                          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                          <rect x="10" y="3" width="3" height="9" rx="1" />
                          <rect x="15" y="0" width="3" height="12" rx="1" />
                        </svg>
                        {/* wifi */}
                        <svg
                          width="16"
                          height="12"
                          viewBox="0 0 16 12"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M8 11.5 5.6 9c1.3-1.3 3.5-1.3 4.8 0L8 11.5Zm0-5c-1.9 0-3.7.7-5.1 2.1L1.5 7.2a9.2 9.2 0 0 1 13 0L13.1 8.6A7.2 7.2 0 0 0 8 6.5Zm0-4.5C5 2 2.2 3.2.1 5.3l1.4 1.4A9.2 9.2 0 0 1 8 4a9.2 9.2 0 0 1 6.5 2.7l1.4-1.4A11.7 11.7 0 0 0 8 2Z" />
                        </svg>
                        {/* battery */}
                        <span className="ml-0.5 inline-flex items-center">
                          <span className="relative inline-flex h-[12px] w-[24px] items-center rounded-[3px] border border-nord-ink/40 px-[1.5px]">
                            <span className="h-[7px] w-[17px] rounded-[1px] bg-nord-ink" />
                          </span>
                          <span className="ml-[1px] h-[4px] w-[1.5px] rounded-r bg-nord-ink/40" />
                        </span>
                      </span>
                    </div>

                    {/* Dynamic Island */}
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-2.5 z-30 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_2px_rgba(255,255,255,0.12)]"
                    >
                      <span className="absolute right-[14px] top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-[#1c1c2e] ring-1 ring-white/10" />
                    </div>

                    {/* Screen content — in-phone Instagram clone */}
                    <div className="absolute inset-0 top-12 overflow-hidden">
                      <IgScreenClone onOpen={setLightboxIdx} />
                    </div>

                    {/* Home indicator */}
                    <div
                      aria-hidden
                      className="absolute bottom-2 left-1/2 z-30 h-[5px] w-[130px] -translate-x-1/2 rounded-full bg-nord-ink/30"
                    />
                  </div>
                </div>
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

              <div className="mt-6 border-t border-nord-line pt-5">
                <Link
                  href={IG_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-xl bg-nord-paper-2 px-4 py-3 transition hover:bg-nord-ink hover:text-nord-paper"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-black tracking-tight text-nord-ink transition group-hover:text-nord-paper">
                      Folge uns auf Instagram
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted transition group-hover:text-nord-paper/70">
                      @{IG_HANDLE} · tägliche Einblicke
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-nord-gold transition group-hover:translate-x-0.5">
                    Folgen ↗
                  </span>
                </Link>
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
        <div className="mt-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-nord-line pb-5">
            <div className="flex items-end gap-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                  <span className="size-1.5 rounded-full bg-nord-gold" />
                  Galerie
                </div>
                <h3 className="mt-2 font-display text-3xl font-black leading-none tracking-tight text-nord-ink md:text-4xl">
                  Aus dem Vereinsleben
                </h3>
              </div>
              <span className="mb-1 hidden rounded-full bg-nord-paper-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-muted sm:inline-flex">
                {GALLERY.length} Momente
              </span>
            </div>
            <Link
              href={IG_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fdc468] via-[#e1306c] to-[#5851db] p-[1.5px] font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition hover:shadow-[0_8px_24px_-10px_rgba(225,48,108,0.6)]"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-nord-paper-2 px-4 py-2 text-nord-ink transition group-hover:bg-transparent group-hover:text-white">
                Mehr auf Instagram
                <span className="transition group-hover:translate-x-0.5">
                  ↗
                </span>
              </span>
            </Link>
          </div>
          {/* Masonry: jedes Bild behält sein natürliches Seitenverhältnis */}
          <div className="columns-1 gap-3 [column-fill:_balance] sm:columns-2 md:columns-3 lg:columns-4">
            {GALLERY.map((shot, idx) => (
              <button
                key={shot.src}
                type="button"
                onClick={() => setLightboxIdx(idx)}
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-[20px] bg-nord-navy text-left shadow-sm ring-1 ring-nord-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(11,27,63,0.55)] hover:ring-2 hover:ring-nord-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold"
              >
                <Image
                  src={shot.src}
                  alt={shot.caption}
                  width={shot.w}
                  height={shot.h}
                  loading="lazy"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                  style={{ width: "100%", height: "auto" }}
                  className="block object-cover transition duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 bg-[linear-gradient(180deg,rgba(11,27,63,0)_0%,rgba(8,18,46,0.85)_100%)]" />

                {/* index chip */}
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/25 bg-black/35 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* hover IG pill */}
                <span className="absolute right-3 top-3 flex translate-y-1 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-nord-navy opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-3"
                    aria-hidden
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    />
                    <circle cx="17.5" cy="6.5" r="1.4" fill="currentColor" />
                  </svg>
                  Ansehen
                </span>

                <div className="absolute inset-x-3.5 bottom-3.5 text-white">
                  <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-nord-gold drop-shadow">
                    {shot.sub}
                  </div>
                  <div className="mt-0.5 font-display text-[16px] font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    {shot.caption}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-view lightbox */}
      {activeShot ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeShot.caption}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx(null);
            }}
            aria-label="Schließen"
            className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:right-6 md:top-6"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="size-5"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Vorheriges Bild"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) =>
                i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length,
              );
            }}
            className="absolute left-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:left-6"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="size-6"
              aria-hidden
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Nächstes Bild"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((i) =>
                i === null ? null : (i + 1) % GALLERY.length,
              );
            }}
            className="absolute right-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:right-6"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="size-6"
              aria-hidden
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeShot.src}
              alt={activeShot.caption}
              width={activeShot.w}
              height={activeShot.h}
              sizes="100vw"
              style={{ width: "auto", height: "auto" }}
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="w-full max-w-2xl rounded-2xl bg-white/[0.06] px-5 py-4 text-center backdrop-blur">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                {activeShot.sub}
              </div>
              <div className="mt-1 font-display text-lg font-black text-white md:text-xl">
                {activeShot.caption}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
                {(lightboxIdx ?? 0) + 1} / {GALLERY.length} · Esc zum Schließen
                · ← / → zum Blättern
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
