import { createHash, randomBytes } from "node:crypto";

import { z } from "zod";

/**
 * Online-Zustimmung der Eltern zur Veroeffentlichung von Mannschaftsfotos.
 *
 * Ablauf: Eltern fuellen /foto-zustimmung aus, der Eintrag landet als "offen"
 * in der Collection photo-consents, und sie bekommen per Mail einen Link zum
 * Bestaetigen (Double-Opt-in). Derselbe Link-Token dient spaeter zum Widerruf.
 * In der Datenbank liegt nur der SHA-256 des Tokens, nie der Token selbst.
 */

// Namen landen in Mails an fremde Adressen: nur Buchstaben, Leerzeichen,
// Bindestrich, Punkt und Apostroph, damit niemand Links oder Zeilen einschmuggelt.
const PERSON_NAME = /^\p{L}[\p{L} .'-]*$/u;

/** Nur fuer Kinder- und Jugendteams gibt es eine Elternzustimmung. */
export const CONSENT_CATEGORIES = ["junioren", "juniorinnen", "bambini"];

/** So viele offene Eintraege darf eine Adresse gleichzeitig haben. */
export const MAX_PENDING_PER_EMAIL = 5;

export const photoConsentSchema = z.object({
  team: z.coerce
    .number({ message: "Bitte Mannschaft auswählen" })
    .int()
    .positive("Bitte Mannschaft auswählen"),
  childName: z
    .string()
    .trim()
    .min(2, "Bitte Namen des Kindes angeben")
    .max(100)
    .regex(PERSON_NAME, "Bitte nur den Namen angeben"),
  parentName: z
    .string()
    .trim()
    .min(2, "Bitte deinen Namen angeben")
    .max(100)
    .regex(PERSON_NAME, "Bitte nur den Namen angeben"),
  email: z.string().trim().email("Gültige E-Mail bitte").max(200),
  consent: z.literal(true, {
    message: "Bitte die Zustimmung ankreuzen",
  }),
  // Honeypot: darf hier nicht scheitern, sonst bekaeme ein Bot eine
  // Fehlermeldung statt der vorgetaeuschten Erfolgsantwort der Route.
  website: z.string().max(500).optional(),
});

export type PhotoConsentInput = z.infer<typeof photoConsentSchema>;

export const tokenSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{32,64}$/, "Ungültiger Link"),
});

/** Unbestaetigte Eintraege verfallen nach dieser Zeit. */
export const PENDING_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Text, dem die Eltern zustimmen. Steht im Formular und in der Mail. */
export const CONSENT_TEXT =
  "Ich bin erziehungsberechtigt und stimme zu, dass der SV Nord München-Lerchenau e.V. Mannschaftsfotos, auf denen mein Kind zu sehen ist, auf www.svnord.de veröffentlicht. Die Zustimmung ist freiwillig und kann jederzeit über den Link in der Bestätigungsmail widerrufen werden; das Foto wird dann von der Website entfernt.";

export type ConsentStatus = "offen" | "bestaetigt" | "widerrufen";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function isPendingExpired(createdAt: string | Date, now: Date): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return true;
  return now.getTime() - created > PENDING_TTL_MS;
}

type Decision =
  | { ok: true; next: ConsentStatus }
  | { ok: false; reason: "abgelaufen" | "widerrufen" | "schon-bestaetigt" };

/** Was ein Klick auf "Bestaetigen" mit einem Eintrag in diesem Zustand macht. */
export function decideConfirm(
  status: ConsentStatus,
  createdAt: string | Date,
  now: Date,
): Decision {
  if (status === "widerrufen") return { ok: false, reason: "widerrufen" };
  if (status === "bestaetigt") return { ok: false, reason: "schon-bestaetigt" };
  if (isPendingExpired(createdAt, now))
    return { ok: false, reason: "abgelaufen" };
  return { ok: true, next: "bestaetigt" };
}

/**
 * Widerrufen geht aus jedem Zustand ausser "widerrufen". Das Team-Foto blendet
 * nur der Widerruf einer bestaetigten Zustimmung aus (siehe hidesTeamPhoto):
 * sonst koennte jeder mit einem eigenen, nie bestaetigten Eintrag ein Foto
 * abschalten.
 */
export function decideRevoke(status: ConsentStatus): Decision {
  if (status === "widerrufen") return { ok: false, reason: "widerrufen" };
  return { ok: true, next: "widerrufen" };
}

export function hidesTeamPhoto(previous: ConsentStatus): boolean {
  return previous === "bestaetigt";
}

/**
 * Ob fuer ein Team ueberhaupt ein Mannschaftsfoto erscheinen darf. Gilt fuer
 * alle Quellen: das hochgeladene Foto im CMS, das FuPa-Foto und das BFV-Bild.
 */
export function teamPhotoAllowed(team: {
  hidePhoto?: boolean | null;
}): boolean {
  return team.hidePhoto !== true;
}
