import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";
import { slug as toSlug } from "@/lib/slug";

const fillSlug: CollectionBeforeChangeHook = ({ data }) => {
  if (!data.slug && data.title) {
    data.slug = toSlug(String(data.title));
  }
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "News-Artikel", plural: "News & Berichte" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "author"],
    description:
      "Vereinsnews, Spielberichte und Ankündigungen. Erscheint unter /news.",
    group: "1. Inhalte",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [fillSlug],
    afterChange: [revalidateOnChange("posts")],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Überschrift",
      admin: { description: "Wird groß oben auf dem Artikel angezeigt." },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL-Kürzel",
      admin: {
        description:
          "Wird automatisch aus der Überschrift erstellt. Nur ändern, wenn nötig.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Kurzfassung",
      admin: {
        description:
          "1 bis 2 Sätze. Wird in der News-Übersicht als Teaser angezeigt.",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Titelbild",
      admin: {
        description:
          "Optionales Titelbild der News. Wird angezeigt, wenn gesetzt.",
      },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      label: "Artikeltext",
      admin: { description: "Der eigentliche Inhalt des Artikels." },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "people",
      label: "Autor:in",
      admin: { description: "Optional. Wer hat den Artikel geschrieben?" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      label: "Veröffentlichungsdatum",
      // Prefilled with "now": without a default the very first save of every
      // article failed on this field, and a first-time editor has no way of
      // knowing that the fix is a date picker further down the form.
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description:
          "Steht oben am Artikel und bestimmt die Reihenfolge in der News-Liste (neuestes zuerst). Ist mit jetzt vorbelegt.",
      },
    },
    {
      name: "tags",
      type: "select",
      hasMany: true,
      label: "Schlagwörter",
      admin: {
        description: "Mehrere möglich. Dient zur Filterung in der News-Liste.",
      },
      options: [
        { label: "Spielbericht", value: "spielbericht" },
        { label: "Verein", value: "verein" },
        { label: "Jugend", value: "jugend" },
        { label: "Event", value: "event" },
        { label: "Sponsoren", value: "sponsoren" },
        { label: "Allgemein", value: "allgemein" },
      ],
    },
  ],
};
