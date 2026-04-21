import { ContactForm } from "@/components/ContactForm";
import { MapEmbed } from "@/components/MapEmbed";
import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ subject?: string }>;
};

export default async function KontaktPage({ searchParams }: Props) {
  const { subject } = await searchParams;
  const payload = await getPayloadClient();
  const contact = await payload.findGlobal({ slug: "contact-info" });

  const addresses = Array.isArray(contact.addresses) ? contact.addresses : [];
  const hours = Array.isArray(contact.openingHours)
    ? contact.openingHours.filter(
        (h): h is NonNullable<typeof h> & { day: string; hours: string } =>
          Boolean(h?.day && h?.hours),
      )
    : [];

  const customEmbed =
    contact.mapEmbedSrc && contact.mapEmbedSrc.startsWith("http")
      ? contact.mapEmbedSrc
      : null;

  const primary = addresses[0];
  const directionsHref = primary
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${primary.label ?? ""}, ${primary.street}, ${primary.postalCode} ${primary.city}`,
      )}`
    : null;

  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Schreib uns."
        lede="Fragen zu Mitgliedschaft, Training, Sponsoring oder einfach so — wir freuen uns über deine Nachricht."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1.35fr_1fr] md:gap-10">
          <section className="rounded-2xl border border-nord-line bg-white p-6 shadow-[0_1px_0_rgba(11,27,63,0.04)] md:p-10">
            <div className="mb-7 md:mb-9">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
                Nachricht
              </div>
              <h2
                className="mt-2 font-display font-black leading-[1.05] text-nord-ink"
                style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}
              >
                Schreib uns direkt.
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-nord-muted">
                Felder mit <span className="text-nord-navy-2">*</span> sind
                Pflichtfelder. Meist melden wir uns innerhalb von 48 Stunden.
              </p>
            </div>

            <ContactForm defaultSubject={subject} />

            <p className="mt-7 border-t border-nord-line pt-5 text-[11px] leading-relaxed text-nord-muted">
              Mit dem Absenden stimmst du der Verarbeitung deiner Angaben zur
              Bearbeitung deiner Anfrage zu. Mehr dazu in unserer{" "}
              <a
                href="/datenschutz"
                className="font-semibold text-nord-navy hover:text-nord-navy-2"
              >
                Datenschutzerklärung
              </a>
              .
            </p>
          </section>

          <aside className="space-y-5">
            {(contact.email || contact.phone) && (
              <div className="overflow-hidden rounded-2xl bg-nord-ink p-7 text-white md:p-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                  Direkt erreichen
                </div>
                <p className="mt-3 font-display text-[22px] font-extrabold leading-tight">
                  Kurzer Draht zum Verein.
                </p>
                <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="group flex items-center gap-3 text-white/85 transition hover:text-nord-gold"
                    >
                      <span className="w-10 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                        Mail
                      </span>
                      <span className="truncate font-semibold">
                        {contact.email}
                      </span>
                      <span
                        className="ml-auto text-nord-gold opacity-0 transition group-hover:opacity-100"
                        aria-hidden
                      >
                        →
                      </span>
                    </a>
                  ) : null}
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="group flex items-center gap-3 text-white/85 transition hover:text-nord-gold"
                    >
                      <span className="w-10 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                        Tel
                      </span>
                      <span className="font-semibold">{contact.phone}</span>
                      <span
                        className="ml-auto text-nord-gold opacity-0 transition group-hover:opacity-100"
                        aria-hidden
                      >
                        →
                      </span>
                    </a>
                  ) : null}
                </div>
              </div>
            )}

            {addresses.length > 0 ? (
              <div className="rounded-2xl border border-nord-line bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                    Adressen
                  </div>
                  {directionsHref ? (
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-navy transition hover:text-nord-gold"
                    >
                      Route ↗
                    </a>
                  ) : null}
                </div>
                <ul className="mt-4 space-y-4">
                  {addresses.map((addr, i) => (
                    <li
                      key={addr.id ?? `addr-${i}`}
                      className="border-l-2 border-nord-gold/70 pl-3"
                    >
                      <div className="text-[13px] font-semibold text-nord-ink">
                        {addr.label}
                      </div>
                      <div className="mt-0.5 text-xs leading-relaxed text-nord-muted">
                        {addr.street}
                        <br />
                        {addr.postalCode} {addr.city}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {hours.length > 0 ? (
              <div className="rounded-2xl border border-nord-line bg-white p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                  Öffnungszeiten
                </div>
                <dl className="mt-4 divide-y divide-nord-line/70 text-xs">
                  {hours.map((h, i) => (
                    <div
                      key={h.id ?? `h-${i}`}
                      className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0"
                    >
                      <dt className="font-semibold text-nord-ink">{h.day}</dt>
                      <dd className="text-nord-muted">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2 shadow-[0_20px_48px_-24px_rgba(11,27,63,0.25)]">
              <div className="aspect-[4/3] w-full">
                {customEmbed ? (
                  <iframe
                    src={customEmbed}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Karte Vereinsheim"
                    style={{ colorScheme: "normal" }}
                  />
                ) : (
                  <MapEmbed
                    lat={48.1994}
                    lon={11.5545}
                    zoom={15.6}
                    label={primary?.label ?? "Vereinsheim"}
                    variant="positron"
                    className="relative h-full w-full"
                  />
                )}
              </div>
              {primary ? (
                <div className="border-t border-nord-line bg-white/90 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-nord-muted backdrop-blur">
                  {primary.street} · {primary.postalCode} {primary.city}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
