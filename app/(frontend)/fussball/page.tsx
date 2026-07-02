import Link from "next/link";

import { BfvFormulare } from "@/components/fussball/BfvFormulare";
import { StandingsTable } from "@/components/fussball/StandingsTable";
import { FupaBlock } from "@/components/home/FupaBlock";
import { PageHero } from "@/components/PageHero";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { BFV_CLUB_URL } from "@/lib/bfv";
import { getFupaStanding } from "@/lib/fupa";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

type CardTone = "navy" | "paper" | "sky" | "gold";

const TONE_CLASSES: Record<
  CardTone,
  { card: string; eyebrow: string; meta: string; arrow: string }
> = {
  navy: {
    card: "bg-nord-navy text-white",
    eyebrow: "text-nord-gold",
    meta: "text-white/70",
    arrow: "text-nord-gold",
  },
  paper: {
    card: "bg-nord-paper-2 text-nord-ink border border-nord-line",
    eyebrow: "text-nord-gold",
    meta: "text-nord-muted",
    arrow: "text-nord-navy",
  },
  sky: {
    card: "bg-gradient-to-br from-[#dff0fb] via-white to-white text-nord-ink border border-nord-line",
    eyebrow: "text-nord-navy",
    meta: "text-nord-muted",
    arrow: "text-nord-navy",
  },
  gold: {
    card: "bg-gradient-to-br from-nord-gold via-[#f0c44c] to-[#e6b035] text-nord-ink",
    eyebrow: "text-nord-navy",
    meta: "text-nord-ink/70",
    arrow: "text-nord-navy",
  },
};

export default async function FussballPage() {
  const payload = await getPayloadClient();

  const [result, standings] = await Promise.all([
    payload.find({
      collection: "teams",
      where: { sport: { equals: "fussball" } },
      sort: "order",
      limit: 200,
      depth: 0,
    }),
    getFupaStanding(),
  ]);

  const bfvCount = result.docs.filter((t) => t.bfv?.teamId).length;

  return (
    <>
      <PageHero
        eyebrow="Fußball"
        title="Unsere Mannschaften"
        lede="Unsere Fußballabteilung existiert seit 1947. In der Saison 2026/27 stellen wir 15 Jugendmannschaften, 5 Herrenmannschaften und eine Ehrenligamannschaft."
      />
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <section className="mb-12 grid gap-6 rounded-2xl bg-nord-paper-2 p-8 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Herzlich Willkommen bei der Fußball-Abteilung
            </div>
            <p className="text-base leading-relaxed text-nord-ink">
              Unsere Fußballabteilung existiert seit dem Jahre 1947. Wir stellen
              in der Saison 2026/2027 fünfzehn Jugendmannschaften, fünf
              Herrenmannschaften und eine Ehrenligamannschaft. Wir freuen uns
              über alle Fußballbegeisterten von Jung bis Alt.
            </p>
            <p className="mt-3 text-sm italic text-nord-muted">
              Eure SV Nord Fußballer.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={BFV_CLUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
              >
                BFV-Vereinsprofil ↗
              </a>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                {bfvCount} Mannschaften · live beim BFV gemeldet
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-nord-line bg-white p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Sportliche Leitung
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <div className="font-semibold text-nord-ink">
                  Felix Kirmeyer
                </div>
                <div className="text-xs text-nord-muted">
                  Sportlicher Leiter
                </div>
              </li>
              <li>
                <div className="font-semibold text-nord-ink">
                  Felix Kirmeyer
                </div>
                <div className="text-xs text-nord-muted">
                  Fußball-Erwachsene
                </div>
              </li>
              <li>
                <div className="font-semibold text-nord-ink">Ergin Piker</div>
                <div className="text-xs text-nord-muted">Fußball-Jugend</div>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
            <h2 className="font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
              Säulen der Abteilung
            </h2>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
              Fünf Bereiche
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FussballPillar
              eyebrow="Erwachsen"
              title="Fußball — Erwachsene"
              body="Landesliga, Reserve, Dritte, Ehrenliga und Senioren. Vom ambitionierten Spieltag bis zur Altherrenrunde, alle Erwachsenenmannschaften des SV Nord."
              href="/fussball/herren"
              meta="5 Herrenmannschaften · Ehrenliga"
              tone="navy"
            />
            <FussballPillar
              eyebrow="Jugend"
              title="Fußball — Jugend"
              body="Großfeld, Kompaktfeld und Kleinfeld. Direkte Ansprechpartner für Eltern und Jugendspieler — von der A-Jugend bis zu den Bambinis."
              href="/fussball/junioren"
              meta="15 Jugendmannschaften"
              tone="sky"
            />
            <FussballPillar
              eyebrow="Torwart"
              title="Fußball — Torwart"
              body="Spezielles Torwart-Training für alle Altersklassen. Wir suchen Talente und bilden eigene Torhüter:innen aus. Spielerbetreuung ab den Junioren."
              href="/fussball"
              meta="Position · Training"
              tone="gold"
            />
            <FussballPillar
              eyebrow="Spielbetrieb"
              title="Schiedsrichter"
              body="Aktive Unparteiische im BFV-Spielbetrieb — von der Kreisklasse bis zur Bezirksliga. Sie sorgen für faire Bedingungen auf den Plätzen."
              href="/schiedsrichter"
              meta="BFV · Ehrenamt"
              tone="sky"
            />
            <FussballPillar
              eyebrow="Organisation"
              title="PR, Events, Equipment, Organisation"
              body="Wir suchen tatkräftige Unterstützung! Um unsere Projekte und Ziele erfolgreich zu meistern, wie das nächste Vereinsfest oder die Unterstützung in unseren Teams, brauchen wir noch helfende Hände. Egal ob Organisationstalent, handwerkliches Geschick oder einfach gute Laune und etwas Zeit: Bei uns ist jede helfende Kraft ein Gewinn! Hast du Lust, gemeinsam mit uns anzupacken? Dann schreib uns einfach eine Nachricht an info@svnord.de."
              href="/fussball"
              meta="Ehrenamt · Backbone"
              tone="paper"
            />
          </div>
        </section>

        <section id="formulare" className="mb-12 scroll-mt-24">
          <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
            <div>
              <SectionEyebrow number="03" label="Formulare" />
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                BFV-Formulare
              </h2>
            </div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
              Passabteilung · offiziell
            </span>
          </div>
          <BfvFormulare />
        </section>

        <section className="mb-4">
          <div className="mb-5 flex items-baseline justify-between border-b border-nord-line pb-2">
            <div>
              <SectionEyebrow number="04" label="Tabelle" />
              <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-nord-ink md:text-3xl">
                Landesliga
              </h2>
            </div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
              Herren 1 · live von fupa
            </span>
          </div>
          <StandingsTable standings={standings} />
        </section>
      </div>
      <FupaBlock />
    </>
  );
}

type PillarTone = "navy" | "paper" | "sky" | "gold";

function FussballPillar({
  eyebrow,
  title,
  body,
  href,
  meta,
  tone,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  meta: string;
  tone: PillarTone;
}) {
  const tones = TONE_CLASSES[tone];
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-xl md:p-8 ${tones.card}`}
    >
      <div className="relative">
        <div
          className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${tones.eyebrow}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {eyebrow}
        </div>
        <h3 className="mt-3 font-display text-2xl font-black leading-tight tracking-tight md:text-3xl">
          {title}
        </h3>
        <p
          className={`mt-3 max-w-prose text-sm leading-relaxed ${
            tone === "navy" ? "text-white/80" : "text-current/80"
          }`}
        >
          {body}
        </p>
      </div>
      <div className="relative mt-6 flex items-end justify-between gap-3">
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-[0.15em] ${tones.meta}`}
        >
          {meta}
        </span>
        <span
          className={`font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition group-hover:translate-x-0.5 ${tones.arrow}`}
        >
          Ansehen →
        </span>
      </div>
    </Link>
  );
}
