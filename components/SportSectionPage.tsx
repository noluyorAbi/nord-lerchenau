import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { PageHero } from "@/components/PageHero";
import { PersonCard } from "@/components/PersonCard";
import { getPayloadClient } from "@/lib/payload";
import { mediaSrc } from "@/lib/publicUploads";
import type { Media, Person } from "@/payload-types";

export type StaticContact = {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
};

export type SportStat = { label: string; value: string };
export type SportHighlight = {
  eyebrow: string;
  title: string;
  body: string;
  accent?: "gold" | "navy" | "sky";
};
export type SportCta = {
  title: string;
  body: string;
  mailSubject?: string;
  primaryLabel?: string;
};

type Props = {
  sport: "volleyball" | "gymnastik" | "ski" | "esport" | "schiedsrichter";
  eyebrow: string;
  title: string;
  fallbackLede?: string;
  hideTrainers?: boolean;
  excludeTrainerNames?: string[];
  staticContacts?: StaticContact[];
  intro?: string;
  pills?: string[];
  stats?: SportStat[];
  highlights?: SportHighlight[];
  cta?: SportCta;
};

const RICH_TEXT_CLS = [
  "max-w-none text-[15px] leading-relaxed text-nord-ink/85 md:text-base",
  // Headings
  "[&_h2]:font-display [&_h2]:text-[24px] [&_h2]:md:text-[28px] [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-nord-ink [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:first:mt-0",
  "[&_h2]:relative [&_h2]:pl-4 [&_h2]:before:absolute [&_h2]:before:left-0 [&_h2]:before:top-[0.45em] [&_h2]:before:h-[0.7em] [&_h2]:before:w-[3px] [&_h2]:before:rounded-full [&_h2]:before:bg-nord-gold",
  "[&_h3]:font-display [&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-nord-ink [&_h3]:mt-7 [&_h3]:mb-2",
  "[&_h4]:font-display [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-nord-ink [&_h4]:mt-5 [&_h4]:mb-1",
  // Paragraphs + lists
  "[&_p]:mt-3 [&_p]:first:mt-0",
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6",
  "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6",
  "[&_strong]:font-semibold [&_strong]:text-nord-ink",
  "[&_em]:italic [&_em]:text-nord-ink/75",
  "[&_a]:font-semibold [&_a]:text-nord-navy [&_a]:underline-offset-2 hover:[&_a]:underline",
].join(" ");

const STATIC_HERO: Partial<Record<Props["sport"], string>> = {
  gymnastik: "/sport/gymnastik-hero.jpg",
  volleyball: "/sport/volleyball-hero.jpg",
  ski: "/sport/ski-hero.jpg",
};

function highlightStyles(accent: SportHighlight["accent"] = "navy") {
  switch (accent) {
    case "gold":
      return {
        wrap: "border-nord-gold/40 bg-gradient-to-br from-[#fffbef] via-white to-[#fffaf0]",
        eyebrow: "text-nord-gold",
      };
    case "sky":
      return {
        wrap: "border-nord-line bg-gradient-to-br from-[#e8f3ff] via-white to-white",
        eyebrow: "text-nord-navy",
      };
    case "navy":
    default:
      return {
        wrap: "border-nord-line bg-white",
        eyebrow: "text-nord-gold",
      };
  }
}

export async function SportSectionPage({
  sport,
  eyebrow,
  title,
  fallbackLede,
  hideTrainers,
  excludeTrainerNames,
  staticContacts,
  intro,
  pills,
  stats,
  highlights,
  cta,
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

  const excludeSet = new Set(
    (excludeTrainerNames ?? []).map((n) => n.toLowerCase().trim()),
  );
  const trainers = hideTrainers
    ? []
    : (team.trainers ?? [])
        .filter((t): t is Person => typeof t === "object" && t !== null)
        .filter(
          (t) =>
            !excludeSet.has(
              String(t.name ?? "")
                .toLowerCase()
                .trim(),
            ),
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
  // Resolve the uploaded team photo via mediaSrc: prefer the committed asset in
  // public/uploads, falling back to any stored URL.
  const mediaHeroSrc = mediaSrc(photo);
  // Prefer the curated, tracked static hero whenever we ship one for this sport;
  // only use a CMS/Blob upload where no static hero exists. This prevents a dead
  // Blob URL (e.g. the Ski team photo that was never uploaded) from rendering as
  // a broken image.
  const heroSrc = STATIC_HERO[sport] ?? mediaHeroSrc ?? null;

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
        <div className="grid gap-10 md:grid-cols-[1.55fr_1fr]">
          {/* MAIN */}
          <article>
            <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
              Herzlich willkommen in der {title}-Abteilung
            </div>

            {pills && pills.length > 0 ? (
              <div className="mb-6 flex flex-wrap gap-2">
                {pills.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center rounded-full border border-nord-line bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-ink"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : null}

            {intro ? (
              <p className="mb-6 max-w-prose text-lg font-medium leading-relaxed text-nord-ink">
                {intro}
              </p>
            ) : null}

            {hasDescription &&
            !(intro && highlights && highlights.length > 0) ? (
              <div className={RICH_TEXT_CLS}>
                <RichText data={team.description as SerializedEditorState} />
              </div>
            ) : !hasDescription && !intro ? (
              <div className="rounded-xl border border-dashed border-nord-line bg-white p-8 text-sm text-nord-muted">
                Noch keine Beschreibung. Pflege die Seite im Admin unter{" "}
                <em>Teams → {team.name}</em>.
              </div>
            ) : null}

            {highlights && highlights.length > 0 ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {highlights.map((h) => {
                  const s = highlightStyles(h.accent);
                  return (
                    <article
                      key={h.title}
                      className={`rounded-2xl border p-6 ${s.wrap}`}
                    >
                      <div
                        className={`font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${s.eyebrow}`}
                      >
                        {h.eyebrow}
                      </div>
                      <h3 className="mt-2 font-display text-xl font-black tracking-tight text-nord-ink">
                        {h.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-nord-ink/80 md:text-[15px]">
                        {h.body}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {cta ? (
              <section className="mt-10 overflow-hidden rounded-2xl bg-nord-ink p-7 text-white md:p-9">
                <div className="grid gap-5 md:grid-cols-[2fr_1fr] md:items-center">
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                      Mitmachen
                    </div>
                    <h3 className="mt-2 font-display text-xl font-black tracking-tight md:text-2xl">
                      {cta.title}
                    </h3>
                    <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/80 md:text-base">
                      {cta.body}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <a
                      href={`mailto:info@svnord.de${cta.mailSubject ? `?subject=${encodeURIComponent(cta.mailSubject)}` : ""}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-nord-gold px-5 py-3 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-nord-navy transition hover:-translate-y-px hover:brightness-105"
                    >
                      {cta.primaryLabel ?? "Mail an info@svnord.de"} →
                    </a>
                    <Link
                      href={`/kontakt?subject=${encodeURIComponent(title)}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-nord-navy"
                    >
                      Kontaktformular →
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}

            {trainers.length > 0 ? (
              <div className="mt-12">
                <div className="mb-4 flex items-baseline justify-between border-b border-nord-line pb-2">
                  <h2 className="font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
                    Ansprechpartner
                  </h2>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-muted">
                    {trainers.length}{" "}
                    {trainers.length === 1 ? "Person" : "Personen"}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {trainers.map((trainer) => (
                    <PersonCard key={trainer.id} person={trainer} />
                  ))}
                </div>
              </div>
            ) : staticContacts && staticContacts.length > 0 ? (
              <div className="mt-12">
                <div className="mb-4 flex items-baseline justify-between border-b border-nord-line pb-2">
                  <h2 className="font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
                    Ansprechpartner
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {staticContacts.map((c) => (
                    <article
                      key={c.name}
                      className="overflow-hidden rounded-2xl border border-nord-line bg-white p-5"
                    >
                      <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-nord-navy to-nord-navy-2 text-base font-bold text-white">
                        {c.name
                          .split(/\s+/)
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <h3 className="mt-4 font-display text-base font-extrabold tracking-tight text-nord-ink">
                        {c.name}
                      </h3>
                      {c.role ? (
                        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-sky">
                          {c.role}
                        </div>
                      ) : null}
                      <div className="mt-3 space-y-1 text-xs">
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone.replace(/\s/g, "")}`}
                            className="block font-semibold text-nord-muted transition hover:text-nord-navy"
                          >
                            ☎ {c.phone}
                          </a>
                        ) : null}
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="block font-semibold text-nord-muted transition hover:text-nord-navy"
                          >
                            ✉ {c.email}
                          </a>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          {/* SIDEBAR */}
          <aside className="space-y-5 md:sticky md:top-24 md:h-fit md:self-start">
            {stats && stats.length > 0 ? (
              <div className="rounded-2xl bg-nord-ink p-6 text-white">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                  Auf einen Blick
                </div>
                <dl className="mt-3 divide-y divide-white/10 text-sm">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <dt className="text-white/70">{s.label}</dt>
                      <dd className="text-right font-display font-bold">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="rounded-2xl border border-nord-line bg-white p-6">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                Kontakt
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <a
                  href={`mailto:info@svnord.de?subject=${encodeURIComponent(title)}`}
                  className="block font-semibold text-nord-ink transition hover:text-nord-navy"
                >
                  ✉ info@svnord.de
                </a>
                <Link
                  href={`/kontakt?subject=${encodeURIComponent(title)}`}
                  className="block font-semibold text-nord-ink transition hover:text-nord-navy"
                >
                  Kontaktformular →
                </Link>
              </div>
            </div>

            {externalLinks.length > 0 ? (
              <div className="rounded-2xl border border-nord-line bg-white p-6">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-muted">
                  Extern
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {externalLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-nord-navy transition hover:text-nord-gold"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
