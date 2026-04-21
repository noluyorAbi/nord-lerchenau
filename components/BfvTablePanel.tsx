import { bfvTeamUrl, fetchBfvTable, type BfvMeta } from "@/lib/bfv";

type Props = {
  bfv: BfvMeta;
  compact?: boolean;
};

export async function BfvTablePanel({ bfv, compact }: Props) {
  if (!bfv?.teamId) return null;

  const table = await fetchBfvTable(bfv.teamId);
  const profileUrl = bfvTeamUrl(bfv);

  if (!table || table.rows.length === 0) {
    return (
      <section className="rounded-2xl border border-nord-line bg-nord-paper-2 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
            BFV · Tabelle
          </div>
          {profileUrl ? (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-navy transition hover:text-nord-gold"
            >
              Auf BFV ↗
            </a>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-nord-muted">
          Tabelle nicht verfügbar. Schau direkt beim BFV nach — die Daten werden
          dort live geführt.
        </p>
      </section>
    );
  }

  const rowsToShow = compact
    ? pickCompactWindow(table.rows, table.ownRow?.rank ?? 1)
    : table.rows;
  const totalRows = table.rows.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-nord-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-nord-line bg-nord-paper-2 px-5 py-3.5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
            BFV · Tabelle
          </div>
          {bfv.spielklasse ? (
            <div className="mt-0.5 font-display text-sm font-bold text-nord-ink">
              {bfv.spielklasse}
            </div>
          ) : null}
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

      <ul className="divide-y divide-nord-line/70">
        {rowsToShow.map((row) => (
          <li
            key={row.rank}
            className={`grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-[13px] sm:grid-cols-[36px_1fr_36px_36px_36px_44px_52px] sm:px-5 ${
              row.isUs
                ? "bg-[linear-gradient(90deg,rgba(200,169,106,0.14),transparent_60%)]"
                : ""
            }`}
          >
            <span>
              <span
                className={`inline-flex size-6 items-center justify-center rounded font-bold text-[11px] ${
                  row.isUs
                    ? "bg-nord-gold text-nord-navy"
                    : "bg-nord-paper-2 text-nord-ink"
                }`}
              >
                {row.rank}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              {row.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.logoUrl}
                  alt=""
                  className="size-5 shrink-0 object-contain"
                  loading="lazy"
                />
              ) : null}
              <span
                className={`min-w-0 truncate font-display ${
                  row.isUs ? "font-black" : "font-bold"
                } text-nord-ink`}
              >
                {row.clubName}
              </span>
            </span>
            <span className="text-right tabular-nums text-nord-muted sm:hidden">
              {row.played} Sp
            </span>
            <span className="hidden text-right tabular-nums text-nord-muted sm:inline">
              {row.played}
            </span>
            <span className="hidden text-right tabular-nums text-nord-muted sm:inline">
              {row.wins}
            </span>
            <span className="hidden text-right tabular-nums text-nord-muted sm:inline">
              {row.draws}
            </span>
            <span className="hidden text-right tabular-nums text-nord-muted sm:inline">
              {formatGoalDiff(row.goalDifference)}
            </span>
            <span className="text-right font-display font-black text-nord-gold">
              {row.points}
              <span className="ml-1 font-normal text-[10px] text-nord-muted">
                Pkt
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-nord-line bg-nord-paper-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
        <span>
          {compact
            ? `Auszug · ${totalRows} Mannschaften gesamt`
            : `${totalRows} Mannschaften · Vollständig`}
        </span>
        <span>Quelle · BFV · Cache 30 min</span>
      </div>
    </section>
  );
}

function formatGoalDiff(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

function pickCompactWindow<T extends { rank: number }>(
  rows: T[],
  ownRank: number,
): T[] {
  if (rows.length <= 8) return rows;
  // Always show top 3 + 5 around our team.
  const top = rows.slice(0, 3);
  const center = rows.filter(
    (r) => r.rank >= ownRank - 2 && r.rank <= ownRank + 2,
  );
  const merged = [...top, ...center];
  const uniq = Array.from(new Map(merged.map((r) => [r.rank, r])).values());
  return uniq.sort((a, b) => a.rank - b.rank);
}
