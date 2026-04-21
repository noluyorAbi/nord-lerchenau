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

const WIX_PDF = "https://www.svnord-lerchenau.de/_files/ugd/c475b1_";

type Download = { label: string; href: string; hint?: string };
type DownloadGroup = { group: string; items: Download[] };

const DOWNLOADS: DownloadGroup[] = [
  {
    group: "Aufnahmeantrag",
    items: [
      {
        label: "Mitglieds-Antrag",
        href: `${WIX_PDF}c263b875a83c4c1eaafb358bad317e0a.pdf`,
        hint: "Hauptformular für Neumitglieder",
      },
    ],
  },
  {
    group: "Spielerpass Fußball",
    items: [
      {
        label: "Passantrag Erwachsene",
        href: `${WIX_PDF}087ec7628edd451e910b491f4d23896d.pdf`,
      },
      {
        label: "Passantrag Jugend",
        href: `${WIX_PDF}4c76d2eddec7416bb37e15956b3cb7f0.pdf`,
      },
      {
        label: "Spieler aus dem Ausland (10–17)",
        href: `${WIX_PDF}0c7fa8d5317240e8a552ec7321509b9d.pdf`,
      },
      {
        label: "DFB-Zusatzerklärung",
        href: `${WIX_PDF}1e6da086b72a4e8fab43bba5ab26efae.pdf`,
      },
    ],
  },
  {
    group: "Einverständniserklärungen",
    items: [
      {
        label: "Spieler-Passfoto (bis U13)",
        href: `${WIX_PDF}baed2f01b4464a31b3990e7c4923c9b5.pdf`,
      },
      {
        label: "Spieler-Passfoto (ab U14)",
        href: `${WIX_PDF}f6fe69b8098b465188ab5144c3b32b57.pdf`,
      },
      {
        label: "Veröffentlichung von Bildern",
        href: `${WIX_PDF}2b37a95d1c304bdd8cbf32bb3e11a8c1.pdf`,
      },
    ],
  },
  {
    group: "Vereinsdokumente",
    items: [
      {
        label: "Satzung",
        href: `${WIX_PDF}d3c8104a3f4d4a879ac25bf00ebcbb25.pdf`,
        hint: "Geltende Fassung vom 23.11.2023 · VR 6924",
      },
      {
        label: "Jugendfußballkonzept",
        href: `${WIX_PDF}a49715fb5199401ea7ad093e1664eabd.pdf`,
        hint: "Mia san Nord · Erlebnis vor Ergebnis",
      },
    ],
  },
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

        <section className="mb-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
              Formulare & Anträge
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
              PDF · Direkt-Download
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {DOWNLOADS.map((group) => (
              <div
                key={group.group}
                className="flex flex-col gap-3 rounded-xl border border-nord-line bg-white p-5"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-gold">
                  {group.group}
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-3 rounded-lg border border-nord-line/60 bg-nord-paper-2 px-3 py-2.5 transition hover:border-nord-gold hover:bg-white"
                      >
                        <span className="flex-1 text-sm font-semibold text-nord-ink">
                          {item.label}
                          {item.hint ? (
                            <span className="block text-[11px] font-normal text-nord-muted">
                              {item.hint}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className="shrink-0 text-nord-gold transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        >
                          ↓
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-nord-muted">
            Alle Formulare werden ausgefüllt per Post an die Vereinsadresse
            geschickt oder im Vereinsheim Eschengarten abgegeben.
          </p>
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
