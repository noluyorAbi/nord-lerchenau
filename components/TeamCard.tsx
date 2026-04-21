import Link from "next/link";

import type { Team } from "@/payload-types";

type Props = { team: Team };

export function TeamCard({ team }: Props) {
  const hasBfv = Boolean(team.bfv?.teamId);
  const sublabel =
    team.bfv?.spielklasse ??
    team.league ??
    (team.ageGroup ? `Altersklasse ${team.ageGroup}` : null) ??
    "Mannschaft";

  return (
    <Link
      href={`/fussball/${team.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-nord-line bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,var(--color-nord-navy)_0%,var(--color-nord-navy-2)_60%,var(--color-nord-sky)_120%)]">
        {team.ageGroup ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {team.ageGroup}
          </span>
        ) : null}
        {hasBfv ? (
          <span className="absolute right-3 top-3 rounded-full bg-nord-gold px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-nord-navy">
            BFV
          </span>
        ) : null}
        {team.bfv?.partner ? (
          <div className="absolute inset-x-3 bottom-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/75">
            SG · {team.bfv.partner.replace(/^Spielgemeinschaft\s*mit\s*/i, "")}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="text-base font-bold tracking-tight text-nord-ink">
          {team.name}
        </div>
        <div className="mt-1 text-[11px] text-nord-muted">{sublabel}</div>
        {hasBfv ? (
          <div className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-nord-navy transition group-hover:text-nord-gold">
            Tabelle &middot; Spielplan →
          </div>
        ) : null}
      </div>
    </Link>
  );
}
