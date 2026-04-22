import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "https://svnord-lerchenau.de";
const SITE_NAME = "SV Nord München-Lerchenau e.V.";

/**
 * Club-level Organization / SportsOrganization + WebSite schema. Emitted
 * once per page via the root layout so every URL carries the entity
 * context without LLMs having to crawl deeper to figure out what the site
 * is about.
 */
export function SiteSchema() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["SV Nord", "SV N Lerchenau", "SV Nord Lerchenau"],
    legalName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/svnord-logo.png`,
    image: `${SITE_URL}/svnord-logo.png`,
    foundingDate: "1947-10-15",
    foundingLocation: {
      "@type": "Place",
      name: "Lerchenau, München",
    },
    slogan: "Einmal Nordler, immer Nordler.",
    description:
      "Traditionsverein im Münchner Norden seit 1947. Fußball, Volleyball, Gymnastik, Ski und Esport. Rund 600 Mitglieder.",
    sport: ["Fußball", "Volleyball", "Gymnastik", "Ski", "Esport"],
    memberOf: {
      "@type": "SportsOrganization",
      name: "Bayerischer Fußball-Verband",
      url: "https://www.bfv.de",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ebereschenstraße 17",
      postalCode: "80935",
      addressLocality: "München",
      addressRegion: "BY",
      addressCountry: "DE",
    },
    location: {
      "@type": "Place",
      name: "Bezirkssportanlage Lerchenau – Eschengarten",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ebereschenstraße 17",
        postalCode: "80935",
        addressLocality: "München",
        addressRegion: "BY",
        addressCountry: "DE",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 48.1994,
        longitude: 11.5545,
      },
    },
    email: "info@svnord.de",
    telephone: "+49 172 9808109",
    identifier: [
      {
        "@type": "PropertyValue",
        propertyID: "Vereinsregister",
        value: "VR 6924",
      },
      {
        "@type": "PropertyValue",
        propertyID: "BFV-Vereins-ID",
        value: "00ES8GNHD400000DVV0AG08LVUPGND5I",
      },
      {
        "@type": "PropertyValue",
        propertyID: "fupa-Slug",
        value: "sv-nord-muenchen-lerchenau",
      },
    ],
    sameAs: [
      "https://www.instagram.com/svnord_lerchenau/",
      "https://www.facebook.com/svnordlerchenau/",
      "https://www.linkedin.com/company/sv-nord-m%C3%BCnchen-lerchenau",
      "https://www.bfv.de/vereine/sv-nord-muenchen-lerchenau/00ES8GNHD400000DVV0AG08LVUPGND5I",
      "https://www.fupa.net/club/sv-nord-muenchen-lerchenau",
      "https://www.11teamsports.com/de-de/clubshop/sv-nord-muenchen-lerchenau/",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Allgemeine Anfragen",
        email: "info@svnord.de",
        availableLanguage: ["de"],
      },
      {
        "@type": "ContactPoint",
        contactType: "Vorstand",
        name: "Ralf Kirmeyer",
        email: "ralf.kirmeyer@svnord.de",
        telephone: "+49 172 9808109",
      },
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "de-DE",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd id="schema-organization" data={organization} />
      <JsonLd id="schema-website" data={website} />
    </>
  );
}
