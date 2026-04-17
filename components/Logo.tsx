import Link from "next/link";

type Props = {
  href?: string;
  label?: string;
};

export function Logo({ href = "/", label = "SV Nord" }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 font-bold tracking-tight text-nord-ink"
    >
      <span className="relative block h-[26px] w-[22px]">
        <span
          className="absolute inset-0 bg-nord-navy"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
          }}
        />
        <span className="absolute inset-x-[2px] top-[12px] h-[3px] bg-nord-gold" />
      </span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}
