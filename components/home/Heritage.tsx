import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { SectionEyebrow } from "@/components/SectionEyebrow";

const TIMELINE = [
  {
    year: "1947",
    t: "Gründung",
    d: "Ein Verein im Trümmerstaub. Erste Mannschaft, ein Platz, ein Versprechen.",
  },
  {
    year: "1967",
    t: "Gymnastik-Abteilung",
    d: "Bewegung für Groß und Klein — der erste Schritt in Richtung Breitensport.",
  },
  {
    year: "1986",
    t: "Eschengarten",
    d: "Neuer Platz an der Ebereschenstraße. Flutlicht, Fassbier, Heimspiel.",
  },
  {
    year: "1998",
    t: "Ski & Volleyball",
    d: "Zwei Abteilungen mehr. Der Verein atmet breiter.",
  },
  {
    year: "2017",
    t: "70 Jahre Nord",
    d: "500 Mitglieder. Familie, nicht bloß Verein.",
  },
  {
    year: "2024",
    t: "Esport",
    d: "Virtuell für Nord am Ball — Meister im Debütjahr.",
  },
  {
    year: "2026",
    t: "Heute",
    d: "Platz 3 Bezirksliga. Einmal Nordler, immer Nordler.",
  },
];

export function Heritage() {
  const lastIdx = TIMELINE.length - 1;

  return (
    <section
      className="border-b border-nord-line bg-nord-paper-2"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgb(0 0 0 / 0.02) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgb(0 0 0 / 0.02) 1px, transparent 1px)",
        backgroundSize: "24px 24px, 31px 31px",
      }}
    >
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-24">
        <div className="grid gap-14 md:grid-cols-[1fr_1.4fr]">
          {/* Left column */}
          <div>
            <SectionEyebrow number="04" label="Heritage" />
            <h2
              className="mt-4 font-serif italic font-bold leading-[0.98] tracking-[-0.02em]"
              style={{ fontSize: "clamp(44px, 6vw, 88px)" }}
            >
              Seit <span className="text-nord-gold">1947</span>
              <br />
              zuhause im Norden.
            </h2>
            <p className="mt-6 max-w-[420px] text-base leading-relaxed text-nord-muted">
              79 Jahre Vereinsleben im Münchner Norden. Von der Gründung im
              Trümmerstaub bis zur Bezirksliga — die Chronik eines familiären
              Vereins, der sich nie zu groß gemacht hat.
            </p>
            <div className="mt-7 flex gap-2.5">
              <Link
                href="/verein/chronik"
                className="inline-flex items-center gap-2.5 rounded-full bg-nord-gold px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)]"
              >
                Chronik lesen →
              </Link>
              <Link
                href="/verein/vorstand"
                className="inline-flex items-center gap-2.5 rounded-full border border-nord-line bg-transparent px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper"
              >
                Vorstand
              </Link>
            </div>

            <div className="mt-12 border-y border-nord-line py-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-nord-muted">
                Unser Motto
              </div>
              <div className="mt-2.5 font-serif italic text-[28px] font-bold leading-[1.15] text-balance">
                „Einmal Nordler,
                <br />
                immer Nordler."
              </div>
            </div>
          </div>

          {/* Right — timeline */}
          <div className="relative">
            <div className="absolute bottom-0 left-[60px] top-0 w-px bg-nord-line" />
            {TIMELINE.map((t, i) => {
              const isLast = i === lastIdx;
              return (
                <FadeUp key={t.year} delay={i * 0.04}>
                  <div className="grid grid-cols-[80px_1fr] items-start gap-6 pb-7">
                    <div
                      className={`relative text-right font-display leading-none ${
                        isLast ? "text-nord-gold" : "text-nord-navy"
                      } text-[28px] font-black`}
                    >
                      {t.year}
                      <span
                        className={`absolute right-[-24px] top-2 size-3 rounded-full border-[3px] border-nord-paper-2 ${
                          isLast ? "bg-nord-gold" : "bg-nord-navy"
                        }`}
                      />
                    </div>
                    <div className="pl-3">
                      <div className="font-display text-[22px] font-extrabold tracking-[-0.01em]">
                        {t.t}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-nord-muted text-pretty">
                        {t.d}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
