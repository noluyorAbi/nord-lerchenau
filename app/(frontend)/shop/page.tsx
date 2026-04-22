import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Vereinsshop",
  description:
    "Der offizielle SV Nord München-Lerchenau Fanshop bei 11teamsports — Trikots, Trainingsausstattung und Fanartikel in Vereinsfarben.",
  alternates: { canonical: "/shop" },
};

const SHOP_URL =
  "https://www.11teamsports.com/de-de/clubshop/sv-nord-muenchen-lerchenau/";

const HIGHLIGHTS = [
  {
    title: "Trikots",
    body: "Heim-, Auswärts- und Torwarttrikots in der aktuellen Saisonedition mit SV-Nord-Vereinslogo.",
  },
  {
    title: "Trainingsausstattung",
    body: "Trainingsjacken, Hosen und Sporttaschen für jede Altersklasse.",
  },
  {
    title: "Fanartikel",
    body: "Schals, Caps und weitere Accessoires in blau-weiß — für den Eschengarten und jeden Auswärtstermin.",
  },
];

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Vereinsshop"
        title="Unser eigener Vereinsshop."
        lede="Liebe Nordler! Es gibt erfreuliche Nachrichten — der digitale Fanshop beim Partner 11teamsports ist online. Trikots, Trainingskleidung und Fanartikel im offiziellen SV-Nord-Design."
      />

      <div className="mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
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
                versendet. Die Trikotnummerierung für aktive Spieler erfolgt
                über die Abteilung.
              </p>
            </div>
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-nord-gold px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.06em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(200,169,106,0.4)]"
            >
              Shop öffnen ↗
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-nord-line bg-white p-6"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
                {h.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-nord-ink">
                {h.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-nord-line bg-nord-paper-2 p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-muted">
            Hinweis für aktive Mannschaften
          </div>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-nord-ink">
            Für offizielle Spielausstattung (Trikots, Trainingsanzüge,
            Aufwärmshirts in den Teamfarben) wendet euch bitte an die
            sportliche Leitung bzw. eure Trainer:innen. Die Abteilung bündelt
            Bestellungen und sorgt für einheitliches Auftreten auf dem Platz.
          </p>
        </section>
      </div>
    </>
  );
}
