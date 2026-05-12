import { getPayloadClient } from "@/lib/payload";

type Sponsor = {
  id: number | string;
  name: string;
  url?: string | null;
  logoUrl: string | null;
  tier?: string | null;
};

export async function SponsorMarquee() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "sponsors",
    sort: "order",
    limit: 40,
    depth: 1,
  });

  const sponsors: Sponsor[] = result.docs.map((doc) => {
    const d = doc as unknown as {
      id: number | string;
      name: string;
      url?: string | null;
      tier?: string | null;
      logo?: { url?: string | null; filename?: string | null } | number | null;
    };
    const logo = typeof d.logo === "object" && d.logo ? d.logo : null;
    const logoUrl = logo
      ? logo.filename
        ? `/uploads/${logo.filename}`
        : (logo.url ?? null)
      : null;
    return {
      id: d.id,
      name: d.name,
      url: d.url ?? null,
      tier: d.tier ?? null,
      logoUrl,
    };
  });

  if (sponsors.length === 0) return null;

  const doubled = [...sponsors, ...sponsors];

  return (
    <section className="border-y border-nord-line bg-nord-paper-2">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-16">
        <div className="mb-7 flex items-baseline justify-between gap-4">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-gold">
            Unsere Sponsoren
          </div>
          <a
            href="/sponsoren"
            className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-muted transition hover:text-nord-navy md:inline"
          >
            Alle Partner →
          </a>
        </div>
        <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
          <div className="flex w-max animate-[marquee_50s_linear_infinite] items-center gap-6 pr-6 group-hover:[animation-play-state:paused] motion-reduce:animate-none md:gap-8 md:pr-8">
            {doubled.map((s, idx) => {
              const card = (
                <div className="flex h-24 w-52 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-nord-navy-2/40 bg-nord-navy p-4 shadow-[0_8px_22px_-10px_rgba(11,27,63,0.55)] transition hover:-translate-y-0.5 hover:border-nord-gold hover:shadow-[0_14px_28px_-10px_rgba(11,27,63,0.65)] md:h-28 md:w-60 md:p-5">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logoUrl}
                      alt={`Logo ${s.name}`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-center font-display text-sm font-bold uppercase tracking-[0.06em] text-white">
                      {s.name}
                    </span>
                  )}
                </div>
              );
              return s.url ? (
                <a
                  key={`${s.id}-${idx}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  className="block"
                >
                  {card}
                </a>
              ) : (
                <div key={`${s.id}-${idx}`} title={s.name}>
                  {card}
                </div>
              );
            })}
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
