import { getPayloadClient } from "@/lib/payload";

type Props = {
  teamName?: string;
};

const FALLBACK_EMAIL = "info@svnord.de";

function formatPhoneDisplay(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return raw.trim();
}

export async function ProbetrainingBanner({ teamName }: Props) {
  const payload = await getPayloadClient();

  let phone: string | null = null;
  let email: string | null = null;
  try {
    const info = await payload.findGlobal({ slug: "contact-info" });
    phone = info.phone ?? null;
    email = info.email ?? FALLBACK_EMAIL;
  } catch {
    email = FALLBACK_EMAIL;
  }

  const phoneDisplay = formatPhoneDisplay(phone);
  const phoneTel = phone ? phone.replace(/\s+/g, "") : null;

  const headline = teamName
    ? `Lust auf Probetraining bei der ${teamName}?`
    : "Lust auf ein Probetraining?";

  return (
    <section
      aria-label="Probetraining Kontakt"
      className="relative overflow-hidden rounded-2xl border border-nord-line bg-gradient-to-br from-nord-navy via-nord-navy-2 to-[#0a1738] p-7 text-white md:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-nord-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-sky-400/10 blur-3xl"
      />

      <div className="relative grid gap-7 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-nord-gold/40 bg-nord-gold/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-nord-gold">
            <span className="size-1.5 rounded-full bg-nord-gold" />
            Probetraining
          </div>
          <h2
            className="mt-4 font-display font-black leading-[1.02] tracking-tight"
            style={{ fontSize: "clamp(26px, 3.2vw, 40px)" }}
          >
            {headline}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            Schreib uns einfach eine E-Mail. Wir melden uns schnell bei dir mit
            dem passenden Termin, dem Treffpunkt und allen wichtigen Infos.
            Bitte bring deine eigene Sportkleidung und Schienbeinschoner mit.
          </p>
          {phoneDisplay ? (
            <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
              Direkt erreichbar ·{" "}
              <span className="text-nord-gold">{phoneDisplay}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {email ? (
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(
                "Probetraining",
              )}&body=${encodeURIComponent(
                `Hallo SV Nord,\n\nich interessiere mich für ein Probetraining${
                  teamName ? ` bei der ${teamName}` : ""
                }.\n\nViele Grüße`,
              )}`}
              className="group inline-flex items-center justify-between gap-4 rounded-xl bg-nord-gold px-5 py-4 font-display font-bold text-nord-navy shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <span className="flex items-center gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                <span>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-navy/60">
                    E-Mail
                  </span>
                  <span className="block text-base leading-tight">{email}</span>
                </span>
              </span>
              <span className="font-mono text-lg transition group-hover:translate-x-0.5">
                →
              </span>
            </a>
          ) : null}

          {phoneTel ? (
            <a
              href={`tel:${phoneTel}`}
              className="group inline-flex items-center justify-between gap-4 rounded-xl border border-white/20 bg-white/5 px-5 py-4 font-display font-bold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-nord-gold hover:bg-white/10"
            >
              <span className="flex items-center gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z" />
                </svg>
                <span>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/60">
                    Anrufen
                  </span>
                  <span className="block text-base leading-tight">
                    {phoneDisplay}
                  </span>
                </span>
              </span>
              <span className="font-mono text-lg transition group-hover:translate-x-0.5">
                →
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
