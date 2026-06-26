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
    title: "Gymnastik",
    href: "/gymnastik",
    desc: "Seit 1967. Montag und Mittwoch abends, Frauen und Männer willkommen.",
  },
  {
    title: "Volleyball",
    href: "/volleyball",
    desc: "Hobby & Mixed, jeden Freitag 19-20 Uhr in der Waldmeisterschule.",
  },
  {
    title: "eSport",
    href: "/esport",
    desc: "Zwei Mannschaften in der BFV-eLeague. Ab 16 Jahren, wir suchen Nachwuchs.",
  },
  {
    title: "Schiedsrichter",
    href: "/schiedsrichter",
    desc: "Ohne Schiri kein Spiel. Aktive Unparteiische und Nachwuchs beim SV Nord.",
  },
  {
    title: "Ski",
    href: "/ski",
    desc: "Seit über 20 Jahren. Ausgebildete Skilehrer, vom Einsteiger bis zum Könner.",
  },
];

type Lizenz = "B" | "C";
type Sportart = "Fußball" | "Ski Alpin";

const TRAINER_LICENSES: Array<{
  nachname: string;
  vorname: string;
  sportart: Sportart;
  lizenz: Lizenz;
}> = [
  { nachname: "Besel", vorname: "Dominik", sportart: "Fußball", lizenz: "B" },
  { nachname: "Braun", vorname: "Leopold", sportart: "Fußball", lizenz: "C" },
  { nachname: "Eisele", vorname: "Manuel", sportart: "Fußball", lizenz: "B" },
  { nachname: "Eroglu", vorname: "Taylan", sportart: "Fußball", lizenz: "C" },
  { nachname: "Falk", vorname: "Fabian", sportart: "Ski Alpin", lizenz: "B" },
  {
    nachname: "Fessenmayer",
    vorname: "Heinz",
    sportart: "Fußball",
    lizenz: "B",
  },
  { nachname: "Fuchs", vorname: "Andreas", sportart: "Fußball", lizenz: "C" },
  {
    nachname: "Gerstner",
    vorname: "Markus",
    sportart: "Fußball",
    lizenz: "C",
  },
  {
    nachname: "Hafner",
    vorname: "Christoph",
    sportart: "Ski Alpin",
    lizenz: "C",
  },
  {
    nachname: "Hafner",
    vorname: "Korbinian",
    sportart: "Ski Alpin",
    lizenz: "B",
  },
  {
    nachname: "Harag",
    vorname: "Christian",
    sportart: "Fußball",
    lizenz: "B",
  },
  {
    nachname: "Helmreich",
    vorname: "Steffen",
    sportart: "Fußball",
    lizenz: "C",
  },
  { nachname: "Jeremic", vorname: "Zeljko", sportart: "Fußball", lizenz: "C" },
  { nachname: "Kaiser", vorname: "Kevin", sportart: "Fußball", lizenz: "B" },
  {
    nachname: "Kirmeyer",
    vorname: "Felix",
    sportart: "Ski Alpin",
    lizenz: "B",
  },
  {
    nachname: "Kirmeyer",
    vorname: "Felix",
    sportart: "Fußball",
    lizenz: "C",
  },
  {
    nachname: "Kirmeyer",
    vorname: "Ralf",
    sportart: "Ski Alpin",
    lizenz: "B",
  },
  {
    nachname: "Kocademir",
    vorname: "Gökrem",
    sportart: "Fußball",
    lizenz: "C",
  },
  {
    nachname: "Lappe",
    vorname: "Karl-Heinz",
    sportart: "Fußball",
    lizenz: "B",
  },
  { nachname: "Loroff", vorname: "Jürgen", sportart: "Ski Alpin", lizenz: "B" },
  { nachname: "Piker", vorname: "Ergin", sportart: "Fußball", lizenz: "C" },
  { nachname: "Sahin", vorname: "Ilkay", sportart: "Fußball", lizenz: "C" },
  { nachname: "Seidl", vorname: "Luisa", sportart: "Ski Alpin", lizenz: "B" },
  { nachname: "Tiesler", vorname: "Thomas", sportart: "Fußball", lizenz: "C" },
  { nachname: "Tins", vorname: "Tobias", sportart: "Ski Alpin", lizenz: "C" },
  { nachname: "Ucarkus", vorname: "Birol", sportart: "Fußball", lizenz: "C" },
  {
    nachname: "Westermair",
    vorname: "Rudolf",
    sportart: "Fußball",
    lizenz: "B",
  },
  { nachname: "Wurm", vorname: "Thomas", sportart: "Fußball", lizenz: "C" },
];

export default function SportPage() {
  const counts = {
    total: TRAINER_LICENSES.length,
    b: TRAINER_LICENSES.filter((t) => t.lizenz === "B").length,
    c: TRAINER_LICENSES.filter((t) => t.lizenz === "C").length,
    fussball: TRAINER_LICENSES.filter((t) => t.sportart === "Fußball").length,
    ski: TRAINER_LICENSES.filter((t) => t.sportart === "Ski Alpin").length,
  };

  return (
    <>
      <PageHero
        eyebrow="Abteilungen"
        title="Unsere Sportarten"
        lede="Sechs Abteilungen unter einem Dach: Fußball, Gymnastik, Volleyball, eSport, Schiedsrichter und Ski."
      />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 rounded-2xl border border-nord-line bg-nord-paper-2 p-6 md:p-8">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
            Qualifizierte Übungsleiter
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-nord-ink md:text-base">
            Unsere Trainer und Übungsleiter besitzen{" "}
            <strong>Trainerlizenzen der C-Lizenz und höher</strong> und bilden
            sich kontinuierlich weiter, vom Bambini-Training bis zur
            Bezirksliga.
          </p>
          <p className="mt-2">
            <a
              href="#trainerlizenzen"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-navy underline-offset-2 hover:underline"
            >
              Liste ansehen →
            </a>
          </p>
        </div>
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

        <section id="trainerlizenzen" className="mt-16 scroll-mt-28">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-nord-line pb-2">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                Übungsleiter mit Trainerlizenz
              </div>
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                Trainerlizenzen C und B
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-nord-muted">
              <span className="rounded-full bg-nord-paper-2 px-3 py-1 text-nord-ink">
                {counts.total} Übungsleiter
              </span>
              <span className="rounded-full bg-nord-paper-2 px-3 py-1 text-nord-ink">
                B: {counts.b}
              </span>
              <span className="rounded-full bg-nord-paper-2 px-3 py-1 text-nord-ink">
                C: {counts.c}
              </span>
              <span className="rounded-full bg-nord-paper-2 px-3 py-1 text-nord-ink">
                Fußball: {counts.fussball}
              </span>
              <span className="rounded-full bg-nord-paper-2 px-3 py-1 text-nord-ink">
                Ski: {counts.ski}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-nord-line bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-nord-paper-2 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-muted">
                <tr>
                  <th className="w-12 px-4 py-3">Nr.</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Vorname</th>
                  <th className="px-4 py-3">Sportart</th>
                  <th className="px-4 py-3">Lizenz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nord-line/70 text-nord-ink">
                {TRAINER_LICENSES.map((t, i) => (
                  <tr
                    key={`${t.nachname}-${t.vorname}-${t.sportart}`}
                    className="hover:bg-nord-paper-2/60"
                  >
                    <td className="px-4 py-2 font-mono text-[11px] text-nord-muted">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2 font-semibold">{t.nachname}</td>
                    <td className="px-4 py-2">{t.vorname}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${
                          t.sportart === "Fußball"
                            ? "bg-nord-navy/10 text-nord-navy"
                            : "bg-nord-sky/30 text-nord-navy"
                        }`}
                      >
                        {t.sportart}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${
                          t.lizenz === "B"
                            ? "bg-nord-gold/30 text-nord-ink"
                            : "bg-nord-paper-2 text-nord-ink"
                        }`}
                      >
                        {t.lizenz}-Lizenz
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </>
  );
}
