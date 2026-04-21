import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { BfvMatchesPanel } from "@/components/BfvMatchesPanel";
import { BfvSquadPanel } from "@/components/BfvSquadPanel";
import { BfvTablePanel } from "@/components/BfvTablePanel";
import { PageHero } from "@/components/PageHero";
import { PersonCard } from "@/components/PersonCard";
import {
  bfvClubLogoUrl,
  bfvTeamImageUrl,
  bfvTeamUrl,
  BFV_CLUB_URL,
} from "@/lib/bfv";
import { formatKickoff } from "@/lib/format-date";
import { getPayloadClient } from "@/lib/payload";
import type { Person } from "@/payload-types";

type Props = { params: Promise<{ team: string }> };

export const dynamic = "force-dynamic";

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

  const bfv = team.bfv ?? null;
  const bfvUrl = bfvTeamUrl(bfv);
  const bfvTeamImage = bfvTeamImageUrl(bfv?.teamId);
  const bfvClubCrest = bfvClubLogoUrl("00ES8GNHD400000DVV0AG08LVUPGND5I");

  return (
    <>
      <PageHero
        eyebrow={team.league ?? bfv?.spielklasse ?? "Fußball"}
        title={team.name}
        lede={
          bfv?.partner
            ? `${bfv.partner}${team.season ? ` · Saison ${team.season}` : ""}`
            : team.ageGroup
              ? `Altersklasse ${team.ageGroup}${team.season ? ` · Saison ${team.season}` : ""}`
              : team.season
                ? `Saison ${team.season}`
                : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        {bfv?.teamId ? (
          <div className="mb-10 overflow-hidden rounded-2xl border border-nord-line bg-nord-ink">
            <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[24/9]">
              {bfvTeamImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bfvTeamImage}
                  alt={`Mannschaftsfoto ${team.name}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="size-full bg-[linear-gradient(135deg,#0b1b3f_0%,#142a64_60%,#6ec7ea_120%)]"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,14,36,0.15)_0%,rgba(5,14,36,0.85)_100%)]" />
              <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4 md:inset-x-8 md:bottom-6">
                <div className="flex items-center gap-4">
                  {bfvClubCrest ? (
                    <span className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-white/30 sm:size-16">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bfvClubCrest}
                        alt=""
                        className="size-full object-contain"
                        loading="lazy"
                      />
                    </span>
                  ) : null}
                  <div className="text-white">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                      SV Nord · {bfv?.spielklasse ?? team.league ?? "Fußball"}
                    </div>
                    <div
                      className="mt-0.5 font-display font-black leading-[0.95] tracking-[-0.01em]"
                      style={{ fontSize: "clamp(22px, 3vw, 36px)" }}
                    >
                      {team.name}
                    </div>
                  </div>
                </div>
                <span className="hidden shrink-0 rounded-full border border-nord-gold bg-nord-gold/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-gold backdrop-blur md:inline-block">
                  Foto · BFV
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
          <div className="space-y-10">
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

            {bfv?.teamId ? <BfvMatchesPanel bfv={bfv} /> : null}
            {bfv?.teamId ? <BfvTablePanel bfv={bfv} /> : null}
            {bfv?.teamId ? <BfvSquadPanel bfv={bfv} /> : null}

            {trainers.length > 0 ? (
              <div>
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
            {bfvUrl ? (
              <div className="overflow-hidden rounded-2xl bg-nord-ink p-6 text-white">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                  BFV · Offizieller Spielbetrieb
                </div>
                <div className="mt-3 font-display text-[22px] font-extrabold leading-tight">
                  {bfv?.spielklasse ?? team.league ?? team.name}
                </div>
                {bfv?.partner ? (
                  <p className="mt-2 text-xs leading-relaxed text-white/70">
                    {bfv.partner}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={bfvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-nord-gold px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)]"
                  >
                    Zum Mannschafts­profil ↗
                  </a>
                  <a
                    href={BFV_CLUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:bg-white hover:text-nord-navy"
                  >
                    Vereinsprofil
                  </a>
                </div>
              </div>
            ) : null}

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

