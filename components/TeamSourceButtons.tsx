import { bfvTeamUrl, type BfvMeta } from "@/lib/bfv";
import { fupaTeamUrl, resolveFupaSlug, type FupaMeta } from "@/lib/fupa";

type Props = {
  bfv: BfvMeta | null | undefined;
  fupa: FupaMeta | null | undefined;
  variant?: "light" | "dark";
  className?: string;
};

/**
 * Branded external-link pills for the two data sources every football team
 * has on the wider web: the BFV (official league registry) and fupa.net
 * (community mirror with squad + player photos).
 */
export function TeamSourceButtons({
  bfv,
  fupa,
  variant = "dark",
  className,
}: Props) {
  const bfvUrl = bfvTeamUrl(bfv ?? null);
  const fupaSlug = resolveFupaSlug(fupa ?? null);
  const fupaUrl = fupaSlug ? fupaTeamUrl(fupaSlug) : null;

  if (!bfvUrl && !fupaUrl) return null;

  return (
    <div
      className={
        className ?? "flex flex-wrap items-center gap-3"
      }
    >
      {bfvUrl ? (
        <a
          href={bfvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full bg-[#0e4a8a] px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_8px_20px_-10px_rgba(14,74,138,0.45)] transition hover:-translate-y-px hover:bg-[#0a3c75] hover:shadow-[0_12px_28px_-10px_rgba(14,74,138,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4a8a]/40"
          aria-label="Mannschaft beim BFV ansehen"
        >
          <BfvMark />
          <span>Auf BFV</span>
          <ArrowOut className="opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
        </a>
      ) : null}

      {fupaUrl ? (
        <a
          href={fupaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full bg-[#e8671d] px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_8px_20px_-10px_rgba(232,103,29,0.5)] transition hover:-translate-y-px hover:bg-[#d95a12] hover:shadow-[0_12px_28px_-10px_rgba(232,103,29,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8671d]/40"
          aria-label="Mannschaft auf fupa.net ansehen"
        >
          <FupaMark />
          <span>Auf FuPa</span>
          <ArrowOut className="opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
        </a>
      ) : null}

      {/* Subtle note when only one source is linked, useful on youth/non-fupa teams */}
      {!fupaUrl && bfvUrl ? (
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
            variant === "dark" ? "text-white/50" : "text-nord-muted"
          }`}
        >
          FuPa · nicht gelistet
        </span>
      ) : null}
    </div>
  );
}

function BfvMark() {
  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-display text-[11px] font-black leading-none tracking-[0.04em] text-[#0e4a8a]"
    >
      BFV
    </span>
  );
}

function FupaMark() {
  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-display text-[11px] font-black leading-none tracking-[0.02em] text-[#e8671d]"
    >
      FP
    </span>
  );
}

function ArrowOut({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 9l4-4M5 5h4v4" />
    </svg>
  );
}
