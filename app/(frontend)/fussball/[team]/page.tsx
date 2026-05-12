import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { BfvMatchesPanel } from "@/components/BfvMatchesPanel";
import { BfvSquadPanel } from "@/components/BfvSquadPanel";
import { BfvTablePanel } from "@/components/BfvTablePanel";
import { FupaSquadPanel } from "@/components/FupaSquadPanel";
import { PageHero } from "@/components/PageHero";
import { PersonCard } from "@/components/PersonCard";
import { ProbetrainingBanner } from "@/components/ProbetrainingBanner";
import { TeamSourceButtons } from "@/components/TeamSourceButtons";
import { bfvClubLogoUrl, bfvTeamImageUrl, bfvTeamUrl } from "@/lib/bfv";
import { resolveFupaSlug } from "@/lib/fupa";
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
          [
            bfv?.partner ??
              (team.ageGroup ? `Altersklasse ${team.ageGroup}` : null),
            team.birthYears ? `Jahrgänge ${team.birthYears}` : null,
            team.season ? `Saison ${team.season}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
      />

      <div className="mx-auto max-w-5xl px-6 py-10 md:px-8 md:py-14">
        {bfv?.teamId ? (
          <div className="mb-10 overflow-hidden rounded-2xl border border-nord-line bg-nord-ink">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              {bfvTeamImage ? (
                <>
                  {/* Blurred fill backdrop keeps the frame saturated while the
                      foreground image is shown uncropped via object-contain. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bfvTeamImage}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-xl"
                    loading="lazy"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bfvTeamImage}
                    alt={`Mannschaftsfoto ${team.name}`}
                    className="relative size-full object-contain"
                    loading="lazy"
                  />
                </>
              ) : (
                <div
                  className="size-full bg-[linear-gradient(135deg,#0b1b3f_0%,#142a64_60%,#6ec7ea_120%)]"
                  aria-hidden
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,14,36,0.1)_0%,rgba(5,14,36,0.85)_100%)]" />
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
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
                      SV Nord · {bfv?.spielklasse ?? team.league ?? "Fußball"}
                    </div>
                    <div
                      className="mt-0.5 font-display font-black leading-[0.95] tracking-[-0.01em]"
                      style={{ fontSize: "clamp(24px, 3.2vw, 40px)" }}
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

        <div className="space-y-10 md:space-y-12">
          {hasDescription ? (
            <div className="prose prose-neutral prose-lg max-w-none">
              <RichText data={team.description as SerializedEditorState} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-nord-line bg-white p-8 text-base text-nord-muted">
              Noch keine Beschreibung. Pflege die Mannschaftsseite im Admin
              unter <em>Teams → {team.name}</em>.
            </div>
          )}

          <ProbetrainingBanner teamName={team.name} />

          {bfvUrl || resolveFupaSlug(team.fupa ?? null) ? (
            <div className="overflow-hidden rounded-2xl bg-nord-ink p-8 text-white md:p-10">
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-nord-gold">
                    Offizieller Spielbetrieb
                  </div>
                  <div
                    className="mt-3 font-display font-extrabold leading-tight"
                    style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
                  >
                    {bfv?.spielklasse ?? team.league ?? team.name}
                  </div>
                  {bfv?.partner ? (
                    <p className="mt-3 text-base leading-relaxed text-white/75">
                      {bfv.partner}
                    </p>
                  ) : null}
                </div>
                <TeamSourceButtons
                  bfv={bfv}
                  fupa={team.fupa ?? null}
                  variant="dark"
                />
              </div>
            </div>
          ) : null}

          {bfv?.teamId ? <BfvMatchesPanel bfv={bfv} /> : null}
          {bfv?.teamId ? <BfvTablePanel bfv={bfv} /> : null}
          {team.fupa && resolveFupaSlug(team.fupa) ? (
            <FupaSquadPanel fupa={team.fupa} teamName={team.name} />
          ) : bfv?.teamId ? (
            <BfvSquadPanel bfv={bfv} />
          ) : null}

          {fixturesResult.docs.length > 0 ? (
            <section className="rounded-2xl border border-nord-line bg-white p-6 md:p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
                Nächste Termine · Verein
              </div>
              <ul className="mt-4 divide-y divide-nord-line/70">
                {fixturesResult.docs.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <div className="font-display text-base font-bold text-nord-ink">
                        {f.isHome ? "vs." : "@"} {f.opponent}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-nord-muted">
                        {formatKickoff(new Date(f.kickoff))}
                        {f.venue ? ` · ${f.venue}` : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {externalLinks.length > 0 ? (
            <section className="rounded-2xl border border-nord-line bg-white p-6 md:p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
                Externe Links
              </div>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {externalLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-nord-line bg-nord-paper-2 px-4 py-2 font-display text-sm font-semibold text-nord-navy transition hover:border-nord-gold hover:bg-white hover:text-nord-navy-2"
                    >
                      {link.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {trainers.length > 0 ? (
            <section>
              <h2 className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                Trainer
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trainers.map((trainer) => (
                  <PersonCard key={trainer.id} person={trainer} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="pt-2">
            <Link
              href="/fussball"
              className="font-display text-base text-nord-muted transition hover:text-nord-ink"
            >
              ← Alle Mannschaften
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
