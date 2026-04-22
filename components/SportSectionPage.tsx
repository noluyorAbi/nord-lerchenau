import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { PersonCard } from "@/components/PersonCard";
import { getPayloadClient } from "@/lib/payload";
import type { Media, Person } from "@/payload-types";

type Props = {
  sport: "volleyball" | "gymnastik" | "ski" | "esport" | "schiedsrichter";
  eyebrow: string;
  title: string;
  fallbackLede?: string;
};

export async function SportSectionPage({
  sport,
  eyebrow,
  title,
  fallbackLede,
}: Props) {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "teams",
    where: { sport: { equals: sport } },
    limit: 1,
    depth: 2,
  });

  const team = result.docs[0];
  if (!team) notFound();

  const trainers = (team.trainers ?? []).filter(
    (t): t is Person => typeof t === "object" && t !== null,
  );

  const hasDescription =
    team.description &&
    typeof team.description === "object" &&
    "root" in team.description;

  const externalLinks = (team.externalLinks ?? []).filter(
    (l): l is { id?: string | null; label: string; url: string } =>
      typeof l?.label === "string" && typeof l?.url === "string",
  );

  const photo =
    team.photo && typeof team.photo === "object" ? (team.photo as Media) : null;
  const heroSrc =
    photo && typeof photo.url === "string" && photo.url
      ? /^https?:\/\//.test(photo.url) &&
        !photo.url.includes("/api/media/file/")
        ? photo.url
        : photo.filename
          ? `/uploads/${photo.filename}`
          : null
      : null;

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lede={fallbackLede} />
      {heroSrc ? (
        <div className="mx-auto max-w-7xl px-6 pt-8 md:px-10 md:pt-12">
          <div className="relative overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={photo?.alt ?? `${title}-Abteilung`}
              className="aspect-[16/7] w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
          <div>
            {hasDescription ? (
              <div className="prose prose-neutral max-w-none">
                <RichText data={team.description as SerializedEditorState} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-nord-line bg-white p-8 text-sm text-nord-muted">
                Noch keine Beschreibung. Pflege die Seite im Admin unter{" "}
                <em>Teams → {team.name}</em>.
              </div>
            )}

            {trainers.length > 0 ? (
              <div className="mt-12">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
                  Ansprechpartner
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {trainers.map((trainer) => (
                    <PersonCard key={trainer.id} person={trainer} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {externalLinks.length > 0 ? (
            <aside>
              <div className="rounded-xl border border-nord-line bg-white p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  Extern
                </div>
                <ul className="mt-3 space-y-2">
                  {externalLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-nord-navy hover:text-nord-navy-2"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </>
  );
}
