import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { fetchClubshopProducts } from "@/lib/clubshop";

export const metadata: Metadata = {
  title: "Vereinsshop",
  description:
    "Der offizielle SV Nord München-Lerchenau Fanshop bei 11teamsports — Trainingskollektion und Fanartikel in Vereinsfarben.",
  alternates: { canonical: "/shop" },
};

export const revalidate = 3600;

export default async function ShopPage() {
  const { products, shopUrl } = await fetchClubshopProducts();

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
