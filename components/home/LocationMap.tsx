import { MapEmbed } from "@/components/MapEmbed";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { getPayloadClient } from "@/lib/payload";

const DEFAULT_ADDRESS = {
  label: "Bezirkssportanlage Lerchenau",
  street: "Ebereschenstraße 17",
  postalCode: "80935",
  city: "München",
};

export async function LocationMap() {
  const payload = await getPayloadClient();
  let primary = DEFAULT_ADDRESS;
  let phone: string | null = null;
  let email: string | null = null;
  let hours: Array<{ day: string; hours: string }> = [];
  let customEmbed: string | null = null;

  try {
    const info = await payload.findGlobal({ slug: "contact-info" });
    const first = Array.isArray(info.addresses) ? info.addresses[0] : null;
    if (first?.street) {
      primary = {
        label: first.label,
        street: first.street,
        postalCode: first.postalCode,
        city: first.city,
      };
    }
    phone = info.phone ?? null;
    email = info.email ?? null;
    hours = Array.isArray(info.openingHours)
      ? info.openingHours.filter(
          (h): h is { day: string; hours: string } =>
            Boolean(h?.day) && Boolean(h?.hours),
        )
      : [];
    customEmbed = info.mapEmbedSrc ?? null;
  } catch {
    // Payload unavailable — render with fallback data only
  }

  const addressLine = `${primary.street}, ${primary.postalCode} ${primary.city}`;
  const dirQuery = encodeURIComponent(
    `${primary.label}, ${primary.street}, ${primary.postalCode} ${primary.city}`,
  );
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dirQuery}`;
  const mapsLinkUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${primary.label}, ${primary.street}, ${primary.postalCode} ${primary.city}`,
  )}`;
  const useCustomEmbed = Boolean(customEmbed && customEmbed.startsWith("http"));

  return (
    <section className="border-b border-nord-line bg-nord-paper">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionEyebrow number="07" label="Anfahrt" />
            <h2
              className="mt-3 font-display font-black leading-[0.95] text-nord-ink"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Finde uns am{" "}
              <span className="font-serif italic font-bold text-nord-navy">
                Eschengarten.
              </span>
            </h2>
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-nord-gold px-[18px] py-3 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-nord-navy transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(200,169,106,0.4)]"
          >
            Route planen →
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          {/* Address card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-nord-ink p-7 text-white md:p-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                {primary.label}
              </div>
              <div className="mt-3 font-display text-[26px] font-extrabold leading-tight">
                {primary.street}
                <br />
                {primary.postalCode} {primary.city}
              </div>

              {hours.length > 0 ? (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                    Öffnungszeiten
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {hours.slice(0, 5).map((h, i) => (
                      <li
                        key={`${h.day}-${i}`}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="font-semibold">{h.day}</span>
                        <span className="text-white/70">{h.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {phone || email ? (
                <div className="mt-6 border-t border-white/10 pt-5 space-y-2 text-sm">
                  {phone ? (
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-white/80 transition hover:text-nord-gold"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                        Tel
                      </span>
                      <span className="font-semibold">{phone}</span>
                    </a>
                  ) : null}
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 text-white/80 transition hover:text-nord-gold"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                        Mail
                      </span>
                      <span className="font-semibold">{email}</span>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 text-[11px] text-white/50">
              Öffentlich: U-Bahn <span className="text-white/80">U2 Dülferstraße</span>{" "}
              · Bus <span className="text-white/80">172 Lerchenauer Straße</span>
              <div className="mt-1">
                Auto: kostenfreie Parkplätze am{" "}
                <span className="text-white/80">Eschengarten</span>.
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative overflow-hidden rounded-2xl border border-nord-line bg-nord-paper-2 shadow-[0_24px_60px_-24px_rgba(11,27,63,0.28)]">
            <div className="aspect-[4/3] w-full md:aspect-[16/10]">
              {useCustomEmbed ? (
                <iframe
                  title={`Karte · ${primary.label}`}
                  src={customEmbed!}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                  style={{ colorScheme: "normal" }}
                />
              ) : (
                <MapEmbed
                  lat={48.1994}
                  lon={11.5545}
                  zoom={15.8}
                  label={primary.label}
                  variant="positron"
                  className="relative h-full w-full"
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-nord-line bg-white/90 px-4 py-3 backdrop-blur">
              <div className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-nord-muted">
                {addressLine}
              </div>
              <a
                href={mapsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-nord-navy transition hover:text-nord-gold"
              >
                Auf Karte ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
