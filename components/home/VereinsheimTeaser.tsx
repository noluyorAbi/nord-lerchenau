import Link from "next/link";

import { SectionEyebrow } from "@/components/SectionEyebrow";

const VEREINSHEIM_BG =
  "https://static.wixstatic.com/media/c475b1_eb1cfe50a9ff4e729945bc7901d8d2e9~mv2_d_1600_1200_s_2.jpg/v1/crop/x_0,y_42,w_1600,h_1117/fill/w_1600,h_900,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Halle.jpg";

const FACTS = [
  { l: "Adresse", v: "Ebereschenstraße 90", h: "80935 München" },
  { l: "Heimspiel", v: "Sa · 14:30", h: "Bezirksliga" },
  { l: "Kiosk", v: "Ab 12:00", h: "Bis zum Abpfiff" },
];

export function VereinsheimTeaser() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-nord-navy text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
        style={{ backgroundImage: `url(${VEREINSHEIM_BG})` }}
      />
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-7 md:py-24">
        <div>
          <SectionEyebrow
            number="05"
            label="Vereinsheim"
            className="text-white/60"
          />
          <h2
            className="mt-4 font-display font-black leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: "clamp(44px, 6vw, 88px)" }}
          >
            Eschen<span className="text-nord-gold">garten.</span>
            <br />
            Mehr als ein Platz.
          </h2>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-white/75">
            Seit 40 Jahren treffen sich hier Generationen — Kabine, Tribüne und
            Biergarten. Fassbier, Weißwurst und Flutlicht gibt's bei jedem
            Heimspiel.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {FACTS.map((f) => (
              <div
                key={f.l}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {f.l}
                </div>
                <div className="mt-1.5 font-display text-[22px] font-extrabold leading-none">
                  {f.v}
                </div>
                <div className="mt-1 text-[11px] text-white/60">{f.h}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-2.5">
            <Link
              href="/verein/vereinsheim"
              className="inline-flex items-center gap-2.5 rounded-full bg-nord-gold px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)]"
            >
              Vereinsheim entdecken →
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-transparent px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition hover:bg-white hover:text-nord-navy"
            >
              Anfahrt
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/20">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${VEREINSHEIM_BG})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-nord-navy/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">
                Unser Zuhause seit
              </div>
              <div className="font-display text-[72px] font-black leading-none text-nord-gold">
                1984
              </div>
              <div className="mt-1 font-display text-[18px] font-bold">
                Eschenstraße · Lerchenau
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
