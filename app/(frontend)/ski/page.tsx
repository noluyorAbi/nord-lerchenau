import Link from "next/link";

import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

type Skilehrer = {
  name: string;
  role: string;
};

const SKILEHRER: Skilehrer[] = [
  { name: "Bini Hafner", role: "1. Vorsitzender / Skilehrer" },
  { name: "Tobias Tins", role: "2. Vorsitzender / Skilehrer" },
  { name: "Fabian Falk", role: "Skilehrer" },
  { name: "Christoph Hafner", role: "Skilehrer" },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function SkiPage() {
  return (
    <>
      <PageHero
        eyebrow="Sport"
        title="Ski"
        lede="Seit über 20 Jahren fester Bestandteil des SV Nord. Skikurse, Touren und das Ski-Camp — vom Einsteiger bis zur Könnerin."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
          <article>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Herzlich willkommen bei der Ski-Abteilung
            </div>
            <div className="prose prose-neutral max-w-none">
              <p>
                Seit nun mehr als <strong>20 Jahren</strong> ist die
                Ski-Abteilung fester Bestandteil des SV Nord. Mit ausgebildeten
                und jungen Skilehrern wollen wir jedem Interessenten den Spaß am
                Skifahren näher bringen.
              </p>
              <p>
                Vom motivierten Neueinsteiger bis hin zum routinierten Könner —
                in der Ski-Abteilung vom SV Nord München-Lerchenau ist für jeden
                Pistenfreund ein Platz frei.
              </p>
              <p>Wir freuen uns auf Dich.</p>
              <p className="italic text-nord-muted">Eure SV Nord Ski-Crew</p>
            </div>

            <section className="mt-12">
              <h2 className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                Unsere Skilehrer
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {SKILEHRER.map((p) => (
                  <article
                    key={p.name}
                    className="flex items-center gap-4 rounded-2xl border border-nord-line bg-white p-5"
                  >
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-nord-navy font-display text-lg font-black text-nord-gold">
                      {initials(p.name)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-display text-base font-black leading-tight text-nord-ink">
                        {p.name}
                      </div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                        {p.role}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-12 rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 p-7 md:p-9">
              <div className="grid gap-5 md:grid-cols-[2fr_1fr] md:items-center">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                    Interesse?
                  </div>
                  <h3 className="mt-2 font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
                    Schreib uns für Skikurs oder Ski-Camp.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-nord-muted">
                    Mail an info@svnord.de oder direkt übers Kontaktformular —
                    wir melden uns mit Terminen und Treffpunkt.
                  </p>
                </div>
                <div className="flex md:justify-end">
                  <Link
                    href="/kontakt?subject=Ski"
                    className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
                  >
                    Kontakt aufnehmen →
                  </Link>
                </div>
              </div>
            </section>
          </article>

          <aside className="space-y-5 md:sticky md:top-24 md:h-fit md:self-start">
            <div className="rounded-2xl bg-nord-ink p-6 text-white">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                Auf einen Blick
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/70">Aktiv seit</dt>
                  <dd className="font-display font-bold">über 20 Jahren</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/70">Skilehrer</dt>
                  <dd className="font-display font-bold">{SKILEHRER.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/70">Offen für</dt>
                  <dd className="font-display font-bold">
                    Einsteiger & Profis
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-nord-line bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                Kontakt
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <a
                  href="mailto:info@svnord.de?subject=Ski-Abteilung"
                  className="block font-semibold text-nord-ink transition hover:text-nord-navy"
                >
                  ✉ info@svnord.de
                </a>
                <Link
                  href="/kontakt?subject=Ski"
                  className="block font-semibold text-nord-ink transition hover:text-nord-navy"
                >
                  Kontaktformular →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
