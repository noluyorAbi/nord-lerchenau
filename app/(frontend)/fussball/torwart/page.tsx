import Link from "next/link";
import type { ReactNode } from "react";

import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Torwarttraining · Fußball",
  description:
    "Einmal pro Woche gezieltes Torwarttraining für alle Jugendmannschaften ab der F-Jugend, geleitet von erfahrenen Torhütern aus dem Herrenbereich.",
  alternates: { canonical: "/fussball/torwart" },
};

const FACTS = [
  {
    title: "Einmal pro Woche",
    text: "feste Torwarteinheit, parallel zum Mannschaftstraining",
  },
  {
    title: "Ab der F-Jugend",
    text: "für Torhüterinnen und Torhüter aller Jugendmannschaften",
  },
  {
    title: "Erfahrene Torhüter",
    text: "aus dem Herrenbereich leiten das Training",
  },
];

const TOPICS = [
  {
    title: "Grundtechniken",
    text: "Fangen, Abwehren, Fallen und Abrollen, in jeder Altersstufe so, dass es zum Körper passt.",
  },
  {
    title: "Stellungsspiel",
    text: "Das richtige Verhalten im Tor: Position, Winkel und Grundstellung.",
  },
  {
    title: "Eins-gegen-eins",
    text: "Mutig rauskommen, Winkel verkürzen, den Moment des Schusses lesen.",
  },
  {
    title: "Flanken und hohe Bälle",
    text: "Herauslaufen, Fangen oder Faustabwehr und die Beherrschung des Strafraums.",
  },
  {
    title: "Spieleröffnung",
    text: "Abwurf, Abschlag und Passspiel mit dem Fuß, weil der Torwart heute mitspielt.",
  },
  {
    title: "Kommunikation und Kopf",
    text: "Die Abwehr dirigieren, nach einem Gegentor weitermachen, Selbstvertrauen aufbauen.",
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-nord-line py-10 first:border-t-0 md:py-12">
      <h2 className="font-display text-[26px] font-black leading-tight tracking-tight text-nord-ink md:text-[32px]">
        {title}
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-[16px] leading-relaxed text-nord-muted">
        {children}
      </div>
    </section>
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

export default function TorwartPage() {
  return (
    <>
      <PageHero
        eyebrow="Fußball · Torwart"
        title="Torwarttraining"
        lede="Einmal pro Woche trainieren unsere Torhüterinnen und Torhüter gezielt, von der F-Jugend bis zur U19."
      />

      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-12">
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-nord-line bg-nord-line md:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.title} className="bg-white p-6">
              <dt className="font-display text-[22px] font-black text-nord-ink">
                {f.title}
              </dt>
              <dd className="mt-1.5 text-[14.5px] leading-relaxed text-nord-muted">
                {f.text}
              </dd>
            </div>
          ))}
        </dl>

        <Section title="Warum ein eigenes Torwarttraining?">
          <p>
            Torhüter haben eine eigene Rolle: Sie spielen mit den Händen,
            verteidigen das Tor und starten das Spiel. Das lässt sich im
            normalen Mannschaftstraining nur schwer gezielt üben. Deshalb
            trainieren Torhüterinnen und Torhüter bei uns einmal pro Woche
            gezielt, parallel zum Mannschaftstraining.
          </p>
          <p>
            Im Kinderfußball darf jedes Kind ins Tor und der Torwart wechselt
            regelmäßig. Das Angebot ab der F-Jugend gibt denen, die gern im Tor
            stehen, die Chance, besser zu werden.
          </p>
        </Section>

        <Section title="Was Torhüter bei uns lernen">
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-nord-line bg-nord-line md:grid-cols-2">
            {TOPICS.map((t) => (
              <li key={t.title} className="bg-white p-5">
                <div className="font-display text-[17px] font-extrabold text-nord-ink">
                  {t.title}
                </div>
                <p className="mt-1 text-[14.5px] leading-relaxed">{t.text}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Wer trainiert?">
          <p>
            Das Training leiten erfahrene Torhüter aus dem Herrenbereich. Sie
            arbeiten gezielt nach bewährten Methoden und geben ihr Wissen an die
            nächste Generation weiter. So lernen die Kinder von Spielern, die
            selbst im Tor stehen.
          </p>
        </Section>

        <Section title="Sicherheit im Training">
          <p>
            Für das Torwarttraining gelten die Verhaltensregeln aus unserem{" "}
            <Int href="/verein/jugendschutz">Schutzkonzept</Int>. Beim
            Einzeltraining gilt zum Beispiel das Sechs-Augen-Prinzip oder die
            offene Tür.
          </p>
        </Section>

        <Section title="Mitmachen">
          <p>
            Sie möchten, dass Ihr Kind mitmacht, oder fragen sich, ob das
            Torwarttraining zu ihm passt? Schreiben Sie uns über das{" "}
            <Int href="/kontakt">Kontaktformular</Int>. Alle Jugendmannschaften
            finden Sie auf der Seite{" "}
            <Int href="/fussball/junioren">Junioren</Int>, mehr über unsere
            Jugendarbeit im{" "}
            <Int href="/verein/jugendkonzept">Jugendkonzept</Int>.
          </p>
        </Section>
      </div>
    </>
  );
}
