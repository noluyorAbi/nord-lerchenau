"use client";

import { useRouter } from "next/navigation";

type Props = {
  fallbackHref?: string;
  label?: string;
  className?: string;
};

export function BackButton({
  fallbackHref = "/",
  label = "Zurück",
  className,
}: Props) {
  const router = useRouter();

  const onClick = () => {
    // Prefer the browser history. If the user landed here directly (SSR
    // entry, shared link, etc.) history.length is 1 and `back()` would
    // bounce them off-site, so route to the fallback instead.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} zur vorherigen Seite`}
      className={
        className ??
        "group inline-flex items-center gap-2 rounded-full border border-nord-line bg-white/80 px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-nord-ink shadow-sm backdrop-blur-sm transition hover:-translate-x-0.5 hover:border-nord-gold hover:bg-white hover:text-nord-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold"
      }
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:-translate-x-0.5"
        aria-hidden
      >
        <path d="M13 16L7 10l6-6" />
      </svg>
      {label}
    </button>
  );
}
