import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const HERO_EYEBROW = "Mitglied werden";
const HERO_TITLE = "Einmal Nordler, immer Nordler.";
const HERO_LEDE = "Mitglied beim SV Nord zu werden ist unkompliziert.";

const ONLINE_HEADING = "Online-Aufnahmeantrag";
const ONLINE_BADGE = "Direkt im Browser";
const ONLINE_INTRO =
  "Antrag inkl. SEPA-Lastschriftmandat online ausfüllen. Wähle die passende Variante. Einmalige Aufnahmegebühr 49 €.";

type OnlineForm = {
  tag: string;
  title: string;
  body: string;
  href: string;
};

const ONLINE_FORMS: OnlineForm[] = [
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
    body: "Mehrere Familienmitglieder gemeinsam anmelden, alle Sparten möglich.",
    href: "https://formular.vereinsplaner.com/f7f432f8-41ff-4794-b6e7-b075c71639d0",
  },
  {
    tag: "Beitragsfrei",
    title: "Aufnahmeantrag für Beitragsfreie",
    body: "Für Erwachsene und Jugendliche, solange eine beitragsfreie Tätigkeit ausgeübt wird.",
    href: "https://formular.vereinsplaner.com/7fba1dc8-500b-4c76-89c4-40d2acaecd0b",
  },
];

const STEPS_HEADING = "So wirst du Mitglied";
const STEPS_BADGE = "In 3 Schritten";
const STEP1_TITLE = "Melde dich vorab zum Training";
const STEP1_BODY =
  "Wir möchten dich gerne kennenlernen und freuen uns, wenn du dich zu einem ersten Probetraining bei uns anmeldest.";
const STEP2_TITLE = "Antrag stellen";
const STEP2_BODY =
  "Online-Antrag in vier Varianten: Jugend, Erwachsene, Familienbeitrag oder beitragsfrei. Komplett im Browser ausfüllen und absenden.";
const STEP2_LINK_LABEL = "Zu den Online-Anträgen";
const STEP3_TITLE = "Bestätigung Mitgliedschaft";
const STEP3_BODY =
  "Sobald dein Mitgliedsantrag von unserer Mitgliederverwaltung geprüft und bearbeitet wurde, erhältst du eine Bestätigung per E-Mail.";

type SportNode = {
  name: string;
  children?: { name: string; children?: string[] }[];
};

const SPORTS_TREE: SportNode[] = [
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
  { name: "eSport" },
];

const BENEFITS_HEADING = "Was du davon hast";
const BENEFITS = [
  "Training auf eigenem Platz im Eschengarten der Bezirkssportanlage Ebereschenstraße 17 und Hallentraining in der Grundschule Waldmeisterstraße 38",
  "Teilnahme an allen Vereinsveranstaltungen (Sommerfest, Weihnachtsfeier u. a.)",
  "Freier Eintritt zu allen Heimspielen",
  "Mitbestimmung in der Jahreshauptversammlung",
];

const DOCUMENTS_HEADING = "Vereinsdokumente";
const DOCUMENTS_BADGE = "PDF · Direkt-Download";
const SATZUNG = {
  label: "Satzung (PDF)",
  href: "/downloads/satzung-2026-05.pdf",
  hint: "Stand Mai 2026 · VR 6924",
};

const KUENDIGUNG_EYEBROW = "Kündigung";
const KUENDIGUNG_HEADING = "Mitgliedschaft beenden";
const KUENDIGUNG_BODY =
  "Bitte kündige deine Mitgliedschaft schriftlich zum 31.12. des Jahres. Du kannst die Kündigung per E-Mail oder Post einreichen.";
const KUENDIGUNG_EMAIL = "info@svnord.de";
const KUENDIGUNG_POST_NAME = "SV Nord München-Lerchenau e.V.";
const KUENDIGUNG_POST_STREET = "Ebereschenstraße 17";
const KUENDIGUNG_POST_CITY = "80935 München";

export default async function MitgliedschaftPage() {
  const payload = await getPayloadClient();
  const contact = await payload.findGlobal({ slug: "contact-info" });
  const cms = await payload.findGlobal({ slug: "mitgliedschaft-page" });

  const heroEyebrow = cms.hero?.eyebrow ?? HERO_EYEBROW;
  const heroTitle = cms.hero?.title ?? HERO_TITLE;
  const heroLede = cms.hero?.lede ?? HERO_LEDE;

  const onlineHeading = cms.online?.heading ?? ONLINE_HEADING;
  const onlineBadge = cms.online?.badge ?? ONLINE_BADGE;
  const onlineIntro = cms.online?.intro ?? ONLINE_INTRO;
  const onlineForms: OnlineForm[] =
    cms.online?.forms && cms.online.forms.length > 0
      ? cms.online.forms.map((f) => ({
          tag: f.tag,
          title: f.title,
          body: f.body,
          href: f.href,
        }))
      : ONLINE_FORMS;

  const stepsHeading = cms.steps?.heading ?? STEPS_HEADING;
  const stepsBadge = cms.steps?.badge ?? STEPS_BADGE;
  const step1Title = cms.steps?.step1Title ?? STEP1_TITLE;
  const step1Body = cms.steps?.step1Body ?? STEP1_BODY;
  const step2Title = cms.steps?.step2Title ?? STEP2_TITLE;
  const step2Body = cms.steps?.step2Body ?? STEP2_BODY;
  const step2LinkLabel = cms.steps?.step2LinkLabel ?? STEP2_LINK_LABEL;
  const step3Title = cms.steps?.step3Title ?? STEP3_TITLE;
  const step3Body = cms.steps?.step3Body ?? STEP3_BODY;

  const sportsTree: SportNode[] =
    cms.sportsTree && cms.sportsTree.length > 0
      ? cms.sportsTree.map((sport) => ({
          name: sport.name,
          children:
            sport.children && sport.children.length > 0
              ? sport.children.map((child) => ({
                  name: child.name,
                  children:
                    child.leaves && child.leaves.length > 0
                      ? child.leaves.map((leaf) => leaf.name)
                      : undefined,
                }))
              : undefined,
        }))
      : SPORTS_TREE;

  const benefitsHeading = cms.benefits?.heading ?? BENEFITS_HEADING;
  const benefits: string[] =
    cms.benefits?.items && cms.benefits.items.length > 0
      ? cms.benefits.items.map((b) => b.text)
      : BENEFITS;

  const documentsHeading = cms.documents?.heading ?? DOCUMENTS_HEADING;
  const documentsBadge = cms.documents?.badge ?? DOCUMENTS_BADGE;
  const satzungLabel = cms.documents?.satzungLabel ?? SATZUNG.label;
  const satzungHref = cms.documents?.satzungHref ?? SATZUNG.href;
  const satzungHint = cms.documents?.satzungHint ?? SATZUNG.hint;

  const kuendigungEyebrow = cms.kuendigung?.eyebrow ?? KUENDIGUNG_EYEBROW;
  const kuendigungHeading = cms.kuendigung?.heading ?? KUENDIGUNG_HEADING;
  const kuendigungBody = cms.kuendigung?.body ?? KUENDIGUNG_BODY;
  const kuendigungEmail = cms.kuendigung?.email ?? KUENDIGUNG_EMAIL;
  const kuendigungPostName = cms.kuendigung?.postName ?? KUENDIGUNG_POST_NAME;
  const kuendigungPostStreet =
    cms.kuendigung?.postStreet ?? KUENDIGUNG_POST_STREET;
  const kuendigungPostCity = cms.kuendigung?.postCity ?? KUENDIGUNG_POST_CITY;

  return (
    <>
      <PageHero eyebrow={heroEyebrow} title={heroTitle} lede={heroLede} />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <section id="online-formulare" className="mb-16 scroll-mt-24">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
              {onlineHeading}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
              {onlineBadge}
            </span>
          </div>
          <p className="mb-5 max-w-2xl text-sm text-nord-muted">
            {onlineIntro}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {onlineForms.map((form) => (
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
              {stepsHeading}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
              {stepsBadge}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-nord-line bg-white p-6">
              <div className="text-2xl font-bold text-nord-sky">01</div>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-nord-ink">
                {step1Title}
              </h3>
              <p className="mt-2 text-sm text-nord-muted">{step1Body}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-nord-ink">
                {sportsTree.map((sport) => (
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
                {step2Title}
              </h3>
              <p className="mt-2 text-sm text-nord-muted">{step2Body}</p>
              <a
                href="#online-formulare"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-nord-navy hover:text-nord-navy-2"
              >
                {step2LinkLabel} <span aria-hidden>↑</span>
              </a>
            </div>

            <div className="rounded-xl border border-nord-line bg-white p-6">
              <div className="text-2xl font-bold text-nord-sky">03</div>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-nord-ink">
                {step3Title}
              </h3>
              <p className="mt-2 text-sm text-nord-muted">{step3Body}</p>
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-2xl border border-nord-line bg-white p-8 md:p-10">
          <h2 className="text-lg font-bold tracking-tight text-nord-ink">
            {benefitsHeading}
          </h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 text-sm text-nord-muted"
              >
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 font-bold text-nord-gold"
                >
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-nord-muted">
              {documentsHeading}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
              {documentsBadge}
            </span>
          </div>
          <a
            href={satzungHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex max-w-md items-start justify-between gap-3 rounded-xl border border-nord-line bg-white px-5 py-4 transition hover:border-nord-gold hover:shadow-sm"
          >
            <span className="flex-1 text-sm font-semibold text-nord-ink">
              {satzungLabel}
              <span className="block text-[11px] font-normal text-nord-muted">
                {satzungHint}
              </span>
            </span>
            <span
              className="shrink-0 text-nord-gold transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              ↓
            </span>
          </a>
        </section>

        <section className="mb-16 rounded-2xl border border-nord-line bg-nord-paper-2 p-8 md:p-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-gold">
            {kuendigungEyebrow}
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-nord-ink">
            {kuendigungHeading}
          </h2>
          <p className="mt-2 text-sm text-nord-muted">{kuendigungBody}</p>
          <div className="mt-4 grid gap-3 text-sm text-nord-ink md:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
                E-Mail
              </div>
              <a
                href={`mailto:${kuendigungEmail}`}
                className="mt-1 inline-block font-semibold text-nord-navy hover:text-nord-navy-2"
              >
                {kuendigungEmail}
              </a>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-nord-muted">
                Post
              </div>
              <div className="mt-1 text-sm leading-snug">
                {kuendigungPostName}
                <br />
                {kuendigungPostStreet}
                <br />
                {kuendigungPostCity}
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
