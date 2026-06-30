import { BFV_FORM_GROUPS, BFV_FORMULARE_URL } from "@/lib/bfv-formulare";

export function BfvFormulare() {
  return (
    <div className="rounded-2xl border border-nord-line bg-nord-paper-2 p-6 md:p-8">
      <p className="max-w-prose text-sm leading-relaxed text-nord-ink">
        Die offiziellen Formulare der BFV-Passabteilung zum direkten Download.
        Für Spielberechtigungen, Vereinswechsel und Verträge die häufig
        gebrauchten Vordrucke. Alle weiteren Formulare (Sonder- und
        Zweitspielrechte, internationale Wechsel, Sammellisten) findest du beim
        BFV.
      </p>

      <div className="mt-7 grid gap-7 md:grid-cols-3">
        {BFV_FORM_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-3 flex items-baseline gap-2 border-b border-nord-line pb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-nord-gold">
                {group.eyebrow}
              </span>
              <span className="font-display text-sm font-bold tracking-tight text-nord-ink">
                {group.title}
              </span>
            </div>
            <ul className="space-y-2.5">
              {group.forms.map((form) => (
                <li key={form.href}>
                  <a
                    href={form.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-3 rounded-xl border border-nord-line bg-white px-4 py-3 transition hover:border-nord-gold hover:shadow-sm"
                  >
                    <span className="flex-1 text-[13px] font-semibold leading-snug text-nord-ink">
                      {form.title}
                      <span className="mt-0.5 block font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-nord-muted">
                        {form.type} · {form.note}
                      </span>
                    </span>
                    <span
                      className="shrink-0 pt-0.5 text-nord-gold transition-transform group-hover:translate-y-0.5"
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

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-nord-line pt-6">
        <a
          href={BFV_FORMULARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-nord-ink px-4 py-2.5 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-white transition hover:-translate-y-px hover:bg-nord-navy-2"
        >
          Alle Formulare beim BFV ↗
        </a>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
          Passabteilung · stets aktuelle Fassung
        </span>
      </div>
    </div>
  );
}
