import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";

type LexicalValue =
  | { root?: unknown }
  | string
  | null
  | undefined
  | Record<string, unknown>;

/**
 * Render a Payload richText (Lexical) value as plain text for surfaces that show
 * a short blurb rather than formatted HTML (e.g. the Termine agenda). Accepts the
 * stored Lexical object, a plain string (legacy/fallback), or null, and returns a
 * trimmed string or null when empty.
 */
export function lexicalToText(value: LexicalValue): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t.length ? t : null;
  }
  if (typeof value === "object" && "root" in value && value.root) {
    try {
      const text = convertLexicalToPlaintext({
        // The converter validates the editor-state shape at runtime; our stored
        // value matches it but is typed loosely here.
        data: value as Parameters<typeof convertLexicalToPlaintext>[0]["data"],
      }).trim();
      return text.length ? text : null;
    } catch {
      return null;
    }
  }
  return null;
}
