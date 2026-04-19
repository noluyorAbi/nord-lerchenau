type Props = {
  number: string;
  label: string;
  className?: string;
};

export function SectionEyebrow({ number, label, className }: Props) {
  return (
    <div
      className={`flex items-center gap-3 font-display text-[13px] font-bold uppercase tracking-[0.14em] text-nord-muted ${className ?? ""}`}
    >
      <span className="h-px w-6 bg-current opacity-60" />
      {number} · {label}
    </div>
  );
}
