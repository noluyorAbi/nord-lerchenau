import type { Media, Person } from "@/payload-types";
import { mediaSrc } from "@/lib/publicUploads";

type Props = { person: Person };

function portraitUrl(photo: Person["photo"]): string | null {
  if (!photo || typeof photo !== "object") return null;
  const m = photo as Media;
  return mediaSrc(m);
}

// German number to a wa.me link: strip formatting, replace the leading 0
// with the +49 country code.
function whatsappLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const intl = digits.startsWith("0") ? `49${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}

export function PersonCard({ person }: Props) {
  const src = portraitUrl(person.photo);
  const wa =
    person.function === "trainer" && person.phone
      ? whatsappLink(person.phone)
      : null;
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
        {person.phone ? (
          wa ? (
            <div>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-[#128c4a] transition hover:text-[#0d6b39]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 shrink-0"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24Zm-4.5 4.42c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.66.75.24 1.44.21 1.98.13.6-.09 1.86-.76 2.12-1.5.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.71.16-.21.31-.81 1.02-1 1.23-.18.21-.37.24-.68.08-.31-.16-1.33-.49-2.53-1.56-.94-.83-1.57-1.86-1.75-2.17-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.11-.21.05-.39-.02-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54-.18-.01-.39-.01-.6-.01Z" />
                </svg>
                {person.phone}
              </a>
            </div>
          ) : (
            <div>{person.phone}</div>
          )
        ) : null}
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
