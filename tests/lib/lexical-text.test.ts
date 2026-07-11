import { describe, expect, test } from "vitest";

import { lexicalToPlainText } from "@/lib/lexical-text";

const text = (t: string) => ({ type: "text", text: t });
const doc = (children: unknown[]) => ({ root: { type: "root", children } });

describe("lexicalToPlainText", () => {
  test("returns null for empty or invalid input", () => {
    expect(lexicalToPlainText(null)).toBeNull();
    expect(lexicalToPlainText(undefined)).toBeNull();
    expect(lexicalToPlainText({})).toBeNull();
    expect(lexicalToPlainText(doc([]))).toBeNull();
    expect(lexicalToPlainText("  ")).toBeNull();
  });

  test("passes plain strings through", () => {
    expect(lexicalToPlainText("Hallo Verein")).toBe("Hallo Verein");
  });

  test("joins block nodes with newlines and bullets list items", () => {
    const value = doc([
      { type: "heading", children: [text("Programm")] },
      { type: "paragraph", children: [text("Freitag ab 16:30.")] },
      {
        type: "list",
        children: [
          { type: "listitem", children: [text("Kiga-Turnier")] },
          { type: "listitem", children: [text("U19-Turnier")] },
        ],
      },
    ]);
    expect(lexicalToPlainText(value)).toBe(
      "Programm\nFreitag ab 16:30.\n• Kiga-Turnier\n• U19-Turnier",
    );
  });

  test("keeps soft line breaks as newlines", () => {
    const value = doc([
      {
        type: "paragraph",
        children: [
          text("Einlass 16:00"),
          { type: "linebreak" },
          text("Beginn 16:30"),
        ],
      },
    ]);
    expect(lexicalToPlainText(value)).toBe("Einlass 16:00\nBeginn 16:30");
  });

  test("does not duplicate nested list items into the parent bullet", () => {
    const value = doc([
      {
        type: "list",
        children: [
          {
            type: "listitem",
            children: [
              text("Getränke"),
              {
                type: "list",
                children: [
                  { type: "listitem", children: [text("Bier")] },
                  { type: "listitem", children: [text("Limo")] },
                ],
              },
            ],
          },
        ],
      },
    ]);
    expect(lexicalToPlainText(value)).toBe("• Getränke\n• Bier\n• Limo");
  });
});
