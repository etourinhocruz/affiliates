type Props = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 52, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mansao Green Affiliates"
    >
      <defs>
        <pattern id="mgHalftone" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.1" fill="#0a0a0a" opacity="0.55" />
        </pattern>
        <linearGradient id="mgNeon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8BFF2E" />
          <stop offset="50%" stopColor="#39FF14" />
          <stop offset="100%" stopColor="#12C93A" />
        </linearGradient>
        <filter id="mgGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="16" fill="url(#mgNeon)" />
      <rect x="0" y="0" width="120" height="120" rx="16" fill="url(#mgHalftone)" />

      <path
        d="M 4 6 Q 40 -2 72 4 T 118 8 L 118 14 Q 82 6 50 12 T 4 16 Z"
        fill="#0a0a0a"
        opacity="0.35"
      />
      <path
        d="M 2 104 Q 36 112 70 108 T 118 112 L 118 118 L 2 118 Z"
        fill="#0a0a0a"
        opacity="0.35"
      />

      <rect
        x="13"
        y="13"
        width="94"
        height="94"
        rx="8"
        fill="#e5e7eb"
        stroke="#0a0a0a"
        strokeWidth="1"
      />

      <g filter="url(#mgGlow)">
        <path
          d="M 32 86 L 44 34 L 56 34 L 60 58 L 64 34 L 76 34 L 88 86 L 76 86 L 72 68 L 66 68 L 64 78 L 56 78 L 54 68 L 48 68 L 44 86 Z"
          fill="#0a0a0a"
        />
        <path
          d="M 54 44 L 60 58 L 66 44 Z"
          fill="#0a0a0a"
        />
      </g>

      <text
        x="60"
        y="100"
        textAnchor="middle"
        fontFamily="'Inter', system-ui, sans-serif"
        fontSize="8"
        fontWeight="900"
        letterSpacing="2"
        fill="#0a0a0a"
      >
        AMG
      </text>
    </svg>
  );
}
