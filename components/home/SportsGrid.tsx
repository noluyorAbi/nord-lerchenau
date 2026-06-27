import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  MdDownhillSkiing,
  MdSports,
  MdSportsEsports,
  MdSportsGymnastics,
  MdSportsSoccer,
  MdSportsVolleyball,
} from "react-icons/md";

import { FadeUp } from "@/components/motion/FadeUp";
import { SectionEyebrow } from "@/components/SectionEyebrow";

type ThemeId =
  | "football"
  | "volleyball"
  | "gymnastik"
  | "esport"
  | "schiri"
  | "ski";

type Sport = {
  slug: string;
  name: string;
  href: string;
  kicker: string;
  body: string;
  pills: string[];
  count: string;
  sub: string;
  theme: ThemeId;
};

const SPORTS: Sport[] = [
  {
    slug: "fussball",
    name: "Fußball",
    href: "/fussball",
    kicker: "Vom Bambino zur Landesliga.",
    body: "Seit 1947 zuhause am Eschengarten. 13 Mannschaften von den Allerjüngsten bis zur 1. Herren — jedes Wochenende unter Flutlicht.",
    pills: ["Landesliga", "13 Teams", "Eschengarten"],
    count: "13",
    sub: "Teams",
    theme: "football",
  },
  {
    slug: "gymnastik",
    name: "Gymnastik",
    href: "/gymnastik",
    kicker: "Seit 1967 in Bewegung.",
    body: "Montag und Mittwoch, je 19–20 Uhr in der Waldmeisterschule. Kraft, Mobilität und Gemeinschaft — über drei Generationen weitergegeben.",
    pills: ["Mo + Mi", "Frauen & Männer", "19–20 Uhr"],
    count: "1967",
    sub: "seit",
    theme: "gymnastik",
  },
  {
    slug: "volleyball",
    name: "Volleyball",
    href: "/volleyball",
    kicker: "Smash auf Holz. Seit 1984.",
    body: "Familien-Volleyball mit Spaß-Faktor — zwei Abende pro Woche, Hobby und Mixed. 30 bis 75 Jahre, alle Spielstärken willkommen.",
    pills: ["Hobby & Mixed", "2× Woche", "Waldmeisterhalle"],
    count: "2×",
    sub: "Woche",
    theme: "volleyball",
  },
  {
    slug: "esport",
    name: "eSport",
    href: "/esport",
    kicker: "Meister im Debütjahr.",
    body: "Zwei Mannschaften, ein Controller. eRegionalliga und eLandesliga — FC26 auf der Konsole, SV-Nord-Blau im Trikot. Nachwuchs ab 16 Jahren willkommen.",
    pills: ["eRegionalliga", "FC26", "ab 16 Jahren"],
    count: "2",
    sub: "Teams",
    theme: "esport",
  },
  {
    slug: "schiri",
    name: "Schiedsrichter",
    href: "/schiedsrichter",
    kicker: "Ohne uns kein Spiel.",
    body: "Aktive Unparteiische im BFV-Spielbetrieb — von der Kreisklasse bis zur Bezirksliga. Mehrere Nordler in Schwarz, und wir suchen Verstärkung.",
    pills: ["BFV-Lizenz", "Ehrenamt", "Nachwuchs"],
    count: "Aktiv",
    sub: "im BFV",
    theme: "schiri",
  },
  {
    slug: "ski",
    name: "Ski & Snowboard",
    href: "/ski",
    kicker: "Vom Sudelfeld bis Südtirol.",
    body: "Über 20 Jahre auf der Piste. Skikurse für Einsteiger, Tagesfahrten am Wochenende, Ski-Camp in den Ferien — ausgebildete Lehrer für alle Levels.",
    pills: ["Tagesfahrten", "Skikurse", "Ski-Camp"],
    count: "20+",
    sub: "Jahre",
    theme: "ski",
  },
];

type ThemeDef = {
  bg: string;
  chip: string;
  accent: string;
  iconWrap: string;
  iconClass: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  Decor: () => React.JSX.Element;
};

function FootballDecor() {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full opacity-25"
    >
      <ellipse
        cx="200"
        cy="540"
        rx="280"
        ry="120"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="200"
        cy="540"
        r="70"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="0" y1="420" x2="400" y2="420" stroke="white" strokeWidth="1" />
    </svg>
  );
}

function VolleyballDecor() {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full opacity-30"
    >
      <pattern id="net" width="14" height="14" patternUnits="userSpaceOnUse">
        <path
          d="M0 0L14 14M14 0L0 14"
          stroke="white"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />
      </pattern>
      <rect x="0" y="120" width="400" height="180" fill="url(#net)" />
      <line
        x1="0"
        y1="120"
        x2="400"
        y2="120"
        stroke="white"
        strokeWidth="2.5"
      />
      <line
        x1="0"
        y1="300"
        x2="400"
        y2="300"
        stroke="white"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function GymnastikDecor() {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full opacity-30"
    >
      <path
        d="M -40 200 Q 100 80 260 240 T 460 320"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M -40 280 Q 120 180 300 320 T 460 400"
        stroke="white"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <circle cx="60" cy="100" r="2.5" fill="white" />
      <circle cx="340" cy="160" r="2.5" fill="white" />
      <circle cx="220" cy="60" r="2.5" fill="white" />
    </svg>
  );
}

function EsportDecor() {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full opacity-25"
    >
      <pattern id="pixels" width="22" height="22" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="3" height="3" fill="#ffffff" />
      </pattern>
      <rect x="0" y="0" width="400" height="500" fill="url(#pixels)" />
    </svg>
  );
}

function SchiriDecor() {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full opacity-25"
    >
      <pattern id="warn" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M0 40L40 0M-10 10L10 -10M30 50L50 30"
          stroke="#facc15"
          strokeWidth="6"
        />
      </pattern>
      <rect x="0" y="0" width="400" height="500" fill="url(#warn)" />
    </svg>
  );
}

function SkiDecor() {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full opacity-40"
    >
      <polygon
        points="0,500 110,240 200,360 300,180 400,500"
        fill="#ffffff"
        opacity="0.15"
      />
      <polygon
        points="0,500 80,300 180,400 280,260 400,500"
        fill="#ffffff"
        opacity="0.1"
      />
      <circle cx="60" cy="80" r="2.5" fill="#ffffff" />
      <circle cx="340" cy="50" r="2.5" fill="#ffffff" />
      <circle cx="180" cy="40" r="2.5" fill="#ffffff" />
      <circle cx="280" cy="120" r="2.5" fill="#ffffff" />
      <circle cx="120" cy="160" r="2.5" fill="#ffffff" />
    </svg>
  );
}

const ICON_WRAP =
  "absolute right-[-26px] top-[55%] size-[240px] -translate-y-1/2 transition duration-500 group-hover:translate-x-[-8px]";

const THEMES: Record<ThemeId, ThemeDef> = {
  football: {
    bg: "bg-[linear-gradient(150deg,#0a1730_0%,#0f2a5c_42%,#1f6e3a_100%)]",
    chip: "border-[#a3d977] text-[#dbeb9d]",
    accent: "text-[#e6f5b3]",
    iconWrap: ICON_WRAP,
    iconClass: "size-full text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
    Icon: MdSportsSoccer,
    Decor: FootballDecor,
  },
  volleyball: {
    bg: "bg-[linear-gradient(160deg,#082f4d_0%,#1d6f9e_45%,#5cc7e3_100%)]",
    chip: "border-[#bdf0ff] text-[#e3f8ff]",
    accent: "text-white",
    iconWrap: ICON_WRAP,
    iconClass: "size-full text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
    Icon: MdSportsVolleyball,
    Decor: VolleyballDecor,
  },
  gymnastik: {
    bg: "bg-[linear-gradient(150deg,#3a160a_0%,#a5471a_45%,#f0a14a_100%)]",
    chip: "border-[#ffe3b3] text-[#fff1d6]",
    accent: "text-[#fff1d6]",
    iconWrap: ICON_WRAP,
    iconClass: "size-full text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
    Icon: MdSportsGymnastics,
    Decor: GymnastikDecor,
  },
  esport: {
    bg: "bg-[linear-gradient(135deg,#16092e_0%,#5b21b6_50%,#db2777_100%)]",
    chip: "border-[#ffc6e6] text-[#ffe2f1]",
    accent: "text-white",
    iconWrap: ICON_WRAP,
    iconClass: "size-full text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
    Icon: MdSportsEsports,
    Decor: EsportDecor,
  },
  schiri: {
    bg: "bg-[linear-gradient(135deg,#0a0a0b_0%,#1a1a1d_55%,#3f3f46_100%)]",
    chip: "border-[#facc15] text-[#facc15]",
    accent: "text-[#facc15]",
    iconWrap: ICON_WRAP,
    iconClass:
      "size-full text-[#facc15] drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
    Icon: MdSports,
    Decor: SchiriDecor,
  },
  ski: {
    bg: "bg-[linear-gradient(165deg,#0f2547_0%,#2a5fa8_45%,#a3cbef_100%)]",
    chip: "border-white text-white",
    accent: "text-white",
    iconWrap: ICON_WRAP,
    iconClass: "size-full text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
    Icon: MdDownhillSkiing,
    Decor: SkiDecor,
  },
};

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
          {SPORTS.map((sport, idx) => {
            const theme = THEMES[sport.theme];
            const { Icon, Decor } = theme;
            return (
              <FadeUp key={sport.slug} delay={(idx % 3) * 0.07}>
                <Link
                  href={sport.href}
                  className={`group relative block aspect-[4/5] overflow-hidden rounded-2xl text-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(11,27,63,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold focus-visible:ring-offset-2 ${theme.bg}`}
                >
                  <Decor />

                  <div className="absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

                  <div className={theme.iconWrap} aria-hidden>
                    <Icon className={theme.iconClass} />
                  </div>

                  <div className="absolute left-[18px] right-[18px] top-[18px] flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full border bg-black/35 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur ${theme.chip}`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div
                      className={`font-display font-black leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] ${theme.accent}`}
                      style={{ fontSize: 36 }}
                    >
                      {sport.count}
                      <span className="ml-1.5 text-[12px] text-white/85">
                        {sport.sub}
                      </span>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.1,1)] md:translate-y-[28%] md:p-6 md:group-hover:translate-y-0">
                    <div
                      className={`mb-1.5 font-serif text-[14px] italic leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] md:text-[15px] ${theme.accent}`}
                    >
                      {sport.kicker}
                    </div>
                    <h3
                      className="m-0 font-display font-black leading-[0.95] tracking-[-0.01em] drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]"
                      style={{ fontSize: "clamp(28px, 6vw, 38px)" }}
                    >
                      {sport.name}
                    </h3>
                    <p className="m-0 mt-3 max-w-[380px] text-[13px] leading-relaxed text-white/85 opacity-100 md:opacity-0 md:transition-opacity md:duration-400 md:group-hover:opacity-100 md:motion-reduce:opacity-100">
                      {sport.body}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 opacity-100 md:opacity-0 md:transition-opacity md:duration-400 md:group-hover:opacity-100 md:motion-reduce:opacity-100">
                      {sport.pills.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`mt-3 flex items-center gap-1.5 font-display text-[12px] font-extrabold uppercase tracking-[0.12em] opacity-100 md:opacity-0 md:transition-opacity md:duration-400 md:group-hover:opacity-100 md:motion-reduce:opacity-100 ${theme.accent}`}
                    >
                      Zur Abteilung
                      <span className="transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
