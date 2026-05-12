export type FussballCategorySlug =
  | "herren"
  | "junioren"
  | "juniorinnen"
  | "bambini";

export type FussballCategoryDef = {
  slug: FussballCategorySlug;
  label: string;
  category: "senioren" | "junioren" | "juniorinnen" | "bambini";
  eyebrow: string;
  lede: string;
  description: string;
};

export const FUSSBALL_CATEGORIES: Record<
  FussballCategorySlug,
  FussballCategoryDef
> = {
  herren: {
    slug: "herren",
    label: "Herren",
    category: "senioren",
    eyebrow: "Fußball · Herren",
    lede: "Erste, zweite, dritte Mannschaft sowie die Ehrenliga. Vom Bezirksligateam bis zur Altherrenrunde.",
    description:
      "Alle Herrenmannschaften des SV Nord. Spielbetrieb im BFV, gemeldet in Liga und Pokal.",
  },
  junioren: {
    slug: "junioren",
    label: "Junioren",
    category: "junioren",
    eyebrow: "Fußball · Junioren",
    lede: "Großfeld- und Kleinfeldmannschaften der männlichen Jugend von A bis F.",
    description:
      "Alle Juniorenmannschaften — strukturiert nach Altersklassen, betreut von ehrenamtlichen Trainer:innen.",
  },
  juniorinnen: {
    slug: "juniorinnen",
    label: "Juniorinnen",
    category: "juniorinnen",
    eyebrow: "Fußball · Juniorinnen",
    lede: "Mädchen- und Juniorinnenmannschaften des SV Nord.",
    description:
      "Mannschaften der weiblichen Jugend, Spielbetrieb im BFV und in Spielgemeinschaften.",
  },
  bambini: {
    slug: "bambini",
    label: "Bambinis & Fußballkindergarten",
    category: "bambini",
    eyebrow: "Fußball · Nachwuchs",
    lede: "Die Allerjüngsten — Fußballkindergarten und Bambini-Gruppen.",
    description:
      "Spielerischer Einstieg ins Fußballtraining für die Kleinsten — ohne Leistungsdruck, mit viel Spaß am Ball.",
  },
};
