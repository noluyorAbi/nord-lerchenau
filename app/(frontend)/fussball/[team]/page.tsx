import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { PersonCard } from "@/components/PersonCard";
import { formatKickoff } from "@/lib/format-date";
import { getPayloadClient } from "@/lib/payload";
import type { Person } from "@/payload-types";

type Props = { params: Promise<{ team: string }> };

export default async function TeamPage({ params }: Props) {
  const { team: teamSlug } = await params;
  const payload = await getPayloadClient();

  const teamResult = await payload.find({
    collection: "teams",
    where: { slug: { equals: teamSlug } },
    limit: 1,
    depth: 2,
  });

  const team = teamResult.docs[0];
  if (!team) notFound();

  const trainers = (team.trainers ?? []).filter(
    (t): t is Person => typeof t === "object" && t !== null,
  );

  const fixturesResult = await payload.find({
    collection: "fixtures",
    where: {
      and: [
        { team: { equals: team.id } },
        { kickoff: { greater_than: new Date().toISOString() } },
      ],
    },
    sort: "kickoff",
    limit: 5,
    depth: 0,
  });

  const hasDescription =
    team.description &&
    typeof team.description === "object" &&
    "root" in team.description;

  const externalLinks = (team.externalLinks ?? []).filter(
    (l): l is { id?: string | null; label: string; url: string } =>
      typeof l?.label === "string" && typeof l?.url === "string",
  );

  return (
    <>
      <PageHero
        eyebrow={team.league ?? "Fußball"}
        title={team.name}
        lede={
          team.ageGroup
            ? `Altersklasse ${team.ageGroup}${team.season ? ` · Saison ${team.season}` : ""}`
            : team.season
              ? `Saison ${team.season}`
              : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
          <div>
            {hasDescription ? (
              <div className="prose prose-neutral max-w-none">
                <RichText data={team.description as SerializedEditorState} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-nord-line bg-white p-8 text-sm text-nord-muted">
                Noch keine Beschreibung. Pflege die Mannschaftsseite im Admin
                unter <em>Teams → {team.name}</em>.
              </div>
            )}

            {trainers.length > 0 ? (
              <div className="mt-12">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
                  Trainer
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {trainers.map((trainer) => (
                    <PersonCard key={trainer.id} person={trainer} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            {fixturesResult.docs.length > 0 ? (
              <div className="rounded-xl border border-nord-line bg-white p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  Nächste Spiele
                </div>
                <ul className="mt-3 space-y-3">
                  {fixturesResult.docs.map((f) => (
                    <li key={f.id}>
                      <div className="text-sm font-semibold text-nord-ink">
                        {f.isHome ? "vs." : "@"} {f.opponent}
                      </div>
                      <div className="mt-0.5 text-[11px] text-nord-muted">
                        {formatKickoff(new Date(f.kickoff))}
                        {f.venue ? ` · ${f.venue}` : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {externalLinks.length > 0 ? (
              <div className="rounded-xl border border-nord-line bg-white p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  Extern
                </div>
                <ul className="mt-3 space-y-2">
                  {externalLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-nord-navy hover:text-nord-navy-2"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <Link
                href="/fussball"
                className="text-sm text-nord-muted hover:text-nord-ink"
              >
                ← Alle Mannschaften
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const payload = await (await import("@/lib/payload")).getPayloadClient();
  const result = await payload.find({
    collection: "teams",
    where: { sport: { equals: "fussball" } },
    limit: 100,
    depth: 0,
  });
  return result.docs.map((t) => ({ team: t.slug }));
}
