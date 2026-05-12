import Link from "next/link";

import { ClubLogo } from "@/components/ClubLogo";

type Props = {
  href?: string;
  variant?: "light" | "dark";
};

export function Logo({ href = "/", variant = "light" }: Props) {
  const isDark = variant === "dark";
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold focus-visible:ring-offset-2 ${
        isDark ? "text-white" : "text-nord-ink"
      }`}
    >
      <ClubLogo size={64} priority />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[24px] font-black tracking-[-0.01em] md:text-[26px]">
          SV NORD
        </span>
        <span
          className={`text-[11px] font-semibold tracking-[0.22em] ${
            isDark ? "text-white/60" : "text-nord-muted"
          }`}
        >
          MÜNCHEN-LERCHENAU · 1947
        </span>
      </span>
    </Link>
  );
}
