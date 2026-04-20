import { PageHero } from "@/components/PageHero";
import { PersonCard } from "@/components/PersonCard";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function VorstandPage() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "people",
    where: {
      function: { in: ["vorstand", "sportleitung", "jugendleitung"] },
    },
    sort: "order",
    limit: 50,
    depth: 0,
  });

  const byFunction = {
    vorstand: result.docs.filter((p) => p.function === "vorstand"),
    sportleitung: result.docs.filter((p) => p.function === "sportleitung"),
    jugendleitung: result.docs.filter((p) => p.function === "jugendleitung"),
  };

  const groups = [
    { label: "Vorstandschaft", people: byFunction.vorstand },
    { label: "Sportliche Leitung", people: byFunction.sportleitung },
    { label: "Jugendleitung", people: byFunction.jugendleitung },
  ];

  return (
    <>
      <PageHero
        eyebrow="Vorstand"
        title="Das Team hinter dem Verein"
        lede="Ehrenamtliche Vorstandschaft, sportliche und Jugendleitung — erreichbar für alle Fragen rund um den SV Nord."
      />
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        {groups.map((group) =>
          group.people.length === 0 ? null : (
            <div key={group.label} className="mb-14 last:mb-0">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
                {group.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.people.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}
