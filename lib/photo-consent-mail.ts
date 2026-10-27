import { Resend } from "resend";

import { CONSENT_TEXT } from "@/lib/photo-consent";
import { SITE_URL } from "@/lib/site";

/**
 * Mails rund um die Foto-Zustimmung. Wie beim Kontaktformular gilt: ohne
 * RESEND_API_KEY und RESEND_FROM_EMAIL wird nichts verschickt, der Eintrag ist
 * trotzdem gespeichert. Links bauen immer auf SITE_URL auf, nie auf dem
 * Host-Header der Anfrage, damit niemand Mails mit fremden Links ausloesen kann.
 */

function resendConfig() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const club = process.env.RESEND_TO_EMAIL ?? "info@svnord.de";
  return key && from ? { resend: new Resend(key), from, club } : null;
}

type MailConfig = NonNullable<ReturnType<typeof resendConfig>>;

/** Resend meldet API-Fehler im Rueckgabewert statt per Exception. */
async function send(
  cfg: MailConfig,
  mail: { to: string; subject: string; text: string },
): Promise<void> {
  const { error } = await cfg.resend.emails.send({ from: cfg.from, ...mail });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export function consentLinks(token: string) {
  const t = encodeURIComponent(token);
  return {
    confirm: `${SITE_URL}/foto-zustimmung/bestaetigen?token=${t}`,
    revoke: `${SITE_URL}/foto-zustimmung/widerrufen?token=${t}`,
  };
}

type ConsentMailData = {
  email: string;
  parentName: string;
  childName: string;
  teamName: string;
  token: string;
};

export async function sendConfirmationRequest(
  data: ConsentMailData,
): Promise<void> {
  const links = consentLinks(data.token);
  const cfg = resendConfig();
  if (!cfg) {
    // Lokal ohne Resend: Link im Log, damit sich der Ablauf testen laesst.
    if (process.env.NODE_ENV !== "production") {
      console.info("[foto-zustimmung] Bestaetigungslink:", links.confirm);
    }
    return;
  }
  await send(cfg, {
    to: data.email,
    subject: `Bitte bestätigen: Mannschaftsfoto ${data.teamName}`,
    text: [
      `Hallo ${data.parentName},`,
      "",
      `du hast auf svnord.de der Veröffentlichung von Mannschaftsfotos mit ${data.childName} (${data.teamName}) zugestimmt. Bitte bestätige das mit diesem Link:`,
      "",
      links.confirm,
      "",
      "Der Link ist 7 Tage gültig. Ohne Bestätigung gilt die Zustimmung nicht.",
      "",
      "Zugestimmter Text:",
      CONSENT_TEXT,
      "",
      "Widerrufen kannst du jederzeit hier:",
      links.revoke,
      "",
      "Warst du das nicht? Dann ignoriere diese Mail einfach.",
      "",
      "SV Nord München-Lerchenau e.V.",
    ].join("\n"),
  });
}

export async function notifyClub(
  kind: "bestaetigt" | "widerrufen",
  data: { childName: string; teamName: string; confirmedCount: number },
): Promise<void> {
  const cfg = resendConfig();
  if (!cfg) return;
  const lines =
    kind === "bestaetigt"
      ? [
          `Neue bestätigte Foto-Zustimmung: ${data.childName} (${data.teamName}).`,
          `Bestätigte Zustimmungen für dieses Team: ${data.confirmedCount}.`,
          "",
          "Sind alle Kinder auf dem Foto abgedeckt, kann im Admin bei der Mannschaft das Häkchen 'Mannschaftsfoto ausblenden' raus.",
        ]
      : [
          `Widerruf der Foto-Zustimmung: ${data.childName} (${data.teamName}).`,
          "",
          "Das Mannschaftsfoto dieses Teams ist ab sofort ausgeblendet ('Mannschaftsfoto ausblenden' wurde gesetzt). Erst wieder einblenden, wenn ein Foto ohne das Kind vorliegt oder alle verbleibenden Eltern zugestimmt haben.",
        ];
  await send(cfg, {
    to: cfg.club,
    subject:
      kind === "bestaetigt"
        ? `Foto-Zustimmung · ${data.teamName}`
        : `Widerruf Foto-Zustimmung · ${data.teamName}`,
    text: [
      ...lines,
      "",
      `Übersicht: ${SITE_URL}/admin/collections/photo-consents`,
    ].join("\n"),
  });
}
