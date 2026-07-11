import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { LegalSections } from "@/components/legal/LegalSections";
import type { LegalSection } from "@/components/legal/types";

export const dynamic = "force-dynamic";

const LAST_UPDATED = "2. Juni 2026";

// Wir nutzen denselben strukturellen Baustein wie Impressum und Datenschutz
// (LegalSections), damit die Seite zu den Textseiten passt. LegalLayout selbst
// wird bewusst nicht verwendet, da dessen feste Badges (Rechtlich verbindlich,
// DSGVO / TMG / MStV) und die Kopfzeile "Verantwortlicher" auf einer
// Kinder- und Jugendschutzseite irreführend wären.
const SECTIONS: LegalSection[] = [
  {
    id: "fuehrungszeugnis",
    num: "01",
    title: "Erweitertes Führungszeugnis",
    icon: "shield",
    intro: "Grundlage des Kinder- und Jugendschutzes",
    blocks: [
      {
        kind: "lead",
        text: "Die Verpflichtung zur Vorlage eines erweiterten Führungszeugnisses ist eine der wichtigsten Maßnahmen zum Kinder- und Jugendschutz im Verein. Sie sorgt dafür, dass Personen, die wegen bestimmter Straftaten (insbesondere Sexualdelikten) verurteilt wurden, nicht im Kinder- und Jugendbereich eingesetzt werden.",
      },
      {
        kind: "p",
        text: "Alle unsere Trainer und Übungsleiter haben dem Verein ein erweitertes Führungszeugnis vorgelegt. Siehe auch [Bayerischer Fußball-Verband](https://www.bfv.de).",
      },
    ],
  },
  {
    id: "schutzauftrag",
    num: "02",
    title: "Schutz vor sexuellem Missbrauch",
    icon: "user",
    intro: "Unser gemeinsamer Auftrag",
    blocks: [
      {
        kind: "p",
        text: "Schutz vor sexuellem Missbrauch bedeutet, respektvoll und achtsam mit den uns anvertrauten Kindern und Jugendlichen umzugehen. Wir haben eine Mitverantwortung, dass Kinder und Jugendliche bei uns sicher sind. Wir wollen sie vor sexuellem Missbrauch in allen unseren Angebotsbereichen schützen und sind dabei alle gefordert, wachsam zu sein und auch präventiv zu arbeiten, um die Möglichkeiten für Täter und Täterinnen zu minimieren.",
      },
    ],
  },
  {
    id: "hintergrund",
    num: "03",
    title: "Hintergrund und Zahlen",
    icon: "scale",
    intro: "Daten der Bayerischen Sportjugend",
    blocks: [
      {
        kind: "p",
        text: "Die Zahlen der Bayerischen Sportjugend zur sexuellen Gewalt in Deutschland sind erschreckend:",
      },
      {
        kind: "ul",
        items: [
          "Jedes vierte bis fünfte Mädchen und jeder achte bis zehnte Junge unter 18 ist betroffen.",
          "Männer und Frauen können Täter bzw. Täterin sein (85 bis 90 % männlich).",
          "Die Täterinnen und Täter kommen aus allen Altersgruppen (etwa ein Drittel ist unter 21 Jahre alt).",
          "Die Täterinnen und Täter kommen meist aus dem sozialen Umfeld des Opfers (Familie ca. 20 bis 30 %, Bekannte ca. 50 %, Fremde ca. 10 bis 15 %).",
        ],
      },
      {
        kind: "p",
        text: "Eine aktuelle Fallstudie des Bundesministeriums für Bildung, Familie, Senioren, Frauen und Jugend (BMFSFJ) verdeutlicht die Situation und den Handlungsbedarf.",
      },
      {
        kind: "p",
        text: "Sexuelle Gewalt ist eine Grenzverletzung und meint jede sexuelle Handlung, die an einer anderen Person gegen deren Willen vorgenommen wird. Gerade im Sport gibt es eine Sondersituation durch das große Vertrauensverhältnis und das bestehende Macht- und Abhängigkeitsverhältnis zwischen Trainerinnen/Trainern und Spielerinnen/Spielern. Die besonderen Situationen in der Umkleide, beim Duschen und die Trainingslager mit Übernachtungen verlangen gezielte Schutzvereinbarungen für die Sicherheit der Kinder und Jugendlichen, aber auch um den Trainerinnen/Trainern und Betreuerinnen/Betreuern Sicherheit zu geben, in welchen Situationen besondere Rücksicht zu nehmen ist.",
      },
    ],
  },
  {
    id: "praevention",
    num: "04",
    title: "Prävention und Verdachtsfall",
    icon: "gavel",
    intro: "Was tun im Verdachtsfall?",
    blocks: [
      {
        kind: "p",
        text: "Prävention vor sexuellem Missbrauch, was tun im Verdachtsfall?",
      },
      {
        kind: "ul",
        items: [
          "Wird ein Verdacht durch ein Kind oder einen Jugendlichen geäußert, ist diesem zunächst Glauben zu schenken und sorgfältig zuzuhören.",
          "Auch Schilderungen von Eltern oder anderen Beteiligten über Verstöße gegen Schutzvereinbarungen sind ernst zu nehmen.",
          "Bei leichten und erstmaligen Verstößen ist die betreffende Person seitens der Vereinsverantwortlichen auf die Einhaltung hinzuweisen.",
          "Bei mehrfachen oder wiederholten Verstößen noch ohne Hinweise auf sexuelle Übergriffe ist umgehend eine Fachberatungsstelle zu Rate zu ziehen.",
          "Bei dringenden und schwerwiegenden Verdachtsfällen dürfen die Hinweise nicht ignoriert werden; das weitere Vorgehen ist an Fachleute abzugeben.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Dringender Rat",
        text: "Wir raten dringend, sofort fachliche Unterstützung zu suchen und sich an eine Beratungsstelle oder das zuständige Jugendamt zu wenden.",
      },
    ],
  },
  {
    id: "beratung",
    num: "05",
    title: "Beratung und Hilfe",
    icon: "globe",
    intro: "Anlaufstellen und weitere Hinweise",
    blocks: [
      {
        kind: "linkRow",
        label: "www.praetect.de",
        href: "https://www.praetect.de",
        sub: "Beratungsstellen und weitere Hinweise",
      },
      {
        kind: "linkRow",
        label: "Kontaktdaten der örtlichen Jugendämter",
        href: "http://www.stmas.bayern.de/familie/beratung/jugendamt/index.htm",
        sub: "Bayerisches Staatsministerium für Familie, Arbeit und Soziales",
      },
    ],
  },
];

const SIDE_LINKS = [
  { href: "/verein/vorstand", label: "Vorstand" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/impressum", label: "Impressum" },
];

export default function JugendschutzPage() {
  return (
    <>
      <PageHero
        eyebrow="Verein · Schutzkonzept"
        title="Kinder- & Jugendschutz"
        lede="Schutzkonzept des SV Nord München-Lerchenau e.V. für den respektvollen und sicheren Umgang mit den uns anvertrauten Kindern und Jugendlichen."
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-nord-line pb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-nord-muted">
          <span className="rounded-full border border-nord-line bg-white px-3 py-1">
            Stand · {LAST_UPDATED}
          </span>
          <span className="rounded-full border border-nord-gold/40 bg-nord-gold/10 px-3 py-1 text-nord-navy">
            Schutzkonzept
          </span>
          <span className="rounded-full border border-nord-line bg-white px-3 py-1">
            Erweitertes Führungszeugnis
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_280px] md:gap-12">
          <article className="min-w-0">
            <LegalSections sections={SECTIONS} />
          </article>

          <aside className="space-y-5 md:sticky md:top-24 md:h-fit md:self-start">
            <div className="rounded-2xl bg-nord-ink p-6 text-white">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                Im Verdachtsfall
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/75">
                Wir raten dringend, sofort fachliche Unterstützung zu suchen und
                sich an eine Beratungsstelle oder das zuständige Jugendamt zu
                wenden.
              </p>
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
                <a
                  href="https://www.praetect.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-white/85 transition hover:text-nord-gold"
                >
                  www.praetect.de ↗
                </a>
                <a
                  href="http://www.stmas.bayern.de/familie/beratung/jugendamt/index.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white/85 transition hover:text-nord-gold"
                >
                  Örtliche Jugendämter (StMAS Bayern) ↗
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                Auch nützlich
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {SIDE_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center gap-1.5 font-display font-semibold text-nord-navy transition hover:text-nord-gold"
                    >
                      {l.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
