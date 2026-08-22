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

export const NAV_TREE: NavItem[] = [
  { label: "Startseite", href: "/" },
  {
    label: "Verein",
    href: "/verein",
    children: [
      { label: "Übersicht", href: "/verein" },
      { label: "Chronik", href: "/verein/chronik" },
      { label: "Vorstand", href: "/verein/vorstand" },
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
          { label: "Junioren", href: "/fussball/junioren" },
          { label: "Juniorinnen", href: "/fussball/juniorinnen" },
          { label: "Bambinis", href: "/fussball/bambini" },
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
