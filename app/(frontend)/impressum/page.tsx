import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { LegalLayout } from "@/components/LegalLayout";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const LAST_UPDATED = "12. Mai 2026";

export default async function ImpressumPage() {
  const payload = await getPayloadClient();
  const legal = await payload.findGlobal({ slug: "legal-pages" });
  const contact = await payload.findGlobal({ slug: "contact-info" });

  const hasBody =
    legal.impressumBody &&
    typeof legal.impressumBody === "object" &&
    "root" in legal.impressumBody;

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
      eyebrow="Rechtliches · § 5 TMG"
      title="Impressum"
      lede="Pflichtangaben gemäß § 5 TMG sowie verantwortliche Person im Sinne von § 18 Abs. 2 MStV für den SV Nord München-Lerchenau e.V."
      lastUpdated={LAST_UPDATED}
      facts={[
        { label: "Vereinsname", value: "SV Nord München-Lerchenau e.V." },
        { label: "Gegründet", value: "1947" },
        { label: "Sitz", value: primary?.city ?? "München" },
        { label: "Rechtsform", value: "eingetragener Verein" },
      ]}
      sideLinks={[
        { href: "/datenschutz", label: "Datenschutzerklärung" },
        { href: "/kontakt", label: "Kontaktformular" },
        { href: "/verein/vorstand", label: "Vorstand" },
      ]}
      contact={{
        name: "SV Nord München-Lerchenau e.V.",
        streetLines,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
      }}
    >
      {hasBody ? (
        <RichText data={legal.impressumBody as SerializedEditorState} />
      ) : (
        <ImpressumDefault
          email={contact.email ?? null}
          phone={contact.phone ?? null}
          address={
            primary
              ? {
                  street: primary.street,
                  postalCode: primary.postalCode,
                  city: primary.city,
                }
              : null
          }
        />
      )}
    </LegalLayout>
  );
}

function ImpressumDefault({
  email,
  phone,
  address,
}: {
  email: string | null;
  phone: string | null;
  address: { street: string; postalCode: string; city: string } | null;
}) {
  return (
    <>
      <h2 id="anbieter">Angaben gemäß § 5 TMG</h2>
      <p>
        <strong>SV Nord München-Lerchenau e.V.</strong>
        {address ? (
          <>
            <br />
            {address.street}
            <br />
            {address.postalCode} {address.city}
            <br />
            Deutschland
          </>
        ) : null}
      </p>

      <h2 id="vertretung">Vertretungsberechtigte Vorstandschaft</h2>
      <p>
        Der Verein wird durch die im Vereinsregister eingetragenen Vorstände
        gemäß § 26 BGB gesetzlich vertreten. Die aktuelle Besetzung der
        Vorstandschaft findet sich auf der Seite{" "}
        <a href="/verein/vorstand">/verein/vorstand</a>.
      </p>

      <h2 id="register">Registereintrag</h2>
      <p>
        Eintragung im Vereinsregister.
        <br />
        Registergericht: Amtsgericht München
        <br />
        Registernummer: <em>im Admin pflegen</em>
      </p>

      <h2 id="kontakt">Kontakt</h2>
      <ul>
        {email ? (
          <li>
            E-Mail: <a href={`mailto:${email}`}>{email}</a>
          </li>
        ) : null}
        {phone ? (
          <li>
            Telefon: <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
          </li>
        ) : null}
        <li>
          Postanschrift: siehe oben unter <em>Angaben gemäß § 5 TMG</em>
        </li>
      </ul>

      <h2 id="redaktion">
        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
      </h2>
      <p>
        Verantwortlich für journalistisch-redaktionell gestaltete Inhalte ist
        die jeweils aktuelle 1. Vorsitzende bzw. der 1. Vorsitzende des Vereins,
        erreichbar unter der oben genannten Postanschrift.
      </p>

      <h2 id="eu-os">EU-Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr/
        </a>
        . Unsere E-Mail-Adresse findest du oben im Impressum.
      </p>

      <h2 id="vsbg">Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2 id="haftung-inhalt">Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
        bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder
        nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
        hinweisen.
      </p>
      <p>
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
        Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
        Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
        entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend
        entfernen.
      </p>

      <h2 id="haftung-links">Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren
        Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden
        Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
        verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
        Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte
        waren zum Zeitpunkt der Verlinkung nicht erkennbar.
      </p>

      <h2 id="urheberrecht">Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
        Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
        Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
        Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des
        jeweiligen Autors bzw. Erstellers.
      </p>
      <p>
        Mannschaftsfotos und Spieldaten stammen teilweise aus den offiziellen
        Datenfeeds des Bayerischen Fußball-Verbands (BFV) sowie von FuPa und
        sind dort entsprechend lizenziert.
      </p>

      <h2 id="bildnachweis">Bildnachweis</h2>
      <p>
        Wappen, Mannschafts- und Spielerfotos: SV Nord München-Lerchenau e.V.,
        BFV (Bayerischer Fußball-Verband) und FuPa GmbH. Produktbilder im Shop:{" "}
        <a
          href="https://www.11teamsports.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          11teamsports
        </a>
        .
      </p>

      <p className="!mt-12 rounded-xl border border-dashed border-nord-line bg-nord-paper-2 p-4 text-xs text-nord-muted">
        Hinweis: Diese Standardangaben wurden automatisch erzeugt. Pflege die
        finale Fassung im Admin unter{" "}
        <em>Globals → Legal Pages → Impressum Body</em>. Sobald dort Inhalt
        steht, wird er an Stelle dieses Texts angezeigt.
      </p>
    </>
  );
}
