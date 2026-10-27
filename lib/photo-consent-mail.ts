import { Resend } from "resend";

import { escapeHtml, renderMailHtml } from "@/lib/mail-template";
import { CONSENT_TEXT, PENDING_TTL_MS } from "@/lib/photo-consent";
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
  mail: { to: string; subject: string; text: string; html: string },
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

const TTL_DAYS = Math.round(PENDING_TTL_MS / (24 * 60 * 60 * 1000));

export function confirmationRequestMail(data: ConsentMailData) {
  const links = consentLinks(data.token);
  const child = escapeHtml(data.childName);
  const team = escapeHtml(data.teamName);
  return {
    subject: `Bitte bestätigen: Mannschaftsfoto ${data.teamName}`,
    html: renderMailHtml({
      preheader: `Ein Klick, dann darf das Mannschaftsfoto mit ${data.childName} auf svnord.de erscheinen.`,
      eyebrow: "Mannschaftsfoto",
      heading: "Bitte bestätige deine Zustimmung",
      paragraphs: [
        `Hallo ${escapeHtml(data.parentName)},`,
        `danke! Du hast zugestimmt, dass Mannschaftsfotos mit <strong>${child}</strong> (${team}) auf unserer Website erscheinen dürfen. Damit die Zustimmung gilt, bestätige sie bitte mit einem Klick.`,
      ],
      button: { label: "Zustimmung bestätigen", url: links.confirm },
      quote: { label: "Dem hast du zugestimmt", text: CONSENT_TEXT },
      footnotes: [
        `Der Link ist ${TTL_DAYS} Tage gültig. Ohne Bestätigung veröffentlichen wir nichts.`,
        `Du kannst deine Zustimmung jederzeit zurückziehen: <a href="${escapeHtml(links.revoke)}" style="color:#0b1b3f;">Zustimmung widerrufen</a>. Bewahre diese Mail dafür am besten auf.`,
        "Du hast das Formular nicht ausgefüllt? Dann ignoriere diese Mail einfach, es passiert nichts.",
      ],
    }),
    text: [
      `Hallo ${data.parentName},`,
      "",
      `danke! Du hast zugestimmt, dass Mannschaftsfotos mit ${data.childName} (${data.teamName}) auf unserer Website erscheinen dürfen. Damit die Zustimmung gilt, bestätige sie bitte hier:`,
      "",
      links.confirm,
      "",
      `Der Link ist ${TTL_DAYS} Tage gültig. Ohne Bestätigung veröffentlichen wir nichts.`,
      "",
      "Dem hast du zugestimmt:",
      CONSENT_TEXT,
      "",
      "Du kannst deine Zustimmung jederzeit zurückziehen. Bewahre diese Mail dafür am besten auf:",
      links.revoke,
      "",
      "Du hast das Formular nicht ausgefüllt? Dann ignoriere diese Mail einfach, es passiert nichts.",
      "",
      "SV Nord München-Lerchenau e.V.",
    ].join("\n"),
  };
}

export async function sendConfirmationRequest(
  data: ConsentMailData,
): Promise<void> {
  const cfg = resendConfig();
  if (!cfg) {
    // Lokal ohne Resend: Link im Log, damit sich der Ablauf testen laesst.
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[foto-zustimmung] Bestaetigungslink:",
        consentLinks(data.token).confirm,
      );
    }
    return;
  }
  await send(cfg, { to: data.email, ...confirmationRequestMail(data) });
}

type ClubNotice = {
  childName: string;
  teamName: string;
  confirmedCount: number;
};

export function clubNoticeMail(
  kind: "bestaetigt" | "widerrufen",
  data: ClubNotice,
) {
  const admin = `${SITE_URL}/admin/collections/photo-consents`;
  const child = escapeHtml(data.childName);
  const team = escapeHtml(data.teamName);
  if (kind === "bestaetigt") {
    const check =
      "Die Zahl allein reicht nicht: Bitte die Namen in der Übersicht mit den Kindern auf dem Foto abgleichen. Erst wenn jedes Kind auf dem Foto eine bestätigte Zustimmung hat, kann bei der Mannschaft das Häkchen „Mannschaftsfoto ausblenden“ raus.";
    return {
      subject: `Foto-Zustimmung · ${data.teamName}`,
      html: renderMailHtml({
        preheader: `${data.childName} (${data.teamName}) hat zugestimmt.`,
        eyebrow: "Foto-Zustimmung",
        heading: "Neue bestätigte Zustimmung",
        paragraphs: [
          `<strong>${child}</strong> (${team}) darf auf dem Mannschaftsfoto gezeigt werden.`,
          `Bestätigte Zustimmungen für diese Mannschaft: <strong>${data.confirmedCount}</strong>.`,
          escapeHtml(check),
        ],
        button: { label: "Zustimmungen ansehen", url: admin },
      }),
      text: [
        `Neue bestätigte Foto-Zustimmung: ${data.childName} (${data.teamName}).`,
        `Bestätigte Zustimmungen für diese Mannschaft: ${data.confirmedCount}.`,
        "",
        check,
        "",
        `Übersicht: ${admin}`,
      ].join("\n"),
    };
  }
  const todo =
    "Erst wieder einblenden, wenn ein Foto ohne das Kind vorliegt oder alle übrigen Eltern zugestimmt haben. Kommt der Name in der Mannschaft nicht vor, war es vermutlich ein Fehleintrag.";
  return {
    subject: `Widerruf Foto-Zustimmung · ${data.teamName}`,
    html: renderMailHtml({
      preheader: `Das Mannschaftsfoto von ${data.teamName} ist ausgeblendet.`,
      eyebrow: "Widerruf",
      heading: "Mannschaftsfoto ausgeblendet",
      paragraphs: [
        `Die Eltern von <strong>${child}</strong> (${team}) haben ihre Zustimmung widerrufen.`,
        "Das Mannschaftsfoto dieser Mannschaft ist ab sofort auf der Website ausgeblendet; das Häkchen „Mannschaftsfoto ausblenden“ ist gesetzt.",
        escapeHtml(todo),
      ],
      button: { label: "Zustimmungen ansehen", url: admin },
    }),
    text: [
      `Widerruf der Foto-Zustimmung: ${data.childName} (${data.teamName}).`,
      "",
      "Das Mannschaftsfoto dieser Mannschaft ist ab sofort ausgeblendet ('Mannschaftsfoto ausblenden' ist gesetzt).",
      todo,
      "",
      `Übersicht: ${admin}`,
    ].join("\n"),
  };
}

export async function notifyClub(
  kind: "bestaetigt" | "widerrufen",
  data: ClubNotice,
): Promise<void> {
  const cfg = resendConfig();
  if (!cfg) return;
  await send(cfg, { to: cfg.club, ...clubNoticeMail(kind, data) });
}
