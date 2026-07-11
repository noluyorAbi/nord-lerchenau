// Minimal plain-text extraction from Payload/Lexical richtext JSON.
// Used where a compact text rendering is enough (e.g. /termine event
// descriptions) — block nodes become lines, list items get a bullet.

type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
};

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "listitem",
  "quote",
  "horizontalrule",
]);

function inlineText(node: LexicalNode): string {
  if (node.type === "linebreak") return "\n";
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.children)) return "";
  // Nested lists are emitted as their own lines by collectBlocks; including
  // them here would duplicate their text inside the parent bullet.
  return node.children
    .filter((child) => child.type !== "list")
    .map(inlineText)
    .join("");
}

function collectBlocks(node: LexicalNode, out: string[]): void {
  if (!node || typeof node !== "object") return;
  if (node.type && BLOCK_TYPES.has(node.type)) {
    const text = inlineText(node).trim();
    if (text) out.push(node.type === "listitem" ? `• ${text}` : text);
    if (node.type !== "listitem") return;
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      // Nested lists inside a listitem still need their own lines.
      if (node.type === "listitem" && child.type !== "list") continue;
      collectBlocks(child, out);
    }
  }
}

export function lexicalToPlainText(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (!value || typeof value !== "object") return null;
  const root = (value as { root?: LexicalNode }).root;
  if (!root || !Array.isArray(root.children)) return null;
  const lines: string[] = [];
  for (const child of root.children) collectBlocks(child, lines);
  const text = lines.join("\n").trim();
  return text.length > 0 ? text : null;
}
