import Link from "next/link";

import type { Team } from "@/payload-types";

type Props = { team: Team };

export function TeamCard({ team }: Props) {
  return (
    <Link
      href={`/fussball/${team.slug}`}
      className="group overflow-hidden rounded-xl border border-nord-line bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[16/10] bg-[linear-gradient(135deg,var(--color-nord-navy)_0%,var(--color-nord-navy-2)_60%,var(--color-nord-sky)_120%)]" />
      <div className="px-4 py-4">
        <div className="text-base font-bold tracking-tight text-nord-ink">
          {team.name}
        </div>
        <div className="mt-1 text-[11px] text-nord-muted">
          {team.league ?? (team.ageGroup ? `Altersklasse ${team.ageGroup}` : null) ?? "Mannschaft"}
        </div>
      </div>
    </Link>
  );
}
