import { clubAddress } from "@/lib/club-address";
import { SITE_URL } from "@/lib/site";

/**
 * Gemeinsames HTML-Layout fuer Mails des Vereins. Tabellen und Inline-Styles,
 * weil Gmail, Outlook und Apple Mail kein Stylesheet zuverlaessig lesen. Jede
 * Mail bekommt dazu eine Klartext-Fassung, die ohne HTML vollstaendig ist.
 *
 * Alle Werte, die aus einem Formular stammen, laufen durch escapeHtml: sie
 * landen in Mails an fremde Adressen.
 */

const C = {
  navy: "#0b1b3f",
  gold: "#c8a96a",
  goldInk: "#7a5c2a",
  paper: "#f4f1ea",
  paper2: "#eae5d8",
  ink: "#0c0c0e",
  muted: "#616161",
  line: "#e2ddd0",
};

// Feste Rueckfall-Anschrift: eine Mail fragt das CMS nicht extra ab.
const ADDRESS = clubAddress(null);

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type MailContent = {
  /** Vorschauzeile im Posteingang, unsichtbar in der Mail selbst. */
  preheader: string;
  eyebrow: string;
  heading: string;
  /** Absaetze als bereits escapter HTML-Text (siehe escapeHtml). */
  paragraphs: string[];
  button?: { label: string; url: string };
  /** Hervorgehobener Kasten, etwa der zugestimmte Text. */
  quote?: { label: string; text: string };
  /** Kleingedrucktes unter dem Inhalt, bereits escapt. */
  footnotes?: string[];
};

export function renderMailHtml(mail: MailContent): string {
  const p = (html: string) =>
    `<p style="margin:0 0 16px;font:400 16px/1.6 ${FONT};color:${C.ink};">${html}</p>`;

  const button = mail.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
        <tr><td style="border-radius:10px;background:${C.navy};">
          <a href="${escapeHtml(mail.button.url)}" style="display:inline-block;padding:14px 26px;font:600 16px/1 ${FONT};color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(mail.button.label)}&nbsp;&rarr;</a>
        </td></tr>
      </table>`
    : "";

  const quote = mail.quote
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
        <tr><td style="background:${C.paper};border-left:3px solid ${C.gold};border-radius:6px;padding:16px 18px;">
          <div style="font:600 11px/1.4 ${FONT};letter-spacing:0.14em;text-transform:uppercase;color:${C.goldInk};margin-bottom:6px;">${escapeHtml(mail.quote.label)}</div>
          <div style="font:400 14px/1.6 ${FONT};color:${C.ink};">${escapeHtml(mail.quote.text)}</div>
        </td></tr>
      </table>`
    : "";

  const footnotes = (mail.footnotes ?? [])
    .map(
      (f) =>
        `<p style="margin:0 0 10px;font:400 13px/1.55 ${FONT};color:${C.muted};">${f}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(mail.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(mail.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
      <tr><td style="background:${C.navy};border-radius:14px 14px 0 0;padding:20px 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:14px;"><img src="${SITE_URL}/icon-192.png" width="40" height="40" alt="SV Nord" style="display:block;border:0;"></td>
          <td>
            <div style="font:800 17px/1.1 ${FONT};color:#ffffff;letter-spacing:0.02em;">SV NORD</div>
            <div style="font:500 11px/1.4 ${FONT};color:${C.gold};letter-spacing:0.16em;text-transform:uppercase;">München-Lerchenau e.V.</div>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;border:1px solid ${C.line};border-top:0;border-radius:0 0 14px 14px;padding:32px 28px 24px;">
        <div style="font:600 11px/1.4 ${FONT};letter-spacing:0.18em;text-transform:uppercase;color:${C.goldInk};margin-bottom:8px;">${escapeHtml(mail.eyebrow)}</div>
        <h1 style="margin:0 0 20px;font:800 24px/1.25 ${FONT};color:${C.ink};">${escapeHtml(mail.heading)}</h1>
        ${mail.paragraphs.map(p).join("")}
        ${button}
        ${quote}
        ${footnotes ? `<div style="border-top:1px solid ${C.line};padding-top:18px;">${footnotes}</div>` : ""}
      </td></tr>
      <tr><td style="padding:20px 8px 0;text-align:center;font:400 12px/1.6 ${FONT};color:${C.muted};">
        SV Nord München-Lerchenau e.V. · ${ADDRESS.street} · ${ADDRESS.cityLine}<br>
        <a href="mailto:info@svnord.de" style="color:${C.muted};">info@svnord.de</a> · <a href="${SITE_URL}" style="color:${C.muted};">svnord.de</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
