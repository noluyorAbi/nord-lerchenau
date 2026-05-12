import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { TeamCard } from "@/components/TeamCard";
import { BFV_CLUB_URL } from "@/lib/bfv";
import {
  FUSSBALL_CATEGORIES,
  type FussballCategorySlug,
} from "@/lib/fussball-categories";
import { getPayloadClient } from "@/lib/payload";

type Props = { slug: FussballCategorySlug };

export async function CategoryPage({ slug }: Props) {
  const def = FUSSBALL_CATEGORIES[slug];
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "teams",
    where: {
      and: [
        { sport: { equals: "fussball" } },
        { category: { equals: def.category } },
      ],
    },
    sort: "order",
    limit: 100,
    depth: 0,
  });

  const teams = result.docs;
  const bfvCount = teams.filter((t) => t.bfv?.teamId).length;

  return (
    <>
      <PageHero eyebrow={def.eyebrow} title={def.label} lede={def.lede} />
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <section className="mb-10 grid gap-6 rounded-2xl bg-nord-paper-2 p-7 md:grid-cols-[1.4fr_1fr] md:p-9">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              {def.eyebrow}
            </div>
            <p className="text-base leading-relaxed text-nord-ink">
              {def.description}
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
                {bfvCount} {bfvCount === 1 ? "Mannschaft" : "Mannschaften"} ·
                live beim BFV gemeldet
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-nord-line bg-white p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Weitere Kategorien
            </div>
            <ul className="space-y-1.5 text-sm">
              {(
                Object.values(FUSSBALL_CATEGORIES) as ReadonlyArray<
                  (typeof FUSSBALL_CATEGORIES)[FussballCategorySlug]
                >
              )
                .filter((c) => c.slug !== slug)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/fussball/${c.slug}`}
                      className="inline-flex items-center gap-2 font-display font-semibold text-nord-navy transition hover:text-nord-gold"
                    >
                      {c.label} →
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  href="/schiedsrichter"
                  className="inline-flex items-center gap-2 font-display font-semibold text-nord-navy transition hover:text-nord-gold"
                >
                  Schiedsrichter →
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Aktuell keine Mannschaft in dieser Kategorie. Pflege Teams im Admin
            unter <em>Sport → Mannschaften</em>.
          </div>
        ) : (
          <section>
            <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
              <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                Mannschaften
              </h2>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                {teams.length} {teams.length === 1 ? "Team" : "Teams"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Link
            href="/fussball"
            className="font-display text-base text-nord-muted transition hover:text-nord-ink"
          >
            ← Übersicht Fußball
          </Link>
        </div>
      </div>
    </>
  );
}
