"use client";

import { useState } from "react";

import { PlayerModal } from "@/components/fupa/PlayerModal";
import {
  fupaImage,
  type FupaPlayerDetail,
  type FupaSquadCoach,
} from "@/lib/fupa";

type Props = {
  players: FupaPlayerDetail[];
  coaches: FupaSquadCoach[];
  captainName?: string | null;
  viceName?: string | null;
  profileUrl: string;
  teamName?: string;
  season?: string | null;
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

export function FupaSquadClient({
  players,
  coaches,
  profileUrl,
  teamName,
  season,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = selectedId !== null ? players.find((p) => p.id === selectedId) ?? null : null;

  const buckets = groupByPosition(players);

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
              onSelect={setSelectedId}
            />
          );
        })}
        {buckets.Sonstige && buckets.Sonstige.length > 0 ? (
          <PositionGroup
            label={POSITION_LABEL.Sonstige}
            players={buckets.Sonstige}
            onSelect={setSelectedId}
          />
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-nord-line bg-nord-paper-2 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
        <span>
          Tippen für Profil · Daten von fupa.net
          {teamName ? ` · ${teamName}` : ""}
        </span>
        <span>{season ? `Saison ${season}` : "Cache 30 min"}</span>
      </div>

      <PlayerModal
        player={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        teamName={teamName}
      />
    </section>
  );
}

function PositionGroup({
  label,
  players,
  onSelect,
}: {
  label: string;
  players: FupaPlayerDetail[];
  onSelect: (id: number) => void;
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
            <PlayerCard player={p} onClick={() => onSelect(p.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayerCard({
  player,
  onClick,
}: {
  player: FupaPlayerDetail;
  onClick: () => void;
}) {
  const img = fupaImage(player.image, "128x128", "webp");
  const marked = player.isCaptain || player.isViceCaptain;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Profil von ${player.fullName} öffnen`}
      className={`group flex w-full items-center gap-4 rounded-xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold ${
        marked
          ? "border-nord-gold/70 bg-[linear-gradient(90deg,rgba(200,169,106,0.08),transparent_75%)] hover:border-nord-gold"
          : "border-nord-line/70 bg-white hover:-translate-y-0.5 hover:border-nord-gold hover:shadow-sm"
      }`}
    >
      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nord-paper-2 ring-1 ring-nord-line">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="size-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-[13px] font-black text-nord-muted">
            {initials(player.firstName, player.lastName)}
          </span>
        )}
        {player.jerseyNumber !== null && player.jerseyNumber !== undefined ? (
          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-nord-ink font-display text-[11px] font-black text-white ring-2 ring-white">
            {player.jerseyNumber}
          </span>
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-display text-base font-bold text-nord-ink">
            {player.fullName}
          </span>
          {player.isCaptain ? (
            <span className="shrink-0 rounded-sm bg-nord-gold px-1.5 py-0.5 font-mono text-[10px] font-black text-nord-navy">
              C
            </span>
          ) : player.isViceCaptain ? (
            <span className="shrink-0 rounded-sm bg-nord-navy px-1.5 py-0.5 font-mono text-[10px] font-black text-white">
              C²
            </span>
          ) : null}
        </span>
        <span className="truncate font-mono text-[12px] tracking-[0.06em] text-nord-muted">
          {[
            player.age !== null ? `${player.age} J.` : null,
            player.matches > 0 ? `${player.matches} Sp` : null,
            player.goals > 0
              ? `${player.goals} ${player.goals === 1 ? "Tor" : "Tore"}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") ||
            player.position ||
            "—"}
        </span>
      </span>
      <span
        className="shrink-0 text-nord-gold opacity-0 transition group-hover:opacity-100"
        aria-hidden
      >
        →
      </span>
    </button>
  );
}

function CoachRow({ coach }: { coach: FupaSquadCoach }) {
  const img = fupaImage(coach.image, "128x128", "webp");
  return (
    <div className="flex items-center gap-4 rounded-xl border border-nord-line/70 bg-white p-3.5">
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-nord-paper-2 ring-1 ring-nord-line">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-[13px] font-black text-nord-muted">
            {initials(coach.firstName, coach.lastName)}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-display text-base font-bold text-nord-ink">
          {coach.firstName} {coach.lastName}
        </span>
        <span className="truncate font-mono text-[12px] tracking-[0.06em] text-nord-gold">
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
  players: FupaPlayerDetail[],
): Partial<Record<Position | "Sonstige", FupaPlayerDetail[]>> {
  const out: Partial<Record<Position | "Sonstige", FupaPlayerDetail[]>> = {};
  for (const p of players) {
    const key =
      p.position && POSITION_ORDER.includes(p.position as Position)
        ? (p.position as Position)
        : "Sonstige";
    (out[key] ??= []).push(p);
  }
  for (const k of Object.keys(out) as (Position | "Sonstige")[]) {
    out[k]!.sort(
      (a, b) =>
        (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999) ||
        a.lastName.localeCompare(b.lastName),
    );
  }
  return out;
}
