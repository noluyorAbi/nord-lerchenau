import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { getPayloadClient } from "@/lib/payload";

const MONTHS_DE = [
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

export async function UpcomingEvents() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "events",
    where: { startsAt: { greater_than: new Date().toISOString() } },
    sort: "startsAt",
    limit: 3,
    depth: 0,
  });

  if (result.docs.length === 0) return null;

  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-nord-ink md:text-4xl">
            Nächste Termine
          </h2>
          <Link href="/termine" className="text-sm text-nord-muted hover:text-nord-ink">
            Alle Termine →
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {result.docs.map((event, idx) => {
            const startDate = new Date(event.startsAt);
            const day = startDate.getDate().toString().padStart(2, "0");
            const month = MONTHS_DE[startDate.getMonth()];
            const weekday = startDate.toLocaleDateString("de-DE", {
              weekday: "short",
            });
            const time = startDate.toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return (
              <FadeUp key={event.id} delay={idx * 0.08}>
                <div className="flex items-center gap-3 rounded-xl border border-nord-line bg-white p-3 md:p-4">
                  <div className="flex min-w-12 flex-col items-center justify-center rounded-lg bg-nord-navy px-3 py-2 text-white">
                    <span className="text-lg font-bold leading-none">
                      {day}
                    </span>
                    <span className="mt-1 text-[9px] tracking-[0.1em]">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-nord-ink">
                      {event.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-nord-muted">
                      {weekday} · {time}
                      {event.location ? ` · ${event.location}` : null}
                    </div>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
