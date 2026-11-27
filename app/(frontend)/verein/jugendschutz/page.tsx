import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { LegalSections } from "@/components/legal/LegalSections";
import type { LegalSection } from "@/components/legal/types";

const LAST_UPDATED = "November 2026";

const BSJ_PSG = "https://bsj.org/startseite/verein/psg/";
const BSJ_VERHALTENSREGELN =
  "https://bsj.org/wp-content/uploads/2026/09/2026_Verhaltensregeln.pdf";
const BSJ_SELBSTVERPFLICHTUNG =
  "https://bsj.org/wp-content/uploads/2023/11/PsG-Selbstverpflichtung_2023.pdf";

// Wir nutzen denselben strukturellen Baustein wie Impressum und Datenschutz
// (LegalSections), damit die Seite zu den Textseiten passt. LegalLayout selbst
// wird bewusst nicht verwendet, da dessen feste Badges (Rechtlich verbindlich,
// DSGVO / TMG / MStV) und die Kopfzeile "Verantwortlicher" auf einer
// Kinder- und Jugendschutzseite irreführend wären.
const SECTIONS: LegalSection[] = [
  {
    id: "ansprechpersonen",
    num: "01",
    title: "An wen kann ich mich wenden?",
    icon: "user",
    intro: "Ansprechpersonen und Hilfe",
    blocks: [
      {
        kind: "lead",
        text: "Wenn Sie oder Ihr Kind etwas beschäftigt, sprechen Sie uns an. Auf Wunsch behandeln wir jeden Hinweis vertraulich.",
      },
      {
        kind: "kv",
        rows: [
          {
            k: "Im Verein",
            v: "Jugendleitung und Vorstand",
            href: "/verein/vorstand",
          },
          {
            k: "Mail",
            v: "info@svnord.de",
            href: "mailto:info@svnord.de",
          },
          {
            k: "BSJ / BLSV",
            v: "089 / 15702-555",
            href: "tel:+498915702555",
          },
          {
            k: "Kinder und Jugendliche",
            v: "Kinder- und Jugendtelefon 116 111",
            href: "tel:116111",
          },
          {
            k: "Akute Gefahr",
            v: "Polizei 110",
            href: "tel:110",
          },
        ],
      },
      {
        kind: "p",
        text: "Das Team Prävention sexualisierter Gewalt von Bayerischer Sportjugend und BLSV erreichen Sie auch per Mail an [psg@blsv.de](mailto:psg@blsv.de). Das Kinder- und Jugendtelefon der [Nummer gegen Kummer](https://www.nummergegenkummer.de) ist kostenlos.",
      },
    ],
  },
  {
    id: "schutzauftrag",
    num: "02",
    title: "Unser Auftrag",
    icon: "shield",
    intro: "Respektvoll und achtsam",
    blocks: [
      {
        kind: "lead",
        text: "Kinder und Jugendliche sollen beim SV Nord Sport treiben können, ohne Angst und mit der Sicherheit, dass Erwachsene verantwortungsvoll mit ihnen umgehen. Wir schauen hin, wir sprechen darüber und wir handeln.",
      },
      {
        kind: "p",
        text:
          "Das gilt für sexualisierte, körperliche und seelische Gewalt ebenso wie für Mobbing, Diskriminierung und Grenzverletzungen unter Kindern. Wir sind alle gefordert, wachsam zu sein und vorzubeugen, damit Täter und Täterinnen keine Möglichkeiten bekommen. Unser Schutzkonzept orientiert sich an den Empfehlungen der [Bayerischen Sportjugend im BLSV](" +
          BSJ_PSG +
          ").",
      },
    ],
  },
  {
    id: "verhaltensregeln",
    num: "03",
    title: "Unsere Verhaltensregeln",
    icon: "doc",
    intro: "Für Trainer, Betreuer und Helfer",
    blocks: [
      {
        kind: "p",
        text:
          "Die Regeln geben Orientierung in Situationen besonderer Nähe. Sie gelten für alle, die im Verein mit Kindern arbeiten, und folgen den [Verhaltensregeln der BSJ](" +
          BSJ_VERHALTENSREGELN +
          ").",
      },
      { kind: "h3", text: "Training" },
      {
        kind: "ul",
        items: [
          "Umkleiden betreten Erwachsene nur nach Klopfen und Aufforderung.",
          "Körperkontakt zur Hilfestellung gibt es nur, wenn er nötig ist und das Kind einverstanden ist.",
          "**Erwachsene duschen nicht gemeinsam mit Kindern und Jugendlichen. Dafür gibt es keine Ausnahme.** Keine Besprechungen unter der Dusche oder beim Umziehen.",
          "Einzeltraining, zum Beispiel beim Torwarttraining, findet möglichst im Sechs-Augen-Prinzip oder bei offener Tür statt.",
        ],
      },
      { kind: "h3", text: "Fahrten und Trainingslager" },
      {
        kind: "ul",
        items: [
          "Trainer sind nicht mit einem Kind allein in einem Raum. Die Tür bleibt offen oder eine weitere Betreuungsperson kommt dazu.",
          "Trainer und Kinder schlafen in getrennten Zimmern. Wenn das nicht geht, sind zwei Trainer im Raum.",
          "Einzelne Kinder werden nicht im Auto mitgenommen. Ausnahmen werden erklärt und mit den Eltern abgesprochen.",
        ],
      },
      { kind: "h3", text: "Gespräche und Nähe" },
      {
        kind: "ul",
        items: [
          "Keine Geheimnisse und keine Geschenke an einzelne Kinder. Vertrauliche Gespräche finden bei offener Tür statt.",
          "Trösten und Mut machen ist erlaubt, wenn das Kind es möchte, und nur in der Öffentlichkeit der Gruppe.",
          "Keine sexistischen, abwertenden oder diskriminierenden Bemerkungen, auch nicht in sozialen Medien.",
        ],
      },
      { kind: "h3", text: "Fotos und Messenger" },
      {
        kind: "ul",
        items: [
          "Fotos und Videos entstehen nur zu Vereinszwecken und mit Einwilligung der Eltern. In Umkleide, Dusche und Schlafraum gibt es keine Aufnahmen.",
          "Kontakt zu Kindern läuft offen, am besten über Gruppenchats mit den Eltern. Trainer schicken Kindern keine privaten Freundschaftsanfragen in sozialen Medien.",
        ],
      },
      {
        kind: "p",
        text: "Wenn sich eine andere Regel in einer besonderen Situation nicht einhalten lässt, machen wir das transparent und sprechen es mit dem Vorstand ab. Das gemeinsame Duschen von Erwachsenen mit Kindern und Jugendlichen ist davon ausgenommen.",
      },
    ],
  },
  {
    id: "trainer",
    num: "04",
    title: "Unsere Trainer",
    icon: "key",
    intro: "Führungszeugnis und Selbstverpflichtung",
    blocks: [
      {
        kind: "ul",
        items: [
          "**Erweitertes Führungszeugnis:** Alle unsere Trainer und Übungsleiter haben dem Verein ein erweitertes Führungszeugnis vorgelegt. Neue Trainer legen es vor dem ersten Training vor. Es sorgt dafür, dass wegen bestimmter Straftaten Verurteilte nicht im Kinder- und Jugendbereich eingesetzt werden. Die Einsichtnahme wird dokumentiert, eine Kopie wird nicht angefertigt. Alle fünf Jahre wird das Zeugnis erneut vorgelegt. Für Ehrenamtliche ist es kostenlos, der Verein stellt die Bescheinigung aus.",
          "**Selbstverpflichtung:** Alle Trainer, Betreuer und Übungsleiter im Kinder- und Jugendbereich unterschreiben die [Selbstverpflichtung der BSJ](" +
            BSJ_SELBSTVERPFLICHTUNG +
            "). Sie versprechen darin, die Grenzen der Kinder zu achten, ihre Vertrauensstellung nicht zu missbrauchen und Grenzverletzungen weder zu dulden noch zu vertuschen.",
          "**Schulung:** Die Prävention sexualisierter Gewalt ist Teil der Übungsleiter-Ausbildung des BLSV. Zusätzlich nutzen wir Fortbildungsangebote von BSJ und BLSV.",
        ],
      },
    ],
  },
  {
    id: "praevention",
    num: "05",
    title: "Wenn etwas passiert",
    icon: "gavel",
    intro: "Ablauf im Verdachtsfall",
    blocks: [
      {
        kind: "p",
        text: "Wir richten uns nach dem Ablauf der Bayerischen Sportjugend für den Verdachtsfall:",
      },
      {
        kind: "ul",
        items: [
          "**1. Zuhören:** ruhig und zugewandt, ohne Detailfragen, nichts versprechen. Aufschreiben, was berichtet wurde. Einem Kind, das einen Verdacht äußert, schenken wir zunächst Glauben.",
          "**2. Melden:** Jede und jeder im Verein kann sich an die Jugendleitung oder den Vorstand wenden. Der Hinweis wird ernst genommen und vertraulich behandelt. Das gilt auch für Berichte von Eltern über Verstöße gegen unsere Regeln.",
          "**3. Einschätzen:** Möglichst zu zweit bewerten wir, was vorliegt. Bei leichten, erstmaligen Verstößen weisen wir die Person auf die Regeln hin. Bei wiederholten Verstößen oder einem begründeten Verdacht holen wir Rat bei einer Fachberatungsstelle.",
          "**4. Schützen:** Wir sorgen für die Sicherheit des Kindes, informieren die Eltern, soweit das das Kind nicht gefährdet, und ziehen die Verantwortlichen im Verein so weit hinzu, wie nötig. Bei dringenden und schwerwiegenden Fällen geben wir das weitere Vorgehen an Fachleute ab.",
          "**5. Aufarbeiten:** Der Vorstand entscheidet über Maßnahmen. Wir dokumentieren das Vorgehen und lernen daraus. Ist ein Verdacht unbegründet, stellen wir das klar und rehabilitieren die betroffene Person.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Dringender Rat",
        text: "Suchen Sie sofort fachliche Unterstützung bei einer Beratungsstelle oder dem zuständigen Jugendamt. Fotos oder Videos mit sexualisierten Inhalten, die Minderjährige zeigen, dürfen nicht gespeichert oder weitergeleitet werden.",
      },
    ],
  },
  {
    id: "hintergrund",
    num: "06",
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
        text: "Sexuelle Gewalt ist eine Grenzverletzung und meint jede sexuelle Handlung, die an einer anderen Person gegen deren Willen vorgenommen wird. Gerade im Sport gibt es eine Sondersituation durch das große Vertrauensverhältnis und das bestehende Macht- und Abhängigkeitsverhältnis zwischen Trainerinnen/Trainern und Spielerinnen/Spielern. Die besonderen Situationen in der Umkleide, beim Duschen und die Trainingslager mit Übernachtungen verlangen gezielte Schutzvereinbarungen. Sie sichern die Kinder und Jugendlichen und geben auch Trainerinnen/Trainern und Betreuerinnen/Betreuern Sicherheit, in welchen Situationen besondere Rücksicht zu nehmen ist.",
      },
    ],
  },
  {
    id: "beratung",
    num: "07",
    title: "Beratung und Hilfe",
    icon: "globe",
    intro: "Anlaufstellen",
    blocks: [
      {
        kind: "linkRow",
        label: "Stadtjugendamt München",
        href: "https://stadt.muenchen.de/infos/jugendamt.html",
        sub: "Beratung und Hilfe bei Kindeswohlgefährdung",
      },
      {
        kind: "linkRow",
        label: "Jugendämter in Bayern",
        href: "https://www.bayernportal.de/dokumente/behoerdeordner/87332722131",
        sub: "BayernPortal: das Jugendamt am Wohnort finden",
      },
      {
        kind: "linkRow",
        label: "Hilfe-Portal Sexueller Missbrauch",
        href: "https://www.hilfe-portal-missbrauch.de",
        sub: "Beratungsstellen in Ihrer Nähe",
      },
      {
        kind: "linkRow",
        label: "Anlauf gegen Gewalt",
        href: "https://www.anlauf-gegen-gewalt.org",
        sub: "Hilfe im Sport",
      },
      {
        kind: "linkRow",
        label: "Ansprechstelle Safe Sport",
        href: "https://ansprechstelle-safe-sport.de",
        sub: "Unabhängige Anlaufstelle bei Gewalt im Sport",
      },
      {
        kind: "linkRow",
        label: "Bayern gegen Gewalt",
        href: "https://bayern-gegen-gewalt.de",
        sub: "Hilfsangebote des Freistaats",
      },
      {
        kind: "linkRow",
        label: "Kein Täter werden",
        href: "https://kein-taeter-werden.de",
        sub: "Für Menschen, die Angst haben, übergriffig zu werden",
      },
      {
        kind: "p",
        text: "Wir prüfen dieses Konzept einmal im Jahr und passen es nach Vorfällen an.",
      },
    ],
  },
];

const SIDE_LINKS = [
  { href: "/verein/vorstand", label: "Vorstand" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/impressum", label: "Impressum" },
];

export const metadata = {
  title: "Kinder- & Jugendschutz · Verein",
  alternates: { canonical: "/verein/jugendschutz" },
};

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
                Hilfe und Kontakt
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/75">
                Sprechen Sie uns an. Wir nehmen jeden Hinweis ernst und
                behandeln ihn auf Wunsch vertraulich.
              </p>
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
                <Link
                  href="/verein/vorstand"
                  className="block text-white/85 transition hover:text-nord-gold"
                >
                  Jugendleitung und Vorstand →
                </Link>
                <a
                  href="tel:+498915702555"
                  className="block text-white/85 transition hover:text-nord-gold"
                >
                  BSJ / BLSV · 089 / 15702-555
                </a>
                <a
                  href="tel:116111"
                  className="block text-white/85 transition hover:text-nord-gold"
                >
                  Kinder- und Jugendtelefon · 116 111
                </a>
                <a
                  href="tel:110"
                  className="block text-white/85 transition hover:text-nord-gold"
                >
                  Bei akuter Gefahr · 110
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
