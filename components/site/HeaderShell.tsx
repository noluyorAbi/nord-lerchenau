"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/site/MobileMenu";
import { SiteNav } from "@/components/site/SiteNav";
import { NAV_TREE } from "@/lib/nav-tree";

type CTA = { label: string; href: string };

type Props = {
  cta: CTA;
};

export function HeaderShell({ cta }: Props) {
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
      <div className="mx-auto flex h-[88px] w-full max-w-[1320px] items-center justify-between gap-6 px-6 md:px-7">
        <Logo variant={glass ? "dark" : "light"} />

        <SiteNav items={NAV_TREE} glass={glass} />

        <div className="flex items-center gap-3">
          <Link
            href={cta.href}
            className="hidden items-center gap-2 rounded-full bg-nord-gold px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)] lg:inline-flex"
          >
            {cta.label}
          </Link>
          <MobileMenu
            items={NAV_TREE}
            cta={cta}
            theme={glass ? "dark" : "light"}
          />
        </div>
      </div>
    </header>
  );
}
