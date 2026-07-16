import Link from "next/link";

import { BfvFormulare } from "@/components/fussball/BfvFormulare";
import { StandingsTable } from "@/components/fussball/StandingsTable";
import { FupaBlock } from "@/components/home/FupaBlock";
import { PageHero } from "@/components/PageHero";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { BFV_CLUB_URL } from "@/lib/bfv";
import {
  fupaTeamUrl,
  getFupaStandingForTeam,
  getFupaTeam,
  resolveLiveHerrenSlug,
} from "@/lib/fupa";
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

  // Slug-unabhängige Payload-Query sofort starten, damit die
  // fupa-Slug-Auflösung sie nicht serialisiert.
  const teamsPromise = payload.find({
    collection: "teams",
    where: { sport: { equals: "fussball" } },
    sort: "order",
    limit: 200,
    depth: 0,
  });
  // Aktuellste auf fupa existierende Saison der 1. Herren; Liga und Saison
  // der Tabelle kommen aus dem fupa-Team-Datensatz selbst.
  const herrenSlug = await resolveLiveHerrenSlug();
  const [result, standings, herrenTeam] = await Promise.all([
    teamsPromise,
    getFupaStandingForTeam(herrenSlug),
    getFupaTeam(herrenSlug),
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
              body="Hinter den Kulissen: Öffentlichkeitsarbeit, Vereinsevents, Material- und Trikotverwaltung, organisatorischer Backbone der Abteilung."
              href="#mitmachen"
              meta="Ehrenamt · Backbone"
              tone="paper"
            />
          </div>
        </section>

        {/* 2026_06_02 Vereinswunsch: Mithelfer-Aufruf + Social-Media-Team auf /fussball. */}
        <section id="mitmachen" className="mb-12 scroll-mt-24">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl bg-nord-navy p-7 text-white md:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(110,199,234,0.3)_0%,transparent_60%)]"
              />
              <div className="relative">
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-gold">
                  PR · Events · Equipment · Organisation
                </div>
                <h2 className="mt-3 font-display text-2xl font-black tracking-tight md:text-3xl">
                  Wir suchen tatkräftige Unterstützung!
                </h2>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/85">
                  Um unsere Projekte und Ziele erfolgreich zu meistern, wie das
                  nächste Vereinsfest oder die Unterstützung in unseren Teams,
                  brauchen wir noch helfende Hände. Egal ob Organisationstalent,
                  handwerkliches Geschick oder einfach gute Laune und etwas
                  Zeit: Bei uns ist jede helfende Kraft ein Gewinn!
                </p>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/85">
                  Hast du Lust, gemeinsam mit uns anzupacken? Dann schreib uns
                  einfach eine Nachricht. Wir freuen uns auf dich!
                </p>
                <a
                  href="mailto:info@svnord.de?subject=Ich%20packe%20mit%20an"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-nord-gold px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-nord-ink transition hover:-translate-y-px hover:brightness-105"
                >
                  info@svnord.de →
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-nord-line bg-white p-6 md:p-7">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-gold">
                Social Media Abteilung
              </div>
              <p className="mt-2 text-xs text-nord-muted">
                Das Team hinter Kanälen, Fotos und Spieltags-Posts.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Tobias Tins",
                  "Tobias Treffer",
                  "Dominik Besel",
                  "Andi Weiß",
                  "Marko Rakita",
                  "Tamay Piker",
                ].map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 font-display text-base font-semibold text-nord-ink"
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-nord-gold"
                      aria-hidden
                    />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
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
          <StandingsTable
            standings={standings}
            competitionName={herrenTeam?.competition.middleName}
            seasonName={herrenTeam?.competition.season.name}
            fupaUrl={fupaTeamUrl(herrenSlug)}
          />
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
