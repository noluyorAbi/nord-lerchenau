/**
 * Bild-Verwendungsbericht.
 *
 * Beantwortet die zwei Fragen des Vereins aus dem Aenderungsdokument vom
 * 21.08.2026: "Wo sehe ich, welches Foto auf welcher Seite ist?" und "Hier sind
 * viele Fotos doppelt, welche kann ich loeschen?".
 *
 * Der Bericht liest ausschliesslich (REST, keine Schreibzugriffe). Er raet
 * keine Feldnamen: jedes Dokument wird mit depth=1 geladen und komplett
 * durchlaufen, und alles was die Form eines Media-Dokuments hat (id +
 * filename + mimeType) zaehlt als Fundstelle. So werden auch Galerien,
 * Bild-Bloecke in Artikeln und Felder gefunden, die es zum Zeitpunkt dieses
 * Skripts noch gar nicht gibt.
 *
 *   bun run media-usage                       # Produktion
 *   bun run media-usage http://localhost:3000 # lokal
 */

const BASE = (process.argv[2] ?? "https://www.svnord.de").replace(/\/$/, "");

/**
 * Jede Quelle, die auf `media` zeigen kann. Die Listen sind bewusst
 * ausgeschrieben, damit das Skript ohne Payload-Bootstrap laeuft.
 * tests/scripts/media-usage.test.ts liest das payload-Verzeichnis und schlaegt
 * fehl, sobald eine neue Collection oder ein neues Global ein Upload-Feld
 * bekommt und hier fehlt: sonst waeren dessen Bilder ploetzlich
 * "Loeschkandidaten".
 */
export const COLLECTIONS = [
  "teams",
  "people",
  "sponsors",
  "events",
  "posts",
] as const;

export const GLOBALS = [
  ["home-page", "Startseite"],
  ["chronik-page", "Seite Chronik"],
  ["vereinsheim-page", "Seite Vereinsheim"],
  ["jugendfoerder-page", "Seite Jugendfoerderverein"],
  ["faq-page", "Seite FAQ"],
  ["legal-pages", "Rechtstexte"],
  ["site-settings", "Einstellungen"],
] as const;

const LABELS: Record<string, string> = {
  teams: "Mannschaft",
  people: "Person",
  sponsors: "Sponsor",
  events: "Termin",
  posts: "Beitrag",
};

type MediaDoc = {
  id: number;
  filename?: string | null;
  alt?: string | null;
  filesize?: number | null;
  updatedAt?: string | null;
};

/** Verwendungsstellen je Bild-ID, z.B. "Mannschaft Gymnastik -> photo". */
const usage = new Map<number, Set<string>>();

function isMediaLike(value: unknown): value is MediaDoc {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.filename === "string" &&
    typeof v.mimeType === "string"
  );
}

/**
 * Laeuft ein Dokument ab und vermerkt jede eingebettete Mediendatei.
 * `path` sammelt die Feldnamen, damit im Bericht steht, wo genau das Bild
 * haengt. Groessen-Varianten (media.sizes) werden nicht weiterverfolgt, sie
 * gehoeren zum selben Bild.
 */
function walk(value: unknown, owner: string, path: string[] = []): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, owner, path);
    return;
  }
  if (!value || typeof value !== "object") return;

  if (isMediaLike(value)) {
    const where = path.length > 0 ? `${owner} -> ${path.join(".")}` : owner;
    const list = usage.get(value.id) ?? new Set<string>();
    list.add(where);
    usage.set(value.id, list);
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === "object") walk(child, owner, [...path, key]);
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fuer ${path}`);
  return (await res.json()) as T;
}

function titleOf(doc: Record<string, unknown>): string {
  for (const key of ["name", "title", "label"]) {
    const value = doc[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return `#${String(doc.id ?? "?")}`;
}

function kb(bytes?: number | null): string {
  return bytes ? `${Math.round(bytes / 1024)} KB` : "?";
}

async function main(): Promise<void> {
  const failed: string[] = [];
  const media = (
    await get<{ docs: MediaDoc[] }>("/api/media?limit=1000&depth=0")
  ).docs;

  for (const slug of COLLECTIONS) {
    const { docs } = await get<{ docs: Array<Record<string, unknown>> }>(
      `/api/${slug}?limit=1000&depth=1`,
    );
    for (const doc of docs) walk(doc, `${LABELS[slug]} ${titleOf(doc)}`);
  }

  for (const [slug, label] of GLOBALS) {
    try {
      const doc = await get<Record<string, unknown>>(
        `/api/globals/${slug}?depth=1`,
      );
      walk(doc, label);
    } catch {
      // Ein nicht lesbares Global darf den Bericht nicht abbrechen, aber es
      // darf auch keine Loeschliste erzeugen, die so tut, als waere ueberall
      // gesucht worden.
      failed.push(slug);
    }
  }

  const byName = (a: MediaDoc, b: MediaDoc) =>
    (a.filename ?? "").localeCompare(b.filename ?? "");
  const used = media.filter((m) => usage.has(m.id)).sort(byName);
  const unused = media.filter((m) => !usage.has(m.id)).sort(byName);

  console.log(`\nBILD-VERWENDUNG · ${BASE}`);
  console.log(
    `${media.length} Bilder · ${used.length} in Verwendung · ${unused.length} ohne Fundstelle\n`,
  );

  console.log("IN VERWENDUNG (nicht loeschen)");
  for (const m of used) {
    console.log(`  ${m.filename} (#${m.id}, ${kb(m.filesize)})`);
    for (const where of usage.get(m.id) ?? []) console.log(`      ${where}`);
  }

  if (failed.length > 0) {
    console.log(
      `\nABGEBROCHEN: ${failed.join(", ")} nicht lesbar. Ohne diese Quellen`,
    );
    console.log(
      "waere jede Loeschliste geraten, deshalb wird hier keine ausgegeben.\n",
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nOHNE FUNDSTELLE (Loeschkandidaten, vorher kurz ansehen)");
  for (const m of unused) {
    console.log(
      `  ${m.filename} (#${m.id}, ${kb(m.filesize)}, geaendert ${m.updatedAt?.slice(0, 10) ?? "?"})`,
    );
  }
  console.log("");
}

// Nur beim direkten Aufruf ausfuehren; der Test importiert die Quellenlisten.
if (process.argv[1]?.endsWith("media-usage.ts")) await main();
