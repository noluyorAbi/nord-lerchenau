import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { LegalLayout } from "@/components/LegalLayout";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const LAST_UPDATED = "12. Mai 2026";

export default async function DatenschutzPage() {
  const payload = await getPayloadClient();
  const legal = await payload.findGlobal({ slug: "legal-pages" });
  const contact = await payload.findGlobal({ slug: "contact-info" });

  const hasBody =
    legal.datenschutzBody &&
    typeof legal.datenschutzBody === "object" &&
    "root" in legal.datenschutzBody;

  const primary = Array.isArray(contact.addresses)
    ? contact.addresses[0]
    : null;
  const streetLines = primary
    ? [primary.street, `${primary.postalCode} ${primary.city}`.trim()].filter(
        (s) => s && s.trim().length > 0,
      )
    : [];

  return (
    <LegalLayout
      eyebrow="Rechtliches · DSGVO"
      title="Datenschutzerklärung"
      lede="Welche personenbezogenen Daten wir verarbeiten, warum, wie lange — und welche Rechte du als betroffene Person hast."
      lastUpdated={LAST_UPDATED}
      facts={[
        { label: "Rechtsgrundlage", value: "Art. 6 Abs. 1 DSGVO" },
        { label: "Hosting", value: "Vercel · EU" },
        { label: "DB", value: "Neon (EU)" },
        { label: "Newsletter", value: "Nein" },
        { label: "Tracking", value: "Keine Cookies" },
      ]}
      sideLinks={[
        { href: "/impressum", label: "Impressum" },
        { href: "/kontakt", label: "Kontaktformular" },
        {
          href: "mailto:info@svnord.de?subject=Datenschutz%20%E2%80%94%20Auskunft",
          label: "Datenauskunft anfragen",
        },
      ]}
      contact={{
        name: "SV Nord München-Lerchenau e.V.",
        streetLines,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
      }}
    >
      {hasBody ? (
        <RichText data={legal.datenschutzBody as SerializedEditorState} />
      ) : (
        <DatenschutzDefault
          email={contact.email ?? null}
          phone={contact.phone ?? null}
        />
      )}
    </LegalLayout>
  );
}

function DatenschutzDefault({
  email,
  phone,
}: {
  email: string | null;
  phone: string | null;
}) {
  return (
    <>
      <h2 id="verantwortlicher">1. Verantwortlicher</h2>
      <p>
        Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und
        anderer nationaler Datenschutzgesetze ist der{" "}
        <strong>SV Nord München-Lerchenau e.V.</strong>, vertreten durch die
        jeweils amtierende Vorstandschaft. Kontaktdaten siehe Spalte rechts und{" "}
        <a href="/impressum">Impressum</a>.
      </p>

      <h2 id="ueberblick">2. Überblick der Verarbeitungen</h2>
      <p>
        Wir verarbeiten personenbezogene Daten nur, wenn ein berechtigtes
        Interesse, ein Vertrag oder eine ausdrückliche Einwilligung vorliegt
        (Art. 6 Abs. 1 lit. a, b, f DSGVO). Konkret:
      </p>
      <ul>
        <li>
          <strong>Bereitstellung der Website</strong> — technisch notwendige
          Server-Logs (Lieferung der Seiten, Sicherheit).
        </li>
        <li>
          <strong>Kontaktformular</strong> — wenn du uns über{" "}
          <a href="/kontakt">/kontakt</a> schreibst.
        </li>
        <li>
          <strong>Eingebettete Karten- und Sportdaten</strong> — BFV, FuPa,
          OpenStreetMap.
        </li>
      </ul>
      <p>
        Es findet <strong>keine</strong> Webanalyse, kein Tracking und keine
        Werbe-Cookie-Verarbeitung statt. Wir bauen kein Profilbildungs-Cookie.
      </p>

      <h2 id="hosting">3. Hosting und Server-Logs</h2>
      <p>
        Die Website wird bei <strong>Vercel Inc.</strong> bzw. deren EU-Tochter
        gehostet. Bei jedem Aufruf werden technische Daten im Server-Log
        verarbeitet: IP-Adresse, Datum/Uhrzeit, aufgerufene Seite, User-Agent.
        Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an einem sicheren Betrieb). Logs werden nach
        spätestens 30 Tagen gelöscht oder anonymisiert.
      </p>
      <p>
        Die Datenbank läuft bei <strong>Neon</strong> in einer EU-Region. Mit
        beiden Anbietern bestehen Auftragsverarbeitungsverträge (Art. 28 DSGVO).
      </p>

      <h2 id="kontakt-form">4. Kontaktformular</h2>
      <p>
        Wenn du uns über das Kontaktformular eine Nachricht sendest, verarbeiten
        wir die von dir angegebenen Daten (Name, E-Mail, Telefon, Adresse,
        Anliegen, Betreff, Nachricht) zur Bearbeitung deiner Anfrage (Art. 6
        Abs. 1 lit. b und f DSGVO). Versand der E-Mail-Benachrichtigung an den
        Vorstand erfolgt über <strong>Resend</strong> (EU-Region). Die Daten
        werden in unserer Datenbank gespeichert und nach Abschluss der
        Bearbeitung gelöscht, spätestens jedoch nach 24 Monaten.
      </p>

      <h2 id="externe-dienste">5. Eingebundene externe Dienste</h2>
      <h3 id="bfv-fupa">5.1 BFV und FuPa</h3>
      <p>
        Spielpläne, Tabellen und Mannschaftsfotos beziehen wir live vom{" "}
        <strong>Bayerischen Fußball-Verband (BFV)</strong> und{" "}
        <strong>FuPa GmbH</strong>. Beim Aufruf einer Mannschaftsseite werden
        Anfragen an die jeweiligen Server gestellt; dabei wird deine IP-Adresse
        an den Anbieter übermittelt. Datenschutzhinweise siehe{" "}
        <a
          href="https://www.bfv.de/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
        >
          BFV-Datenschutz
        </a>{" "}
        und{" "}
        <a
          href="https://www.fupa.net/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
        >
          FuPa-Datenschutz
        </a>
        .
      </p>
      <h3 id="11teamsports">5.2 11teamsports Clubshop</h3>
      <p>
        Produktdaten unseres Vereinsshops werden serverseitig vom{" "}
        <strong>Clubshop bei 11teamsports</strong> abgerufen und auf{" "}
        <a href="/shop">/shop</a> dargestellt. Der Abruf erfolgt durch unseren
        Server, nicht durch deinen Browser — eine Übermittlung deiner IP-Adresse
        an 11teamsports findet erst statt, wenn du auf einen Produktlink
        klickst.
      </p>
      <h3 id="firecrawl">5.3 Firecrawl (Scraping-Proxy)</h3>
      <p>
        Für den Abruf der Clubshop-Daten nutzen wir den{" "}
        <strong>Firecrawl</strong>-Dienst. Es werden ausschließlich öffentliche
        Produktdaten geladen, keine Nutzerdaten von dir.
      </p>
      <h3 id="karten">5.4 Karten und Standort</h3>
      <p>
        Die Karte auf <a href="/kontakt">/kontakt</a> wird je nach Konfiguration
        als Iframe (Google Maps) oder als statische OpenStreetMap eingebunden.
        Bei eingebettetem Google Maps wird beim Laden der Karte deine IP-Adresse
        an Google übermittelt. Datenschutzhinweise:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com
        </a>
        .
      </p>

      <h2 id="cookies">6. Cookies und lokale Speicherung</h2>
      <p>
        Diese Website setzt{" "}
        <strong>keine Tracking-, Werbe- oder Analyse-Cookies</strong> ein.
        Notwendige technische Cookies (etwa Session-Token im Admin-Bereich)
        werden ausschließlich bei aktiver Nutzung des Admin-Logins gesetzt und
        sind für den Betrieb erforderlich (Art. 6 Abs. 1 lit. f DSGVO, § 25 Abs.
        2 Nr. 2 TTDSG).
      </p>

      <h2 id="rechte">7. Deine Rechte als betroffene Person</h2>
      <p>Du hast jederzeit das Recht auf:</p>
      <ul>
        <li>Auskunft über deine bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung („Recht auf Vergessenwerden“, Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>
          Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen
          (Art. 21 DSGVO)
        </li>
        <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft</li>
      </ul>
      <p>
        Anfragen richtest du formlos an{" "}
        {email ? (
          <a
            href={`mailto:${email}?subject=Datenschutz%20%E2%80%94%20Auskunft`}
          >
            {email}
          </a>
        ) : (
          <em>im Admin pflegen</em>
        )}
        {phone ? <> oder telefonisch unter {phone}</> : null}.
      </p>

      <h2 id="beschwerde">8. Beschwerderecht bei der Aufsichtsbehörde</h2>
      <p>
        Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die
        Verarbeitung deiner personenbezogenen Daten zu beschweren. Zuständig für
        unseren Sitz in München ist das{" "}
        <a
          href="https://www.lda.bayern.de/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bayerische Landesamt für Datenschutzaufsicht (BayLDA)
        </a>
        .
      </p>

      <h2 id="speicherdauer">9. Speicherdauer</h2>
      <p>
        Personenbezogene Daten werden nur so lange gespeichert, wie es zur
        Erfüllung des jeweiligen Zwecks oder zur Einhaltung gesetzlicher
        Aufbewahrungspflichten (z.B. Vereinsmitgliedschaft, steuerliche
        Pflichten nach AO/HGB) notwendig ist. Anfragen aus dem Kontaktformular
        werden spätestens nach 24 Monaten gelöscht.
      </p>

      <h2 id="aenderungen">10. Änderungen dieser Erklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie
        stets aktuellen rechtlichen Anforderungen entspricht. Die jeweils
        aktuelle Fassung findest du auf dieser Seite. Stand:{" "}
        <strong>{LAST_UPDATED}</strong>.
      </p>

      <p className="!mt-12 rounded-xl border border-dashed border-nord-line bg-nord-paper-2 p-4 text-xs text-nord-muted">
        Hinweis: Diese Datenschutzangaben sind eine fundierte Standardvorlage,
        ersetzen aber keine individuelle Rechtsberatung. Pflege die finale
        Fassung im Admin unter <em>Globals → Legal Pages → Datenschutz Body</em>
        ; sobald dort Inhalt steht, wird er statt dieses Texts ausgespielt.
      </p>
    </>
  );
}
