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
    livePreview: {
      url: ({ data }) => {
        const postSlug = typeof data?.slug === "string" ? data.slug : "new";
        const base =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        return `${base}/news/${postSlug}?preview=1`;
      },
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
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
          "1–2 Sätze. Wird in der News-Übersicht als Teaser angezeigt.",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Titelbild",
      admin: { description: "Großes Bild ganz oben im Artikel." },
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
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description:
          "Datum + Uhrzeit, ab wann der Artikel öffentlich sein soll.",
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
