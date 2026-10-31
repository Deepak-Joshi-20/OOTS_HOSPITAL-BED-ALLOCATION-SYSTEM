import React from 'react';

export type BackgroundVariant =
  | 'dashboard'
  | 'machines'
  | 'os-lab'
  | 'system'
  | 'login';

/**
 * Provides the signature "Arctic Bloom" subtle engineering blueprint &
 * mechanical sketch background layer across the entire platform.
 * Uses only Arctic Bloom pastel blue (#4169E1 / #63A4FF), lavender (#8B78DB / #E9E4FF),
 * and coral/peach (#FF806D / #FFE4D8) at low opacity so content remains crisp.
 */
export const PageBackgroundPattern: React.FC<{ variant?: BackgroundVariant }> = ({
  variant = 'dashboard',
}) => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none no-print"
      aria-hidden="true"
    >
      {/* Soft radial pastel ambient wash */}
      <div
        className="absolute -top-32 -right-32 h-[460px] w-[460px] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            variant === 'os-lab'
              ? 'radial-gradient(circle, #E9E4FF 0%, rgba(233,228,255,0) 70%)'
              : variant === 'machines'
              ? 'radial-gradient(circle, #FFE4D8 0%, rgba(255,228,216,0) 70%)'
              : 'radial-gradient(circle, rgba(99,164,255,0.22) 0%, rgba(233,228,255,0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            variant === 'os-lab'
              ? 'radial-gradient(circle, rgba(99,164,255,0.18) 0%, rgba(255,228,216,0) 70%)'
              : 'radial-gradient(circle, #E9E4FF 0%, rgba(248,247,243,0) 70%)',
        }}
      />

      {/* Fine architectural & circuit grid pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.38]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="arctic-blueprint-grid"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 96 0 L 0 0 0 96"
              fill="none"
              stroke="#E9EAF0"
              strokeWidth="0.8"
            />
            <circle cx="48" cy="48" r="1.2" fill="#8B78DB" fillOpacity="0.35" />
            <path
              d="M 44 48 L 52 48 M 48 44 L 48 52"
              stroke="#63A4FF"
              strokeWidth="0.6"
              strokeOpacity="0.35"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arctic-blueprint-grid)" />
      </svg>

      {/* Top-right technical schematic illustration (gears, circuit traces, rotor geometry) */}
      <svg
        className="absolute top-14 right-4 w-[480px] h-[480px] opacity-[0.065]"
        viewBox="0 0 420 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer precision compass ring */}
        <circle
          cx="250"
          cy="170"
          r="130"
          stroke="#4169E1"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <circle cx="250" cy="170" r="102" stroke="#8B78DB" strokeWidth="1.2" />
        <circle cx="250" cy="170" r="64" stroke="#4169E1" strokeWidth="1.5" />
        <circle cx="250" cy="170" r="24" stroke="#FF806D" strokeWidth="1.8" />
        {/* Mechanical gear teeth */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30;
          return (
            <g key={i} transform={`rotate(${angle} 250 170)`}>
              <rect
                x="244"
                y="58"
                width="12"
                height="14"
                rx="2"
                stroke="#4169E1"
                strokeWidth="1.3"
              />
              <line
                x1="250"
                y1="106"
                x2="250"
                y2="146"
                stroke="#8B78DB"
                strokeWidth="1"
              />
            </g>
          );
        })}
        {/* Secondary interlocking pinion gear */}
        <circle
          cx="110"
          cy="275"
          r="56"
          stroke="#8B78DB"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
        <circle cx="110" cy="275" r="36" stroke="#FF806D" strokeWidth="1.3" />
        <circle cx="110" cy="275" r="12" stroke="#4169E1" strokeWidth="1.5" />
        {/* Circuit bus lines & sensor nodes */}
        <path
          d="M 20 110 H 95 L 125 140 H 185"
          stroke="#4169E1"
          strokeWidth="1.3"
        />
        <circle cx="95" cy="110" r="3.5" fill="#63A4FF" />
        <circle cx="185" cy="140" r="4" stroke="#4169E1" strokeWidth="1.5" />
        <path
          d="M 165 275 H 270 L 305 310 H 390"
          stroke="#8B78DB"
          strokeWidth="1.3"
        />
        <circle cx="270" cy="275" r="3.5" fill="#8B78DB" />
        <circle cx="390" cy="310" r="4" stroke="#FF806D" strokeWidth="1.5" />
      </svg>

      {/* Bottom-left subtle OS pipeline & sensor waveform sketch */}
      <svg
        className="absolute bottom-6 left-64 w-[520px] h-[220px] opacity-[0.06]"
        viewBox="0 0 520 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 10 160 Q 45 110, 80 160 T 150 160 T 220 130 T 290 160 T 360 140 T 430 160"
          stroke="#4169E1"
          strokeWidth="1.8"
          fill="none"
        />
        <rect
          x="30"
          y="40"
          width="88"
          height="42"
          rx="8"
          stroke="#8B78DB"
          strokeWidth="1.4"
        />
        <rect
          x="160"
          y="40"
          width="88"
          height="42"
          rx="8"
          stroke="#4169E1"
          strokeWidth="1.4"
        />
        <rect
          x="290"
          y="40"
          width="88"
          height="42"
          rx="8"
          stroke="#FF806D"
          strokeWidth="1.4"
        />
        <line
          x1="118"
          y1="61"
          x2="160"
          y2="61"
          stroke="#4169E1"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
        <line
          x1="248"
          y1="61"
          x2="290"
          y2="61"
          stroke="#8B78DB"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
};

/**
 * Editorial banner artwork embedded inside the Dashboard Welcome Card
 * and major section headers.
 */
export const WelcomeHeroIllustration: React.FC = () => (
  <svg
    className="w-full h-full max-h-[165px]"
    viewBox="0 0 360 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Soft pastel backdrop shapes */}
    <rect x="18" y="16" width="128" height="128" rx="24" fill="#E9E4FF" fillOpacity="0.65" />
    <rect x="162" y="24" width="180" height="112" rx="20" fill="#FFE4D8" fillOpacity="0.55" />

    {/* Turbine / Rotor Engineering Drawing */}
    <circle cx="82" cy="80" r="44" fill="#FFFFFF" stroke="#4169E1" strokeWidth="1.75" />
    <circle
      cx="82"
      cy="80"
      r="33"
      stroke="#8B78DB"
      strokeWidth="1.2"
      strokeDasharray="4 3"
    />
    {Array.from({ length: 8 }).map((_, idx) => (
      <g key={idx} transform={`rotate(${idx * 45} 82 80)`}>
        <line x1="82" y1="36" x2="82" y2="64" stroke="#4169E1" strokeWidth="1.6" />
        <circle cx="82" cy="36" r="2.5" fill="#63A4FF" />
      </g>
    ))}
    <circle cx="82" cy="80" r="14" fill="#E9E4FF" stroke="#4169E1" strokeWidth="1.75" />
    <circle cx="82" cy="80" r="5" fill="#FF806D" />

    {/* Connecting circuit trace */}
    <path
      d="M 126 80 H 182"
      stroke="#4169E1"
      strokeWidth="1.75"
      strokeDasharray="3 3"
    />
    <circle cx="154" cy="80" r="4" fill="#FFFFFF" stroke="#4169E1" strokeWidth="1.75" />

    {/* OS Bounded Buffer & Harmonic Waveform Card */}
    <rect
      x="182"
      y="40"
      width="142"
      height="80"
      rx="12"
      fill="#FFFFFF"
      stroke="#8B78DB"
      strokeWidth="1.5"
    />
    {/* Mini buffer slots */}
    <rect x="194" y="52" width="18" height="10" rx="3" fill="#4169E1" />
    <rect x="216" y="52" width="18" height="10" rx="3" fill="#63A4FF" />
    <rect x="238" y="52" width="18" height="10" rx="3" fill="#8B78DB" />
    <rect x="260" y="52" width="18" height="10" rx="3" fill="#FF806D" />
    <rect
      x="282"
      y="52"
      width="18"
      height="10"
      rx="3"
      fill="#F8F7F3"
      stroke="#E9EAF0"
    />
    {/* Harmonic sensor wave */}
    <path
      d="M 194 94 C 210 72, 222 110, 238 88 C 254 66, 268 106, 284 82 C 296 68, 304 94, 312 84"
      stroke="#4169E1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="238" cy="88" r="3.5" fill="#FF806D" />
    <circle cx="284" cy="82" r="3.5" fill="#4169E1" />
  </svg>
);

/**
 * Friendly, editorial SVG illustration for empty states
 * (e.g., when filters match no machines or alerts).
 */
export const EmptyStateIllustration: React.FC<{ title?: string }> = () => (
  <svg
    className="mx-auto h-32 w-44"
    viewBox="0 0 180 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="90" cy="112" rx="64" ry="8" fill="#E9E4FF" fillOpacity="0.65" />
    <rect
      x="38"
      y="24"
      width="104"
      height="74"
      rx="16"
      fill="#FFFFFF"
      stroke="#8B78DB"
      strokeWidth="1.6"
    />
    <circle cx="72" cy="61" r="18" fill="#F8F7F3" stroke="#4169E1" strokeWidth="1.6" />
    <circle cx="72" cy="61" r="6" fill="#63A4FF" />
    <path d="M 98 48 H 126" stroke="#4169E1" strokeWidth="2" strokeLinecap="round" />
    <path d="M 98 60 H 120" stroke="#8B78DB" strokeWidth="2" strokeLinecap="round" />
    <path d="M 98 72 H 114" stroke="#FF806D" strokeWidth="2" strokeLinecap="round" />
    <circle cx="136" cy="28" r="9" fill="#FFE4D8" stroke="#FF806D" strokeWidth="1.5" />
  </svg>
);
