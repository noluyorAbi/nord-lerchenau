/**
 * Single source of truth for the main menu.
 *
 * Desktop (`SiteNav`) and mobile (`MobileMenu`) both render this tree, so an
 * entry can never sit in one place on a phone and somewhere else in a browser.
 * Before this file existed the desktop menu read a hardcoded tree while the
 * mobile drawer read the flat `navigation.header` list from the CMS, which is
 * why "Fußball" was a top-level item on a phone and buried under
 * "Abteilungen" on a desktop.
 */
export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

const juniorenTeams: NavItem[] = [
  { label: "A1-Junioren · U19", href: "/fussball/a1-junioren" },
  { label: "B1-Junioren · U17", href: "/fussball/b1-junioren" },
  { label: "C1-Junioren · U15", href: "/fussball/c1-junioren" },
  { label: "C2-Junioren · U14", href: "/fussball/c-junioren-u14" },
  { label: "C2-Junioren · U14-2", href: "/fussball/c2-junioren" },
  { label: "D1-Junioren · U13", href: "/fussball/d1-junioren" },
  { label: "E-Junioren · U11", href: "/fussball/e1-junioren" },
  { label: "E-Junioren · U11-2", href: "/fussball/e2-junioren" },
  { label: "E-Junioren · U10", href: "/fussball/E-junioren" },
  { label: "F-Junioren · U9-1", href: "/fussball/f1-junioren" },
  { label: "F-Junioren · U9-2", href: "/fussball/f1-junioren-2" },
  { label: "F-Junioren · U8-1", href: "/fussball/f2-junioren" },
  { label: "F-Junioren · U8-3", href: "/fussball/f3-junioren" },
  { label: "F-Junioren · U8-2", href: "/fussball/f4-junioren" },
  { label: "G-Junioren", href: "/fussball/g-junioren" },
];

const juniorinnenTeams: NavItem[] = [
  { label: "B-Juniorinnen · U17", href: "/fussball/b-juniorinnen" },
  { label: "C-Juniorinnen · U15", href: "/fussball/c-juniorinnen" },
  { label: "D-Juniorinnen · U13", href: "/fussball/d-juniorinnen" },
  { label: "E-Juniorinnen · U11", href: "/fussball/e-juniorinnen-u11" },
];

export const NAV_TREE: NavItem[] = [
  { label: "Startseite", href: "/" },
  {
    label: "Verein",
    href: "/verein",
    children: [
      { label: "Übersicht", href: "/verein" },
      { label: "Chronik", href: "/verein/chronik" },
      { label: "Vorstand", href: "/verein/vorstand" },
      { label: "Spielerpass beantragen", href: "/verein/spielerpass" },
      { label: "Jugendkonzept", href: "/verein/jugendkonzept" },
      { label: "Kinder- & Jugendschutz", href: "/verein/jugendschutz" },
      { label: "Vereinsheim", href: "/verein/vereinsheim" },
      { label: "Jugendförderverein", href: "/verein/jugendfoerderverein" },
    ],
  },
  {
    label: "Abteilungen",
    href: "/sport",
    children: [
      {
        label: "Fußball",
        href: "/fussball",
        children: [
          {
            label: "Herren",
            href: "/fussball/herren",
            children: [
              { label: "Alle Herren-Teams", href: "/fussball/herren" },
              { label: "1. Mannschaft", href: "/fussball/erste" },
              { label: "2. Mannschaft", href: "/fussball/zweite" },
              { label: "3. Mannschaft", href: "/fussball/dritte" },
            ],
          },
          {
            label: "Junioren",
            href: "/fussball/junioren",
            children: [
              { label: "Alle Junioren-Teams", href: "/fussball/junioren" },
              ...juniorenTeams,
            ],
          },
          {
            label: "Juniorinnen",
            href: "/fussball/juniorinnen",
            children: [
              {
                label: "Alle Juniorinnen-Teams",
                href: "/fussball/juniorinnen",
              },
              ...juniorinnenTeams,
            ],
          },
          { label: "Bambinis", href: "/fussball/bambini" },
          { label: "Torwarttraining", href: "/fussball/torwart" },
          { label: "Schiedsrichter", href: "/schiedsrichter" },
        ],
      },
      { label: "Gymnastik", href: "/gymnastik" },
      { label: "Volleyball", href: "/volleyball" },
      { label: "eSport", href: "/esport" },
      { label: "Ski", href: "/ski" },
    ],
  },
  {
    label: "News / Termine",
    href: "/termine",
    children: [
      { label: "News", href: "/news" },
      { label: "Termine", href: "/termine" },
    ],
  },
  { label: "Sponsoren", href: "/sponsoren" },
  { label: "Shop", href: "/shop" },
  {
    label: "Kontakt",
    href: "/kontakt",
    children: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "Mitgliedschaft", href: "/mitgliedschaft" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];
