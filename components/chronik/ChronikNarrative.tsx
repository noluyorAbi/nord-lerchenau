type Highlight = { value: string; label: string };

type Chapter = {
  num: string;
  era: string;
  title: string;
  lede: string;
  paragraphs: string[];
  quote?: { text: string; source?: string };
  highlights?: Highlight[];
};

const CHAPTERS: Chapter[] = [
  {
    num: "I",
    era: "1947",
    title: "Vereinsgründung",
    lede: "Lerchenauer und Eggartler raufen sich nach langen Verhandlungen zusammen. Aus Mangel und Improvisation entsteht ein Verein.",
    paragraphs: [
      "Im Frühjahr 1947 treiben Alfons Huber, Lorenz Gessler, Hans Brandhuber, Carl Jennerwein, Kleophas Lang und Johann Steiner die Gründung voran. Am 15. Oktober trägt sich im Gasthof Schützengarten eine ungewöhnliche Versammlung ein: 38 Erwachsene, 22 Jugendliche. Carl Jennerwein wird 1. Vorstand, Adolf Gräf Kassier, Karl Hornung Schriftführer.",
      "Fünf Bürgen haften nach alliierter Bestimmung mit Privatvermögen: Schaflitzl, Spiegel, Melz, Lang, Huber. Die Fußballabteilung übernehmen Steiner, Dietel, Buchner. Erste Aufgabe: Bälle und Trikots beschaffen. Im Protokoll vom 4. März 1948 eine Notiz, die alles über die Zeit sagt:",
    ],
    quote: {
      text: "Ein Kompensationsgeschäft zum Erhalt von zwei Bällen, in der Gegenleistung einer Kuhhaut, wurde ausfindig gemacht.",
      source: "Vereinsprotokoll, 4. März 1948",
    },
    highlights: [
      { value: "60", label: "Personen bei der Gründung" },
      { value: "5", label: "Bürgen mit Privathaftung" },
      { value: "10", label: "Trikots zum Start" },
    ],
  },
  {
    num: "II",
    era: "1948–1959",
    title: "Aus dem Acker wird ein Sportplatz",
    lede: "Die Reichsbahn verpachtet einen Acker. Mehrere Tonnen Steine wandern in Eigenleistung weg.",
    paragraphs: [
      "Im Frühjahr 1948 pachtet der SV Nord über Beziehungen zum Pächter Kötterl aus Feldmoching einen Acker an der Heidelerchenstraße. Mehrere Tonnen Steine, Wochen voller Arbeitseinsatz. Am 1. August 1948 weiht das Rückspiel gegen den TSV Unterhaching den Platz ein.",
      "Die Währungsreform vom 20. Juni 1948 trifft alle: jeder Bürger erhält DM 40 Kopfgeld. Trotzdem geht es Anfang der 50er aufwärts. Im Saal des Schützengarten finden Bunte Abende statt, Künstler wie Fred Rauch, Roider Jackl und Adolf Gondrell treten auf. Die Lerchenau wird über ihre Grenzen hinaus bekannt.",
      "1959 zieht der Verein auf die Bezirkssportanlage Ebereschenstraße um. Mit dem Umzug entsteht auch die Handballabteilung; Georg Seifert meldet eine Damenmannschaft, ein Jahr später folgen die Herren.",
    ],
  },
  {
    num: "III",
    era: "1960er–1970er",
    title: "Flutlicht in Eigenleistung",
    lede: "Stadt München sieht sich außerstande. Mitglieder bauen die Flutlichtanlage selbst.",
    paragraphs: [
      "Bedingt durch erhöhten Spielbetrieb werden Frühjahr und Herbst zur Engstelle. Eine Flutlichtanlage muss her. Die Stadt sagt nein. 1967 baut der SV Nord die Anlage in Eigenleistung und auf Vereinskosten. Im selben Jahr gründet Annemarie Riepl die Gymnastikabteilung.",
      "Die 70er bringen unter Klaus Wersching einen enormen Jugendzuwachs: über 200 Spieler von der E- bis zur A-Jugend. Reisen nach Luxemburg, Straßburg, Enschede, Amsterdam, Hamburg, London. Höhepunkt: USA-Tour der B-Jugend. Dieter Silberhorn führt die D-Jugend nach Dietzenbach, Paris und Edingen, Kurt Tänzer knüpft Kontakte nach Dänemark und Ungarn.",
      "1971 bringt Olympia 1972 ein Tartan-Kleinhandballfeld auf die Anlage. 1975 erneut Eigenleistung: Flutlicht für das Handball-Kleinfeld.",
    ],
    highlights: [
      { value: "200+", label: "Jugendspieler in den 70ern" },
      { value: "1967", label: "Eigenbau Flutlichtanlage" },
      { value: "USA", label: "Auslandstour B-Jugend" },
    ],
  },
  {
    num: "IV",
    era: "1978–1983",
    title: "Vereinsorganisation wird modern",
    lede: "500 Mitglieder. Erste EDV. Neue Satzung. Gemeinnützigkeit anerkannt.",
    paragraphs: [
      "Die Mitgliederzahl wächst von 370 (1971) auf knapp 500 (1977). Der Vorstand reagiert: 1978 Einzugsverfahren, 1979 neue Satzung mit anerkannter Gemeinnützigkeit, im selben Jahr Vereinszeitung Nr. 1. 1981 stellt der Verein die Mitgliederverwaltung mit Hilfe der Stadtsparkasse auf EDV um.",
      "Parallel werden die Sportbedingungen besser. 1980 wird endlich der Sandplatz mit Flutlichtanlage fertig. 1984 gibt die Stadt grünes Licht für die nördliche Erweiterung der Bezirkssportanlage: 1985 entstehen ein sandverfüllter Kunstrasen und ein Rasenspielfeld, 1986 fertiggestellt. 1987 kommt das erweiterte Umkleidegebäude dazu.",
    ],
  },
  {
    num: "V",
    era: "1983–1986",
    title: "Eschengarten in Eigenregie",
    lede: "DM 383.000 Zuschuss, 15.000 Arbeitsstunden, drei Vereine. Ein Vereinsheim entsteht aus dem Boden.",
    paragraphs: [
      "1982 sagt die Stadt München: kein Vereinsheimbau auf Jahre. Doch 1983 beschließt der Stadtrat ein Fördermodell für selbsterrichtete Vereinsheime. Auf Initiative von Horst Lanninger schließen sich SV Nord, FC Eintracht München und der Heimat- und Volkstrachtenverein Edelweiß-Stamm am 5. Mai 1983 zur Interessengemeinschaft Sportheimbau zusammen.",
      "Am 25. April 1985 bewilligt der Stadtrat DM 383.000 Zuschuss. Baubeginn: 21. Juni 1985. Beim Richtfest fünf Monate später begrüßt Erich Ostermeier 150 Gäste. Nach 15.000 freiwilligen Arbeitsstunden öffnet der Eschengarten am 19. Juli 1986. Bis heute der gesellschaftliche Mittelpunkt der Lerchenau.",
    ],
    quote: {
      text: "Die drei Vereine haben damit eindrucksvoll bewiesen, dass es sich, dank der hohen Bereitschaft aller Mitglieder, lohnen kann, mit Eigeninitiative solch ein Projekt anzugehen.",
      source: "Chronik des SV Nord",
    },
    highlights: [
      { value: "15.000", label: "Arbeitsstunden in Eigenleistung" },
      { value: "3", label: "Vereine im Schulterschluss" },
      { value: "DM 383k", label: "Stadt-Zuschuss" },
    ],
  },
  {
    num: "VI",
    era: "1987–2005",
    title: "Aufstieg und Erweiterung",
    lede: "Ski-Abteilung, Bezirksliga, Fußballförderverein. Mitgliederzahl auf 870.",
    paragraphs: [
      "Im Herbst 1987 gründen Karl Prölß und Christian Schäffer die Ski-Abteilung, rund 100 neue Mitglieder. 1989 Aufstieg in die A-Klasse unter Trainer Morcinek, 1993 erstmals Bezirksliga unter Spielertrainer Aumüller. 1994 steigt die A-Jugend in die Bezirksliga Oberbayern auf.",
      "1993 entsteht der Fußball-Förderverein für die Senioren. 1996 baut der SV Nord gemeinsam mit FC Eintracht und FSV Harthof einen Geräteschuppen. Die Mitgliederzahl wächst von 500 (1971) auf 766 (1996) auf 870 (1998). 1999 modernisiert Kurt Tänzer die Vereins-EDV. 2005 ist der SV Nord erstmals online: svnord.de.",
    ],
  },
  {
    num: "VII",
    era: "2004–2015",
    title: "Stadtangebote und Rückschläge",
    lede: "Bezirkssportanlage in Eigenregie? Geprüft, abgelehnt. Andere Vereine machen es schmerzhaft anders.",
    paragraphs: [
      "Mitte 2004 prüfen SV Nord und FC Eintracht das Angebot der Stadt, die Bezirkssportanlage selbst zu betreiben. Hintergrund: Unterhaltskosten von 200 bis 250 Tausend Euro pro Jahr. Beide Vereine lehnen ab, das Risiko ist zu groß.",
      "2015 zeigt sich, dass die Vorsicht klug war. Neun Vereine waren in das Modell eingestiegen. Vier gaben die Anlagen mit sechsstelligen Schulden an die Stadt zurück.",
      "Der zweite große Vorstoß scheitert ebenfalls: ab 1998 bemüht sich der Verein gemeinsam mit FC Eintracht und FSV Harthof, eine Teilfläche am Virginia-Depot als Sportfläche auszuweisen. 2002 Ernüchterung; das Planungsreferat hat die Fläche längst als Magerrasenbiotop ausgewiesen. 2008 endgültiges Aus.",
      "Parallel verliert der Verein 2013 die Skiabteilung an die Eigenständigkeit, 2014 löst sich nach 55 Jahren die Handballabteilung auf. Die Mitgliederzahl sinkt 2015 auf 600.",
    ],
    highlights: [
      { value: "9 → 4", label: "Vereine, die das Stadtmodell rückabwickelten" },
      { value: "55", label: "Jahre Handball, dann aus" },
      { value: "600", label: "Mitglieder 2015" },
    ],
  },
];

export function ChronikNarrative() {
  return (
    <div className="space-y-10">
      {CHAPTERS.map((chapter) => (
        <article
          key={chapter.num}
          className="overflow-hidden rounded-2xl border border-nord-line bg-white"
        >
          <header className="border-b border-nord-line bg-nord-paper-2 px-6 py-5 md:px-10 md:py-7">
            <div className="flex flex-wrap items-baseline gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-muted">
              <span className="rounded-full bg-nord-navy px-2.5 py-1 text-white">
                Kapitel {chapter.num}
              </span>
              <span className="text-nord-gold">{chapter.era}</span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-black leading-[1.05] tracking-tight text-nord-ink md:text-4xl">
              {chapter.title}
            </h3>
            <p className="mt-3 max-w-2xl font-display text-base leading-relaxed text-nord-muted md:text-lg">
              {chapter.lede}
            </p>
          </header>

          <div className="space-y-6 px-6 py-7 md:px-10 md:py-10">
            <div className="space-y-5 text-base leading-[1.7] text-nord-ink">
              {chapter.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.85] first-letter:text-nord-navy"
                      : ""
                  }
                >
                  {p}
                </p>
              ))}

              {chapter.quote ? (
                <blockquote className="mt-6 border-l-4 border-nord-gold bg-nord-paper-2 px-5 py-4">
                  <p className="font-display text-lg italic leading-snug text-nord-ink md:text-xl">
                    &bdquo;{chapter.quote.text}&ldquo;
                  </p>
                  {chapter.quote.source ? (
                    <footer className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                      {chapter.quote.source}
                    </footer>
                  ) : null}
                </blockquote>
              ) : null}
            </div>

            {chapter.highlights ? (
              <div>
                <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                  Highlights
                </div>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {chapter.highlights.map((h) => (
                    <li
                      key={h.label}
                      className="rounded-xl border border-nord-line bg-nord-paper-2 p-4"
                    >
                      <div className="font-display text-xl font-black leading-none tracking-tight text-nord-ink">
                        {h.value}
                      </div>
                      <div className="mt-1.5 text-[11px] leading-snug text-nord-muted">
                        {h.label}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
