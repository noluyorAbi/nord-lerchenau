/**
 * Die Anschrift des Vereins an einer Stelle.
 *
 * Impressum und Datenschutzerklaerung fuehrten "Ebereschenstraße 17, 80935
 * München" bisher als festen Text, obwohl beide Seiten daneben schon
 * `contact-info` abfragen und dort dieselbe Anschrift gepflegt wird. Ein Umzug
 * des Vereins haette also an drei Stellen nachgezogen werden muessen, zwei
 * davon nur durch einen Entwickler. Die Pflichtangabe nach § 5 TMG ist genau
 * die, die nicht veralten darf.
 *
 * Der feste Wert bleibt als Rueckfall stehen: eine leere oder halb ausgefuellte
 * Adresse im CMS darf keine Rechtsseite ohne Anschrift erzeugen.
 */

export type ContactAddressInput = {
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
} | null;

export type ClubAddress = {
  street: string;
  postalCode: string;
  city: string;
  /** "80935 München" */
  cityLine: string;
  /** "Ebereschenstraße 17, 80935 München" */
  oneLine: string;
  /** Beide Zeilen untereinander, fuer Adressbloecke. */
  lines: string[];
};

const FALLBACK = {
  street: "Ebereschenstraße 17",
  postalCode: "80935",
  city: "München",
} as const;

function pick(value: string | null | undefined, fallback: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : fallback;
}

export function clubAddress(primary: ContactAddressInput): ClubAddress {
  const street = pick(primary?.street, FALLBACK.street);
  const postalCode = pick(primary?.postalCode, FALLBACK.postalCode);
  const city = pick(primary?.city, FALLBACK.city);
  const cityLine = `${postalCode} ${city}`;
  return {
    street,
    postalCode,
    city,
    cityLine,
    oneLine: `${street}, ${cityLine}`,
    lines: [street, cityLine],
  };
}

/** Die erste gepflegte Adresse aus dem `contact-info`-Global. */
export function primaryAddressOf(contact: {
  addresses?: unknown;
}): ContactAddressInput {
  const list = contact.addresses;
  if (!Array.isArray(list) || list.length === 0) return null;
  const first: unknown = list[0];
  if (!first || typeof first !== "object") return null;
  return first as ContactAddressInput;
}
