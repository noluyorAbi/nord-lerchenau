/**
 * Bild-Verwendungsbericht.
 *
 * Beantwortet die zwei Fragen des Vereins aus dem Änderungsdokument vom
 * 21.08.2026: "Wo sehe ich, welches Foto auf welcher Seite ist?" und "Hier sind
 * viele Fotos doppelt, welche kann ich löschen?".
 *
 * Der Bericht liest ausschließlich (REST, keine Schreibzugriffe). Er rät
 * keine Feldnamen: jedes Dokument wird mit depth=1 geladen und komplett
 * durchlaufen, und alles was die Form eines Media-Dokuments hat (id +
 * filename + mimeType) zaehlt als Fundstelle. So werden auch Galerien,
 * Bild-Blöcke in Artikeln und Felder gefunden, die es zum Zeitpunkt dieses
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
 * bekommt und hier fehlt: sonst wären dessen Bilder ploetzlich
 * "Löschkandidaten".
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
 * Läuft ein Dokument ab und vermerkt jede eingebettete Mediendatei.
 * `path` sammelt die Feldnamen, damit im Bericht steht, wo genau das Bild
 * hängt. Größen-Varianten (media.sizes) werden nicht weiterverfolgt, sie
 * gehören zum selben Bild.
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
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} für ${path}`);
  return (await res.json()) as T;
}

/**
 * Alle Dokumente einer Collection, ueber alle Seiten hinweg.
 *
 * Eine feste Obergrenze wäre hier gefährlich: alles, was hinter der ersten
 * Seite liegt, würde nicht durchsucht, und die Bilder daran landeten als
 * "ohne Fundstelle" auf der Löschliste. Deshalb wird geblättert, bis Payload
 * keine weitere Seite mehr meldet.
 */
async function allDocs(
  slug: string,
  depth: number,
): Promise<Array<Record<string, unknown>>> {
  const out: Array<Record<string, unknown>> = [];
  const perPage = 200;
  for (let page = 1; ; page += 1) {
    const res = await get<{
      docs: Array<Record<string, unknown>>;
      hasNextPage?: boolean;
      totalDocs?: number;
    }>(`/api/${slug}?limit=${perPage}&depth=${depth}&page=${page}`);
    out.push(...res.docs);
    if (!res.hasNextPage || res.docs.length === 0) {
      if (typeof res.totalDocs === "number" && out.length < res.totalDocs) {
        throw new Error(
          `${slug}: nur ${out.length} von ${res.totalDocs} Dokumenten gelesen`,
        );
      }
      return out;
    }
  }
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
  const media = (await allDocs("media", 0)) as MediaDoc[];

  for (const slug of COLLECTIONS) {
    try {
      for (const doc of await allDocs(slug, 1)) {
        walk(doc, `${LABELS[slug]} ${titleOf(doc)}`);
      }
    } catch {
      failed.push(slug);
    }
  }

  for (const [slug, label] of GLOBALS) {
    try {
      const doc = await get<Record<string, unknown>>(
        `/api/globals/${slug}?depth=1`,
      );
      walk(doc, label);
    } catch {
      // Ein nicht lesbares Global darf den Bericht nicht abbrechen, aber es
      // darf auch keine Löschliste erzeugen, die so tut, als wäre überall
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

  console.log("IN VERWENDUNG (nicht löschen)");
  for (const m of used) {
    console.log(`  ${m.filename} (#${m.id}, ${kb(m.filesize)})`);
    for (const where of usage.get(m.id) ?? []) console.log(`      ${where}`);
  }

  if (failed.length > 0) {
    console.log(
      `\nABGEBROCHEN: ${failed.join(", ")} nicht lesbar. Ohne diese Quellen`,
    );
    console.log(
      "wäre jede Löschliste geraten, deshalb wird hier keine ausgegeben.\n",
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nOHNE FUNDSTELLE (Löschkandidaten, vorher kurz ansehen)");
  for (const m of unused) {
    console.log(
      `  ${m.filename} (#${m.id}, ${kb(m.filesize)}, geändert ${m.updatedAt?.slice(0, 10) ?? "?"})`,
    );
  }
  console.log("");
}

// Nur beim direkten Aufruf ausfuehren; der Test importiert die Quellenlisten.
if (process.argv[1]?.endsWith("media-usage.ts")) await main();
