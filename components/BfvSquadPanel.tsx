import { bfvTeamUrl, fetchBfvSquad, type BfvMeta } from "@/lib/bfv";

type Props = {
  bfv: BfvMeta;
};

export async function BfvSquadPanel({ bfv }: Props) {
  if (!bfv?.teamId) return null;
  const squad = await fetchBfvSquad(bfv.teamId);
  if (!squad) return null;

  const profileUrl = bfvTeamUrl(bfv);

  if (!squad.public) {
    return (
      <section className="rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
              Kader · BFV
            </div>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-nord-muted">
              Der Kader dieser Mannschaft ist beim BFV nicht öffentlich
              gelistet. Für die komplette Aufstellung und Statistik schau bitte
              direkt ins Mannschafts­profil beim Bayerischen Fußball-Verband.
            </p>
          </div>
          {profileUrl ? (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-nord-ink px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-nord-gold hover:text-nord-navy"
            >
              BFV-Profil ↗
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  if (squad.players.length === 0) return null;

  // Sort by goals desc, then minutes played desc — top scorers up top.
  const sorted = [...squad.players].sort(
    (a, b) =>
      b.goals - a.goals ||
      b.minutesPlayed - a.minutesPlayed ||
      a.name.localeCompare(b.name),
  );
  const hasAnyStats = sorted.some(
    (p) => p.matchesPlayed > 0 || p.minutesPlayed > 0 || p.goals > 0,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-nord-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-nord-line bg-nord-paper-2 px-5 py-3.5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
            Kader · BFV
          </div>
          <div className="mt-0.5 font-display text-sm font-bold text-nord-ink">
            {sorted.length} Spieler · Saison {squad.season ?? "25/26"}
          </div>
        </div>
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-navy transition hover:text-nord-gold"
          >
            Auf BFV ↗
          </a>
        ) : null}
      </div>

      <ul className="grid divide-y divide-nord-line/70 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
        {sorted.map((p) => (
          <li
            key={p.name}
            className="flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3"
          >
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nord-paper-2 ring-1 ring-nord-line">
              {p.playerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.playerImage}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="font-display text-[11px] font-black text-nord-muted">
                  {p.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-display text-sm font-bold text-nord-ink">
                {p.name}
              </span>
              {hasAnyStats ? (
                <span className="font-mono text-[10px] tracking-[0.08em] text-nord-muted">
                  {p.matchesPlayed} Sp · {p.minutesPlayed} Min
                  {p.goals > 0 ? (
                    <>
                      {" · "}
                      <span className="font-semibold text-nord-gold">
                        {p.goals} {p.goals === 1 ? "Tor" : "Tore"}
                      </span>
                    </>
                  ) : null}
                </span>
              ) : null}
            </span>
            {p.goals > 0 ? (
              <span className="shrink-0 rounded-full bg-nord-gold px-2 py-0.5 font-mono text-[10px] font-bold text-nord-navy">
                {p.goals}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="border-t border-nord-line bg-nord-paper-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
        Quelle · BFV Kaderliste · Saison {squad.season ?? "25/26"}
      </div>
    </section>
  );
}
