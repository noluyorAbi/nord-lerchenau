import {
  fupaImage,
  fupaTeamUrl,
  getFupaSquad,
  resolveFupaSlug,
  type FupaMeta,
  type FupaSquadCoach,
  type FupaSquadPlayer,
} from "@/lib/fupa";

type Props = {
  fupa: FupaMeta;
  teamName?: string;
};

const POSITION_ORDER = ["Torwart", "Abwehr", "Mittelfeld", "Angriff"] as const;
type Position = (typeof POSITION_ORDER)[number];

const POSITION_LABEL: Record<Position | "Sonstige", string> = {
  Torwart: "Tor",
  Abwehr: "Abwehr",
  Mittelfeld: "Mittelfeld",
  Angriff: "Angriff",
  Sonstige: "Sonstige",
};

export async function FupaSquadPanel({ fupa, teamName }: Props) {
  const slug = resolveFupaSlug(fupa);
  if (!slug) return null;

  const data = await getFupaSquad(slug);
  if (!data) return null;

  const players = data.players.filter((p) => !p.isDeactivated);
  const coaches = data.coaches.filter((c) => !c.isDeactivated);
  const profileUrl = fupaTeamUrl(slug);

  if (players.length === 0 && coaches.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
              Kader · fupa
            </div>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-nord-muted">
              Für diese Mannschaft ist auf fupa noch kein Kader gepflegt.
              Sobald Spieler:innen beim Verein hinterlegt sind, tauchen sie
              hier automatisch auf.
            </p>
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-nord-ink px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-nord-gold hover:text-nord-navy"
          >
            fupa-Profil ↗
          </a>
        </div>
      </section>
    );
  }

  const buckets = groupByPosition(players);

  const captain = data.info?.captain ?? null;
  const vice = data.info?.viceCaptain ?? null;
  const captainIds = new Set<number>();
  if (captain) captainIds.add(captain.id);
  if (vice) captainIds.add(vice.id);

  return (
    <section className="overflow-hidden rounded-2xl border border-nord-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nord-line bg-nord-paper-2 px-5 py-3.5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
            Kader · fupa
          </div>
          <div className="mt-0.5 font-display text-sm font-bold text-nord-ink">
            {players.length} Spieler
            {coaches.length > 0 ? ` · ${coaches.length} Trainer/Betreuer` : ""}
          </div>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-navy transition hover:text-nord-gold"
        >
          Auf fupa ↗
        </a>
      </div>

      {coaches.length > 0 ? (
        <div className="border-b border-nord-line/70 bg-white px-5 py-4">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
            Trainer &amp; Betreuer
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((c) => (
              <li key={c.id}>
                <CoachRow coach={c} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="divide-y divide-nord-line/70">
        {POSITION_ORDER.map((pos) => {
          const roster = buckets[pos];
          if (!roster || roster.length === 0) return null;
          return (
            <PositionGroup
              key={pos}
              label={POSITION_LABEL[pos]}
              players={roster}
              captainIds={captainIds}
              captainId={captain?.id}
              viceId={vice?.id}
            />
          );
        })}
        {buckets.Sonstige && buckets.Sonstige.length > 0 ? (
          <PositionGroup
            label={POSITION_LABEL.Sonstige}
            players={buckets.Sonstige}
            captainIds={captainIds}
            captainId={captain?.id}
            viceId={vice?.id}
          />
        ) : null}
      </div>

      {(captain || vice) && (
        <div className="grid gap-2 border-t border-nord-line bg-nord-paper-2 px-5 py-3 text-[11px] font-mono uppercase tracking-[0.14em] text-nord-muted sm:grid-cols-2">
          {captain ? (
            <span>
              Kapitän ·{" "}
              <span className="text-nord-ink">
                {captain.firstName} {captain.lastName}
              </span>
            </span>
          ) : null}
          {vice ? (
            <span>
              Vize ·{" "}
              <span className="text-nord-ink">
                {vice.firstName} {vice.lastName}
              </span>
            </span>
          ) : null}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-nord-line bg-nord-paper-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
        <span>
          Quelle · fupa.net{teamName ? ` · ${teamName}` : ""}
        </span>
        <span>Cache 30 min</span>
      </div>
    </section>
  );
}

function PositionGroup({
  label,
  players,
  captainIds,
  captainId,
  viceId,
}: {
  label: string;
  players: FupaSquadPlayer[];
  captainIds: Set<number>;
  captainId?: number;
  viceId?: number;
}) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-gold">
          {label}
        </div>
        <div className="font-mono text-[10px] text-nord-muted">
          {players.length}
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <li key={p.id}>
            <PlayerRow
              player={p}
              isCaptain={p.id === captainId}
              isVice={p.id === viceId}
              isMarked={captainIds.has(p.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayerRow({
  player,
  isCaptain,
  isVice,
  isMarked,
}: {
  player: FupaSquadPlayer;
  isCaptain: boolean;
  isVice: boolean;
  isMarked: boolean;
}) {
  const img = fupaImage(player.image, "128x128", "webp");
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-2.5 transition ${
        isMarked
          ? "border-nord-gold/70 bg-[linear-gradient(90deg,rgba(200,169,106,0.08),transparent_75%)]"
          : "border-nord-line/70 bg-white"
      }`}
    >
      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nord-paper-2 ring-1 ring-nord-line">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-[11px] font-black text-nord-muted">
            {initials(player.firstName, player.lastName)}
          </span>
        )}
        {player.jerseyNumber !== null && player.jerseyNumber !== undefined ? (
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-nord-ink font-display text-[10px] font-black text-white ring-2 ring-white">
            {player.jerseyNumber}
          </span>
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-display text-sm font-bold text-nord-ink">
            {player.firstName} {player.lastName}
          </span>
          {isCaptain ? (
            <span className="shrink-0 rounded-sm bg-nord-gold px-1 font-mono text-[9px] font-black text-nord-navy">
              C
            </span>
          ) : isVice ? (
            <span className="shrink-0 rounded-sm bg-nord-navy px-1 font-mono text-[9px] font-black text-white">
              C²
            </span>
          ) : null}
        </span>
        <span className="truncate font-mono text-[10px] tracking-[0.08em] text-nord-muted">
          {[
            player.age !== null ? `${player.age} J.` : null,
            player.matches > 0 ? `${player.matches} Sp` : null,
            player.goals > 0
              ? `${player.goals} ${player.goals === 1 ? "Tor" : "Tore"}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || player.position || "—"}
        </span>
      </span>
    </div>
  );
}

function CoachRow({ coach }: { coach: FupaSquadCoach }) {
  const img = fupaImage(coach.image, "128x128", "webp");
  return (
    <div className="flex items-center gap-3 rounded-lg border border-nord-line/70 bg-white p-2.5">
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nord-paper-2 ring-1 ring-nord-line">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-[11px] font-black text-nord-muted">
            {initials(coach.firstName, coach.lastName)}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-display text-sm font-bold text-nord-ink">
          {coach.firstName} {coach.lastName}
        </span>
        <span className="truncate font-mono text-[10px] tracking-[0.08em] text-nord-gold">
          {coach.role}
          {coach.age !== null ? ` · ${coach.age} J.` : ""}
        </span>
      </span>
    </div>
  );
}

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function groupByPosition(
  players: FupaSquadPlayer[],
): Partial<Record<Position | "Sonstige", FupaSquadPlayer[]>> {
  const out: Partial<Record<Position | "Sonstige", FupaSquadPlayer[]>> = {};
  for (const p of players) {
    const key =
      p.position && POSITION_ORDER.includes(p.position as Position)
        ? (p.position as Position)
        : "Sonstige";
    (out[key] ??= []).push(p);
  }
  const byJersey = (a: FupaSquadPlayer, b: FupaSquadPlayer) =>
    (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999) ||
    a.lastName.localeCompare(b.lastName);
  for (const k of Object.keys(out) as (Position | "Sonstige")[]) {
    out[k]!.sort(byJersey);
  }
  return out;
}
