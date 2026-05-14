import type { LegalSection } from "@/components/legal/LegalSections";

export const IMPRESSUM_SECTIONS: LegalSection[] = [
  {
    id: "anbieter",
    num: "01",
    title: "Angaben gemäß § 5 TMG",
    icon: "building",
    intro: "Pflichtangaben zum Diensteanbieter",
    blocks: [
      {
        kind: "kv",
        rows: [
          { k: "Verein", v: "SV Nord München-Lerchenau e.V." },
          { k: "Straße", v: "Ebereschenstraße 17" },
          { k: "PLZ / Ort", v: "80935 München" },
          { k: "Land", v: "Deutschland" },
        ],
      },
    ],
  },
  {
    id: "vertretung",
    num: "02",
    title: "Vertreten durch",
    icon: "user",
    intro: "Vertretungsberechtigte Person",
    blocks: [
      {
        kind: "kv",
        rows: [
          { k: "Name", v: "Ralf Kirmeyer" },
          { k: "Funktion", v: "1. Vorstand" },
          { k: "Adresse", v: "Ebereschenstraße 17, 80935 München" },
          { k: "Telefon", v: "0172 9808109", href: "tel:+491729808109" },
          {
            k: "E-Mail",
            v: "ralf.kirmeyer@svnord.de",
            href: "mailto:ralf.kirmeyer@svnord.de",
          },
        ],
      },
    ],
  },
  {
    id: "register",
    num: "03",
    title: "Registereintrag",
    icon: "doc",
    intro: "Vereinsregister-Daten",
    blocks: [
      {
        kind: "kv",
        rows: [
          { k: "Registergericht", v: "Amtsgericht München" },
          { k: "Registernummer", v: "VR 6924" },
        ],
      },
    ],
  },
  {
    id: "verantwortlich",
    num: "04",
    title: "Verantwortlich nach § 55 Abs. 2 RStV",
    icon: "scale",
    intro: "Inhaltlich verantwortliche Person",
    blocks: [
      {
        kind: "kv",
        rows: [
          { k: "Name", v: "Ralf Kirmeyer" },
          { k: "Adresse", v: "Ebereschenstraße 17, 80935 München" },
        ],
      },
    ],
  },
  {
    id: "haftung-inhalte",
    num: "05",
    title: "Haftung für Inhalte",
    icon: "gavel",
    intro: "§§ 7–10 TMG",
    blocks: [
      {
        kind: "p",
        text: "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.",
      },
      {
        kind: "p",
        text: "Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.",
      },
      {
        kind: "callout",
        tone: "info",
        title: "Reaktion bei Rechtsverletzungen",
        text: "Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine Haftung ist erst ab Kenntnis einer konkreten Rechtsverletzung möglich — bei Bekanntwerden entfernen wir entsprechende Inhalte umgehend.",
      },
    ],
  },
  {
    id: "haftung-links",
    num: "06",
    title: "Haftung für Links",
    icon: "globe",
    intro: "Externe Links zu Dritten",
    blocks: [
      {
        kind: "p",
        text: "Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.",
      },
      {
        kind: "p",
        text: "Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.",
      },
      {
        kind: "callout",
        tone: "info",
        title: "Bei Rechtsverletzungen",
        text: "Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.",
      },
    ],
  },
  {
    id: "urheberrecht",
    num: "07",
    title: "Urheberrecht",
    icon: "key",
    intro: "Nutzungsrechte an Inhalten dieser Website",
    blocks: [
      {
        kind: "p",
        text: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
      },
      {
        kind: "p",
        text: "Downloads und Kopien dieser Seite sind nur für den **privaten, nicht kommerziellen Gebrauch** gestattet. Soweit Inhalte nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet — insbesondere werden Inhalte Dritter als solche gekennzeichnet.",
      },
      {
        kind: "callout",
        tone: "info",
        title: "Hinweis bei Verletzungen",
        text: "Sollten Sie auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden entfernen wir derartige Inhalte umgehend.",
      },
    ],
  },
];
