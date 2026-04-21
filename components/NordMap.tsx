type Props = {
  className?: string;
  title?: string;
};

export function NordMap({ className, title = "Sportanlage Eschengarten" }: Props) {
  return (
    <div
      className={
        className ??
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-nord-ink"
      }
      role="img"
      aria-label={`Orientierungskarte · ${title}`}
    >
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="nord-map-bg" cx="50%" cy="38%" r="78%">
            <stop offset="0" stopColor="#12295f" />
            <stop offset="1" stopColor="#050e24" />
          </radialGradient>
          <pattern
            id="nord-map-dots"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.7" fill="rgba(200,169,106,0.16)" />
          </pattern>
          <linearGradient id="nord-map-vignette" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(5,14,36,0)" />
            <stop offset="1" stopColor="rgba(5,14,36,0.55)" />
          </linearGradient>
          <filter id="nord-map-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>

        <rect width="800" height="600" fill="url(#nord-map-bg)" />
        <rect width="800" height="600" fill="url(#nord-map-dots)" />

        {/* Secondary street grid */}
        <g
          stroke="rgba(200,169,106,0.16)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="square"
        >
          <path d="M0,110 H800" />
          <path d="M0,490 H800" />
          <path d="M120,0 V600" />
          <path d="M700,0 V600" />
          <path d="M60,0 L280,600" opacity="0.6" />
        </g>

        {/* Primary streets */}
        <g stroke="rgba(200,169,106,0.55)" strokeWidth="3" fill="none">
          {/* Ebereschenstraße — east-west main */}
          <path d="M0,340 H800" />
          {/* Lerchenauer Straße — north-south main */}
          <path d="M430,0 V600" />
        </g>
        {/* Street stripe inside primary */}
        <g
          stroke="rgba(244,241,234,0.18)"
          strokeWidth="1"
          strokeDasharray="6 8"
          fill="none"
        >
          <path d="M0,340 H800" />
          <path d="M430,0 V600" />
        </g>

        <text
          x="140"
          y="334"
          fill="rgba(200,169,106,0.9)"
          fontSize="11"
          letterSpacing="3"
          style={{ fontFamily: "var(--font-mono, monospace)" }}
        >
          EBERESCHENSTRASSE
        </text>
        <text
          x="436"
          y="80"
          fill="rgba(200,169,106,0.9)"
          fontSize="11"
          letterSpacing="3"
          style={{ fontFamily: "var(--font-mono, monospace)" }}
        >
          LERCHENAUER STR.
        </text>

        {/* Neighborhood blocks (subtle) */}
        <g fill="rgba(244,241,234,0.06)" stroke="rgba(200,169,106,0.18)">
          <rect x="40" y="380" width="120" height="80" rx="4" />
          <rect x="40" y="200" width="100" height="100" rx="4" />
          <rect x="510" y="80" width="140" height="210" rx="4" />
          <rect x="510" y="400" width="160" height="90" rx="4" />
        </g>

        {/* Sports complex — rounded dashed outline */}
        <g transform="translate(170,130)">
          <rect
            x="-6"
            y="-6"
            width="252"
            height="172"
            rx="20"
            fill="rgba(200,169,106,0.1)"
            filter="url(#nord-map-glow)"
          />
          <rect
            x="0"
            y="0"
            width="240"
            height="160"
            rx="14"
            fill="rgba(10,26,60,0.65)"
            stroke="#c8a96a"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <text
            x="120"
            y="-14"
            fill="#c8a96a"
            fontSize="11"
            letterSpacing="3"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            SPORTANLAGE ESCHENGARTEN
          </text>

          {/* Pitch 1 */}
          <g transform="translate(12,22)">
            <rect
              width="100"
              height="60"
              rx="3"
              fill="rgba(22,85,42,0.55)"
              stroke="#c8a96a"
              strokeWidth="1.2"
            />
            <line x1="50" y1="0" x2="50" y2="60" stroke="#c8a96a" strokeWidth="0.8" />
            <circle cx="50" cy="30" r="10" fill="none" stroke="#c8a96a" strokeWidth="0.8" />
            <circle cx="50" cy="30" r="1.4" fill="#c8a96a" />
            <rect x="0" y="20" width="10" height="20" fill="none" stroke="#c8a96a" strokeWidth="0.8" />
            <rect x="90" y="20" width="10" height="20" fill="none" stroke="#c8a96a" strokeWidth="0.8" />
          </g>

          {/* Pitch 2 */}
          <g transform="translate(128,22)">
            <rect
              width="100"
              height="60"
              rx="3"
              fill="rgba(22,85,42,0.55)"
              stroke="#c8a96a"
              strokeWidth="1.2"
            />
            <line x1="50" y1="0" x2="50" y2="60" stroke="#c8a96a" strokeWidth="0.8" />
            <circle cx="50" cy="30" r="10" fill="none" stroke="#c8a96a" strokeWidth="0.8" />
            <circle cx="50" cy="30" r="1.4" fill="#c8a96a" />
            <rect x="0" y="20" width="10" height="20" fill="none" stroke="#c8a96a" strokeWidth="0.8" />
            <rect x="90" y="20" width="10" height="20" fill="none" stroke="#c8a96a" strokeWidth="0.8" />
          </g>

          {/* Vereinsheim */}
          <g transform="translate(88,100)">
            <rect
              width="64"
              height="40"
              rx="4"
              fill="#0b1b3f"
              stroke="#c8a96a"
              strokeWidth="1.5"
            />
            <text
              x="32"
              y="17"
              fill="#c8a96a"
              fontSize="8"
              letterSpacing="2"
              textAnchor="middle"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              VEREINS-
            </text>
            <text
              x="32"
              y="29"
              fill="#c8a96a"
              fontSize="8"
              letterSpacing="2"
              textAnchor="middle"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              HEIM
            </text>
          </g>
        </g>

        {/* Pin — anchored on Vereinsheim */}
        <g transform="translate(290,250)">
          <circle r="26" fill="rgba(200,169,106,0.22)" className="nord-pin-pulse" />
          <circle r="16" fill="rgba(200,169,106,0.35)" className="nord-pin-pulse-2" />
          <circle r="11" fill="#0b1b3f" stroke="#ffffff" strokeWidth="2.5" />
          <circle r="4" fill="#c8a96a" />
        </g>

        {/* Compass */}
        <g transform="translate(720,70)">
          <circle
            r="30"
            fill="rgba(11,27,63,0.7)"
            stroke="rgba(200,169,106,0.5)"
            strokeWidth="1"
          />
          <path d="M0,-20 L6,4 L0,0 Z" fill="#c8a96a" />
          <path d="M0,-20 L-6,4 L0,0 Z" fill="#f4f1ea" />
          <path d="M0,20 L6,-4 L0,0 Z" fill="rgba(244,241,234,0.35)" />
          <path d="M0,20 L-6,-4 L0,0 Z" fill="rgba(244,241,234,0.25)" />
          <text
            x="0"
            y="-36"
            fill="#c8a96a"
            fontSize="11"
            textAnchor="middle"
            fontWeight="700"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            N
          </text>
        </g>

        {/* Scale */}
        <g transform="translate(40,548)">
          <line x1="0" y1="0" x2="140" y2="0" stroke="#c8a96a" strokeWidth="2" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#c8a96a" strokeWidth="2" />
          <line x1="70" y1="-4" x2="70" y2="4" stroke="#c8a96a" strokeWidth="2" />
          <line x1="140" y1="-5" x2="140" y2="5" stroke="#c8a96a" strokeWidth="2" />
          <text
            x="0"
            y="18"
            fill="rgba(200,169,106,0.8)"
            fontSize="10"
            letterSpacing="2"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            100 m
          </text>
        </g>

        {/* U-Bahn marker */}
        <g transform="translate(620,420)">
          <circle r="14" fill="#1a3168" stroke="#6ec7ea" strokeWidth="2" />
          <text
            x="0"
            y="4"
            fill="#6ec7ea"
            fontSize="10"
            textAnchor="middle"
            fontWeight="700"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            U2
          </text>
          <text
            x="0"
            y="34"
            fill="rgba(110,199,234,0.85)"
            fontSize="9"
            textAnchor="middle"
            letterSpacing="2"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            DÜLFERSTR.
          </text>
        </g>

        <rect width="800" height="600" fill="url(#nord-map-vignette)" />
      </svg>

      {/* Corner coordinates chip */}
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold/80">
        48.1994° N · 11.5545° E
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-nord-gold/40 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-nord-gold/90 backdrop-blur-sm">
        {title}
      </div>

      <style>{`
        .nord-pin-pulse {
          transform-origin: center;
          animation: nord-pin-pulse 2.4s cubic-bezier(0.4,0,0.2,1) infinite;
        }
        .nord-pin-pulse-2 {
          transform-origin: center;
          animation: nord-pin-pulse 2.4s cubic-bezier(0.4,0,0.2,1) infinite;
          animation-delay: 0.9s;
        }
        @keyframes nord-pin-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          60% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
