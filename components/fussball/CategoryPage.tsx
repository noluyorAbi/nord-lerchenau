import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { TeamCard } from "@/components/TeamCard";
import { BFV_CLUB_URL } from "@/lib/bfv";
import {
  FUSSBALL_CATEGORIES,
  type FussballCategorySlug,
} from "@/lib/fussball-categories";
import { getPayloadClient } from "@/lib/payload";

export type LeadershipGroup = { role: string; names: string[] };

type Props = {
  slug: FussballCategorySlug;
  belowIntro?: React.ReactNode;
  leadership?: LeadershipGroup[];
};

// Hardcoded fallbacks — used when the CMS global "fussball-categories" is empty
// so the page renders byte-identically without any seeded content.
const WEITERE_KATEGORIEN_LABEL = "Weitere Kategorien";
const BFV_BUTTON_LABEL = "BFV-Vereinsprofil ↗";
const BFV_MELDUNG_SUFFIX = "live beim BFV gemeldet";
const SPORTLICHE_LEITUNG_HEADING = "Sportliche Leitung";
const MANNSCHAFTEN_HEADING = "Mannschaften";
const SCHIEDSRICHTER_LABEL = "Schiedsrichter →";
const BACK_LABEL = "← Übersicht Fußball";

export async function CategoryPage({ slug, belowIntro, leadership }: Props) {
  const def = FUSSBALL_CATEGORIES[slug];
  const payload = await getPayloadClient();

  const cms = await payload.findGlobal({ slug: "fussball-categories" });
  const cmsCategories = cms.categories ?? [];
  const cmsCat = cmsCategories.find((c) => c.slug === slug);

  // Per-category editorial copy: prefer CMS, fall back to the hardcoded def.
  const eyebrow = cmsCat?.eyebrow ?? def.eyebrow;
  const title = cmsCat?.label ?? def.label;
  const lede = cmsCat?.lede ?? def.lede;
  const description = cmsCat?.description ?? def.description;

  // Leadership: prefer CMS (shape: names as objects), else the page-level prop.
  const cmsLeadership = cmsCat?.leadership;
  const resolvedLeadership: LeadershipGroup[] | undefined =
    cmsLeadership && cmsLeadership.length > 0
      ? cmsLeadership.map((g) => ({
          role: g.role,
          names: (g.names ?? []).map((n) => n.name),
        }))
      : leadership;

  // Shared chrome labels.
  const weitereKategorienLabel =
    cms.weitereKategorienLabel ?? WEITERE_KATEGORIEN_LABEL;
  const bfvButtonLabel = cms.bfvButtonLabel ?? BFV_BUTTON_LABEL;
  const bfvMeldungSuffix = cms.bfvMeldungSuffix ?? BFV_MELDUNG_SUFFIX;
  const sportlicheLeitungHeading =
    cms.sportlicheLeitungHeading ?? SPORTLICHE_LEITUNG_HEADING;
  const mannschaftenHeading = cms.mannschaftenHeading ?? MANNSCHAFTEN_HEADING;
  const schiedsrichterLabel = cms.schiedsrichterLabel ?? SCHIEDSRICHTER_LABEL;
  const backLabel = cms.backLabel ?? BACK_LABEL;

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
    depth: 1,
  });

  const teams = result.docs;
  const bfvCount = teams.filter((t) => t.bfv?.teamId).length;

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lede={lede} />
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <section className="mb-10 grid gap-6 rounded-2xl bg-nord-paper-2 p-7 md:grid-cols-[1.4fr_1fr] md:p-9">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              {eyebrow}
            </div>
            <p className="text-base leading-relaxed text-nord-ink">
              {description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={BFV_CLUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
              >
                {bfvButtonLabel}
              </a>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                {bfvCount} {bfvCount === 1 ? "Mannschaft" : "Mannschaften"} ·{" "}
                {bfvMeldungSuffix}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-nord-line bg-white p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              {weitereKategorienLabel}
            </div>
            <ul className="space-y-1.5 text-sm">
              {(
                Object.values(FUSSBALL_CATEGORIES) as ReadonlyArray<
                  (typeof FUSSBALL_CATEGORIES)[FussballCategorySlug]
                >
              )
                .filter((c) => c.slug !== slug)
                .map((c) => {
                  const otherLabel =
                    cmsCategories.find((x) => x.slug === c.slug)?.label ??
                    c.label;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/fussball/${c.slug}`}
                        className="inline-flex items-center gap-2 font-display font-semibold text-nord-navy transition hover:text-nord-gold"
                      >
                        {otherLabel} →
                      </Link>
                    </li>
                  );
                })}
              <li>
                <Link
                  href="/schiedsrichter"
                  className="inline-flex items-center gap-2 font-display font-semibold text-nord-navy transition hover:text-nord-gold"
                >
                  {schiedsrichterLabel}
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {resolvedLeadership && resolvedLeadership.length > 0 ? (
          <section className="mb-10">
            <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
              <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                {sportlicheLeitungHeading}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resolvedLeadership.map((g) => (
                <div
                  key={g.role}
                  className="rounded-xl border border-nord-line bg-white p-5"
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-nord-gold">
                    {g.role}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {g.names.map((n) => (
                      <li
                        key={`${g.role}-${n}`}
                        className="font-display text-base font-semibold text-nord-ink"
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {belowIntro ?? null}

        {teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Aktuell keine Mannschaft in dieser Kategorie. Pflege Teams im Admin
            unter <em>Sport → Mannschaften</em>.
          </div>
        ) : (
          <section>
            <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
              <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                {mannschaftenHeading}
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
            {backLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
