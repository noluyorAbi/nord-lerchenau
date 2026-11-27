import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageHero } from "@/components/PageHero";
import { cachedQuery, collectionTag } from "@/lib/cms";
import { getPayloadClient } from "@/lib/payload";

export const metadata = {
  title: "Jugendkonzept · Verein",
  description:
    "So arbeiten wir mit Kindern und Jugendlichen: Leitbild, Altersstufen, Trainer, Weg nach oben, Mädchenfußball und Zusammenarbeit mit den Eltern.",
  alternates: { canonical: "/verein/jugendkonzept" },
};

const JUGEND_CATEGORIES = new Set<string>([
  "junioren",
  "juniorinnen",
  "bambini",
]);

const BFV_URL = "https://www.bfv.de";
const DFB_KINDERFUSSBALL_URL =
  "https://www.dfb.de/mehr-fussball/kinderfussball-irrtuemer";

type Stage = { name: string; age: string; focus: string };

// Altersklassen laut Jugendordnung des BFV (Stichtag 1. Januar), Spielformen
// im Kinderfußball nach den Vorgaben von DFB und BFV.
const STAGES: Stage[] = [
  {
    name: "Bambini (G-Junioren)",
    age: "bis U7",
    focus:
      "Bewegung, Ball am Fuß, Spaß in der Gruppe. 2 gegen 2 oder 3 gegen 3, ohne Torwart.",
  },
  {
    name: "F-Junioren",
    age: "U8, U9",
    focus:
      "Dribbling, Eins-gegen-eins, Torabschluss. 3 gegen 3 oder 5 gegen 5.",
  },
  {
    name: "E-Junioren",
    age: "U10, U11",
    focus:
      "Passspiel, Zusammenspiel, erste Positionen. 5 gegen 5 oder 7 gegen 7.",
  },
  {
    name: "D-Junioren",
    age: "U12, U13",
    focus:
      "Technik unter Druck, Spielverständnis, Positionsspiel, erste Athletik.",
  },
  {
    name: "C-Junioren",
    age: "U14, U15",
    focus: "Taktik, Spielsysteme, Athletik, Verantwortung im Team.",
  },
  {
    name: "B- und A-Junioren",
    age: "U16 bis U19",
    focus: "Leistung, Wettkampfhärte, Übergang zu den Herren.",
  },
];

const VALUES = [
  {
    title: "Spaß",
    text: "Viele Ballkontakte, kleine Gruppen, spielerisches Training. Im Kinderfußball spielt jedes Kind.",
  },
  {
    title: "Fairness",
    text: "Handschlag vor und nach dem Spiel, Respekt vor Gegnern, Schiedsrichtern und Mitspielern. Unsere Trainer gehen voran.",
  },
  {
    title: "Gemeinschaft",
    text: "Mannschaftsabende, Vereinsfeste und Ältere, die Jüngeren helfen.",
  },
];

const PATH = [
  {
    title: "Grundlagen",
    meta: "Bambini bis E-Jugend",
    text: "Spaß am Spiel, gleiche Chancen für alle, kein frühes Aussortieren.",
  },
  {
    title: "Aufbau",
    meta: "D- und C-Jugend",
    text: "Neben dem Breitensport zählen Leistung und Entwicklung stärker. Zusatzangebote für Talente, zum Beispiel Torwarttraining und Athletiktraining.",
  },
  {
    title: "Leistung",
    meta: "B- und A-Jugend",
    text: "Sichtungstrainings, Videoanalyse und der neue Campus.",
  },
  {
    title: "Herren",
    meta: "Landesliga und darunter",
    text: "Probetraining bei den Herren und Einsatz in der Reserve, dann der Sprung in die 1. Mannschaft.",
  },
];

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-nord-navy underline-offset-2 transition hover:text-nord-gold hover:underline"
    >
      {children}
      <span aria-hidden className="ml-0.5 text-[0.85em]">
        ↗
      </span>
    </a>
  );
}

function Int({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-nord-navy underline-offset-2 transition hover:text-nord-gold hover:underline"
    >
      {children}
    </Link>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-nord-line py-10 first:border-t-0 md:py-14"
    >
      <h2 className="font-display text-[28px] font-black leading-tight tracking-tight text-nord-ink md:text-[36px]">
        {title}
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-[16px] leading-relaxed text-nord-muted">
        {children}
      </div>
    </section>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-nord-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function JugendkonzeptPage() {
  const teams = await cachedQuery(
    ["fussball-teams"],
    [collectionTag("teams")],
    async () => {
      const payload = await getPayloadClient();
      return payload.find({
        collection: "teams",
        where: { sport: { equals: "fussball" } },
        sort: "order",
        limit: 200,
        depth: 0,
      });
    },
  );
  const jugendCount = teams.docs.filter(
    (t) => t.category && JUGEND_CATEGORIES.has(t.category),
  ).length;

  return (
    <>
      <PageHero
        eyebrow="Verein · Jugend"
        title="Jugendkonzept"
        lede="So arbeiten wir mit Kindern und Jugendlichen beim SV Nord."
      />

      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-12">
        <div className="grid items-center gap-8 pb-4 md:grid-cols-[1fr_380px] md:gap-12">
          <p className="max-w-2xl text-[18px] leading-relaxed text-nord-ink">
            Die Fußballabteilung des SV Nord gibt es seit 1947. Heute spielen
            bei uns {jugendCount} Jugendmannschaften, von den Bambini bis zur
            U19. Dieses Konzept zeigt, wofür wir stehen und welchen Weg wir
            Kindern und Jugendlichen bieten.
          </p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-nord-line">
            <Image
              src="/jugend-bg.jpg"
              alt="Ein Junge in blauem Trikot schießt auf dem Platz den Ball"
              fill
              sizes="(min-width: 768px) 380px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <Section id="leitbild" title="Unser Leitbild">
          <p>
            Kinder spielen bei uns Fußball, weil es ihnen Spaß macht, und lernen
            dabei Fairness, Teamgeist und Verlässlichkeit. Jedes Kind soll einen
            Platz in der Mannschaft haben und jedes Talent einen Weg nach oben.
            Unser Leitsatz:{" "}
            <strong className="font-semibold text-nord-ink">
              Einmal Nordler, immer Nordler.
            </strong>
          </p>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-nord-line bg-nord-line md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white p-5">
                <dt className="font-display text-[20px] font-black text-nord-ink">
                  {v.title}
                </dt>
                <dd className="mt-2 text-[14.5px] leading-relaxed">{v.text}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="altersstufen" title="Von den Bambini bis zur U19">
          <p>
            Die Einteilung folgt der Jugendordnung des{" "}
            <Ext href={BFV_URL}>Bayerischen Fußball-Verbands</Ext>. Maßgeblich
            ist das Geburtsjahr (Stichtag 1. Januar). Im Kinderfußball spielen
            die Kinder nach den neuen Spielformen von{" "}
            <Ext href={DFB_KINDERFUSSBALL_URL}>DFB</Ext> und BFV: kleine Teams,
            kleine Felder, Spielnachmittage statt Meisterschaft. So bekommt
            jedes Kind viele Ballkontakte und gleiche Einsatzzeiten.
          </p>
          <div className="overflow-hidden rounded-2xl border border-nord-line bg-white">
            {STAGES.map((s) => (
              <div
                key={s.name}
                className="grid gap-1 border-t border-nord-line px-5 py-4 first:border-t-0 sm:grid-cols-[210px_100px_1fr] sm:gap-4"
              >
                <div className="font-display text-[16px] font-extrabold text-nord-ink">
                  {s.name}
                </div>
                <div className="font-mono text-[12px] font-bold text-nord-gold-ink sm:pt-1">
                  {s.age}
                </div>
                <div className="text-[14.5px]">{s.focus}</div>
              </div>
            ))}
          </div>
          <p>
            <strong className="font-semibold text-nord-ink">Training:</strong>{" "}
            Das reguläre Training findet zweimal pro Woche statt. Im Winter kann
            einmal in der Halle trainiert werden. Alle Mannschaften finden Sie
            auf der Seite <Int href="/fussball/junioren">Junioren</Int>.
          </p>
        </Section>

        <Section id="trainer" title="Unsere Trainer">
          <p>
            Unsere Trainerinnen und Trainer haben eine Lizenz (C oder höher) und
            bilden sich weiter. Alle Lizenzen stehen auf der Seite{" "}
            <Int href="/sport#trainerlizenzen">Sport</Int>. Wir nehmen an der
            dezentralen C-Trainer-Ausbildung des BFV teil und qualifizieren so
            eigene Trainer direkt bei uns im Verein. Unsere Athletiktrainerin
            unterstützt die Mannschaften und berät die Trainer.
          </p>
          <p>
            Alle unsere Trainer haben ein erweitertes Führungszeugnis vorgelegt
            und unterschreiben die Selbstverpflichtung des Vereins. Mehr dazu im{" "}
            <Int href="/verein/jugendschutz">Schutzkonzept</Int>.
          </p>
        </Section>

        <Section id="weg-nach-oben" title="Der Weg nach oben">
          <p>
            Wer Talent und Ehrgeiz hat, soll bei uns weiterkommen. Unsere 1.
            Mannschaft spielt in der Landesliga. Der Weg dorthin führt über die
            Jugend:
          </p>
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-nord-line bg-nord-line md:grid-cols-4">
            {PATH.map((step, i) => (
              <li key={step.title} className="bg-white p-5">
                <div className="font-display text-[13px] font-black text-nord-gold-ink">
                  Stufe {i + 1}
                </div>
                <div className="mt-1 font-display text-[18px] font-black text-nord-ink">
                  {step.title}
                </div>
                <div className="mt-0.5 text-[12px] font-semibold text-nord-muted">
                  {step.meta}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
          <p>
            <strong className="font-semibold text-nord-ink">
              Leistung und Breite:
            </strong>{" "}
            Ab der D- oder C-Jugend lassen wir neben dem Breitensportgedanken
            auch ein gewisses Leistungsprinzip zu. Leistung und Entwicklung
            werden stärker berücksichtigt und gezielt gefördert. Wir verbinden
            beides: eine gute sportliche Ausbildung für alle und Perspektiven
            für Kinder und Jugendliche, die mehr erreichen wollen.
          </p>
          <p>
            <strong className="font-semibold text-nord-ink">
              Zusatzangebote:
            </strong>{" "}
            Für besonders talentierte Kinder gibt es zusätzlich zum normalen
            Training ein Auswahltraining. In den Ferien bieten wir gemeinsam mit
            einem lokalen Anbieter Fußballcamps an. Über Sichtungstrainings
            berichten wir in den <Int href="/news">News</Int>.
          </p>
          <p>
            Wer nicht ganz nach oben kommt, bleibt bei uns: Mit Landesliga,
            Reserve, Dritter, Ehrenliga und Senioren hat der Verein Mannschaften
            auf mehreren Niveaus. Alle{" "}
            <Int href="/fussball/herren">Herren- und Seniorenmannschaften</Int>{" "}
            im Überblick.
          </p>
        </Section>

        <Section id="maedchen" title="Mädchenfußball">
          <p>
            Mädchen spielen bei uns selbstverständlich Fußball. In den jüngeren
            Jahrgängen spielen Mädchen und Jungen gemeinsam. Schon in der
            E-Jugend gibt es Mädchen, die lieber unter sich spielen. Für sie
            haben wir ein eigenes E-Juniorinnen-Team, in dem wir sie gezielt
            fördern. Der BFV lässt gemischten Spielbetrieb bis zur B-Jugend zu.
            Jede Spielerin kann deshalb mit ihren Eltern entscheiden, wo sie
            sich wohlfühlt.
          </p>
          <p>
            Unsere <Int href="/fussball/juniorinnen">Juniorinnenteams</Int> und
            das Probetraining finden Sie auf der Website.
          </p>
        </Section>

        <Section id="torwart" title="Torwarttraining">
          <p>
            Torhüter brauchen eigenes Training. Im Kinderfußball darf jedes Kind
            ins Tor, der Torwart wechselt regelmäßig. So entdecken wir Talente.
            Ab der F-Jugend gibt es einmal pro Woche Torwarttraining für alle
            Jugendmannschaften. Erfahrene Torhüter aus dem Herrenbereich leiten
            es gezielt nach bewährten Methoden. Mehr auf der Seite{" "}
            <Int href="/fussball/torwart">Torwarttraining</Int>.
          </p>
        </Section>

        <Section
          id="gemeinschaft"
          title="Kommunikation, Gemeinschaft und Eltern"
        >
          <p>
            Gute Kommunikation und Organisation sind für uns sehr wichtig. Wir
            wollen eine Gemeinschaft aufbauen, in der sich alle wohlfühlen und
            sich gegenseitig helfen.
          </p>
          <Bullets
            items={[
              <>
                <strong className="font-semibold text-nord-ink">
                  Kommunikation:
                </strong>{" "}
                Wir kommunizieren strukturiert, zum Beispiel über
                WhatsApp-Gruppen und Communities oder den Vereinsplaner. Die
                Termine planen wir mit Spond, der BFV Teams App oder dem
                Vereinsplaner, damit alle immer Bescheid wissen. Langfristig
                wollen wir den Vereinsplaner als zentrale Stelle für
                Informationen, Termine und Absprachen aufbauen.
              </>,
              <>
                <strong className="font-semibold text-nord-ink">
                  Eltern sind dabei:
                </strong>{" "}
                Sie helfen bei der Organisation des Trainings, bei Spieltagen
                und beim Verkauf von Essen und Getränken. Jede Hilfe zählt, von
                einer Stunde bis zum Fahrdienst.
              </>,
              <>
                <strong className="font-semibold text-nord-ink">
                  Gemeinsam erleben:
                </strong>{" "}
                Teamevents wie der Bodensee Cup oder gemeinsame Teamabende
                machen aus einer Mannschaft ein Team und aus Eltern Freunde.
              </>,
              <>
                <strong className="font-semibold text-nord-ink">
                  Spielfeldrand:
                </strong>{" "}
                Anfeuern und Loben, ohne in das Spiel einzugreifen. Im
                Kinderfußball halten Eltern Abstand zum Spielfeld. Respekt
                gegenüber Schiedsrichtern, Gegnern und anderen Kindern.
              </>,
              <>
                <strong className="font-semibold text-nord-ink">Fragen:</strong>{" "}
                Zur Aufstellung oder Spielzeit zuerst an den Trainer. Danach
                hilft die Jugendleitung weiter, zuletzt der Vorstand.
              </>,
            ]}
          />
          <p>
            Sie möchten mithelfen? Schreiben Sie uns an{" "}
            <a
              href="mailto:info@svnord.de"
              className="font-semibold text-nord-navy underline-offset-2 hover:text-nord-gold hover:underline"
            >
              info@svnord.de
            </a>
            . Der{" "}
            <Int href="/verein/jugendfoerderverein">Jugendförderverein</Int>{" "}
            unterstützt Trainingslager, Ausrüstung und Teamevents (Jahresbeitrag
            ab 24 Euro).
          </p>
        </Section>

        <Section id="organisation" title="Organisation und Kontakt">
          <Bullets
            items={[
              <>
                Sportlicher Leiter und Jugendleitung stehen auf der Seite{" "}
                <Int href="/verein/vorstand">Vorstand</Int>.
              </>,
              <>
                Training: Bezirkssportanlage Ebereschenstraße 17 und Halle der
                Grundschule Waldmeisterstraße 38.
              </>,
              <>
                Anmelden: <Int href="/kontakt">Probetraining anfragen</Int>,{" "}
                <Int href="/mitgliedschaft">Mitglied werden</Int>,{" "}
                <Int href="/verein/spielerpass">Spielerpass beantragen</Int>.
              </>,
              <>
                Sicherheit der Kinder:{" "}
                <Int href="/verein/jugendschutz">unser Schutzkonzept</Int>.
              </>,
            ]}
          />
        </Section>

        <p className="border-t border-nord-line pt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-nord-muted">
          Stand · November 2026
        </p>
      </div>
    </>
  );
}
