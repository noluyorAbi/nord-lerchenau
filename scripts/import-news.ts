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
  const blocks = input
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const children: LexNode[] = blocks.map((b) => {
    if (b.startsWith("#### ")) return heading("h4", b.slice(5).trim());
    if (b.startsWith("### ")) return heading("h3", b.slice(4).trim());
    if (b.startsWith("## ")) return heading("h2", b.slice(3).trim());
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
];

async function main() {
  const payload = await getPayload({ config });

  for (const p of POSTS) {
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      console.log(`↷ Skipping (exists): ${p.slug}`);
      continue;
    }
    await payload.create({
      collection: "posts",
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        publishedAt: p.publishedAt,
        tags: p.tags,
        body: md(p.body),
      } as never,
    });
    console.log(`✓ Created post: ${p.slug}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
