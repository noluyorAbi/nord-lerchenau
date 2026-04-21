import { PageHero } from "@/components/PageHero";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

const GROUP_LABELS: Record<string, string> = {
  allgemein: "Allgemein",
  mitgliedschaft: "Mitgliedschaft",
  training: "Training & Spielbetrieb",
  vereinsheim: "Vereinsheim",
};

const GROUP_ORDER = ["allgemein", "mitgliedschaft", "training", "vereinsheim"];

export default async function FaqPageRoute() {
  const payload = await getPayloadClient();
  const page = await payload.findGlobal({ slug: "faq-page" });

  const items = (page.items ?? []).filter(
    (i): i is NonNullable<typeof i> & { question: string; answer: string } =>
      Boolean(i?.question && i?.answer),
  );

  const groups = GROUP_ORDER.map((g) => ({
    key: g,
    label: GROUP_LABELS[g] ?? g,
    items: items.filter((i) => (i.group ?? "allgemein") === g),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Häufige Fragen"
        lede={
          page.intro ??
          "Hier beantworten wir die häufigsten Fragen rund um den SV Nord München-Lerchenau — von der Mitgliedschaft bis zum Training."
        }
      />

      <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nord-line bg-white p-8 text-center text-sm text-nord-muted">
            Noch keine Fragen gepflegt. Admin:{" "}
            <em>Einstellungen → FAQ-Seite</em>.
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.key} className="mb-12 last:mb-0">
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-nord-gold">
                {group.label}
              </h2>
              <div className="divide-y divide-nord-line overflow-hidden rounded-2xl border border-nord-line bg-white">
                {group.items.map((item, i) => (
                  <details
                    key={`${group.key}-${i}`}
                    className="group px-5 py-4 open:bg-nord-paper-2"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-nord-ink marker:hidden">
                      <span>{item.question}</span>
                      <span
                        className="font-mono text-[18px] text-nord-gold transition-transform group-open:rotate-45"
                        aria-hidden
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-nord-muted">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
