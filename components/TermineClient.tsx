"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const SHORT_MONTHS_DE = [
  "JAN",
  "FEB",
  "MÄR",
  "APR",
  "MAI",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DEZ",
];

const WEEKDAYS_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WEEKDAYS_LONG_DE = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

export type MatchDTO = {
  kind: "match";
  at: string;
  id: string;
  teamName: string;
  teamSlug: string | null;
  opponent: string;
  side: "home" | "away";
  competition: string | null;
  homeLogo: string | null;
  awayLogo: string | null;
  href: string;
  venue: string | null;
};

export type EventDTO = {
  kind: "event";
  at: string;
  id: string;
  title: string;
  location: string | null;
  description: string | null;
};

export type AgendaDTO = MatchDTO | EventDTO;

type TypeFilter = "all" | "match" | "event";
type RangeFilter = "all" | "7d" | "30d";

export type ShowcaseEntry = { teamName: string; match: MatchDTO | null };

export function TermineClient({
  items,
  teams,
  showcase,
}: {
  items: AgendaDTO[];
  teams: Array<{ name: string; slug: string; count: number }>;
  showcase: ShowcaseEntry[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");
  const [teamSlug, setTeamSlug] = useState<string>("");
  const [side, setSide] = useState<"all" | "home" | "away">("all");

  const parsed = useMemo(
    () => items.map((it) => ({ ...it, atMs: new Date(it.at).getTime() })),
    [items],
  );

  const filtered = useMemo(() => {
    const now = new Date().getTime();
    const qLower = query.trim().toLowerCase();
    const limit =
      range === "7d"
        ? now + 7 * 86400_000
        : range === "30d"
          ? now + 30 * 86400_000
          : Infinity;

    return parsed.filter((item) => {
      if (type !== "all" && item.kind !== type) return false;
      if (item.atMs > limit) return false;

      if (item.kind === "match") {
        if (teamSlug && item.teamSlug !== teamSlug) return false;
        if (side !== "all" && item.side !== side) return false;
        if (qLower) {
          const hay =
            `${item.teamName} ${item.opponent} ${item.competition ?? ""} ${item.venue ?? ""}`.toLowerCase();
          if (!hay.includes(qLower)) return false;
        }
      } else {
        if (teamSlug) return false;
        if (side !== "all") return false;
        if (qLower) {
          const hay =
            `${item.title} ${item.location ?? ""} ${item.description ?? ""}`.toLowerCase();
          if (!hay.includes(qLower)) return false;
        }
      }
      return true;
    });
  }, [parsed, query, type, range, teamSlug, side]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const byMonth = useMemo(() => {
    const map = new Map<string, { label: string; items: typeof filtered }>();
    for (const item of rest) {
      const at = new Date(item.atMs);
      const key = `${at.getFullYear()}-${at.getMonth()}`;
      const label = `${MONTHS_DE[at.getMonth()]} ${at.getFullYear()}`;
      if (!map.has(key)) map.set(key, { label, items: [] });
      map.get(key)!.items.push(item);
    }
    return [...map.entries()];
  }, [rest]);

  const matchCount = filtered.filter((i) => i.kind === "match").length;
  const eventCount = filtered.filter((i) => i.kind === "event").length;
  const nowMs = new Date().getTime();
  const next7 = filtered.filter((i) => i.atMs < nowMs + 7 * 86400_000).length;

  const hasFilters = Boolean(
    query || type !== "all" || range !== "all" || teamSlug || side !== "all",
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <HerrenShowcase entries={showcase} />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatChip label="Spiele" value={matchCount} tone="navy" />
        <StatChip label="Termine" value={eventCount} tone="gold" />
        <StatChip label="Diese Woche" value={next7} tone="ink" />
      </div>

      <Toolbar
        query={query}
        setQuery={setQuery}
        type={type}
        setType={setType}
        range={range}
        setRange={setRange}
        teamSlug={teamSlug}
        setTeamSlug={setTeamSlug}
        side={side}
        setSide={setSide}
        teams={teams}
        onReset={() => {
          setQuery("");
          setType("all");
          setRange("all");
          setTeamSlug("");
          setSide("all");
        }}
        hasFilters={hasFilters}
        total={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <>
          {featured ? <FeaturedCard item={featured} /> : null}
          {byMonth.map(([key, group]) => (
            <section key={key} className="mt-14">
              <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
                <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                  {group.label}
                </h2>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "Termin" : "Termine"}
                </span>
              </div>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <AgendaRow key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function Toolbar(props: {
  query: string;
  setQuery: (v: string) => void;
  type: TypeFilter;
  setType: (v: TypeFilter) => void;
  range: RangeFilter;
  setRange: (v: RangeFilter) => void;
  teamSlug: string;
  setTeamSlug: (v: string) => void;
  side: "all" | "home" | "away";
  setSide: (v: "all" | "home" | "away") => void;
  teams: Array<{ name: string; slug: string; count: number }>;
  onReset: () => void;
  hasFilters: boolean;
  total: number;
}) {
  return (
    <div className="sticky top-2 z-20 mb-8 rounded-2xl border border-nord-line bg-white/85 p-4 shadow-sm backdrop-blur md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-nord-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={props.query}
            onChange={(e) => props.setQuery(e.target.value)}
            placeholder="Suche nach Team, Gegner, Termin…"
            className="w-full rounded-lg border border-nord-line bg-white py-2.5 pl-10 pr-3 text-sm text-nord-ink placeholder:text-nord-muted focus:border-nord-navy focus:outline-none focus:ring-2 focus:ring-nord-navy/20"
          />
        </div>
        <select
          value={props.teamSlug}
          onChange={(e) => props.setTeamSlug(e.target.value)}
          className="rounded-lg border border-nord-line bg-white px-3 py-2.5 text-sm text-nord-ink focus:border-nord-navy focus:outline-none focus:ring-2 focus:ring-nord-navy/20"
        >
          <option value="">Alle Mannschaften</option>
          {props.teams.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name} ({t.count})
            </option>
          ))}
        </select>
        {props.hasFilters ? (
          <button
            type="button"
            onClick={props.onReset}
            className="shrink-0 rounded-lg border border-nord-line bg-nord-paper-2 px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-ink transition hover:bg-nord-line"
          >
            Zurücksetzen
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterGroup
          options={[
            { value: "all", label: "Alle" },
            { value: "match", label: "Spiele" },
            { value: "event", label: "Termine" },
          ]}
          value={props.type}
          onChange={(v) => props.setType(v as TypeFilter)}
        />
        <FilterGroup
          options={[
            { value: "all", label: "Alle" },
            { value: "7d", label: "7 Tage" },
            { value: "30d", label: "30 Tage" },
          ]}
          value={props.range}
          onChange={(v) => props.setRange(v as RangeFilter)}
        />
        <FilterGroup
          options={[
            { value: "all", label: "Heim + Auswärts" },
            { value: "home", label: "Heim" },
            { value: "away", label: "Auswärts" },
          ]}
          value={props.side}
          onChange={(v) => props.setSide(v as "all" | "home" | "away")}
        />
        <span className="ml-auto self-center font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-nord-muted">
          {props.total} {props.total === 1 ? "Treffer" : "Treffer"}
        </span>
      </div>
    </div>
  );
}

function FilterGroup({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex overflow-hidden rounded-full border border-nord-line bg-white"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              active
                ? "bg-nord-navy text-white"
                : "text-nord-muted hover:bg-nord-paper-2 hover:text-nord-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function HerrenShowcase({ entries }: { entries: ShowcaseEntry[] }) {
  if (entries.length === 0) return null;
  const nowMs = new Date().getTime();
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
          Herrenmannschaften
        </h2>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
          Nächstes Spiel
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {entries.map((entry) => (
          <HerrenCard key={entry.teamName} entry={entry} nowMs={nowMs} />
        ))}
      </div>
    </section>
  );
}

function HerrenCard({ entry, nowMs }: { entry: ShowcaseEntry; nowMs: number }) {
  if (!entry.match) {
    return (
      <div className="rounded-xl border border-dashed border-nord-line bg-white p-5 text-center">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
          {entry.teamName}
        </div>
        <div className="mt-3 text-xs text-nord-muted">
          Kein geplantes Spiel.
        </div>
      </div>
    );
  }

  const m = entry.match;
  const at = new Date(m.at);
  const countdown = formatCountdown(at.getTime(), nowMs);
  const day = at.getDate().toString().padStart(2, "0");
  const month = SHORT_MONTHS_DE[at.getMonth()];
  const time = at.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <Link
      href={m.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl border border-nord-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-nord-navy hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-nord-navy">
          {entry.teamName}
        </div>
        <span className="rounded-full bg-nord-navy/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-nord-navy">
          {countdown}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center -space-x-2">
          <Crest
            src={m.homeLogo}
            ring={m.side === "home" ? "ring-nord-gold" : "ring-nord-line"}
          />
          <Crest
            src={m.awayLogo}
            ring={m.side === "away" ? "ring-nord-gold" : "ring-nord-line"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-bold leading-tight tracking-tight text-nord-ink">
            {m.side === "home" ? "SV Nord" : m.opponent}
          </div>
          <div className="mt-0.5 text-[11px] text-nord-muted">vs</div>
          <div className="truncate font-display text-base font-bold leading-tight tracking-tight text-nord-ink">
            {m.side === "home" ? m.opponent : "SV Nord"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-nord-line pt-3 text-[11px]">
        <div className="font-mono font-semibold uppercase tracking-[0.12em] text-nord-ink">
          {day} {month} · {time}
        </div>
        <div
          className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] ${
            m.side === "home"
              ? "bg-nord-sky/20 text-nord-navy"
              : "bg-nord-paper-2 text-nord-muted"
          }`}
        >
          {m.side === "home" ? "Heim" : "Auswärts"}
        </div>
      </div>
      {m.competition ? (
        <div className="mt-2 truncate text-[10px] text-nord-muted">
          {m.competition}
        </div>
      ) : null}
    </Link>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
      {hasFilters ? (
        <>
          Keine Treffer für die gewählten Filter. Probier einen anderen Zeitraum
          oder eine andere Mannschaft.
        </>
      ) : (
        <>
          Aktuell sind keine kommenden Termine hinterlegt. BFV-Spiele erscheinen
          automatisch, sobald der Spielplan steht · zusätzliche Vereinstermine
          (Turniere, Sommerfest, Weihnachtsfeier) pflegt der Vorstand im Admin
          unter <em>Content → Events</em>.
        </>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "navy" | "gold" | "ink";
}) {
  const styles =
    tone === "navy"
      ? "bg-nord-navy text-white"
      : tone === "gold"
        ? "bg-nord-gold text-nord-ink"
        : "bg-white border border-nord-line text-nord-ink";
  return (
    <div className={`rounded-xl p-4 ${styles}`}>
      <div className="font-display text-3xl font-black leading-none md:text-4xl">
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] opacity-80">
        {label}
      </div>
    </div>
  );
}

function formatCountdown(atMs: number, nowMs: number): string {
  const diff = atMs - nowMs;
  if (diff < 0) return "jetzt";
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days >= 2) return `in ${days} Tagen`;
  if (days === 1) return `morgen`;
  if (hours >= 2) return `in ${hours} Std`;
  if (hours === 1) return `in 1 Std`;
  const minutes = Math.floor(diff / 60_000);
  return `in ${Math.max(1, minutes)} Min`;
}

function FeaturedCard({ item }: { item: AgendaDTO & { atMs: number } }) {
  const at = new Date(item.atMs);
  const countdown = formatCountdown(item.atMs, new Date().getTime());
  const weekday = WEEKDAYS_LONG_DE[at.getDay()];
  const dateLine = `${weekday}, ${at.getDate()}. ${MONTHS_DE[at.getMonth()]}`;
  const time = at.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (item.kind === "match") {
    return (
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-2xl bg-nord-navy p-8 text-white shadow-[0_30px_60px_-20px_rgba(11,27,63,0.5)] transition hover:-translate-y-0.5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(110,199,234,0.35)_0%,transparent_60%)]"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-gold">
            <span className="rounded-full bg-nord-gold/20 px-2 py-1 text-nord-gold">
              Nächstes Spiel
            </span>
            <span className="text-white/60">·</span>
            <span>{countdown}</span>
            {item.competition ? (
              <>
                <span className="text-white/60">·</span>
                <span className="text-white/80">{item.competition}</span>
              </>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            <TeamBlock
              name={item.side === "home" ? "SV Nord" : item.opponent}
              logo={item.homeLogo}
              align="left"
              isUs={item.side === "home"}
            />
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-4xl font-black leading-none text-white/40 md:text-5xl">
                vs
              </span>
              <span className="font-display text-4xl font-black tracking-tight text-white md:text-5xl">
                {time}
              </span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                {dateLine}
              </span>
            </div>
            <TeamBlock
              name={item.side === "away" ? "SV Nord" : item.opponent}
              logo={item.awayLogo}
              align="right"
              isUs={item.side === "away"}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/70">
            <div className="font-mono uppercase tracking-[0.12em]">
              {item.teamName}
              {item.venue ? ` · ${item.venue}` : ""}
            </div>
            <div className="font-mono uppercase tracking-[0.12em] opacity-70 group-hover:text-nord-gold">
              Details auf bfv.de →
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-nord-gold/40 bg-gradient-to-br from-nord-gold via-[#f0c44c] to-[#e6b035] p-8 text-nord-ink shadow-[0_30px_60px_-20px_rgba(201,160,46,0.4)]">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-navy">
        <span className="rounded-full bg-nord-navy px-2 py-1 text-white">
          Nächster Termin
        </span>
        <span>·</span>
        <span>{countdown}</span>
      </div>
      <h3 className="mt-5 font-display text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
        {item.title}
      </h3>
      <div className="mt-3 font-display text-lg font-semibold">
        {dateLine} · {time} Uhr
        {item.location ? ` · ${item.location}` : null}
      </div>
      {item.description ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-nord-ink/80">
          {item.description}
        </p>
      ) : null}
    </div>
  );
}

function TeamBlock({
  name,
  logo,
  align,
  isUs,
}: {
  name: string;
  logo: string | null;
  align: "left" | "right";
  isUs: boolean;
}) {
  const alignment =
    align === "left"
      ? "md:items-start md:text-left"
      : "md:items-end md:text-right";
  return (
    <div className={`flex flex-col items-center gap-4 ${alignment}`}>
      <div
        className={`flex size-20 items-center justify-center overflow-hidden rounded-full p-2 ring-2 md:size-24 ${
          logo ? "bg-white" : "bg-white/10"
        } ${isUs ? "ring-nord-gold" : "ring-white/20"}`}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            className="size-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-lg font-black text-white">
            {name
              .split(/\s+/)
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
        )}
      </div>
      <div
        className={`font-display text-lg font-black leading-tight tracking-tight md:text-xl ${
          isUs ? "text-nord-gold" : "text-white"
        }`}
      >
        {name}
      </div>
    </div>
  );
}

function AgendaRow({ item }: { item: AgendaDTO & { atMs: number } }) {
  const at = new Date(item.atMs);
  const day = at.getDate().toString().padStart(2, "0");
  const month = SHORT_MONTHS_DE[at.getMonth()];
  const weekday = WEEKDAYS_DE[at.getDay()];
  const time = at.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (item.kind === "match") {
    return (
      <li>
        <Link
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-stretch gap-4 overflow-hidden rounded-xl border border-nord-line bg-white transition hover:-translate-y-0.5 hover:border-nord-navy hover:shadow-md"
        >
          <DateTile weekday={weekday} day={day} month={month} tone="navy" />
          <div className="flex min-w-0 flex-1 items-center gap-4 py-3 pr-4">
            <CrestStack
              homeLogo={item.homeLogo}
              awayLogo={item.awayLogo}
              side={item.side}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    item.side === "home"
                      ? "bg-nord-sky/20 text-nord-navy"
                      : "bg-nord-paper-2 text-nord-muted"
                  }`}
                >
                  {item.side === "home" ? "Heim" : "Auswärts"}
                </span>
                <span className="text-nord-muted">{item.teamName}</span>
              </div>
              <div className="mt-1.5 truncate font-display text-base font-bold tracking-tight text-nord-ink md:text-lg">
                {item.side === "home" ? "SV Nord" : item.opponent}{" "}
                <span className="text-nord-muted">vs</span>{" "}
                {item.side === "home" ? item.opponent : "SV Nord"}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-nord-muted">
                {time} Uhr
                {item.competition ? ` · ${item.competition}` : null}
                {item.venue ? ` · ${item.venue}` : null}
              </div>
            </div>
            <div className="hidden shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-nord-muted group-hover:text-nord-navy md:block">
              bfv.de →
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li className="flex items-stretch gap-4 overflow-hidden rounded-xl border border-nord-gold/40 bg-gradient-to-br from-[#fffbef] to-white">
      <DateTile weekday={weekday} day={day} month={month} tone="gold" />
      <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
            <span className="rounded-full bg-nord-gold/25 px-2 py-0.5 text-nord-ink">
              Vereinstermin
            </span>
          </div>
          <div className="mt-1.5 truncate font-display text-base font-bold tracking-tight text-nord-ink md:text-lg">
            {item.title}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-nord-muted">
            {time} Uhr
            {item.location ? ` · ${item.location}` : null}
          </div>
        </div>
      </div>
    </li>
  );
}

function DateTile({
  weekday,
  day,
  month,
  tone,
}: {
  weekday: string;
  day: string;
  month: string;
  tone: "navy" | "gold";
}) {
  const toneClass =
    tone === "navy" ? "bg-nord-navy text-white" : "bg-nord-gold text-nord-ink";
  return (
    <div
      className={`flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 ${toneClass} md:w-20`}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-80">
        {weekday}
      </span>
      <span className="font-display text-2xl font-black leading-none md:text-3xl">
        {day}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-80">
        {month}
      </span>
    </div>
  );
}

function CrestStack({
  homeLogo,
  awayLogo,
  side,
}: {
  homeLogo: string | null;
  awayLogo: string | null;
  side: "home" | "away";
}) {
  const ours = side === "home" ? homeLogo : awayLogo;
  const theirs = side === "home" ? awayLogo : homeLogo;
  return (
    <div className="relative hidden shrink-0 md:block">
      <div className="relative flex">
        <Crest src={ours} ring="ring-nord-gold" />
        <Crest src={theirs} ring="ring-nord-line" className="-ml-3" />
      </div>
    </div>
  );
}

function Crest({
  src,
  ring,
  className = "",
}: {
  src: string | null;
  ring: string;
  className?: string;
}) {
  return (
    <div
      className={`flex size-11 items-center justify-center rounded-full bg-white p-1.5 ring-2 ${ring} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="size-full object-contain"
          loading="lazy"
        />
      ) : (
        <span className="text-[10px] font-bold text-nord-muted">·</span>
      )}
    </div>
  );
}
