import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { TeamCard } from "@/components/TeamCard";
import { BFV_CLUB_URL } from "@/lib/bfv";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function FussballPage() {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "teams",
    where: { sport: { equals: "fussball" } },
    sort: "order",
    limit: 100,
    depth: 0,
  });

  const groups = [
    { id: "herren", label: "Herren", teams: result.docs.filter((t) => t.category === "senioren") },
    { id: "junioren", label: "Junioren", teams: result.docs.filter((t) => t.category === "junioren") },
    { id: "juniorinnen", label: "Juniorinnen", teams: result.docs.filter((t) => t.category === "juniorinnen") },
    { id: "bambinis", label: "Bambinis & Fußballkindergarten", teams: result.docs.filter((t) => t.category === "bambini") },
  ];

  const bfvCount = result.docs.filter((t) => t.bfv?.teamId).length;

  return (
    <>
      <PageHero
        eyebrow="Fußball"
        title="Unsere Mannschaften"
        lede="Unsere Fußballabteilung existiert seit 1947. In der Saison 2025/26 stellen wir fünfzehn Jugendmannschaften, fünf Herrenmannschaften und eine Ehrenligamannschaft."
      />
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <section className="mb-12 grid gap-6 rounded-2xl bg-nord-paper-2 p-8 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Herzlich Willkommen bei der Fußball-Abteilung
            </div>
            <p className="text-base leading-relaxed text-nord-ink">
              Unsere Fußballabteilung existiert seit dem Jahre 1947. Wir stellen
              in der Saison 2025/2026 fünfzehn Jugendmannschaften, fünf
              Herrenmannschaften und eine Ehrenligamannschaft. Wir freuen uns
              über alle Fußballbegeisterten von Jung bis Alt.
            </p>
            <p className="mt-3 text-sm italic text-nord-muted">
              Eure SV Nord Fußballer.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={BFV_CLUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
              >
                BFV-Vereinsprofil ↗
              </a>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                {bfvCount} Mannschaften · live beim BFV gemeldet
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-nord-line bg-white p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Sportliche Leitung
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <div className="font-semibold text-nord-ink">
                  Felix Kirmeyer
                </div>
                <div className="text-xs text-nord-muted">
                  Sportlicher Leiter
                </div>
              </li>
              <li>
                <div className="font-semibold text-nord-ink">
                  Tobias Treffer
                </div>
                <div className="text-xs text-nord-muted">
                  Jugendleitung Großfeld
                </div>
              </li>
              <li>
                <div className="font-semibold text-nord-ink">Ergin Piker</div>
                <div className="text-xs text-nord-muted">
                  Jugendleitung Kleinfeld
                </div>
              </li>
            </ul>
          </div>
        </section>

        <nav
          aria-label="Fußball-Kategorien"
          className="sticky top-2 z-20 -mx-2 mb-10 rounded-2xl border border-nord-line bg-white/85 p-3 shadow-sm backdrop-blur md:mx-0"
        >
          <ul className="flex flex-wrap gap-2">
            {groups
              .filter((g) => g.teams.length > 0)
              .map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-ink transition hover:border-nord-navy hover:bg-nord-navy hover:text-white"
                  >
                    {group.label}
                    <span className="rounded-full bg-nord-paper-2 px-1.5 py-0.5 text-[9px] text-nord-muted group-hover:bg-white/20">
                      {group.teams.length}
                    </span>
                  </a>
                </li>
              ))}
            <li>
              <Link
                href="/schiedsrichter"
                className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-ink transition hover:border-nord-navy hover:bg-nord-navy hover:text-white"
              >
                Schiedsrichter ↗
              </Link>
            </li>
            <li>
              <Link
                href="/esport"
                className="inline-flex items-center gap-2 rounded-full border border-nord-line bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-ink transition hover:border-nord-navy hover:bg-nord-navy hover:text-white"
              >
                E-Sport ↗
              </Link>
            </li>
          </ul>
        </nav>

        {groups.map((group) =>
          group.teams.length === 0 ? null : (
            <section
              key={group.id}
              id={group.id}
              className="mb-14 scroll-mt-28 last:mb-0"
            >
              <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
                <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                  {group.label}
                </h2>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  {group.teams.length}{" "}
                  {group.teams.length === 1 ? "Team" : "Teams"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    </>
  );
}
