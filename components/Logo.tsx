import Link from "next/link";

import { Crest } from "@/components/Crest";

type Props = {
  href?: string;
};

export function Logo({ href = "/" }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 text-nord-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nord-gold focus-visible:ring-offset-2"
    >
      <Crest size={32} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[20px] font-black tracking-[-0.01em]">
          SV NORD
        </span>
        <span className="text-[10px] font-semibold tracking-[0.22em] text-nord-muted">
          MÜNCHEN-LERCHENAU · 1947
        </span>
      </span>
    </Link>
  );
}
