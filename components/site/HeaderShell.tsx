"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/site/MobileMenu";

type NavLink = { label: string; href: string };
type CTA = { label: string; href: string };

type Props = {
  links: NavLink[];
  cta: CTA;
};

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

        <nav
          className={`hidden items-center gap-7 font-display text-[15px] font-semibold uppercase tracking-[0.06em] transition-colors duration-300 md:flex ${
            glass ? "text-white/80" : "text-nord-muted"
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 border-transparent pb-1 transition ${
                glass ? "hover:text-white" : "hover:text-nord-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
