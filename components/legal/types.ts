export type LegalBlock =
  | { kind: "lead"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | {
      kind: "kv";
      rows: Array<{ k: string; v: string; href?: string }>;
    }
  | { kind: "h3"; text: string }
  | {
      kind: "callout";
      tone?: "info" | "warning" | "key";
      title?: string;
      text: string;
    }
  | {
      kind: "linkRow";
      label: string;
      href: string;
      sub?: string;
    };

export type LegalIcon =
  | "shield"
  | "user"
  | "server"
  | "cookie"
  | "mail"
  | "scale"
  | "lock"
  | "globe"
  | "doc"
  | "building"
  | "gavel"
  | "key";

export type LegalSection = {
  id: string;
  num: string;
  title: string;
  icon: LegalIcon;
  intro?: string;
  blocks: LegalBlock[];
};
