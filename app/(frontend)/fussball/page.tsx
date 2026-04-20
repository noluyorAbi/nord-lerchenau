import { PageHero } from "@/components/PageHero";
import { TeamCard } from "@/components/TeamCard";
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

  return (
    <>
      <PageHero
        eyebrow="Fußball"
        title="Unsere Mannschaften"
        lede="Fünf Herrenmannschaften, 14 Junioren-Teams, Bambinis und drei Juniorinnen — bei uns kickt jedes Alter."
      />
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
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
