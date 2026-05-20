type Card = {
  src: string;
  caption: string;
  sub: string;
};

const CARDS: Card[] = [
  {
    src: "/sport/u8/trainerteam.jpg",
    caption: "Trainerteam U8",
    sub: "Unsere Trainer:innen der jüngsten Jahrgänge",
  },
  {
    src: "/sport/u8/loewen.jpg",
    caption: "U8 Löwen",
    sub: "F-Junioren · U8-I",
  },
  {
    src: "/sport/u8/tiger.jpg",
    caption: "U8 Tiger",
    sub: "F-Junioren · U8-II",
  },
];

export function U8Showcase() {
  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-nord-line bg-white p-7 md:p-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
            Unsere U8
          </div>
          <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
            Löwen, Tiger und ihr Trainerteam
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-nord-muted">
          Die Allerjüngsten beim SV Nord — zwei Mannschaften, ein engagiertes
          Trainerteam, jede Menge Bewegung.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <figure
            key={c.caption}
            className="group overflow-hidden rounded-xl border border-nord-line bg-nord-paper-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={c.caption}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <figcaption className="px-4 py-3">
              <div className="font-display text-sm font-black tracking-tight text-nord-ink">
                {c.caption}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                {c.sub}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
