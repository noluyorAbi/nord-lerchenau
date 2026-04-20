import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "Formular ausfüllen",
    body: "Mitgliedsantrag als PDF herunterladen, ausdrucken und ausfüllen.",
  },
  {
    n: "02",
    title: "SEPA-Mandat beilegen",
    body: "Einzugsermächtigung für den jährlichen Mitgliedsbeitrag unterschreiben.",
  },
  {
    n: "03",
    title: "Abgeben oder einsenden",
    body: "Ins Vereinsheim Eschengarten bringen oder per Post an die Postanschrift schicken.",
  },
];

const BENEFITS = [
  "Training auf eigenem Platz im Eschengarten",
  "Teilnahme an allen Vereinsveranstaltungen (Jeep Cup, Sommerfest, Weihnachtsfeier)",
  "Freier Eintritt zu allen Heimspielen",
  "Mitbestimmung in der Jahreshauptversammlung",
];

export default async function MitgliedschaftPage() {
  const payload = await getPayloadClient();
  const contact = await payload.findGlobal({ slug: "contact-info" });

  return (
    <>
      <PageHero
        eyebrow="Mitglied werden"
        title="Einmal Nordler, immer Nordler."
        lede="Mitglied beim SV Nord zu werden ist unkompliziert — so geht's in drei Schritten."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <section className="mb-16">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
            In drei Schritten
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-xl border border-nord-line bg-white p-6"
              >
                <div className="text-2xl font-bold text-nord-sky">{step.n}</div>
                <h3 className="mt-3 text-lg font-bold tracking-tight text-nord-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-nord-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-2xl border border-nord-line bg-white p-8 md:p-10">
          <h2 className="text-lg font-bold tracking-tight text-nord-ink">
            Was du davon hast
          </h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-sm text-nord-muted"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-nord-gold" />
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16 rounded-2xl bg-gradient-to-br from-nord-navy to-nord-navy-2 p-8 text-white md:p-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Mitgliedsantrag
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
            Der Antrag liegt als PDF bereit. Den Link schicken wir dir auf
            Anfrage per E-Mail zu — oder frage direkt im Vereinsheim nach einem
            Exemplar.
          </p>
          <Link
            href="/kontakt?subject=Mitgliedsantrag"
            className="mt-6 inline-flex rounded-lg bg-nord-gold px-5 py-3 text-sm font-semibold text-nord-navy hover:brightness-110"
          >
            Antrag anfordern →
          </Link>
        </section>

        <section className="grid gap-8 rounded-2xl border border-nord-line bg-white p-8 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-nord-ink">
              Fragen?
            </h2>
            <p className="mt-2 text-sm text-nord-muted">
              Wir melden uns schnell zurück.
            </p>
          </div>
          <div className="space-y-2 text-sm text-nord-muted">
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
            {Array.isArray(contact.addresses) && contact.addresses[0] ? (
              <div>
                {contact.addresses[0].street} · {contact.addresses[0].postalCode}{" "}
                {contact.addresses[0].city}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
