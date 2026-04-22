"use client";

import * as Dialog from "@radix-ui/react-dialog";

import { fupaImage, type FupaPlayerDetail } from "@/lib/fupa";

type Props = {
  player: FupaPlayerDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName?: string;
};

const POSITION_TINT: Record<string, string> = {
  Torwart: "bg-[#b45309] text-white",
  Abwehr: "bg-[#1d4ed8] text-white",
  Mittelfeld: "bg-[#047857] text-white",
  Angriff: "bg-[#b91c1c] text-white",
};

function formatBirthday(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function minutesToReadable(mins: number): string {
  if (mins <= 0) return "0 Min";
  if (mins < 90) return `${mins} Min`;
  const full = Math.floor(mins / 90);
  const rest = mins % 90;
  return rest > 0 ? `${full} Spiele + ${rest} Min` : `${full} volle Spiele`;
}

export function PlayerModal({ player, open, onOpenChange, teamName }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-nord-ink/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 focus:outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-bottom sm:items-center sm:p-6"
        >
          {player ? <PlayerCard player={player} teamName={teamName} /> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PlayerCard({
  player,
  teamName,
}: {
  player: FupaPlayerDetail;
  teamName?: string;
}) {
  const portrait =
    fupaImage(player.image, "480x600", "webp") ??
    fupaImage(player.image, "300x300", "webp");
  const positionClass = player.position
    ? (POSITION_TINT[player.position] ?? "bg-nord-navy text-white")
    : "bg-nord-navy text-white";

  return (
    <div className="relative flex h-full w-full max-w-[640px] flex-col overflow-hidden bg-white shadow-[0_24px_60px_-20px_rgba(11,27,63,0.5)] sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
      <Dialog.Close asChild>
        <button
          type="button"
          aria-label="Schließen"
          className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-nord-ink backdrop-blur transition hover:bg-nord-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M5 5l10 10M15 5l-10 10" />
          </svg>
        </button>
      </Dialog.Close>

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-nord-ink sm:aspect-[16/10]">
        {portrait ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portrait}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-xl"
              loading="eager"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portrait}
              alt={player.fullName}
              className="relative size-full object-contain"
              loading="eager"
            />
          </>
        ) : (
          <div
            className="size-full bg-[linear-gradient(135deg,#0b1b3f_0%,#142a64_60%,#6ec7ea_120%)]"
            aria-hidden
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(5,14,36,0)_0%,rgba(5,14,36,0.85)_100%)] p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {player.position ? (
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${positionClass}`}
              >
                {player.position}
              </span>
            ) : null}
            {player.jerseyNumber !== null && player.jerseyNumber !== undefined ? (
              <span className="rounded-full bg-nord-gold px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-navy">
                Nr. {player.jerseyNumber}
              </span>
            ) : null}
            {player.isCaptain ? (
              <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-navy">
                Kapitän
              </span>
            ) : player.isViceCaptain ? (
              <span className="rounded-full bg-white/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                Vize-Kapitän
              </span>
            ) : null}
          </div>
          <Dialog.Title
            asChild
            className="mt-3 block font-display font-black leading-[0.95] tracking-[-0.02em]"
          >
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
              {player.fullName}
            </h2>
          </Dialog.Title>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
            {[player.age !== null ? `${player.age} Jahre` : null, teamName]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="grid grid-cols-3 gap-3">
          <PrimaryStat value={player.matches} label="Spiele" />
          <PrimaryStat value={player.goals} label={player.goals === 1 ? "Tor" : "Tore"} accent />
          <PrimaryStat value={player.assists} label={player.assists === 1 ? "Vorlage" : "Vorlagen"} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <SecondaryStat label="Minuten" value={minutesToReadable(player.minutesPlayed)} />
          <SecondaryStat label="Elf d. W." value={player.topEleven} />
          <SecondaryStat
            label="Karten"
            value={
              <span className="inline-flex items-center gap-1.5">
                {player.yellowCards > 0 ? (
                  <CardChip color="#facc15" label={String(player.yellowCards)} />
                ) : null}
                {player.yellowRedCards > 0 ? (
                  <CardChip color="#f97316" label={String(player.yellowRedCards)} />
                ) : null}
                {player.redCards > 0 ? (
                  <CardChip color="#dc2626" label={String(player.redCards)} />
                ) : null}
                {player.yellowCards + player.yellowRedCards + player.redCards === 0 ? (
                  <span className="text-nord-muted">keine</span>
                ) : null}
              </span>
            }
          />
          <SecondaryStat
            label="Wechsel"
            value={`↑ ${player.substitutesIn} · ↓ ${player.substitutesOut}`}
          />
          {player.penaltiesTotal > 0 ? (
            <SecondaryStat
              label="Elfmeter"
              value={`${player.penaltiesHit}/${player.penaltiesTotal}`}
            />
          ) : null}
          {formatBirthday(player.birthday) ? (
            <SecondaryStat
              label="Geburtstag"
              value={formatBirthday(player.birthday)!}
            />
          ) : null}
        </dl>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-nord-line pt-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
            Quelle · fupa.net
          </div>
          <a
            href={player.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-nord-gold hover:text-nord-navy"
          >
            Profil auf fupa ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function PrimaryStat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        accent
          ? "border-nord-gold/50 bg-[linear-gradient(135deg,rgba(200,169,106,0.12),transparent)]"
          : "border-nord-line bg-nord-paper-2"
      }`}
    >
      <div
        className={`font-display font-black leading-none ${accent ? "text-nord-gold" : "text-nord-ink"}`}
        style={{ fontSize: "clamp(28px, 5vw, 40px)" }}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
        {label}
      </div>
    </div>
  );
}

function SecondaryStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-display font-bold text-nord-ink">{value}</dd>
    </div>
  );
}

function CardChip({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex h-4 w-3 items-center justify-center rounded-sm text-[9px] font-black text-nord-ink"
      style={{ backgroundColor: color }}
    >
      {label !== "1" ? label : ""}
    </span>
  );
}
