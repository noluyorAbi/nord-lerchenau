import Link from "next/link";

import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

const CARDS = [
  {
    title: "Chronik",
    href: "/verein/chronik",
    desc: "Von der Gründung 1947 bis heute — 78 Jahre SV Nord in Zahlen und Geschichten.",
  },
  {
    title: "Vorstand",
    href: "/verein/vorstand",
    desc: "Die Menschen hinter dem Verein: 1. und 2. Vorstand, Kassier, Sportleitung und Jugendleitung.",
  },
  {
    title: "Vereinsheim Eschengarten",
    href: "/verein/vereinsheim",
    desc: "Selbst gebaut, vierzig Jahre alt, Treffpunkt für jeden Spieltag und jedes Fest.",
  },
  {
    title: "Jugendförderverein",
    href: "/verein/jugendfoerderverein",
    desc: "Damit jedes Kind kicken kann — Förderung von Ausrüstung, Ausflügen und Turnieren.",
  },
];

export default function VereinPage() {
  return (
    <>
      <PageHero
        eyebrow="Der Verein"
        title="SV Nord München-Lerchenau e.V."
        lede="Traditionsverein im Münchner Norden seit 1947. 500+ Mitglieder über vier Sportarten, getragen von ehrenamtlichem Engagement."
      />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-4 md:grid-cols-2">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border border-nord-line bg-white p-8 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-2xl font-bold tracking-tight text-nord-ink">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-nord-muted md:text-base">
                {card.desc}
              </p>
              <div className="mt-6 text-sm font-semibold text-nord-navy group-hover:text-nord-navy-2">
                Mehr lesen →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
