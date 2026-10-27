import { describe, expect, it } from "vitest";

import { escapeHtml } from "@/lib/mail-template";
import {
  clubNoticeMail,
  confirmationRequestMail,
  consentLinks,
} from "@/lib/photo-consent-mail";

const data = {
  email: "eltern@example.org",
  parentName: "Erika <b>Muster</b>",
  childName: "Max O'Brien",
  teamName: "A1-Junioren · U19-I",
  token: "abcDEF123_-abcDEF123_-abcDEF123_-abcDEF12",
};

describe("escapeHtml", () => {
  it("escapes every character that could open markup", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
  });
});

describe("confirmationRequestMail", () => {
  const mail = confirmationRequestMail(data);
  const links = consentLinks(data.token);

  it("carries the confirm and the revoke link in both versions", () => {
    for (const body of [mail.html, mail.text]) {
      expect(body).toContain(links.confirm);
      expect(body).toContain(links.revoke);
    }
  });

  it("never lets a form value into the HTML unescaped", () => {
    expect(mail.html).not.toContain("<b>Muster</b>");
    expect(mail.html).toContain("Erika &lt;b&gt;Muster&lt;/b&gt;");
    expect(mail.html).toContain("Max O&#39;Brien");
  });

  it("keeps the plain text readable without markup", () => {
    expect(mail.text).toContain("Hallo Erika <b>Muster</b>,");
    expect(mail.text).not.toContain("<table");
  });
});

describe("clubNoticeMail", () => {
  it("tells the club the photo is hidden after a revocation", () => {
    const mail = clubNoticeMail("widerrufen", {
      childName: data.childName,
      teamName: data.teamName,
      confirmedCount: 0,
    });
    expect(mail.subject).toContain("Widerruf");
    expect(mail.text).toContain("ausgeblendet");
    expect(mail.html).toContain("/admin/collections/photo-consents");
  });

  it("reports the confirmed count after a confirmation", () => {
    const mail = clubNoticeMail("bestaetigt", {
      childName: data.childName,
      teamName: data.teamName,
      confirmedCount: 3,
    });
    expect(mail.text).toContain("Mannschaft: 3.");
  });
});
