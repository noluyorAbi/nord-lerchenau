import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";

const SPORTS = [
  {
    name: "Fußball",
    href: "/fussball",
    caption: "Senioren & Jugend",
    color: "bg-nord-navy",
  },
  {
    name: "Volleyball",
    href: "/volleyball",
    caption: "Hobby & Mixed",
    color: "bg-nord-sky",
  },
  {
    name: "Gymnastik",
    href: "/gymnastik",
    caption: "Seit 1967",
    color: "bg-nord-gold",
  },
  { name: "Ski", href: "/ski", caption: "Touren & Camp", color: "bg-nord-navy-2" },
  { name: "Esport", href: "/esport", caption: "Neu", color: "bg-nord-ink" },
  {
    name: "Schiri",
    href: "/schiedsrichter",
    caption: "Ehrenamt",
    color: "bg-nord-muted",
  },
];

export function SportsGrid() {
  return (
    <section className="border-b border-nord-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-nord-ink md:text-4xl">
            Unsere Sportarten
          </h2>
          <Link href="/fussball" className="text-sm text-nord-muted hover:text-nord-ink">
            Alle ansehen →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {SPORTS.map((sport, idx) => (
            <FadeUp key={sport.name} delay={idx * 0.05}>
              <Link
                href={sport.href}
                className="group block rounded-xl border border-nord-line bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-sky focus-visible:ring-offset-2"
              >
                <div className={`size-8 rounded-lg ${sport.color}`} />
                <div className="mt-3 text-sm font-semibold text-nord-ink">
                  {sport.name}
                </div>
                <div className="mt-0.5 text-[11px] text-nord-muted">
                  {sport.caption}
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
