import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

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

export default async function TerminePage() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "events",
    where: { startsAt: { greater_than: new Date().toISOString() } },
    sort: "startsAt",
    limit: 100,
    depth: 0,
  });

  const byMonth = new Map<
    string,
    { label: string; events: typeof result.docs }
  >();

  for (const event of result.docs) {
    const d = new Date(event.startsAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`;
    if (!byMonth.has(key)) {
      byMonth.set(key, { label, events: [] });
    }
    byMonth.get(key)!.events.push(event);
  }

  return (
    <>
      <PageHero
        eyebrow="Termine"
        title="Was ist los beim SV Nord?"
        lede="Training, Heimspiele, Jeep Cup, Sommerfest, Weihnachtsfeier — hier steht, wann du vorbeikommen kannst."
      />
      <div className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {byMonth.size === 0 ? (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-10 text-center text-sm text-nord-muted">
            Keine anstehenden Termine. Pflege Termine im Admin unter{" "}
            <em>Content → Events</em>.
          </div>
        ) : (
          [...byMonth.entries()].map(([key, group]) => (
            <section key={key} className="mb-12 last:mb-0">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
                {group.label}
              </h2>
              <ul className="divide-y divide-nord-line overflow-hidden rounded-xl border border-nord-line bg-white">
                {group.events.map((event) => {
                  const d = new Date(event.startsAt);
                  const day = d.getDate().toString().padStart(2, "0");
                  const month = SHORT_MONTHS_DE[d.getMonth()];
                  const time = d.toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  return (
                    <li key={event.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex min-w-12 flex-col items-center justify-center rounded-lg bg-nord-navy px-3 py-2 text-white">
                        <span className="text-lg font-bold leading-none">{day}</span>
                        <span className="mt-1 text-[9px] tracking-[0.1em]">
                          {month}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-nord-ink">
                          {event.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-nord-muted">
                          {time}
                          {event.location ? ` · ${event.location}` : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
