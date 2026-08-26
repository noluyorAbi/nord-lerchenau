import { describe, expect, it } from "vitest";

import { datenschutzSections } from "@/app/(frontend)/datenschutz/_content";
import { impressumSections } from "@/app/(frontend)/impressum/_content";
import { clubAddress } from "@/lib/club-address";
import { legalSectionsToLexical } from "@/lib/legal-lexical";
import { lexicalToPlainText } from "@/lib/lexical-text";
import type { LegalSection } from "@/components/legal/types";

const ADDRESS = clubAddress(null);

/**
 * Jede Textstelle, die auf der Seite steht. Die Auszeichnung `**fett**` und
 * `[Text](Ziel)` wird entfernt, weil sie in der Lexical-Fassung zu Knoten
 * wird und nicht mehr als Zeichen im Text auftaucht.
 */
function plainStringsOf(sections: LegalSection[]): string[] {
  const out: string[] = [];
  const push = (text: string) => {
    const stripped = text
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    if (stripped.trim()) out.push(stripped.trim());
  };
  for (const section of sections) {
    push(section.title);
    if (section.intro) push(section.intro);
    for (const block of section.blocks) {
      switch (block.kind) {
        case "lead":
        case "p":
        case "h3":
          push(block.text);
          break;
        case "ul":
          block.items.forEach(push);
          break;
        case "kv":
          block.rows.forEach((row) => {
            push(row.k);
            push(row.v);
          });
          break;
        case "callout":
          if (block.title) push(block.title);
          push(block.text);
          break;
        case "linkRow":
          push(block.label);
          if (block.sub) push(block.sub);
          break;
      }
    }
  }
  return out;
}

describe("legalSectionsToLexical", () => {
  for (const [name, sections] of [
    ["Impressum", impressumSections(ADDRESS)],
    ["Datenschutz", datenschutzSections(ADDRESS)],
  ] as const) {
    it(`verliert keine Textstelle aus ${name}`, () => {
      const rendered = lexicalToPlainText(legalSectionsToLexical(sections));
      expect(rendered).not.toBeNull();
      const missing = plainStringsOf(sections).filter(
        (text) => !rendered!.includes(text),
      );
      expect(missing).toEqual([]);
    });
  }

  it("uebersetzt fett und Links zu Knoten statt zu Sternchen", () => {
    const doc = legalSectionsToLexical([
      {
        id: "t",
        num: "01",
        title: "Test",
        icon: "doc",
        blocks: [
          {
            kind: "p",
            text: "Ein **wichtiger** [Hinweis](https://example.org).",
          },
        ],
      },
    ]);
    const text = lexicalToPlainText(doc);
    expect(text).toContain("Ein wichtiger Hinweis.");
    expect(text).not.toContain("**");
    expect(JSON.stringify(doc)).toContain('"url":"https://example.org"');
  });

  it("nimmt die Anschrift aus dem Adressobjekt, nicht aus festem Text", () => {
    const moved = clubAddress({
      street: "Musterweg 1",
      postalCode: "80331",
      city: "München",
    });
    const text = lexicalToPlainText(
      legalSectionsToLexical(impressumSections(moved)),
    );
    expect(text).toContain("Musterweg 1");
    expect(text).not.toContain("Ebereschenstraße");
  });

  /**
   * Der Abschnitt zum KI-Assistenten fehlt in der Fassung, die am 19.07.2026
   * in die Produktionsdatenbank geschrieben wurde. Er ist damit der Pruefstein
   * dafuer, dass die Uebersetzung aus dem Code und nicht aus jener Fassung
   * kommt: eine Verarbeitungstaetigkeit darf aus der Datenschutzerklaerung
   * nicht verschwinden.
   */
  it("enthaelt den Abschnitt zum KI-Assistenten", () => {
    const text = lexicalToPlainText(
      legalSectionsToLexical(datenschutzSections(ADDRESS)),
    );
    expect(text?.toLowerCase()).toMatch(/ki|assistent/);
  });
});
