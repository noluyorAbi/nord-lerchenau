/**
 * Uebersetzt die strukturierten Rechtstexte aus `_content.ts` in ein
 * Lexical-Dokument, damit im CMS exakt das steht, was die Seite heute zeigt.
 *
 * Warum die Uebersetzung und nicht eine zweite, handgepflegte Fassung: es gab
 * schon einmal zwei Quellen fuer denselben Rechtstext, die Abschnittsliste in
 * `_content.ts` und eine Markdown-Kopie im Seed-Skript. Die beiden sind
 * auseinandergelaufen. Bei einer Datenschutzerklaerung ist genau das der
 * teure Fehler, deshalb gibt es ab hier nur noch eine Quelle und diese
 * Funktion.
 *
 * Verlustig geht dabei die Dekoration: Abschnittsnummer und Symbol. Die Nummer
 * zaehlt `LegalRichText` per CSS wieder hoch, das Symbol faellt weg. Alles,
 * was Text ist, bleibt erhalten.
 */
import type { LegalBlock, LegalSection } from "@/components/legal/types";

type LexicalNode = Record<string, unknown>;

const FORMAT_BOLD = 1;

function textRun(text: string, format = 0): LexicalNode {
  return {
    type: "text",
    text,
    format,
    version: 1,
    detail: 0,
    mode: "normal",
    style: "",
  };
}

/**
 * Loest `**fett**` und `[Text](Ziel)` auf, dieselbe Mini-Auszeichnung, die
 * `LegalSections.parseInline` im hartkodierten Pfad versteht. Beide Seiten
 * muessen dieselbe Teilmenge koennen, sonst zeigt die CMS-Fassung eines
 * Textes Sternchen an, wo die alte Fassung fett war.
 */
export function parseInlineToLexical(text: string): LexicalNode[] {
  const out: LexicalNode[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push(textRun(buf));
      buf = "";
    }
  };
  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 1) {
        flush();
        out.push(textRun(text.slice(i + 2, end), FORMAT_BOLD));
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "[") {
      const close = text.indexOf("]", i);
      if (close > i && text[close + 1] === "(") {
        const paren = text.indexOf(")", close);
        if (paren > close) {
          flush();
          out.push(
            link(text.slice(i + 1, close), text.slice(close + 2, paren)),
          );
          i = paren + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return out;
}

function link(label: string, url: string): LexicalNode {
  return {
    type: "link",
    version: 3,
    indent: 0,
    format: "",
    direction: "ltr",
    fields: { url, newTab: /^https?:\/\//.test(url), linkType: "custom" },
    children: parseInlineToLexical(label),
  };
}

function paragraph(text: string): LexicalNode {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    textFormat: 0,
    direction: "ltr",
    children: parseInlineToLexical(text),
  };
}

function heading(tag: "h2" | "h3", text: string): LexicalNode {
  return {
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: parseInlineToLexical(text),
  };
}

function bulletList(items: string[]): LexicalNode {
  return {
    type: "list",
    listType: "bullet",
    tag: "ul",
    start: 1,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: items.map((item, idx) => ({
      type: "listitem",
      value: idx + 1,
      checked: undefined,
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: parseInlineToLexical(item),
    })),
  };
}

function quote(lines: string[]): LexicalNode {
  return {
    type: "quote",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: lines.map(paragraph),
  };
}

/**
 * Ein Schluessel-Wert-Paar wird eine Aufzaehlungszeile "**Schluessel:** Wert".
 * Die Tabellenoptik geht verloren, der Inhalt und der Link nicht, und der
 * Verein kann eine Zeile im Editor anfassen, ohne eine Tabelle zu bedienen.
 */
function kvItem(row: { k: string; v: string; href?: string }): string {
  const value = row.href ? `[${row.v}](${row.href})` : row.v;
  return `**${row.k}:** ${value}`;
}

function blockToNodes(block: LegalBlock): LexicalNode[] {
  switch (block.kind) {
    case "lead":
    case "p":
      return [paragraph(block.text)];
    case "ul":
      return [bulletList(block.items)];
    case "kv":
      return [bulletList(block.rows.map(kvItem))];
    case "h3":
      return [heading("h3", block.text)];
    case "callout":
      return [
        quote(block.title ? [`**${block.title}**`, block.text] : [block.text]),
      ];
    case "linkRow":
      return [
        paragraph(
          block.sub
            ? `[${block.label}](${block.href}) — ${block.sub}`
            : `[${block.label}](${block.href})`,
        ),
      ];
  }
}

export function legalSectionsToLexical(sections: LegalSection[]): {
  root: LexicalNode;
} {
  const children: LexicalNode[] = [];
  for (const section of sections) {
    children.push(heading("h2", section.title));
    if (section.intro) children.push(paragraph(section.intro));
    for (const block of section.blocks) children.push(...blockToNodes(block));
  }
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
