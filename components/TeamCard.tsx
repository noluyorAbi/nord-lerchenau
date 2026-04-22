import Link from "next/link";

import { bfvTeamImageUrl } from "@/lib/bfv";
import type { Team } from "@/payload-types";

type Props = { team: Team };

export function TeamCard({ team }: Props) {
  const hasBfv = Boolean(team.bfv?.teamId);
  const hasFupa = Boolean(
    team.fupa?.slug || team.fupa?.springSlug || team.fupa?.autumnSlug,
  );
  const sublabel =
    team.bfv?.spielklasse ??
    team.league ??
    (team.ageGroup ? `Altersklasse ${team.ageGroup}` : null) ??
    "Mannschaft";

  const teamImage = bfvTeamImageUrl(team.bfv?.teamId);

  return (
    <Link
      href={`/fussball/${team.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-nord-line bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,var(--color-nord-navy)_0%,var(--color-nord-navy-2)_60%,var(--color-nord-sky)_120%)]">
        {teamImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={teamImage}
              alt={`Mannschaftsfoto ${team.name}`}
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,14,36,0.1)_0%,rgba(5,14,36,0.7)_100%)]"
              aria-hidden
            />
          </>
        ) : null}
        {team.ageGroup ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/45 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {team.ageGroup}
          </span>
        ) : null}
        <div className="absolute right-3 top-3 flex gap-1.5">
          {hasBfv ? (
            <span className="rounded-full bg-[#0e4a8a] px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-white ring-1 ring-white/30">
              BFV
            </span>
          ) : null}
          {hasFupa ? (
            <span className="rounded-full bg-[#e8671d] px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-white ring-1 ring-white/30">
              FuPa
            </span>
          ) : null}
        </div>
        {team.bfv?.partner ? (
          <div className="absolute inset-x-3 bottom-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/85">
            SG · {team.bfv.partner.replace(/^Spielgemeinschaft\s*mit\s*/i, "")}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="font-display text-base font-bold tracking-tight text-nord-ink">
          {team.name}
        </div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-nord-muted">
          {sublabel}
        </div>
        {hasBfv ? (
          <div className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-nord-navy transition group-hover:text-nord-gold">
            Tabelle &middot; Spielplan →
          </div>
        ) : null}
      </div>
    </Link>
  );
}
