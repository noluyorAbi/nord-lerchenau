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
    { label: "Senioren", teams: result.docs.filter((t) => t.category === "senioren") },
    { label: "Junioren", teams: result.docs.filter((t) => t.category === "junioren") },
    { label: "Bambini", teams: result.docs.filter((t) => t.category === "bambini") },
    { label: "Juniorinnen", teams: result.docs.filter((t) => t.category === "juniorinnen") },
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

        {groups.map((group) =>
          group.teams.length === 0 ? null : (
            <div key={group.label} className="mb-14 last:mb-0">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {group.teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}
