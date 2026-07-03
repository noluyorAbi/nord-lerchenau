import Image from "next/image";

import { FadeUp } from "@/components/motion/FadeUp";

type ProgramItem = {
  time: string;
  title: string;
  note?: string;
  highlight?: boolean;
};

const PROGRAM: ProgramItem[] = [
  {
    time: "08:30",
    title: "Sommerturniere Kleinfeld",
    note: "Jugend",
  },
  {
    time: "12:00",
    title: "SV Nord III – SV Germering II",
    note: "Testspiel",
  },
  {
    time: "15:00",
    title: "SV Nord II – SV Helios Daglfing",
    note: "Testspiel",
  },
  {
    time: "17:30",
    title: "SV Nord – VFB Forstinning",
    note: "Heimspieltag Landesliga",
    highlight: true,
  },
  {
    time: "20:00",
    title: "Barbetrieb im Eschi mit DJ",
    note: "Bar · DJ · Ausklang",
  },
];

// Auto-Ablauf: Das Event endet in der Nacht des 25.07.2026 (Bar/DJ-Ausklang).
// Fünf Tage nach Event-Ende blendet sich die Section vollautomatisch aus.
// Ein geplanter Cloud-Agent entfernt diese Datei danach komplett aus dem Code
// (siehe docs/SOMMERFEST-CLEANUP.md).
const SOMMERFEST_EXPIRES_AT = new Date("2026-07-31T00:00:00+02:00");

export function SommerfestSection() {
  if (new Date() >= SOMMERFEST_EXPIRES_AT) return null;

  return (
    <section className="border-b border-nord-line bg-nord-navy text-nord-paper">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          {/* Poster */}
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
              <Image
                src="/news/sommerfest-2026.png"
                alt="SV Nord Sommerfest 2026 – Samstag, 25. Juli 2026"
                width={1080}
                height={1350}
                priority={false}
                className="h-auto w-full"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
          </FadeUp>

          {/* Content */}
          <div className="lg:pt-4">
            <FadeUp>
              <div className="flex items-center gap-3 font-display text-[13px] font-bold uppercase tracking-[0.14em] text-nord-gold">
                <span className="h-px w-6 bg-current opacity-60" />
                25.07. · Sommerfest 2026
              </div>
              <h2
                className="mt-4 font-display font-black leading-[0.92]"
                style={{ fontSize: "clamp(40px, 5.5vw, 76px)" }}
              >
                Ein Tag,
                <br />
                ein Verein.
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-nord-paper/75 md:text-base">
                Am{" "}
                <strong className="font-semibold text-nord-paper">
                  Samstag, den 25.07.2026
                </strong>{" "}
                steigt auf unserer Anlage das große Sommerfest. Volles
                Tagesprogramm auf dem Platz, Kaffee, Kuchen, Leckereien vom
                Grill und kühle Getränke, danach lassen wir den Abend im Eschi
                mit Bar und DJ ausklingen. Kommt&apos;s zahlreich – wir freuen
                uns auf euch!
              </p>
            </FadeUp>

            {/* Program timeline */}
            <ol className="mt-9 space-y-2.5">
              {PROGRAM.map((item, idx) => (
                <FadeUp key={item.time} delay={0.06 + idx * 0.06}>
                  <li
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors duration-200 ease-out md:gap-5 md:p-5 ${
                      item.highlight
                        ? "border-nord-gold/60 bg-nord-gold/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <span className="min-w-16 shrink-0 font-display text-lg font-black tabular-nums leading-none text-nord-gold md:text-xl">
                      {item.time}
                    </span>
                    <span className="h-9 w-px shrink-0 bg-white/15" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[16px] font-extrabold leading-tight tracking-[-0.01em] md:text-[17px]">
                        {item.title}
                      </span>
                      {item.note ? (
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-nord-paper/55">
                          {item.note}
                        </span>
                      ) : null}
                    </span>
                  </li>
                </FadeUp>
              ))}
            </ol>

            <FadeUp delay={0.5}>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-nord-paper/50">
                Sportanlage SV Nord · Eintritt frei · Für Essen & Getränke ist
                gesorgt
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
