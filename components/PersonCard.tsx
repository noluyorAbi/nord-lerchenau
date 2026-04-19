import type { Person } from "@/payload-types";

type Props = { person: Person };

export function PersonCard({ person }: Props) {
  const initials = person.name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-xl border border-nord-line bg-white p-5">
      <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-nord-navy to-nord-navy-2 text-lg font-bold text-white">
        {initials}
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-nord-ink">
        {person.name}
      </h3>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-nord-sky">
        {person.role}
      </div>
      <div className="mt-3 space-y-0.5 text-xs text-nord-muted">
        {person.phone ? <div>{person.phone}</div> : null}
        {person.email ? (
          <div>
            <a
              href={`mailto:${person.email}`}
              className="hover:text-nord-ink"
            >
              {person.email}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
