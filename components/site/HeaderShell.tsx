"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/site/MobileMenu";
import { SiteNav, type NavItem } from "@/components/site/SiteNav";

type NavLink = { label: string; href: string };
type CTA = { label: string; href: string };

type Props = {
  links: NavLink[];
  cta: CTA;
};

const NAV_TREE: NavItem[] = [
  { label: "Startseite", href: "/" },
  {
    label: "Verein",
    href: "/verein",
    children: [
      { label: "Übersicht", href: "/verein" },
      { label: "Chronik", href: "/verein/chronik" },
      { label: "Vorstand", href: "/verein/vorstand" },
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
            href: "/fussball",
            children: [
              { label: "1. Mannschaft", href: "/fussball/erste" },
              { label: "2. Mannschaft", href: "/fussball/zweite" },
              { label: "3. Mannschaft", href: "/fussball/dritte" },
            ],
          },
          { label: "Damen", href: "/fussball" },
          { label: "Junioren", href: "/fussball" },
          { label: "Juniorinnen", href: "/fussball" },
          { label: "Schiedsrichter", href: "/schiedsrichter" },
        ],
      },
      { label: "Volleyball", href: "/volleyball" },
      { label: "Gymnastik", href: "/gymnastik" },
      { label: "Ski", href: "/ski" },
      { label: "E-Sport", href: "/esport" },
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
  {
    label: "Kontakt",
    href: "/kontakt",
    children: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "Mitgliedschaft", href: "/mitgliedschaft" },
      { label: "Sponsoren", href: "/sponsoren" },
      { label: "Shop", href: "/shop" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export function HeaderShell({ links, cta }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent glass only on the homepage while still on the hero.
  const glass = isHome && !scrolled;

  return (
    <header
      className={`sticky top-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        glass
          ? "border-b border-white/10 bg-white/5 backdrop-blur-xl"
          : "border-b border-nord-line bg-nord-paper/85 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-6 px-6 md:px-7">
        <Logo variant={glass ? "dark" : "light"} />

        <SiteNav items={NAV_TREE} glass={glass} />

        <div className="flex items-center gap-3">
          <Link
            href={cta.href}
            className="hidden items-center gap-2 rounded-full bg-nord-gold px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)] md:inline-flex"
          >
            {cta.label}
          </Link>
          <MobileMenu
            links={links}
            cta={cta}
            theme={glass ? "dark" : "light"}
          />
        </div>
      </div>
    </header>
  );
}
