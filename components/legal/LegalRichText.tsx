import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

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
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });

    if (node.tag === "h2") {
      return (
        <h2 className="mt-12 flex items-baseline gap-3 font-display text-[22px] font-black tracking-tight text-nord-ink before:font-mono before:text-[11px] before:font-bold before:tracking-[0.16em] before:text-nord-gold before:content-[counter(legal-section,decimal-leading-zero)] first:mt-0 md:text-[25px] [counter-increment:legal-section]">
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
  return (
    <div className="[counter-reset:legal-section]">
      <RichText converters={converters} data={data} disableContainer />
    </div>
  );
}
