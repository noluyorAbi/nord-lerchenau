import { HeaderShell } from "@/components/site/HeaderShell";

const CTA = { label: "Mitglied werden", href: "/mitgliedschaft" };

/**
 * The main menu is not read from the CMS. Desktop and mobile share one tree in
 * `lib/nav-tree.ts`, so an entry cannot sit in two different places depending
 * on the screen. The CMS `navigation` global still drives the footer columns.
 */
export function Header() {
  return <HeaderShell cta={CTA} />;
}
