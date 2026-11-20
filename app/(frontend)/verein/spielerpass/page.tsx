import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { SpielerpassForm } from "@/components/SpielerpassForm";
import { ANTRAG_TEMPLATE } from "@/lib/spielerpass";

export const metadata: Metadata = {
  title: "Spielerpass beantragen",
  description:
    "Antrag auf Spielberechtigung online ausfüllen: Das Formular des BFV wird mit deinen Angaben und deiner Unterschrift erstellt.",
  alternates: { canonical: "/verein/spielerpass" },
};

export default function SpielerpassPage() {
  return (
    <>
      <PageHero
        eyebrow="Für Spieler und Eltern"
        title="Spielerpass beantragen."
        lede="Gib deine Angaben ein, wir erstellen daraus den fertig ausgefüllten Antrag auf Spielberechtigung des BFV. Du unterschreibst am Handy oder mit der Maus und schickst uns die Datei."
      />

      <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
        <section className="rounded-2xl border border-nord-line bg-white p-6 shadow-[0_1px_0_rgba(11,27,63,0.04)] md:p-10">
          <div className="mb-7 md:mb-9">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold-ink">
              Dauert zwei Minuten
            </div>
            <h2
              className="mt-2 font-display font-black leading-[1.05] text-nord-ink"
              style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}
            >
              So funktioniert&apos;s.
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-nord-muted">
              Das Formular wird in deinem Browser erstellt. Deine Angaben werden
              dabei nicht an uns übertragen und nicht gespeichert. Die
              Vereinsangaben (Vereinsnummer, Unterschrift und Stempel des
              Vereins) ergänzt der Verein. Voraussetzung ist die Mitgliedschaft
              im SV Nord, siehe{" "}
              <Link href="/mitgliedschaft" className="underline">
                Mitgliedschaft
              </Link>
              .
            </p>
          </div>

          <SpielerpassForm />
        </section>

        <p className="mt-6 text-sm leading-relaxed text-nord-muted">
          Lieber von Hand ausfüllen? Hier sind die leeren Formulare des BFV:{" "}
          <a href={ANTRAG_TEMPLATE.junioren} className="underline">
            Junioren/Juniorinnen
          </a>
          ,{" "}
          <a href={ANTRAG_TEMPLATE.erwachsene} className="underline">
            Herren/Senioren/Frauen
          </a>{" "}
          (PDF, gültig ab 1. Juli 2026).
        </p>
      </div>
    </>
  );
}
