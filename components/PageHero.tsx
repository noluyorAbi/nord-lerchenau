type Props = {
  eyebrow?: string;
  title: string;
  lede?: string;
};

export function PageHero({ eyebrow, title, lede }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-nord-line bg-nord-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[360px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(110,199,234,0.18)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-[1320px] px-6 py-16 md:px-7 md:py-24">
        {eyebrow ? (
          <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-nord-muted">
            <span className="h-px w-6 bg-current opacity-60" />
            {eyebrow}
          </div>
        ) : null}
        <h1
          className="mt-4 font-display font-black leading-[0.92] tracking-[-0.02em] text-nord-ink"
          style={{ fontSize: "clamp(52px, 8vw, 120px)" }}
        >
          {title}
        </h1>
        {lede ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-nord-muted md:text-lg">
            {lede}
          </p>
        ) : null}
      </div>
    </section>
  );
}
