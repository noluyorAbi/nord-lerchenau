/**
 * One-off import for News articles from the legacy svnord-lerchenau.de site.
 * Idempotent: skips a post if its slug already exists.
 *
 * Run: bun run scripts/import-news.ts
 */
import { getPayload } from "payload";

import config from "@/payload.config";

type LexNode = Record<string, unknown>;

function md(input: string): { root: LexNode } {
  const paragraph = (text: string): LexNode => ({
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      {
        type: "text",
        text,
        format: 0,
        version: 1,
        detail: 0,
        mode: "normal",
        style: "",
      },
    ],
  });
  const heading = (tag: "h2" | "h3" | "h4", text: string): LexNode => ({
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      {
        type: "text",
        text,
        format: 0,
        version: 1,
        detail: 0,
        mode: "normal",
        style: "",
      },
    ],
  });
  const text = (value: string): LexNode => ({
    type: "text",
    text: value,
    format: 0,
    version: 1,
    detail: 0,
    mode: "normal",
    style: "",
  });
  const bulletList = (items: string[]): LexNode => ({
    type: "list",
    listType: "bullet",
    tag: "ul",
    start: 1,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: items.map((item, i) => ({
      type: "listitem",
      value: i + 1,
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [text(item)],
    })),
  });
  const quote = (value: string): LexNode => ({
    type: "quote",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [text(value)],
  });
  const blocks = input
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const children: LexNode[] = blocks.map((b) => {
    if (b.startsWith("> ")) return quote(b.slice(2).replace(/\n/g, " ").trim());
    if (b.startsWith("#### ")) return heading("h4", b.slice(5).trim());
    if (b.startsWith("### ")) return heading("h3", b.slice(4).trim());
    if (b.startsWith("## ")) return heading("h2", b.slice(3).trim());
    if (b.startsWith("- ")) {
      return bulletList(
        b
          .split("\n")
          .map((line) => line.replace(/^-\s+/, "").trim())
          .filter(Boolean),
      );
    }
    return paragraph(b.replace(/\n/g, " "));
  });
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children,
    },
  };
}

type ImportPost = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  body: string;
};

const POSTS: ImportPost[] = [
  {
    title: "Vorbereitung? Abgehakt.",
    slug: "vorbereitung-landesliga-2026",
    excerpt:
      "Fünf Testspiele, ein Trainingslager und jede Menge harte Arbeit: Die Bilanz der Landesliga-Vorbereitung steht bei 3 Siegen, 1 Unentschieden und 1 Niederlage. Am Samstag geht es beim FC Moosinning endlich wieder um Punkte.",
    publishedAt: new Date("2026-07-13T18:00:00+02:00").toISOString(),
    tags: ["verein", "spielbericht"],
    body: `Fünf Testspiele. Ein Trainingslager. Jede Menge harte Arbeit. Die Vorbereitung auf unsere erste Landesliga-Saison ist abgehakt.

## Die Bilanz

- 3 Siege
- 1 Unentschieden
- 1 Niederlage

Woche für Woche Training, dazu fünf Prüfungen gegen Gegner aus unterschiedlichen Ligen und ein Trainingslager, das die Mannschaft enger zusammengeschweißt hat. Alle Einheiten, das Trainingslager und sämtliche Testspiel-Ergebnisse stehen im Plan oben.

## Jetzt zählt es

Jetzt heißt es: noch eine Woche Vollgas. Am Samstag geht es beim FC Moosinning endlich wieder um Punkte, unser Auftakt in der Landesliga.

> Landesliga, wir sind bereit. Seid ihr es auch?`,
  },
  {
    title: "Historischer Aufstieg in die Landesliga!",
    slug: "historischer-aufstieg-in-die-landesliga",
    excerpt:
      "Meister der Bezirksliga Nord. Nach fünf Jahren steigt der SV Nord erstmals in die Landesliga auf — mit einem 9:0-Kantersieg gegen Fatih Ingolstadt.",
    publishedAt: new Date("2026-05-06T18:00:00+02:00").toISOString(),
    tags: ["spielbericht", "verein"],
    body: `Der SV Nord München-Lerchenau wird Meister der Bezirksliga Nord und steigt nach fünf Jahren Bezirksliga das erste Mal in die Landesliga auf.

München – Der Traum ist Wirklichkeit geworden: Mit einem 9:0-Kantersieg gegen Fatih Ingolstadt hat der SV Nord München-Lerchenau nach fünf Jahren Bezirksliga den Aufstieg in die Landesliga perfekt gemacht. Den Meistertitel hat sich die Elf von Peter Zeussel und Karl-Heinz Lappe dabei mehr als verdient: Nach 28 Spieltagen stehen 59 Punkte, 81 erzielte Tore und lediglich fünf Niederlagen auf dem Konto der Mannschaft aus dem Münchner Norden – Zahlen, die eine klare Sprache sprechen und keinen daran zweifeln lassen, wer in dieser Saison das Maß aller Dinge war.

„Meine Stimme hat sich noch nicht ganz erholt", witzelt Trainer Zeussel gegenüber Fussball Vorort/FuPa Oberbayern. Kein Wunder: „Wir standen nach Abpfiff noch zwei Stunden auf dem Platz und haben volksfröhlich in der Kabine weitergeduscht." Später stürmten die Nordler dann noch den Vereinsbiergarten und feierten dort ausgiebig mit den Fans weiter. „Es waren mehrere 100 Zuschauer da", so der Coach, der seit der E-Jugend immer wieder beim SV Nord aktiv gewesen ist. „Es war schon ein echt cooles Ereignis."

Auch Felix Kirmeyer, der sportliche Leiter des SV Nord, zeigt sich tief bewegt: „Ich bin so unfassbar stolz auf die Mannschaft und das ganze Team – das kann man gar nicht in Worte fassen." Nicht nur, weil die Nordler zum 80. Jubiläum das erste Mal in der Landesliga spielen werden. „Mein Uropa war einer der Gründer des Vereins", so Kirmeyer. „Wir haben Historisches erreicht – ich habe immer noch Gänsehaut!"

## Historischer Moment – erste Saison unter dem neuen Trainergespann

Für Zeussel und seinen spielenden Co-Trainer Karl-Heinz Lappe ist es die erste gemeinsame Saison an der Seitenlinie. „Es ist natürlich überwältigend", so Zeussel. „Zu Saisonanfang hat keiner wirklich über uns geredet." Doch was hat sich unter den beiden verändert? „Eine neue Spielphilosophie", wie Zeussel verrät. „Wir wollten mehr mit dem Ball spielen."

Und dies zahlte sich vollends aus. Was das Trainergespann zu Saisonbeginn so auch nicht erwartet hätte. Denn die Vorbereitung verlief alles andere als optimal: Die ersten sieben Testspiele gingen allesamt verloren. „Intern waren wir Abstiegskandidat Nummer eins." Doch startete der SV Nord direkt mit einem 7:1-Erfolg über Langengeisling in die Saison. „Wir sind dann auf einer Welle geschwommen."

## Sämtliche Dämme gebrochen – große Feier am letzten Spieltag

Spätestens ab dem achten Spieltag sei der Glaube gereift, ganz oben angreifen zu können. „Nach ein paar Spielen haben wir schon eine enorme Entwicklung gesehen", behauptet Kirmeyer. Intern sprach man sich ab und beschloss: „Wenn wir es schaffen können, dann wollen wir natürlich aufsteigen", so Zeussel.

Noch ein Erfolgsfaktor: die Arbeit neben dem Platz. „Wir hatten jeden Donnerstag Videoanalyse." Ein weiterer Vorteil war, dass zu Beginn kaum jemand über den SV Nord berichtete. „Das hat uns in die Karten gespielt – wir sind einfach im Schatten mitgelaufen."

Im direkten Vergleich hat der SV Nord München-Lerchenau gegen alle Mannschaften aus den Top Ten gewonnen. „Es hat einfach alles gepasst – Peter und Kalle sind einfach ein überragendes Trainerteam", lobt Kirmeyer die gute Zusammenarbeit im ganzen Verein. „Und wir haben uns das verdient."

Auch wenn der Aufstieg bereits feststeht, ist die Saison nicht vorbei. Zwei Spieltage stehen noch an – und der Ehrgeiz ist ungebrochen. „Wir wollen natürlich genauso gewinnen, wie davor." Die große offizielle Aufstiegsfeier soll dann am letzten Spieltag folgen. „Da werden wir die Fans einladen und die restlichen Herrenmannschaften", sagt Kirmeyer. „Uns ist immer wichtig, dass wir mit der Gemeinschaft zusammen die Erfolge feiern – der SV Nord ist einfach ein geiler Verein." Klar ist aber schon jetzt: „Dass wir vorzeitig aufgestiegen sind, hat sämtliche Dämme gebrochen", sagt Zeussel.

Quelle: FuPa Oberbayern.`,
  },
  {
    title: "Karger kommt!",
    slug: "karger-kommt",
    excerpt:
      "SV Nord München-Lerchenau verpflichtet Ex-1860 Profi Nico Karger. Wechsel im Sommer vom FC Pipinsried zu den Nordlern.",
    publishedAt: new Date("2026-04-28T18:00:00+02:00").toISOString(),
    tags: ["verein"],
    body: `SV Nord München-Lerchenau e.V. verpflichtet Ex-1860 Profi Nico Karger.

Der SV Nord München-Lerchenau e.V. kann einen echten Achtungserfolg auf dem Transfermarkt vermelden: Nico Karger wechselt im Sommer vom FC Pipinsried (Bayernliga Süd) zu den Nordlern.

Wir sind sehr stolz und überglücklich, dass Nico ab der kommenden Saison für den SV Nord auflaufen wird. Nico passt zu 100% zu unserem Verein und wir freuen uns total auf die gemeinsame Zeit.

Danke Nico Karger.

Auf eine geile und unvergessliche Zeit.`,
  },
  {
    title: "Neue Nordler: unsere Neuzugänge",
    slug: "neue-nordler-neuzugaenge-2026",
    excerpt:
      "Fünf neue Gesichter für die Landesliga-Saison: Nico Karger, Medhat Mekhimar, Julius Leucht, Niels Schneider und Hüseyin Gümüs laufen ab sofort in Blau-Weiß auf.",
    publishedAt: new Date("2026-07-16T18:00:00+02:00").toISOString(),
    tags: ["verein"],
    body: `Servus Burschen! Heute freuen wir uns, euch unsere Neuzugänge vorzustellen.

## Nico Karger

Mit Karges verpflichten wir einen absoluten Top-Stürmer und ehemaligen Profi des TSV 1860 München.

Der 33-Jährige bringt nicht nur Erfahrung aus der 2. Bundesliga, 3. Liga und Regionalliga mit, sondern hat in den vergangenen Jahren auch in der Bayernliga eindrucksvoll seine Qualitäten als Torjäger unter Beweis gestellt.

Die Zahlen der letzten vier Bayernliga-Saisons sprechen für sich:

- 109 Spiele
- 76 Tore
- 25 Assists

Mit seiner Abschlussstärke, seiner Erfahrung und seinem Torriecher gewinnen wir einen Spieler, der Spiele entscheiden kann und unsere Offensive auf ein neues Level hebt.

Herzlich willkommen, Nico! Wir freuen uns riesig, dich in unseren Farben auflaufen zu sehen und können es kaum erwarten, dich vor unseren Fans auf dem Platz zu erleben.

## Medhat Mekhimar

Servus Meti! Der 23-jährige Linksfuß verstärkt unsere Defensive und bringt trotz seines jungen Alters bereits jede Menge Erfahrung mit. Mit 101 Pflichtspielen, 16 Toren und 4 Assists hat er sich als torgefährlicher Abwehrspieler einen Namen gemacht.

In der vergangenen Saison absolvierte er 33 Spiele und erzielte 9 Tore für den FC Kempten.

Mit seiner Größe, Zweikampfstärke und seinem starken linken Fuß wird Meti unsere Mannschaft verstärken. Herzlich willkommen, wir freuen uns auf eine erfolgreiche gemeinsame Zeit!

## Julius Leucht

Wir freuen uns, Julius Leucht in unserem Team begrüßen zu dürfen!

Der 20-jährige Mittelfeldspieler überzeugt mit Spielintelligenz und großem Entwicklungspotenzial. Trotz seines jungen Alters bringt er bereits wertvolle Erfahrung aus dem Herren- und Juniorenbereich mit und möchte bei uns den nächsten Schritt in seiner Karriere gehen.

Bisherige Karrierebilanz:

- 67 Pflichtspiele
- 6 Tore
- 2 Assists

Mit seiner Einsatzbereitschaft, seinem Ehrgeiz und seiner Mentalität passt Julius perfekt zu unserer Mannschaft. Wir freuen uns auf die gemeinsame Zeit und wünschen dir eine erfolgreiche und verletzungsfreie Saison!

## Niels Schneider

Wir freuen uns, mit Niels Schneider einen weiteren talentierten Spieler für unsere Farben gewonnen zu haben!

Der 21-Jährige will bei den Nordlern den nächsten Schritt gehen. Herzlich willkommen, Niels, wir freuen uns auf dich!

## Hüseyin Gümüs

Auch Hüseyin, von allen nur Cenkay genannt, läuft ab sofort für den SV Nord auf.

Servus Cenkay! Schön, dass du da bist. Wir freuen uns auf eine erfolgreiche gemeinsame Zeit in Blau-Weiß.

Einmal Nordler, immer Nordler.`,
  },
];

async function main() {
  const payload = await getPayload({ config });

  // Set UPDATE_SLUGS to a comma-separated list to overwrite posts that already
  // exist, e.g. after rewording an article. Everything else stays skip-only so
  // edits made in the CMS are never silently reverted.
  const updateSlugs = new Set(
    (process.env.UPDATE_SLUGS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  for (const p of POSTS) {
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    const data = {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      tags: p.tags,
      body: md(p.body),
    };

    if (existing.docs.length > 0) {
      if (!updateSlugs.has(p.slug)) {
        console.log(`↷ Skipping (exists): ${p.slug}`);
        continue;
      }
      await payload.update({
        collection: "posts",
        id: existing.docs[0].id,
        data: data as never,
      });
      console.log(`↻ Updated post: ${p.slug}`);
      continue;
    }

    await payload.create({ collection: "posts", data: data as never });
    console.log(`✓ Created post: ${p.slug}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
