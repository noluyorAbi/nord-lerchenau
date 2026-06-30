import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { LegalSections } from "@/components/legal/LegalSections";
import type { LegalSection } from "@/components/legal/types";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

// Hardcoded fallbacks: the page must render identically to before when the
// "jugendschutz-page" global is empty. Every CMS read below falls back to the
// matching constant here, so there is zero visual regression without data.
const HERO_EYEBROW = "Verein · Schutzkonzept";
const HERO_TITLE = "Kinder- & Jugendschutz";
const HERO_LEDE =
  "Schutzkonzept des SV Nord München-Lerchenau e.V. für den respektvollen und sicheren Umgang mit den uns anvertrauten Kindern und Jugendlichen.";

const LAST_UPDATED = "2. Juni 2026";
const BADGE_SCHUTZKONZEPT = "Schutzkonzept";
const BADGE_FUEHRUNGSZEUGNIS = "Erweitertes Führungszeugnis";

const S1_TITLE = "Erweitertes Führungszeugnis";
const S1_INTRO = "Grundlage des Kinder- und Jugendschutzes";
const S1_LEAD =
  "Die Verpflichtung zur Vorlage eines erweiterten Führungszeugnisses ist eine der wichtigsten Maßnahmen zum Kinder- und Jugendschutz im Verein. Sie sorgt dafür, dass Personen, die wegen bestimmter Straftaten (insbesondere Sexualdelikten) verurteilt wurden, nicht im Kinder- und Jugendbereich eingesetzt werden.";
const S1_BODY =
  "Alle unsere Trainer und Übungsleiter haben dem Verein ein erweitertes Führungszeugnis vorgelegt.";
const S1_BFV_LABEL = "Bayerischer Fußball-Verband";
const S1_BFV_HREF = "https://www.bfv.de";

const S2_TITLE = "Schutz vor sexuellem Missbrauch";
const S2_INTRO = "Unser gemeinsamer Auftrag";
const S2_BODY =
  "Schutz vor sexuellem Missbrauch bedeutet, respektvoll und achtsam mit den uns anvertrauten Kindern und Jugendlichen umzugehen. Wir haben eine Mitverantwortung, dass Kinder und Jugendliche bei uns sicher sind. Wir wollen sie vor sexuellem Missbrauch in allen unseren Angebotsbereichen schützen und sind dabei alle gefordert, wachsam zu sein und auch präventiv zu arbeiten, um die Möglichkeiten für Täter und Täterinnen zu minimieren.";

const S3_TITLE = "Hintergrund und Zahlen";
const S3_INTRO = "Daten der Bayerischen Sportjugend";
const S3_BODY1 =
  "Die Zahlen der Bayerischen Sportjugend zur sexuellen Gewalt in Deutschland sind erschreckend:";
const S3_ITEMS = [
  "Jedes vierte bis fünfte Mädchen und jeder achte bis zehnte Junge unter 18 ist betroffen.",
  "Männer und Frauen können Täter bzw. Täterin sein (85 bis 90 % männlich).",
  "Die Täterinnen und Täter kommen aus allen Altersgruppen (etwa ein Drittel ist unter 21 Jahre alt).",
  "Die Täterinnen und Täter kommen meist aus dem sozialen Umfeld des Opfers (Familie ca. 20 bis 30 %, Bekannte ca. 50 %, Fremde ca. 10 bis 15 %).",
];
const S3_BODY2 =
  "Sexuelle Gewalt ist eine Grenzverletzung und meint jede sexuelle Handlung, die an einer anderen Person gegen deren Willen vorgenommen wird. Gerade im Sport gibt es eine Sondersituation durch das große Vertrauensverhältnis und das bestehende Macht- und Abhängigkeitsverhältnis zwischen Trainerinnen/Trainern und Spielerinnen/Spielern. Die besonderen Situationen in der Umkleide, beim Duschen und die Trainingslager mit Übernachtungen verlangen gezielte Schutzvereinbarungen für die Sicherheit der Kinder und Jugendlichen, aber auch um den Trainerinnen/Trainern und Betreuerinnen/Betreuern Sicherheit zu geben, in welchen Situationen besondere Rücksicht zu nehmen ist.";

const S4_TITLE = "Prävention und Verdachtsfall";
const S4_INTRO = "Was tun im Verdachtsfall?";
const S4_BODY =
  "Prävention vor sexuellem Missbrauch, was tun im Verdachtsfall?";
const S4_ITEMS = [
  "Wird ein Verdacht durch ein Kind oder einen Jugendlichen geäußert, ist diesem zunächst Glauben zu schenken und sorgfältig zuzuhören.",
  "Auch Schilderungen von Eltern oder anderen Beteiligten über Verstöße gegen Schutzvereinbarungen sind ernst zu nehmen.",
  "Bei leichten und erstmaligen Verstößen ist die betreffende Person seitens der Vereinsverantwortlichen auf die Einhaltung hinzuweisen.",
  "Bei mehrfachen oder wiederholten Verstößen noch ohne Hinweise auf sexuelle Übergriffe ist umgehend eine Fachberatungsstelle zu Rate zu ziehen.",
  "Bei dringenden und schwerwiegenden Verdachtsfällen dürfen die Hinweise nicht ignoriert werden; das weitere Vorgehen ist an Fachleute abzugeben.",
];
const S4_CALLOUT_TITLE = "Dringender Rat";
const S4_CALLOUT_TEXT =
  "Wir raten dringend, sofort fachliche Unterstützung zu suchen und sich an eine Beratungsstelle oder das zuständige Jugendamt zu wenden.";

const S5_TITLE = "Beratung und Hilfe";
const S5_INTRO = "Anlaufstellen und weitere Hinweise";
const S5_LINK1_LABEL = "www.praetect.de";
const S5_LINK1_HREF = "https://www.praetect.de";
const S5_LINK1_SUB = "Beratungsstellen und weitere Hinweise";
const S5_LINK2_LABEL = "Kontaktdaten der örtlichen Jugendämter";
const S5_LINK2_HREF =
  "http://www.stmas.bayern.de/familie/beratung/jugendamt/index.htm";
const S5_LINK2_SUB =
  "Bayerisches Staatsministerium für Familie, Arbeit und Soziales";

const ASIDE_VERDACHT_EYEBROW = "Im Verdachtsfall";
const ASIDE_VERDACHT_TEXT =
  "Wir raten dringend, sofort fachliche Unterstützung zu suchen und sich an eine Beratungsstelle oder das zuständige Jugendamt zu wenden.";
const ASIDE_VERDACHT_LINK1_LABEL = "www.praetect.de";
const ASIDE_VERDACHT_LINK1_HREF = "https://www.praetect.de";
const ASIDE_VERDACHT_LINK2_LABEL = "Örtliche Jugendämter (StMAS Bayern)";
const ASIDE_VERDACHT_LINK2_HREF =
  "http://www.stmas.bayern.de/familie/beratung/jugendamt/index.htm";

const ASIDE_USEFUL_EYEBROW = "Auch nützlich";
const ASIDE_USEFUL_LINKS = [
  { href: "/verein/vorstand", label: "Vorstand" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/impressum", label: "Impressum" },
];

// Wir nutzen denselben strukturellen Baustein wie Impressum und Datenschutz
// (LegalSections), damit die Seite zu den Textseiten passt. LegalLayout selbst
// wird bewusst nicht verwendet, da dessen feste Badges (Rechtlich verbindlich,
// DSGVO / TMG / MStV) und die Kopfzeile "Verantwortlicher" auf einer
// Kinder- und Jugendschutzseite irreführend wären.
export default async function JugendschutzPage() {
  const payload = await getPayloadClient();
  const cms = await payload.findGlobal({ slug: "jugendschutz-page" });

  const lastUpdated = cms.meta.lastUpdated ?? LAST_UPDATED;

  const section3Items = cms.section3.items?.length
    ? cms.section3.items.map((i) => i.text)
    : S3_ITEMS;
  const section4Items = cms.section4.items?.length
    ? cms.section4.items.map((i) => i.text)
    : S4_ITEMS;
  const sideLinks = cms.asideUseful.links?.length
    ? cms.asideUseful.links.map((l) => ({ href: l.href, label: l.label }))
    : ASIDE_USEFUL_LINKS;

  const sections: LegalSection[] = [
    {
      id: "fuehrungszeugnis",
      num: "01",
      title: cms.section1.title ?? S1_TITLE,
      icon: "shield",
      intro: cms.section1.intro ?? S1_INTRO,
      blocks: [
        {
          kind: "lead",
          text: cms.section1.lead ?? S1_LEAD,
        },
        {
          kind: "p",
          text: `${cms.section1.body ?? S1_BODY} Siehe auch [${
            cms.section1.bfvLinkLabel ?? S1_BFV_LABEL
          }](${cms.section1.bfvLinkHref ?? S1_BFV_HREF}).`,
        },
      ],
    },
    {
      id: "schutzauftrag",
      num: "02",
      title: cms.section2.title ?? S2_TITLE,
      icon: "user",
      intro: cms.section2.intro ?? S2_INTRO,
      blocks: [
        {
          kind: "p",
          text: cms.section2.body ?? S2_BODY,
        },
      ],
    },
    {
      id: "hintergrund",
      num: "03",
      title: cms.section3.title ?? S3_TITLE,
      icon: "scale",
      intro: cms.section3.intro ?? S3_INTRO,
      blocks: [
        {
          kind: "p",
          text: cms.section3.body1 ?? S3_BODY1,
        },
        {
          kind: "ul",
          items: section3Items,
        },
        {
          kind: "p",
          text: cms.section3.body2 ?? S3_BODY2,
        },
      ],
    },
    {
      id: "praevention",
      num: "04",
      title: cms.section4.title ?? S4_TITLE,
      icon: "gavel",
      intro: cms.section4.intro ?? S4_INTRO,
      blocks: [
        {
          kind: "p",
          text: cms.section4.body ?? S4_BODY,
        },
        {
          kind: "ul",
          items: section4Items,
        },
        {
          kind: "callout",
          tone: "warning",
          title: cms.section4.calloutTitle ?? S4_CALLOUT_TITLE,
          text: cms.section4.calloutText ?? S4_CALLOUT_TEXT,
        },
      ],
    },
    {
      id: "beratung",
      num: "05",
      title: cms.section5.title ?? S5_TITLE,
      icon: "globe",
      intro: cms.section5.intro ?? S5_INTRO,
      blocks: [
        {
          kind: "linkRow",
          label: cms.section5.link1Label ?? S5_LINK1_LABEL,
          href: cms.section5.link1Href ?? S5_LINK1_HREF,
          sub: cms.section5.link1Sub ?? S5_LINK1_SUB,
        },
        {
          kind: "linkRow",
          label: cms.section5.link2Label ?? S5_LINK2_LABEL,
          href: cms.section5.link2Href ?? S5_LINK2_HREF,
          sub: cms.section5.link2Sub ?? S5_LINK2_SUB,
        },
      ],
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={cms.hero.eyebrow ?? HERO_EYEBROW}
        title={cms.hero.title ?? HERO_TITLE}
        lede={cms.hero.lede ?? HERO_LEDE}
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-nord-line pb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-nord-muted">
          <span className="rounded-full border border-nord-line bg-white px-3 py-1">
            Stand · {lastUpdated}
          </span>
          <span className="rounded-full border border-nord-gold/40 bg-nord-gold/10 px-3 py-1 text-nord-navy">
            {cms.meta.badgeSchutzkonzept ?? BADGE_SCHUTZKONZEPT}
          </span>
          <span className="rounded-full border border-nord-line bg-white px-3 py-1">
            {cms.meta.badgeFuehrungszeugnis ?? BADGE_FUEHRUNGSZEUGNIS}
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_280px] md:gap-12">
          <article className="min-w-0">
            <LegalSections sections={sections} />
          </article>

          <aside className="space-y-5 md:sticky md:top-24 md:h-fit md:self-start">
            <div className="rounded-2xl bg-nord-ink p-6 text-white">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                {cms.asideVerdacht.eyebrow ?? ASIDE_VERDACHT_EYEBROW}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/75">
                {cms.asideVerdacht.text ?? ASIDE_VERDACHT_TEXT}
              </p>
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
                <a
                  href={
                    cms.asideVerdacht.link1Href ?? ASIDE_VERDACHT_LINK1_HREF
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-white/85 transition hover:text-nord-gold"
                >
                  {cms.asideVerdacht.link1Label ?? ASIDE_VERDACHT_LINK1_LABEL} ↗
                </a>
                <a
                  href={
                    cms.asideVerdacht.link2Href ?? ASIDE_VERDACHT_LINK2_HREF
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white/85 transition hover:text-nord-gold"
                >
                  {cms.asideVerdacht.link2Label ?? ASIDE_VERDACHT_LINK2_LABEL} ↗
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-nord-line bg-nord-paper-2 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                {cms.asideUseful.eyebrow ?? ASIDE_USEFUL_EYEBROW}
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {sideLinks.map((l) => (
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
