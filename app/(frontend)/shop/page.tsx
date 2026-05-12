import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { fetchClubshopProducts, type ClubshopProduct } from "@/lib/clubshop";

type StarterSlot = {
  step: number;
  title: string;
  blurb: string;
  matchers: RegExp[];
  excluders?: RegExp[];
};

const STARTER_SLOTS: StarterSlot[] = [
  {
    step: 1,
    title: "T-Shirt",
    blurb: "Atmungsaktiv fürs Training und für drunter unter dem Trikot.",
    matchers: [/t-?shirt/i, /\btee\b/i, /trainingsshirt/i],
    excluders: [/langarm/i, /sleeves/i, /socken/i, /short/i],
  },
  {
    step: 2,
    title: "Kurze Hose",
    blurb:
      "Trainings-Short in Vereinsfarben, auch perfekt fürs Hallentraining.",
    matchers: [/\bshort\b/i, /shorts/i, /kurze\s*hose/i],
  },
  {
    step: 3,
    title: "Rucksack",
    blurb: "Tiro Rucksack für Schuhe, Trikot und Schienbeinschoner.",
    matchers: [/rucksack/i, /backpack/i],
  },
  {
    step: 4,
    title: "Trainingsanzug",
    blurb: "Jacke + Hose im Set für An- und Abreise rund ums Spiel.",
    matchers: [
      /trainingsanzug/i,
      /präsentationsanzug/i,
      /trainingsjacke/i,
      /jogginghose/i,
    ],
    excluders: [/kids/i],
  },
];

function pickStarterProducts(
  products: ClubshopProduct[],
): Array<{ slot: StarterSlot; product: ClubshopProduct | null }> {
  const used = new Set<string>();
  return STARTER_SLOTS.map((slot) => {
    const product =
      products.find((p) => {
        if (used.has(p.id)) return false;
        const hay = `${p.name} ${p.manufacturer ?? ""}`;
        if (slot.excluders?.some((re) => re.test(hay))) return false;
        return slot.matchers.some((re) => re.test(hay));
      }) ?? null;
    if (product) used.add(product.id);
    return { slot, product };
  });
}

export const metadata: Metadata = {
  title: "Vereinsshop",
  description:
    "Der offizielle SV Nord München-Lerchenau Fanshop bei 11teamsports — Trainingskollektion und Fanartikel in Vereinsfarben.",
  alternates: { canonical: "/shop" },
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const result = await fetchClubshopProducts();
  const { products, shopUrl } = result;
  if (!result.ok) {
    console.error("[/shop] clubshop fetch failed:", result.reason);
  }

  const starterPicks = pickStarterProducts(products);

  return (
    <>
      <PageHero
        eyebrow="Vereinsshop"
        title="Unser eigener Vereinsshop."
        lede="Liebe Nordler! Der digitale Fanshop beim Partner 11teamsports ist online. Trainingskollektion, Taschen und Fan-Artikel im offiziellen SV-Nord-Design — direkt in Vereinsfarben bestellbar."
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <section className="overflow-hidden rounded-2xl bg-nord-ink p-8 text-white md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-nord-gold">
                Offizieller Partner · 11teamsports
              </div>
              <h2
                className="mt-3 font-display font-extrabold leading-tight"
                style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }}
              >
                Zum digitalen Fanshop
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-white/75">
                Alle Artikel werden direkt über{" "}
                <span className="font-semibold text-white">11teamsports</span>{" "}
                versendet. Auswahl wird stündlich aktualisiert.
              </p>
            </div>
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-nord-gold px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.06em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(200,169,106,0.4)]"
            >
              Shop öffnen ↗
            </a>
          </div>
        </section>

        {products.length > 0 ? (
          <section className="mt-12 overflow-hidden rounded-2xl border border-nord-gold/40 bg-gradient-to-br from-white via-nord-paper-2 to-white p-7 md:p-10">
            <div className="mb-7 grid gap-4 md:grid-cols-[1.6fr_1fr] md:items-end md:gap-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-nord-gold/40 bg-nord-gold/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-navy">
                  <span className="size-1.5 rounded-full bg-nord-gold" />
                  Starterpaket
                </div>
                <h3
                  className="mt-3 font-display font-black leading-[1.05] tracking-tight text-nord-ink"
                  style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
                >
                  Du bist neu? Damit startest du komplett.
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-nord-muted md:text-base">
                  Vier Basics, die jedes neue Mitglied im Schrank haben sollte —
                  alle direkt im Clubshop verfügbar.
                </p>
              </div>
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-nord-ink px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2 md:self-end"
              >
                Komplette Auswahl ↗
              </a>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {starterPicks.map(({ slot, product }) => (
                <li key={slot.step}>
                  <a
                    href={product?.url ?? shopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-3 rounded-xl border border-nord-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-nord-gold hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-nord-navy text-[12px] font-black text-nord-gold">
                        {slot.step}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-muted">
                        {product ? "Im Shop" : "Vorschlag"}
                      </span>
                    </div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-nord-paper-2">
                      {product?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="absolute inset-0 size-full object-contain p-3 transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-display text-2xl font-black text-nord-line">
                          {slot.title}
                        </div>
                      )}
                    </div>
                    <div className="font-display text-base font-black leading-tight text-nord-ink">
                      {slot.title}
                    </div>
                    {product ? (
                      <>
                        <div className="line-clamp-2 font-display text-xs font-semibold leading-snug text-nord-muted">
                          {product.manufacturer
                            ? `${product.manufacturer} · `
                            : ""}
                          {product.name}
                        </div>
                        {product.price ? (
                          <div className="font-display text-sm font-black text-nord-navy">
                            {product.price}
                            {product.listPrice &&
                            product.listPrice !== product.price ? (
                              <span className="ml-2 font-mono text-[11px] font-normal text-nord-muted line-through">
                                {product.listPrice}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-xs leading-relaxed text-nord-muted">
                        {slot.blurb}
                      </p>
                    )}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {products.length > 0 ? (
          <section className="mt-12">
            <div className="mb-6 flex items-baseline justify-between">
              <h3 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                Aktuelle Artikel
              </h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nord-muted">
                {products.length} Artikel · Live
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <li key={p.id}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nord-line bg-white transition hover:-translate-y-0.5 hover:border-nord-gold hover:shadow-lg"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-nord-paper-2">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          loading="lazy"
                          className="absolute inset-0 size-full object-contain p-3 transition group-hover:scale-105"
                        />
                      ) : null}
                      {p.discountPct ? (
                        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          -{p.discountPct}%
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      {p.manufacturer ? (
                        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-nord-gold">
                          {p.manufacturer}
                        </div>
                      ) : null}
                      <div className="line-clamp-2 font-display text-sm font-semibold leading-snug text-nord-ink">
                        {p.name}
                      </div>
                      <div className="mt-auto flex items-baseline gap-2 pt-1">
                        {p.price ? (
                          <span className="font-display text-base font-black text-nord-navy">
                            {p.price}
                          </span>
                        ) : null}
                        {p.listPrice && p.listPrice !== p.price ? (
                          <span className="font-mono text-[11px] text-nord-muted line-through">
                            {p.listPrice}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="mt-10 rounded-2xl border border-dashed border-nord-line bg-white p-8 text-sm text-nord-muted">
            Aktuell kann die Artikelliste nicht geladen werden. Bitte direkt im{" "}
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-nord-navy hover:text-nord-navy-2"
            >
              Clubshop bei 11teamsports
            </a>{" "}
            stöbern.
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-nord-line bg-nord-paper-2 p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-muted">
            Hinweis für aktive Mannschaften
          </div>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-nord-ink">
            Match-Trikots und einheitliche Spielausstattung gibt es nicht im
            öffentlichen Clubshop. Für offizielle Trikots, Trainingsanzüge und
            Aufwärmshirts in den Teamfarben wendet euch bitte an die sportliche
            Leitung bzw. eure Trainer:innen — die Abteilung bündelt Bestellungen
            und sorgt für einheitliches Auftreten auf dem Platz.
          </p>
        </section>
      </div>
    </>
  );
}
