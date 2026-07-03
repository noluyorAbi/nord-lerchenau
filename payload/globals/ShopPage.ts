import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const ShopPage: GlobalConfig = {
  slug: "shop-page",
  label: "Vereinsshop",
  admin: {
    group: "6. Seiten",
    description:
      "Texte der Seite /shop. Die Artikel selbst kommen live von 11teamsports und werden hier nicht gepflegt.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("shop-page")] },
  fields: [
    {
      type: "collapsible",
      label: "Metadaten (SEO)",
      admin: {
        initCollapsed: true,
        description:
          "Browser-Titel und Suchmaschinen-Beschreibung der Shop-Seite.",
      },
      fields: [
        {
          name: "metaTitle",
          type: "text",
          label: "Seitentitel (Browser-Tab / SEO)",
          defaultValue: "Vereinsshop",
          admin: {
            description:
              "Erscheint im Browser-Tab und in Suchergebnissen. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "metaDescription",
          type: "textarea",
          label: "SEO-Beschreibung",
          defaultValue:
            "Der offizielle SV Nord München-Lerchenau Fanshop bei 11teamsports: Trainingskollektion und Fanartikel in Vereinsfarben.",
          admin: {
            description:
              "Kurzbeschreibung für Google & Co. Wenn leer, wird der Standardtext verwendet.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Seitenkopf (Intro)",
      admin: {
        initCollapsed: true,
        description: "Der große Kopfbereich oben auf der Shop-Seite.",
      },
      fields: [
        {
          name: "heroEyebrow",
          type: "text",
          label: "Überzeile (Eyebrow)",
          defaultValue: "Vereinsshop",
          admin: {
            description:
              "Kleine Zeile über der Hauptüberschrift. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "heroTitle",
          type: "text",
          label: "Hauptüberschrift",
          defaultValue: "Unser eigener Vereinsshop.",
          admin: {
            description:
              "Große Überschrift im Seitenkopf. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "heroLede",
          type: "textarea",
          label: "Einleitungstext",
          defaultValue:
            "Liebe Nordler! Der digitale Fanshop beim Partner 11teamsports ist online. Trainingskollektion, Taschen und Fan-Artikel im offiziellen SV-Nord-Design, direkt in Vereinsfarben bestellbar.",
          admin: {
            description:
              "Beschreibungstext unter der Hauptüberschrift. Wenn leer, wird der Standardtext verwendet.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Starterpaket",
      admin: {
        initCollapsed: true,
        description:
          "Der hervorgehobene Block für neue Mitglieder. Wird nur angezeigt, wenn Live-Artikel geladen werden konnten.",
      },
      fields: [
        {
          name: "starterBadge",
          type: "text",
          label: "Badge: Starterpaket",
          defaultValue: "Starterpaket",
          admin: {
            description:
              "Linkes kleines Label am Block-Anfang. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "partnerBadge",
          type: "text",
          label: "Badge: Partner",
          defaultValue: "Offizieller Partner · 11teamsports",
          admin: {
            description:
              "Rechtes kleines Label (Partner-Hinweis). Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "starterHeading",
          type: "text",
          label: "Überschrift",
          defaultValue: "Du bist neu? Damit startest du komplett.",
          admin: {
            description:
              "Überschrift des Starterpaket-Blocks. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "starterIntro",
          type: "textarea",
          label: "Einleitungstext",
          defaultValue:
            "Vier Basics, die jedes neue Mitglied im Schrank haben sollte, alle direkt im Clubshop verfügbar.",
          admin: {
            description:
              "Beschreibungstext unter der Überschrift. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "starterCtaLabel",
          type: "text",
          label: "Button: Komplette Auswahl",
          defaultValue: "Komplette Auswahl ↗",
          admin: {
            description:
              "Beschriftung des Buttons zum Clubshop. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "starterInShopLabel",
          type: "text",
          label: "Karten-Label: im Shop verfügbar",
          defaultValue: "Im Shop",
          admin: {
            description:
              "Kleiner Hinweis auf einer Karte, wenn der Artikel live gefunden wurde. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "starterSuggestionLabel",
          type: "text",
          label: "Karten-Label: Vorschlag",
          defaultValue: "Vorschlag",
          admin: {
            description:
              "Kleiner Hinweis auf einer Karte, wenn kein passender Live-Artikel gefunden wurde. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "starterSlots",
          type: "array",
          label: "Starterpaket-Bausteine (4 Karten)",
          minRows: 0,
          maxRows: 4,
          labels: { singular: "Baustein", plural: "Bausteine" },
          admin: {
            description:
              "Titel und Beschreibung der vier Karten (T-Shirt, Hose, Rucksack, Trainingsanzug). Die Reihenfolge bestimmt, welcher Karte der Text zugeordnet wird. Die automatische Produktsuche bleibt fest verdrahtet.",
          },
          defaultValue: [
            {
              title: "T-Shirt",
              blurb:
                "Atmungsaktiv fürs Training und für drunter unter dem Trikot.",
            },
            {
              title: "Kurze Hose",
              blurb:
                "Trainings-Short in Vereinsfarben, auch perfekt fürs Hallentraining.",
            },
            {
              title: "Rucksack",
              blurb: "Tiro Rucksack für Schuhe, Trikot und Schienbeinschoner.",
            },
            {
              title: "Trainingsanzug",
              blurb: "Jacke + Hose im Set für An- und Abreise rund ums Spiel.",
            },
          ],
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Karten-Titel",
              admin: { description: "Kurzer Name des Bausteins." },
            },
            {
              name: "blurb",
              type: "textarea",
              required: true,
              label: "Karten-Beschreibung",
              admin: {
                description:
                  "Wird angezeigt, solange kein passender Live-Artikel gefunden wurde.",
              },
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Shop-CTA (dunkler Block)",
      admin: {
        initCollapsed: true,
        description: "Der dunkle Aufruf-Block mit Button zum digitalen Shop.",
      },
      fields: [
        {
          name: "ctaEyebrow",
          type: "text",
          label: "Überzeile (Eyebrow)",
          defaultValue: "Vereinsshop",
          admin: {
            description:
              "Kleine goldene Zeile über der Überschrift. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "ctaHeading",
          type: "text",
          label: "Überschrift",
          defaultValue: "Zum digitalen Fanshop",
          admin: {
            description:
              "Überschrift des dunklen Blocks. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "ctaLeadPrefix",
          type: "text",
          label: "Text vor dem Partnernamen",
          defaultValue: "Alle Artikel werden direkt über",
          admin: {
            description:
              "Erster Teil des Fließtexts, vor dem hervorgehobenen Partnernamen. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "ctaPartnerName",
          type: "text",
          label: "Partnername (hervorgehoben)",
          defaultValue: "11teamsports",
          admin: {
            description:
              "Wird im Fließtext fett dargestellt. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "ctaLeadSuffix",
          type: "text",
          label: "Text nach dem Partnernamen",
          defaultValue: "versendet. Auswahl wird stündlich aktualisiert.",
          admin: {
            description:
              "Zweiter Teil des Fließtexts, nach dem Partnernamen. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "ctaButtonLabel",
          type: "text",
          label: "Button: Shop öffnen",
          defaultValue: "Shop öffnen ↗",
          admin: {
            description:
              "Beschriftung des Buttons zum Shop. Wenn leer, wird der Standardtext verwendet.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Artikelliste",
      admin: {
        initCollapsed: true,
        description:
          "Überschriften und Hinweistexte rund um die live geladene Artikelliste.",
      },
      fields: [
        {
          name: "productsHeading",
          type: "text",
          label: "Überschrift Artikelliste",
          defaultValue: "Aktuelle Artikel",
          admin: {
            description:
              "Überschrift über der Live-Artikelliste. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "productsCountSuffix",
          type: "text",
          label: "Zähler-Zusatz",
          defaultValue: "Artikel · Live",
          admin: {
            description:
              "Steht hinter der Artikelanzahl (z. B. „12 Artikel · Live“). Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "emptyStatePrefix",
          type: "text",
          label: "Fehlerhinweis: Text vor dem Link",
          defaultValue:
            "Aktuell kann die Artikelliste nicht geladen werden. Bitte direkt im",
          admin: {
            description:
              "Wird angezeigt, wenn keine Live-Artikel geladen werden können. Erster Teil vor dem Link. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "emptyStateLinkLabel",
          type: "text",
          label: "Fehlerhinweis: Linktext",
          defaultValue: "Clubshop bei 11teamsports",
          admin: {
            description:
              "Verlinkter Text im Fehlerhinweis. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "emptyStateSuffix",
          type: "text",
          label: "Fehlerhinweis: Text nach dem Link",
          defaultValue: "stöbern.",
          admin: {
            description:
              "Letzter Teil des Fehlerhinweises, nach dem Link. Wenn leer, wird der Standardtext verwendet.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Hinweis für aktive Mannschaften",
      admin: {
        initCollapsed: true,
        description: "Der hellgraue Hinweisblock ganz unten auf der Seite.",
      },
      fields: [
        {
          name: "noticeLabel",
          type: "text",
          label: "Überzeile",
          defaultValue: "Hinweis für aktive Mannschaften",
          admin: {
            description:
              "Kleine Überzeile des Hinweisblocks. Wenn leer, wird der Standardtext verwendet.",
          },
        },
        {
          name: "noticeBody",
          type: "textarea",
          label: "Hinweistext",
          defaultValue:
            "Match-Trikots und einheitliche Spielausstattung gibt es nicht im öffentlichen Clubshop. Für offizielle Trikots, Trainingsanzüge und Aufwärmshirts in den Teamfarben wendet euch bitte an die sportliche Leitung bzw. eure Trainer:innen. Die Abteilung bündelt Bestellungen und sorgt für einheitliches Auftreten auf dem Platz.",
          admin: {
            description:
              "Erläuterungstext an aktive Mannschaften. Wenn leer, wird der Standardtext verwendet.",
          },
        },
      ],
    },
  ],
};
