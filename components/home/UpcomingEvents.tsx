import Link from "next/link";

import { FadeUp } from "@/components/motion/FadeUp";
import { SectionEyebrow } from "@/components/SectionEyebrow";
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
    <section className="border-b border-nord-line bg-nord-paper-2">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="06" label="Termine" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Nächste Termine.
            </h2>
          </div>
          <Link
            href="/termine"
            className="hidden rounded-full border border-nord-line px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:bg-nord-ink hover:text-nord-paper md:inline-flex"
          >
            Alle Termine →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {result.docs.map((event, idx) => {
            const d = new Date(event.startsAt);
            const day = d.getDate().toString().padStart(2, "0");
            const month = MONTHS_DE[d.getMonth()];
            const weekday = d.toLocaleDateString("de-DE", { weekday: "short" });
            const time = d.toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return (
              <FadeUp key={event.id} delay={idx * 0.08}>
                <div className="flex items-center gap-4 rounded-2xl border border-nord-line bg-nord-paper p-4 md:p-5">
                  <div className="flex min-w-14 flex-col items-center justify-center rounded-xl bg-nord-navy px-3 py-3 text-white">
                    <span className="font-display text-2xl font-black leading-none">
                      {day}
                    </span>
                    <span className="mt-1 font-mono text-[9px] tracking-[0.1em] text-nord-gold">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[17px] font-extrabold leading-tight tracking-[-0.01em]">
                      {event.title}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
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
