import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const BENEFITS = [
  "Training auf eigenem Platz im Eschengarten",
  "Teilnahme an allen Vereinsveranstaltungen (Sommerfest, Weihnachtsfeier u.a.)",
  "Freier Eintritt zu allen Heimspielen",
  "Mitbestimmung in der Jahreshauptversammlung",
];

const ONLINE_FORMS: {
  tag: string;
  title: string;
  body: string;
  href: string;
}[] = [
  {
    tag: "Jugendliche",
    title: "Aufnahmeantrag Jugend",
    body: "Bis 18 Jahre. Spartenbeitrag aktive Fußballer/innen 60 €.",
    href: "https://formular.vereinsplaner.com/082ec8ef-1fdb-4346-9849-58b6aca80b59",
  },
  {
    tag: "Erwachsene",
    title: "Aufnahmeantrag Erwachsene",
    body: "Ab 18 Jahre. Abteilung wählbar: Fußball, Gymnastik, Volleyball.",
    href: "https://formular.vereinsplaner.com/33962f83-ddc1-46d7-a43b-bbd3651f6950",
  },
  {
    tag: "Familienbeitrag",
    title: "Familienmitgliedschaft",
    body: "Mehrere Familienmitglieder gemeinsam anmelden — alle Sparten möglich.",
    href: "https://formular.vereinsplaner.com/f7f432f8-41ff-4794-b6e7-b075c71639d0",
  },
];

const SPORTS_TREE: {
  name: string;
  children?: { name: string; children?: string[] }[];
}[] = [
  {
    name: "Fußball",
    children: [
      { name: "Herren" },
      { name: "Senioren" },
      { name: "Juniorinnen" },
      {
        name: "Jugend",
        children: ["Kleinfeld", "Kompaktfeld", "Großfeld"],
      },
    ],
  },
  { name: "Gymnastik" },
  { name: "Volleyball" },
  { name: "Ski" },
  { name: "E-Sport" },
];

const WIX_PDF = "https://www.svnord-lerchenau.de/_files/ugd/c475b1_";

type Download = { label: string; href: string; hint?: string };
type DownloadGroup = { group: string; items: Download[] };

const DOWNLOADS: DownloadGroup[] = [
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
        href: "/downloads/satzung-2026-05.pdf",
        hint: "Stand Mai 2026 · VR 6924",
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
        lede="Mitglied beim SV Nord zu werden ist unkompliziert."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <section id="online-formulare" className="mb-16 scroll-mt-24">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
              Online-Aufnahmeantrag
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
              Direkt im Browser
            </span>
          </div>
          <p className="mb-5 max-w-2xl text-sm text-nord-muted">
            Antrag inkl. SEPA-Lastschriftmandat online ausfüllen. Wähle die
            passende Variante. Einmalige Aufnahmegebühr 49 €.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {ONLINE_FORMS.map((form) => (
              <a
                key={form.href}
                href={form.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 rounded-xl border border-nord-gold/40 bg-gradient-to-br from-nord-paper-2 to-white p-6 transition hover:border-nord-gold hover:shadow-sm"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-gold">
                  {form.tag}
                </div>
                <h3 className="text-xl font-bold tracking-tight text-nord-ink">
                  {form.title}
                </h3>
                <p className="text-sm text-nord-muted">{form.body}</p>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-nord-navy group-hover:text-nord-navy-2">
                  Online anmelden{" "}
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
              So wirst du Mitglied
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
              In 3 Schritten
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-nord-line bg-white p-6">
              <div className="text-2xl font-bold text-nord-sky">01</div>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-nord-ink">
                Melde dich vorab zum Training
              </h3>
              <p className="mt-2 text-sm text-nord-muted">
                Wir möchten dich gerne kennenlernen und freuen uns, wenn du dich
                zu einem ersten Probetraining bei uns anmeldest.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-nord-ink">
                {SPORTS_TREE.map((sport) => (
                  <li key={sport.name}>
                    <span className="font-semibold">{sport.name}</span>
                    {sport.children ? (
                      <ul className="mt-1 ml-4 space-y-1 border-l border-nord-line pl-3 text-[13px] text-nord-muted">
                        {sport.children.map((child) => (
                          <li key={child.name}>
                            {child.name}
                            {child.children ? (
                              <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-nord-line/60 pl-3 text-[12px]">
                                {child.children.map((leaf) => (
                                  <li key={leaf}>· {leaf}</li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-nord-line bg-white p-6">
              <div className="text-2xl font-bold text-nord-sky">02</div>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-nord-ink">
                Antrag stellen
              </h3>
              <p className="mt-2 text-sm text-nord-muted">
                Online-Antrag in drei Varianten: Jugend, Erwachsene oder
                Familienbeitrag. Spielerpass-Formulare (Fußball) weiterhin als
                PDF.
              </p>
              <a
                href="#online-formulare"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-nord-navy hover:text-nord-navy-2"
              >
                Zu den Online-Anträgen <span aria-hidden>↑</span>
              </a>
            </div>

            <div className="rounded-xl border border-nord-line bg-white p-6">
              <div className="text-2xl font-bold text-nord-sky">03</div>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-nord-ink">
                Bestätigung Mitgliedschaft
              </h3>
              <p className="mt-2 text-sm text-nord-muted">
                Sobald dein Mitgliedsantrag von unserer Mitgliederverwaltung
                geprüft und bearbeitet wurde, erhältst du eine Bestätigung per
                E-Mail.
              </p>
            </div>
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

        <section className="mb-16 rounded-2xl border border-nord-line bg-nord-paper-2 p-8 md:p-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-gold">
            Kündigung
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-nord-ink">
            Mitgliedschaft beenden
          </h2>
          <p className="mt-2 text-sm text-nord-muted">
            Bitte kündige deine Mitgliedschaft schriftlich zum 31.12. des
            Jahres. Du kannst die Kündigung per E-Mail oder Post einreichen.
          </p>
          <div className="mt-4 grid gap-3 text-sm text-nord-ink md:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
                E-Mail
              </div>
              <a
                href="mailto:info@svnord.de"
                className="mt-1 inline-block font-semibold text-nord-navy hover:text-nord-navy-2"
              >
                info@svnord.de
              </a>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
                Post
              </div>
              <div className="mt-1 text-sm leading-snug">
                SV Nord München-Lerchenau e.V.
                <br />
                Ebereschenstraße 17
                <br />
                80935 München
              </div>
            </div>
          </div>
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
                {contact.addresses[0].street} ·{" "}
                {contact.addresses[0].postalCode} {contact.addresses[0].city}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
