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
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "author"],
    group: "Content",
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
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "excerpt", type: "textarea", admin: { description: "1–2 sentence teaser shown in cards." } },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", required: true },
    { name: "author", type: "relationship", relationTo: "people" },
    { name: "publishedAt", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    {
      name: "tags",
      type: "select",
      hasMany: true,
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
