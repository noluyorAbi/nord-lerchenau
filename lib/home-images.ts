/**
 * Die mitgelieferten Bilder der Startseite.
 *
 * Sie sind der Rueckfall, wenn im CMS (Startseite -> Bilder) nichts gepflegt
 * ist, und zugleich die Vorlage fuer scripts/import-static-images.ts, das
 * genau diese Dateien in die Medien-Sammlung laedt. Beide Seiten lesen
 * dieselbe Liste, damit die Seite und der Import nicht auseinanderlaufen.
 */

export type GalleryShot = {
  src: string;
  caption: string;
  sub: string;
  /** Intrinsic pixel size — lets next/image reserve space and avoid layout shift. */
  w: number;
  h: number;
  span?: "wide" | "tall" | "default";
};

export const FALLBACK_GALLERY: GalleryShot[] = [
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
    sub: "Zweimal pro Woche · abends",
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

/** Bilderlauf im Kopfbereich der Startseite. */
export const FALLBACK_HERO_SLIDES: string[] = [
  "/news/historischer-aufstieg-in-die-landesliga.jpg",
  "/fans/spieltag-garmisch.jpg",
  "/sport/u8/tiger.jpg",
  "/sport/u8/loewen.jpg",
  "/fans/tribuene-garmisch.jpg",
  "/sport/u8/team-5.jpg",
];
