import Link from "next/link";

import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

const CARDS = [
  {
    title: "Fußball",
    href: "/fussball",
    desc: "20 Mannschaften vom Bambini bis zur 1. Herren. BFV-Tabellen und Spielpläne live.",
  },
  {
    title: "Volleyball",
    href: "/volleyball",
    desc: "Hobby & Mixed — jeden Freitag 19–21 Uhr in der Waldmeisterschule.",
  },
  {
    title: "Gymnastik",
    href: "/gymnastik",
    desc: "Seit 1967. Montag und Mittwoch abends — Frauen und Männer willkommen.",
  },
  {
    title: "Ski",
    href: "/ski",
    desc: "Seit über 20 Jahren. Ausgebildete Skilehrer, vom Einsteiger bis zum Könner.",
  },
  {
    title: "E-Sport",
    href: "/esport",
    desc: "Zwei Mannschaften in der BFV-eLeague. Ab 16 Jahren — wir suchen Nachwuchs.",
  },
  {
    title: "Schiedsrichter",
    href: "/schiedsrichter",
    desc: "Ohne Schiri kein Spiel. Aktive Unparteiische und Nachwuchs beim SV Nord.",
  },
];

export default function SportPage() {
  return (
    <>
      <PageHero
        eyebrow="Abteilungen"
        title="Unsere Sportarten"
        lede="Sechs Abteilungen unter einem Dach — Fußball, Volleyball, Gymnastik, Ski, E-Sport und Schiedsrichter."
      />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                Mehr erfahren →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
