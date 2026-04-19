type Props = {
  size?: number;
  navy?: string;
  gold?: string;
  textColor?: string;
  className?: string;
};

export function Crest({
  size = 40,
  navy = "var(--color-nord-navy)",
  gold = "var(--color-nord-gold)",
  textColor = "#fff",
  className,
}: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 1.2}
      viewBox="0 0 40 48"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))" }}
    >
      <path
        d="M2 2 L38 2 L38 30 Q38 36 30 42 L20 46 L10 42 Q2 36 2 30 Z"
        fill={navy}
      />
      <path
        d="M2 2 L38 2 L38 30 Q38 36 30 42 L20 46 L10 42 Q2 36 2 30 Z"
        fill="none"
        stroke={gold}
        strokeWidth="1.2"
      />
      <text
        x="20"
        y="22"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="900"
        fontSize="13"
        fill={textColor}
        letterSpacing="1"
      >
        SV
      </text>
      <text
        x="20"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="900"
        fontSize="12"
        fill={gold}
      >
        NORD
      </text>
      <rect x="4" y="36" width="32" height="1.2" fill={gold} />
    </svg>
  );
}
