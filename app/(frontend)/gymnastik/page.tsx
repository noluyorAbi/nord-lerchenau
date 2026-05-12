import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

type Contact = {
  name: string;
  role: string;
  phone?: string;
  email?: string;
};

const CONTACTS: Contact[] = [
  {
    name: "Elisabeth Schillinger",
    role: "1. Abteilungsleiterin",
    phone: "0176 646 61 724",
    email: "info@svnord.de",
  },
  {
    name: "Tenja Hirlinger",
    role: "Vertretung",
    phone: "0171 856 60 64",
  },
];

export default function GymnastikPage() {
  return (
    <>
      <PageHero
        eyebrow="Sport"
        title="Gymnastik"
        lede="Seit 1967 — über 50 Jahre Gymnastik beim SV Nord. Montag und Mittwoch, Frauen und Männer willkommen."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
          <article>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-nord-gold">
              Herzlich Willkommen bei der Gymnastik-Abteilung
            </div>
            <div className="prose prose-neutral max-w-none">
              <p>
                Unsere Gymnastikabteilung wurde <strong>1967</strong> gegründet
                und ist somit schon über 50 Jahre alt.
              </p>
              <p>
                Wir trainieren jeden{" "}
                <strong>Montag von 19:00 bis 20:00 Uhr</strong> in der
                Waldmeisterschule und jeden{" "}
                <strong>Mittwoch von 19:00 bis 20:00 Uhr</strong> im Pfarrsaal.
              </p>
              <p>
                Jeder ist herzlich willkommen, Frauen wie Männer. In den
                Schulferien ist kein Training.
              </p>
              <p>
                Aktuell sind wir <strong>35 Mitglieder</strong> in der
                Gymnastikgruppe. Das haben wir vor allem unserer verlässlichen
                und kompetenten Trainerin zu verdanken.
              </p>
              <p>
                Habt ihr Lust bekommen? So meldet euch gerne bei uns, wir freuen
                uns.
              </p>
              <p className="italic text-nord-muted">
                Eure SV Nord Gymnastikgruppe
              </p>
            </div>

            <section className="mt-12">
              <h2 className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                Unser Team der Gymnastik-Abteilung
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {CONTACTS.map((c) => (
                  <article
                    key={c.name}
                    className="rounded-2xl border border-nord-line bg-white p-6"
                  >
                    <div className="font-display text-lg font-black leading-tight text-nord-ink">
                      {c.name}
                    </div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-nord-muted">
                      {c.role}
                    </div>
                    <div className="mt-4 space-y-1.5 border-t border-nord-line pt-4 text-sm">
                      {c.phone ? (
                        <div className="flex items-center gap-2 text-nord-ink">
                          <span className="w-12 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                            Tel.
                          </span>
                          <a
                            href={`tel:${c.phone.replace(/\s/g, "")}`}
                            className="font-semibold transition hover:text-nord-navy"
                          >
                            {c.phone}
                          </a>
                        </div>
                      ) : null}
                      {c.email ? (
                        <div className="flex items-center gap-2 text-nord-ink">
                          <span className="w-12 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                            Mail
                          </span>
                          <a
                            href={`mailto:${c.email}`}
                            className="truncate font-semibold transition hover:text-nord-navy"
                          >
                            {c.email}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-5 md:sticky md:top-24 md:h-fit md:self-start">
            <div className="rounded-2xl border border-nord-line bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                Trainingszeiten
              </div>
              <dl className="mt-3 divide-y divide-nord-line/70 text-sm">
                <div className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                    Montag
                  </dt>
                  <dd className="text-right font-display text-[13px] font-bold text-nord-ink">
                    19:00–20:00 · Waldmeisterschule
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                    Mittwoch
                  </dt>
                  <dd className="text-right font-display text-[13px] font-bold text-nord-ink">
                    19:00–20:00 · Pfarrsaal
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
                    Ferien
                  </dt>
                  <dd className="text-right font-display text-[13px] font-bold text-nord-ink">
                    Kein Training
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-nord-ink p-6 text-white">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold">
                Auf einen Blick
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/70">Gegründet</dt>
                  <dd className="font-display font-bold">1967</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/70">Mitglieder</dt>
                  <dd className="font-display font-bold">35</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/70">Offen für</dt>
                  <dd className="font-display font-bold">Alle</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
