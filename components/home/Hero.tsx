import Link from "next/link";

import { HeroItem, HeroStagger } from "@/components/motion/HeroStagger";
import type { HomePage } from "@/payload-types";

type Props = { hero: HomePage["hero"] };

export function Hero({ hero }: Props) {
  const pretitle = hero?.pretitle ?? "Heimspieltag · Sa 14:30 · Eschengarten";
  const line1 = hero?.headlineLine1 ?? "Einmal Nordler,";
  const line2 = hero?.headlineLine2 ?? "immer Nordler.";
  const subline =
    hero?.subline ??
    "Seit 1947 zuhause im Münchner Norden. 500+ Mitglieder, vier Sportarten, eine Familie.";
  const primary = {
    label: hero?.primaryCtaLabel ?? "Spielplan",
    href: hero?.primaryCtaHref ?? "/fussball",
  };
  const secondary = {
    label: hero?.secondaryCtaLabel ?? "Verein kennenlernen",
    href: hero?.secondaryCtaHref ?? "/verein",
  };

  return (
    <section className="relative overflow-hidden border-b border-nord-line bg-nord-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(96,192,232,0.28)_0%,transparent_55%)]"
      />
      <HeroStagger className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center md:py-32">
        <HeroItem>
          <span className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-3 py-1 text-xs text-nord-muted">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            {pretitle}
          </span>
        </HeroItem>
        <HeroItem>
          <h1 className="text-5xl font-bold leading-[1] tracking-[-0.04em] text-nord-ink md:text-6xl">
            {line1}
            <br />
            <span className="bg-gradient-to-b from-nord-navy-2 to-nord-sky bg-clip-text text-transparent">
              {line2}
            </span>
          </h1>
        </HeroItem>
        <HeroItem>
          <p className="max-w-xl text-base text-nord-muted md:text-lg">
            {subline}
          </p>
        </HeroItem>
        <HeroItem>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={primary.href}
              className="rounded-lg bg-nord-ink px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-sky focus-visible:ring-offset-2"
            >
              {primary.label}
            </Link>
            <Link
              href={secondary.href}
              className="rounded-lg border border-nord-line bg-white px-4 py-2.5 text-sm font-medium text-nord-ink transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-sky focus-visible:ring-offset-2"
            >
              {secondary.label}
            </Link>
          </div>
        </HeroItem>
      </HeroStagger>
    </section>
  );
}
