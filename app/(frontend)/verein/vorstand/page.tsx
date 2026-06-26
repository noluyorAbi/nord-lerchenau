import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";
import { publicUploadSrc } from "@/lib/publicUploads";
import type { Media, Person } from "@/payload-types";

export const dynamic = "force-dynamic";

const VORSTAND_NAMES = [
  "Ralf Kirmeyer",
  "Birgit Höfer",
  "Britta Feierabend",
  "Fabian Falk",
];

// Ski-Abteilung: per Vereinsangabe nur Korbinian (alias "Bini") Hafner und
// Tobias Tins öffentlich auf der Vorstand-Seite anzeigen.
const SKI_ALLOWED = new Set(["Bini Hafner", "Korbinian Hafner", "Tobias Tins"]);

// Gymnastik: Simone Roth wurde vom Verein abgemeldet.
const GYMNASTIK_BLOCKED = new Set(["Simone Roth"]);

// eSport: öffentlich nur Trainer Erich Popp und Kapitän Kevin Schwarz anzeigen.
const ESPORT_ALLOWED = new Set(["Erich Popp", "Kevin Schwarz"]);

// 2026_06_02 Vereinswunsch: Trainerin Abbrederis nicht mehr öffentlich anzeigen.
// Substring-Match auf den Nachnamen, da der volle Vorname in den Daten variieren kann.
const BLOCKED_NAME_SUBSTRINGS = ["Abbrederis"];

function isBlockedName(name: string): boolean {
  return BLOCKED_NAME_SUBSTRINGS.some((s) => name.includes(s));
}

const SPORT_GROUPS: Array<{
  id: string;
  label: string;
  match: (role: string) => boolean;
  accent: string;
}> = [
  {
    id: "sportleitung",
    label: "Fußball-Sportleitung",
    match: (r) => /sportlicher\s+leiter/i.test(r),
    accent: "bg-nord-navy text-white",
  },
  {
    id: "gymnastik",
    label: "Gymnastik",
    match: (r) => /gymnastik/i.test(r),
    accent: "bg-emerald-100 text-emerald-900",
  },
  {
    id: "volleyball",
    label: "Volleyball",
    match: (r) => /volleyball/i.test(r),
    accent: "bg-amber-100 text-amber-900",
  },
  {
    id: "esport",
    label: "eSport",
    match: (r) => /eregionalliga|elandesliga|e-sport/i.test(r),
    accent: "bg-purple-100 text-purple-900",
  },
  {
    id: "schiedsrichter",
    label: "Schiedsrichter",
    match: (r) => /schiedsrichter/i.test(r),
    accent: "bg-rose-100 text-rose-900",
  },
  // Ski-Abteilung laut Vereinswunsch ans Ende der Sportlichen Leitung.
  {
    id: "ski",
    label: "Ski",
    match: (r) => /skilehrer|skilehrerin|ski/i.test(r),
    accent: "bg-nord-sky/20 text-nord-navy",
  },
];

function portraitUrl(photo: Person["photo"]): string | null {
  if (!photo || typeof photo !== "object") return null;
  const m = photo as Media;
  const url = m.url ?? "";
  if (/^https?:\/\//.test(url) && !url.includes("/api/media/file/")) {
    return url;
  }
  return publicUploadSrc(m.filename);
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stripPhone(p: Person): Person {
  return { ...p, phone: null };
}

export default async function VorstandPage() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "people",
    where: {
      function: { in: ["vorstand", "sportleitung", "jugendleitung"] },
    },
    sort: "order",
    limit: 100,
    depth: 1,
  });

  result.docs = result.docs.map(stripPhone);

  const vorstand = VORSTAND_NAMES.map((n) =>
    result.docs.find((p) => p.name === n),
  ).filter((p): p is Person => Boolean(p));

  const sportleitung = result.docs.filter((p) => p.function === "sportleitung");
  const jugendleitung = result.docs.filter(
    (p) => p.function === "jugendleitung",
  );

  const sportSubgroups = SPORT_GROUPS.map((group) => {
    let people = sportleitung.filter((p) => group.match(p.role ?? ""));
    // 2026_06_02 Vereinswunsch: Abbrederis aus allen Abteilungen ausblenden.
    people = people.filter((p) => !isBlockedName(p.name));
    if (group.id === "ski") {
      people = people.filter((p) => SKI_ALLOWED.has(p.name));
    }
    if (group.id === "gymnastik") {
      people = people.filter((p) => !GYMNASTIK_BLOCKED.has(p.name));
    }
    if (group.id === "esport") {
      people = people.filter((p) => ESPORT_ALLOWED.has(p.name));
    }
    return { ...group, people };
  }).filter((g) => g.people.length > 0);

  const ungrouped = sportleitung.filter(
    (p) =>
      !SPORT_GROUPS.some((g) => g.match(p.role ?? "")) &&
      !isBlockedName(p.name),
  );

  const totalPeople = result.docs.length;

  return (
    <>
      <PageHero
        eyebrow="Vorstand"
        title="Das Team hinter dem Verein"
        lede="Ehrenamtliche Vorstandschaft, sportliche Leitung und Jugendleitung. Erreichbar für alle Fragen rund um den SV Nord."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile value={vorstand.length} label="Vorstand" tone="navy" />
          {/* 2026_06_02 Vereinswunsch: nur Abteilungsleitung anzeigen, daher Anzahl der Abteilungen statt aller Trainer. */}
          <StatTile
            value={sportSubgroups.length}
            label="Abteilungen"
            tone="sky"
          />
          <StatTile
            value={jugendleitung.length}
            label="Jugendleitung"
            tone="gold"
          />
          <StatTile value={totalPeople} label="Ansprechpartner" tone="ink" />
        </div>

        <SectionHeader
          eyebrow="Vorstandschaft"
          title="Die Vier an der Spitze"
          sub="Gewählte Vorstandschaft nach Vereinssatzung."
        />
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vorstand.map((p, idx) => (
            <FeaturedPersonCard key={p.id} person={p} order={idx + 1} />
          ))}
        </div>

        {/* 2026_06_02 Vereinswunsch: "Punkt unter dem Vorstand" zum Kinder- & Jugendschutz. */}
        <Link
          href="/verein/jugendschutz"
          className="group mb-20 flex items-center justify-between gap-4 rounded-2xl border border-nord-line bg-nord-paper-2 px-5 py-4 transition hover:-translate-y-0.5 hover:border-nord-gold hover:bg-white md:px-7 md:py-5"
        >
          <div className="min-w-0">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
              Schutzkonzept
            </div>
            <div className="mt-1 font-display text-lg font-black tracking-tight text-nord-ink md:text-xl">
              Kinder- &amp; Jugendschutz
            </div>
            <p className="mt-0.5 text-sm text-nord-muted">
              Erweitertes Führungszeugnis, Prävention und Ansprechstellen im
              Verdachtsfall.
            </p>
          </div>
          <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-nord-navy transition group-hover:translate-x-0.5">
            Mehr →
          </span>
        </Link>

        <SectionHeader
          eyebrow="Sportliche Leitung"
          title="Abteilungsleitung"
          sub="Pro Abteilung gruppiert."
        />
        <div className="mb-20 space-y-12">
          {sportSubgroups.map((group) => (
            <div key={group.id}>
              <div className="mb-4 flex items-baseline justify-between border-b border-nord-line pb-2">
                <h3 className="font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
                  {group.label}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${group.accent}`}
                >
                  {group.people.length}{" "}
                  {group.people.length === 1 ? "Person" : "Personen"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {group.people.map((p) => (
                  <CompactPersonCard key={p.id} person={p} />
                ))}
              </div>
            </div>
          ))}

          {ungrouped.length > 0 ? (
            <div>
              <div className="mb-4 flex items-baseline justify-between border-b border-nord-line pb-2">
                <h3 className="font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
                  Weitere
                </h3>
                <span className="rounded-full bg-nord-paper-2 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-nord-muted">
                  {ungrouped.length}{" "}
                  {ungrouped.length === 1 ? "Person" : "Personen"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {ungrouped.map((p) => (
                  <CompactPersonCard key={p.id} person={p} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {jugendleitung.length > 0 ? (
          <>
            <SectionHeader
              eyebrow="Jugendleitung"
              title="Großfeld und Kleinfeld"
              sub="Direkte Ansprechpartner für Eltern und Jugendspieler."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {jugendleitung.map((p) => (
                <FeaturedPersonCard key={p.id} person={p} accent="gold" />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-gold">
        {eyebrow}
      </div>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-nord-ink md:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-nord-muted md:text-base">
        {sub}
      </p>
    </div>
  );
}

function StatTile({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "navy" | "sky" | "gold" | "ink";
}) {
  const styles = {
    navy: "bg-nord-navy text-white",
    sky: "bg-nord-sky/20 text-nord-navy border border-nord-line",
    gold: "bg-nord-gold text-nord-ink",
    ink: "bg-white border border-nord-line text-nord-ink",
  } as const;
  const labelTone =
    tone === "navy"
      ? "text-white/70"
      : tone === "gold"
        ? "text-nord-ink/70"
        : "text-nord-muted";
  return (
    <div className={`rounded-2xl p-5 ${styles[tone]}`}>
      <div className="font-display text-4xl font-black leading-none tracking-tight md:text-5xl">
        {value}
      </div>
      <div
        className={`mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${labelTone}`}
      >
        {label}
      </div>
    </div>
  );
}

function FeaturedPersonCard({
  person,
  order,
  accent,
}: {
  person: Person;
  order?: number;
  accent?: "gold" | "navy";
}) {
  const src = portraitUrl(person.photo);
  const initials = initialsOf(person.name);
  const isGold = accent === "gold";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-lg ${
        isGold
          ? "border-nord-gold/40 bg-gradient-to-br from-[#fffbef] to-white"
          : "border-nord-line bg-white"
      }`}
    >
      {order ? (
        <div className="absolute right-4 top-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-muted">
          Nr. {order}
        </div>
      ) : null}

      <div className="flex flex-col items-center px-6 pt-8 text-center">
        <div className="relative">
          <div
            aria-hidden
            className={`absolute inset-0 -z-10 rounded-full blur-2xl ${
              isGold ? "bg-nord-gold/40" : "bg-nord-sky/30"
            }`}
          />
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`Porträt ${person.name}`}
              className="size-28 rounded-full object-cover ring-4 ring-white md:size-32"
              loading="lazy"
            />
          ) : (
            <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-nord-navy to-nord-navy-2 text-2xl font-black text-white ring-4 ring-white md:size-32">
              {initials}
            </div>
          )}
        </div>
        <h3 className="mt-5 font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
          {person.name}
        </h3>
        <div
          className={`mt-2 inline-flex rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
            isGold
              ? "bg-nord-navy text-white"
              : "bg-nord-paper-2 text-nord-navy"
          }`}
        >
          {person.role}
        </div>
      </div>

      <ContactBar person={person} accent={isGold ? "gold" : "navy"} />
    </article>
  );
}

function CompactPersonCard({ person }: { person: Person }) {
  const src = portraitUrl(person.photo);
  const initials = initialsOf(person.name);

  return (
    <article className="group flex items-start gap-3 rounded-xl border border-nord-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-nord-navy hover:shadow-md">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Porträt ${person.name}`}
          className="size-14 shrink-0 rounded-full object-cover ring-2 ring-nord-line"
          loading="lazy"
        />
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nord-navy to-nord-navy-2 text-sm font-black text-white">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-display text-base font-bold tracking-tight text-nord-ink">
          {person.name}
        </h4>
        <div className="mt-0.5 line-clamp-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-nord-muted">
          {person.role}
        </div>
        {person.phone || person.email ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {person.phone ? (
              <a
                href={`tel:${person.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1 rounded-full bg-nord-paper-2 px-2 py-0.5 font-mono text-[10px] font-semibold text-nord-ink transition hover:bg-nord-navy hover:text-white"
              >
                Tel
              </a>
            ) : null}
            {person.email ? (
              <a
                href={`mailto:${person.email}`}
                className="inline-flex items-center gap-1 rounded-full bg-nord-paper-2 px-2 py-0.5 font-mono text-[10px] font-semibold text-nord-ink transition hover:bg-nord-navy hover:text-white"
              >
                Mail
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ContactBar({
  person,
  accent,
}: {
  person: Person;
  accent: "navy" | "gold";
}) {
  const hasContact = Boolean(person.phone || person.email);
  if (!hasContact) {
    return <div className="px-6 py-5" />;
  }
  const tone =
    accent === "navy"
      ? "border-t border-nord-line bg-nord-paper-2"
      : "border-t border-nord-gold/30 bg-nord-gold/10";
  return (
    <div className={`mt-6 flex divide-x divide-nord-line ${tone}`}>
      {person.phone ? (
        <a
          href={`tel:${person.phone.replace(/\s+/g, "")}`}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition hover:bg-nord-navy hover:text-white"
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-nord-muted group-hover:text-white/70">
            Telefon
          </span>
          <span className="font-display text-sm font-bold text-nord-ink">
            {person.phone}
          </span>
        </a>
      ) : null}
      {person.email ? (
        <a
          href={`mailto:${person.email}`}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition hover:bg-nord-navy hover:text-white"
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-nord-muted group-hover:text-white/70">
            E-Mail
          </span>
          <span className="truncate px-2 font-display text-sm font-bold text-nord-ink">
            {person.email}
          </span>
        </a>
      ) : null}
    </div>
  );
}
