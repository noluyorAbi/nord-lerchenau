import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

type Props = {
  searchParams: Promise<{ subject?: string }>;
};

export default async function KontaktPage({ searchParams }: Props) {
  const { subject } = await searchParams;
  const payload = await getPayloadClient();
  const contact = await payload.findGlobal({ slug: "contact-info" });

  const addresses = Array.isArray(contact.addresses) ? contact.addresses : [];
  const hours = Array.isArray(contact.openingHours) ? contact.openingHours : [];

  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Schreib uns."
        lede="Fragen zu Mitgliedschaft, Training, Sponsoring oder einfach so — wir freuen uns über deine Nachricht."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <section>
            <div className="rounded-xl border border-nord-line bg-white p-6 md:p-8">
              <ContactForm defaultSubject={subject} />
            </div>
          </section>

          <aside className="space-y-5 text-sm">
            {addresses.length > 0 ? (
              <div className="rounded-xl border border-nord-line bg-white p-6">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  Adressen
                </div>
                <div className="mt-3 space-y-4">
                  {addresses.map((addr, i) => (
                    <div key={addr.id ?? `addr-${i}`}>
                      <div className="text-xs font-semibold text-nord-ink">
                        {addr.label}
                      </div>
                      <div className="mt-0.5 text-xs text-nord-muted">
                        {addr.street}
                        <br />
                        {addr.postalCode} {addr.city}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(contact.email || contact.phone) && (
              <div className="rounded-xl border border-nord-line bg-white p-6">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  Erreichbarkeit
                </div>
                <div className="mt-3 space-y-1 text-xs text-nord-muted">
                  {contact.email ? (
                    <div>
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-semibold text-nord-navy hover:text-nord-navy-2"
                      >
                        {contact.email}
                      </a>
                    </div>
                  ) : null}
                  {contact.phone ? <div>{contact.phone}</div> : null}
                </div>
              </div>
            )}

            {hours.length > 0 ? (
              <div className="rounded-xl border border-nord-line bg-white p-6">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nord-muted">
                  Öffnungszeiten
                </div>
                <dl className="mt-3 space-y-1.5 text-xs">
                  {hours.map((h, i) => (
                    <div
                      key={h.id ?? `h-${i}`}
                      className="flex items-baseline justify-between gap-4 text-nord-muted"
                    >
                      <dt className="font-semibold text-nord-ink">{h.day}</dt>
                      <dd>{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {contact.mapEmbedSrc ? (
              <div className="overflow-hidden rounded-xl border border-nord-line bg-white">
                <iframe
                  src={contact.mapEmbedSrc}
                  className="h-64 w-full"
                  loading="lazy"
                  title="Karte Vereinsheim"
                />
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
