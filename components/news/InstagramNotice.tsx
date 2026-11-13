const IG_HANDLE = "svnord_lerchenau";
const IG_PROFILE_URL = `https://www.instagram.com/${IG_HANDLE}/`;

/**
 * Hinweis über der News-Liste: Das Tagesgeschäft läuft auf Instagram, die
 * News hier sind die ausführlichen Meldungen. Reiner Link, es werden keine
 * Inhalte von Instagram geladen.
 */
export function InstagramNotice() {
  return (
    <aside
      aria-label="Instagram"
      className="mb-8 flex flex-col gap-4 rounded-2xl border border-nord-line bg-white p-6 md:mb-10 md:flex-row md:items-center md:justify-between md:p-7"
    >
      <div>
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nord-gold-ink">
          Instagram
        </div>
        <h2 className="mt-2 font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
          Aktuelles gibt es täglich auf Instagram
        </h2>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-nord-muted">
          Bilder, Ergebnisse und Neuigkeiten aus dem Verein findest du bei{" "}
          <span className="font-semibold text-nord-ink">@{IG_HANDLE}</span>.
          Hier auf der Seite stehen die ausführlichen Meldungen.
        </p>
      </div>
      <a
        href={IG_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-nord-gold px-6 py-3 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-nord-navy transition hover:-translate-y-px hover:brightness-105"
      >
        Zu Instagram
        <span
          aria-hidden
          className="font-mono text-base transition group-hover:translate-x-0.5"
        >
          ↗
        </span>
      </a>
    </aside>
  );
}
