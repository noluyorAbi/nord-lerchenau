import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { slug } from "@/lib/slug";

/**
 * Rechtstexte aus dem CMS, in der Optik der fest eingebauten Fassung.
 *
 * Der Abschnittsrahmen von `LegalSections` (Karte, Symbol, Nummer) laesst sich
 * aus einem Fliesstext nicht rekonstruieren, ausser der Nummer: die zaehlt ein
 * CSS-Zaehler ueber die H2 wieder hoch, damit "Abschnitt 7" auf beiden Wegen
 * dasselbe meint und niemand die Nummern von Hand nachziehen muss.
 *
 * Die Klassen sind bewusst dieselben Groessen und Farben wie in
 * `LegalSections`, damit ein Wechsel zwischen CMS-Fassung und Rueckfall auf
 * der Seite nicht als Bruch auffaellt.
 */
type LexicalTextish = { text?: string; children?: LexicalTextish[] };

function flatten(nodes: unknown): string {
  if (!Array.isArray(nodes)) return "";
  return (nodes as LexicalTextish[])
    .map((node) =>
      typeof node?.text === "string" ? node.text : flatten(node?.children),
    )
    .join("");
}

/**
 * Der Anker eines Abschnitts, abgeleitet aus seiner Ueberschrift.
 *
 * Die eingebaute Fassung fuehrt handvergebene Kuerzel (`ki-assistent`,
 * `tls`), die aus dem Ueberschriftentext nicht rekonstruierbar sind. Ein
 * Richtext-Feld hat keinen Platz fuer ein zweites, verstecktes Kuerzel, das
 * ein Editor auch nicht pflegen koennte. Die Anker aendern sich mit dem
 * Wechsel auf die CMS-Fassung deshalb, das ist der Preis und er steht in der
 * PR. Wichtiger ist, dass es ueberhaupt wieder welche gibt: ohne sie waere
 * eine Datenschutzerklaerung dieser Laenge eine durchlaufende Textwand.
 */
export function headingId(nodes: unknown): string | undefined {
  const id = slug(flatten(nodes));
  return id.length > 0 ? `abschnitt-${id}` : undefined;
}

/** Die Abschnittsueberschriften in Dokumentreihenfolge, fuer das Verzeichnis. */
function tableOfContents(
  data: SerializedEditorState,
): Array<{ id: string; title: string }> {
  const out: Array<{ id: string; title: string }> = [];
  for (const node of data.root?.children ?? []) {
    const candidate = node as {
      type?: string;
      tag?: string;
      children?: unknown;
    };
    if (candidate.type !== "heading" || candidate.tag !== "h2") continue;
    const title = flatten(candidate.children).trim();
    const id = headingId(candidate.children);
    if (title && id) out.push({ id, title });
  }
  return out;
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });

    if (node.tag === "h2") {
      return (
        <h2
          id={headingId(node.children)}
          className="mt-12 flex items-baseline gap-3 font-display text-[22px] font-black tracking-tight text-nord-ink before:font-mono before:text-[11px] before:font-bold before:tracking-[0.16em] before:text-nord-gold before:content-[counter(legal-section,decimal-leading-zero)] first:mt-0 md:text-[25px] [counter-increment:legal-section]"
        >
          {children}
        </h2>
      );
    }

    return (
      <h3 className="mt-7 font-display text-[18px] font-extrabold tracking-tight text-nord-ink">
        {children}
      </h3>
    );
  },

  paragraph: ({ node, nodesToJSX, parent, childIndex }) => {
    const children = nodesToJSX({ nodes: node.children });
    if (children.length === 0) return null;

    // Der erste Absatz nach einer Abschnittsueberschrift ist der Vorspann und
    // wird wie `intro` in der eingebauten Fassung gesetzt.
    // `parent` ist im Konvertertyp nur der Knoten ohne Kinder, die Geschwister
    // muessen daher geprueft statt angenommen werden.
    const siblings =
      "children" in parent && Array.isArray(parent.children)
        ? (parent.children as Array<{ type?: string }>)
        : [];
    const isIntro =
      parent.type === "root" &&
      childIndex > 0 &&
      siblings[childIndex - 1]?.type === "heading";

    return (
      <p
        className={
          isIntro
            ? "mt-2 text-[16px] leading-relaxed text-nord-ink"
            : "mt-4 text-[14.5px] leading-relaxed text-nord-muted"
        }
      >
        {children}
      </p>
    );
  },

  list: ({ node, nodesToJSX }) => (
    <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-nord-muted">
      {nodesToJSX({ nodes: node.children })}
    </ul>
  ),

  listitem: ({ node, nodesToJSX }) => (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-nord-gold" />
      <span>{nodesToJSX({ nodes: node.children })}</span>
    </li>
  ),

  quote: ({ node, nodesToJSX }) => (
    <div className="mt-5 rounded-xl border border-nord-line bg-nord-paper-2 p-4 text-[14px] leading-relaxed text-nord-ink">
      {nodesToJSX({ nodes: node.children })}
    </div>
  ),
});

export function LegalRichText({ data }: { data: SerializedEditorState }) {
  const sections = tableOfContents(data);

  return (
    <div className="[counter-reset:legal-section]">
      {sections.length > 1 && (
        <nav
          aria-label="Abschnitte dieser Seite"
          className="mb-10 rounded-xl border border-nord-line bg-nord-paper-2 p-4"
        >
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-nord-muted">
            Abschnitte
          </div>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id} className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] font-bold tabular-nums text-nord-gold-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <a
                  href={`#${section.id}`}
                  className="text-[14px] text-nord-ink underline-offset-2 hover:text-nord-navy hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <RichText converters={converters} data={data} disableContainer />
    </div>
  );
}
