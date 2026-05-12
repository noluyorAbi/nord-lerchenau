"use client";

import { useEffect, useState } from "react";

type Props = {
  threshold?: number;
  label?: string;
  className?: string;
};

export function ScrollToTopButton({
  threshold = 200,
  label = "Nach oben",
  className,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const onClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={
        className ??
        `group fixed bottom-6 right-6 z-40 inline-flex size-14 items-center justify-center rounded-full bg-nord-navy text-nord-gold shadow-[0_14px_30px_-8px_rgba(11,27,63,0.45)] ring-1 ring-nord-gold/40 transition duration-200 hover:-translate-y-0.5 hover:bg-nord-gold hover:text-nord-navy hover:ring-nord-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold md:bottom-8 md:right-8 ${
          visible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`
      }
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:-translate-y-0.5"
        aria-hidden
      >
        <path d="M4 13l6-6 6 6" />
      </svg>
    </button>
  );
}
