import { getPayloadClient } from "@/lib/payload";

const PLACEHOLDERS = [
  "Lerchenauer Bau",
  "Gasthof Schützen",
  "München Versicherung",
  "Bayer Sport",
  "Eschen Cafe",
  "Nord Apotheke",
  "Grüner Hof",
  "Auto Meier",
];

export async function SponsorMarquee() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "sponsors",
    sort: "order",
    limit: 20,
    depth: 0,
  });

  const names =
    result.docs.length > 0 ? result.docs.map((s) => s.name) : PLACEHOLDERS;

  const doubled = [...names, ...names];

  return (
    <section className="border-b border-nord-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-nord-muted">
          Unsere Sponsoren
        </div>
        <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-12 pr-12 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {doubled.map((name, idx) => (
              <div
                key={`${name}-${idx}`}
                className="whitespace-nowrap font-serif text-lg italic text-nord-muted/70"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
