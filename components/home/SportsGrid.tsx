import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { SectionEyebrow } from "@/components/SectionEyebrow";

type Sport = {
  slug: string;
  name: string;
  href: string;
  caption: string;
  lead: string;
  img: string;
  count: string;
  sub: string;
};

const SPORTS: Sport[] = [
  {
    slug: "fussball",
    name: "Fußball",
    href: "/fussball",
    caption: "13 Mannschaften · Senioren & Jugend",
    lead: "Bezirksliga bis F-Junioren — jedes Wochenende unter Flutlicht am Eschengarten.",
    img: "https://static.wixstatic.com/media/c475b1_3fd6cae312fb48bea46ad4f2b6722bd4~mv2.jpg/v1/fill/w_1200,h_1500,al_c,q_90,enc_avif,quality_auto/c475b1_3fd6cae312fb48bea46ad4f2b6722bd4~mv2.jpg",
    count: "13",
    sub: "Teams",
  },
  {
    slug: "volleyball",
    name: "Volleyball",
    href: "/volleyball",
    caption: "Hobby & Mixed · Waldmeisterhalle",
    lead: "Zwei Trainings pro Woche, Smash-Sessions auf Holz.",
    img: "https://static.wixstatic.com/media/c475b1_88c38b3c414f42d1b208c6bb66849bf9~mv2.jpg/v1/fill/w_1200,h_1500,al_c,q_85,enc_avif,quality_auto/c475b1_88c38b3c414f42d1b208c6bb66849bf9~mv2.jpg",
    count: "2×",
    sub: "Woche",
  },
  {
    slug: "gymnastik",
    name: "Gymnastik",
    href: "/gymnastik",
    caption: "Seit 1967 · Waldmeisterhalle",
    lead: "Beweglichkeit und Kraft, in Generationen weitergegeben.",
    img: "https://static.wixstatic.com/media/c475b1_88c38b3c414f42d1b208c6bb66849bf9~mv2.jpg/v1/fill/w_1200,h_1500,al_c,q_85,enc_avif,quality_auto/c475b1_88c38b3c414f42d1b208c6bb66849bf9~mv2.jpg",
    count: "1967",
    sub: "seit",
  },
  {
    slug: "ski",
    name: "Ski & Snowboard",
    href: "/ski",
    caption: "Tagesfahrten · Kurse auf Anfrage",
    lead: "Vom Sudelfeld bis in die Dolomiten — Skiabteilung on tour.",
    img: "https://static.wixstatic.com/media/c475b1_0f367fff3b8c4479b017bc365d97efd7~mv2.jpg/v1/fill/w_1200,h_1500,al_c,q_90,enc_avif,quality_auto/c475b1_0f367fff3b8c4479b017bc365d97efd7~mv2.jpg",
    count: "∞",
    sub: "Tage",
  },
  {
    slug: "esport",
    name: "Esport",
    href: "/esport",
    caption: "eRegionalliga · FC26",
    lead: "Zwei Teams, ein Controller — seit 2 Jahren virtuell für Nord am Ball.",
    img: "https://static.wixstatic.com/media/c475b1_3fd6cae312fb48bea46ad4f2b6722bd4~mv2.jpg/v1/fill/w_1200,h_1500,al_c,q_90,enc_avif,quality_auto/c475b1_3fd6cae312fb48bea46ad4f2b6722bd4~mv2.jpg",
    count: "2",
    sub: "Teams",
  },
  {
    slug: "schiri",
    name: "Schiedsrichter",
    href: "/schiedsrichter",
    caption: "Ehrenamt · Nachwuchs willkommen",
    lead: "Ohne Schiri kein Spiel — wir stellen die Unparteiischen im Münchner Norden.",
    img: "https://static.wixstatic.com/media/c475b1_1ff71a66773a43b48a4035481abe6042~mv2_d_2048_1535_s_2.jpg/v1/fill/w_1200,h_1500,al_t,q_90,enc_avif,quality_auto/c475b1_1ff71a66773a43b48a4035481abe6042~mv2_d_2048_1535_s_2.jpg",
    count: "12",
    sub: "Pfeifen",
  },
];

export function SportsGrid() {
  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="03" label="Abteilungen" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Sechs Sportarten.
              <br />
              <span className="text-nord-gold">Eine Familie.</span>
            </h2>
          </div>
          <Link
            href="/fussball"
            className="hidden rounded-full border border-nord-line px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper md:inline-flex"
          >
            Alle Abteilungen →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {SPORTS.map((sport, idx) => (
            <FadeUp key={sport.slug} delay={(idx % 3) * 0.07}>
              <Link
                href={sport.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold focus-visible:ring-offset-2"
              >
                <div
                  className="absolute inset-0 scale-[1.02] bg-cover bg-center transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:scale-110"
                  style={{ backgroundImage: `url(${sport.img})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,63,0)_35%,rgba(11,27,63,0.9)_100%)] transition-all duration-500 group-hover:bg-[linear-gradient(180deg,rgba(11,27,63,0.15)_0%,rgba(11,27,63,0.92)_100%)]" />

                <div className="absolute left-[18px] right-[18px] top-[18px] flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-nord-gold bg-black/30 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold backdrop-blur">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="font-display font-black leading-none text-nord-gold [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]"
                    style={{ fontSize: 36 }}
                  >
                    {sport.count}
                    <span className="ml-1.5 text-[12px] text-white opacity-80">
                      {sport.sub}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] md:translate-y-[30%] md:p-6 md:group-hover:translate-y-0">
                  <h3
                    className="m-0 font-display font-black leading-[0.95] tracking-[-0.01em]"
                    style={{ fontSize: "clamp(28px, 6vw, 38px)" }}
                  >
                    {sport.name}
                  </h3>
                  <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] opacity-85">
                    {sport.caption}
                  </div>
                  <p className="m-0 mt-3 max-w-[360px] text-[13px] leading-relaxed opacity-90 md:opacity-0 md:transition-opacity md:duration-400 md:group-hover:opacity-90 md:motion-reduce:opacity-90">
                    {sport.lead}
                  </p>
                  <div className="mt-3 font-display text-[13px] font-extrabold uppercase tracking-[0.08em] text-nord-gold opacity-100 md:opacity-0 md:transition-opacity md:duration-400 md:group-hover:opacity-100 md:motion-reduce:opacity-100">
                    Zur Abteilung →
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
