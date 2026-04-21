import type { Media, Person } from "@/payload-types";

type Props = { person: Person };

function portraitUrl(photo: Person["photo"]): string | null {
  if (!photo || typeof photo !== "object") return null;
  const m = photo as Media;
  const url = m.url ?? "";
  // Blob / external CDN — use the stored URL directly.
  if (/^https?:\/\//.test(url) && !url.includes("/api/media/file/")) {
    return url;
  }
  // Local upload adapter — Payload's /api/media/file/ route isn't reachable
  // from Vercel's serverless runtime, but the file ships with the build at
  // public/uploads/<filename>, which Next.js serves directly.
  if (m.filename) return `/uploads/${m.filename}`;
  return null;
}

export function PersonCard({ person }: Props) {
  const src = portraitUrl(person.photo);
  const initials = person.name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="overflow-hidden rounded-xl border border-nord-line bg-white p-5">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Porträt ${person.name}`}
          className="size-16 rounded-full object-cover ring-2 ring-nord-line"
          loading="lazy"
        />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-nord-navy to-nord-navy-2 text-lg font-bold text-white">
          {initials}
        </div>
      )}
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
            <a href={`mailto:${person.email}`} className="hover:text-nord-ink">
              {person.email}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
