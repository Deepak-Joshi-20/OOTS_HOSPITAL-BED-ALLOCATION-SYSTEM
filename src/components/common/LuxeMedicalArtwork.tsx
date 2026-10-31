import React from 'react';
import { ShieldAlert, ArrowLeft, Sparkles, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable Dual-Theme Switcher Pill ("Blossom Care" vs "Initial Theme")
 */
export const ThemeSwitcherControl: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => {
  const { theme, setTheme, isBlossom } = useTheme();

  return (
    <div
      className={`inline-flex items-center rounded-2xl p-1 border transition-colors ${
        isBlossom
          ? 'bg-[#F5E9E8] border-[#C9A9B8] text-[#2E2532]'
          : 'bg-[#E9EFF8] border-[#B8C7E0] text-[#1A2130]'
      }`}
      role="group"
      aria-label="Visual Theme Selector"
    >
      <button
        type="button"
        onClick={() => setTheme('blossom')}
        className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
          theme === 'blossom'
            ? 'bg-[#754C68] text-[#FAF1E8] shadow-xs'
            : 'text-[#414C66] hover:text-[#1A2130] hover:bg-white/60'
        }`}
      >
        <Sparkles className="h-3 w-3" />
        <span>{compact ? 'Blossom' : 'Blossom Care'}</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('luxe')}
        className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
          theme === 'luxe'
            ? 'bg-[#202B52] text-white shadow-xs'
            : 'text-[#4E3D4A] hover:text-[#2E2532] hover:bg-white/60'
        }`}
      >
        <Palette className="h-3 w-3" />
        <span>{compact ? 'Arctic Bloom' : 'Arctic Bloom'}</span>
      </button>
    </div>
  );
};

/**
 * Ambient background layer that adapts between:
 * - Blossom Care: Warm vanilla (#FAF1E8), blush (#F5E9E8), lavender mist (#EAE2F3),
 *   delicate botanical curves, line-art hospital silhouette, and tiny medical crosses.
 * - Initial Theme (Luxe Medical): Soft blue-grey (#E9EFF8) with navy/indigo linework.
 */
export const LuxePageAmbientBackground: React.FC = () => {
  const { isBlossom } = useTheme();

  if (isBlossom) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none no-print"
        aria-hidden="true"
      >
        {/* Warm organic pastel forms */}
        <div
          className="absolute -top-32 -right-20 h-[540px] w-[540px] rounded-full opacity-65 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(234,226,243,0.95) 0%, rgba(245,233,232,0.7) 48%, rgba(250,241,232,0) 74%)',
          }}
        />
        <div
          className="absolute top-1/3 -left-28 h-[460px] w-[460px] rounded-full opacity-55 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(233,185,167,0.38) 0%, rgba(217,185,200,0.28) 52%, rgba(250,241,232,0) 76%)',
          }}
        />
        <div
          className="absolute -bottom-36 right-1/4 h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(185,165,213,0.34) 0%, rgba(245,233,232,0.5) 55%, rgba(250,241,232,0) 78%)',
          }}
        />

        {/* Delicate editorial dot & tiny medical cross pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.42]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="blossom-editorial-pattern"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              {/* Soft organic curve */}
              <path
                d="M 0 60 Q 30 48 60 60 T 120 60"
                fill="none"
                stroke="#D9B9C8"
                strokeWidth="0.65"
                strokeOpacity="0.45"
              />
              {/* Tiny decorative medical cross */}
              <path
                d="M 56 30 H 64 M 60 26 V 34"
                stroke="#B98CA7"
                strokeWidth="1.2"
                strokeOpacity="0.45"
                strokeLinecap="round"
              />
              {/* Tiny botanical dot */}
              <circle
                cx="24"
                cy="90"
                r="1.5"
                fill="#E9B9A7"
                fillOpacity="0.6"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#blossom-editorial-pattern)"
          />
        </svg>

        {/* Subtle Top-Right Editorial Line-Art Hospital & Botanical Illustration */}
        <svg
          className="absolute top-12 right-6 w-[560px] h-[300px] opacity-[0.11]"
          viewBox="0 0 560 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Flowing organic botanical stem & petals */}
          <path
            d="M 420 260 C 430 190 465 130 510 75"
            stroke="#754C68"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 452 175 C 425 162 418 135 445 128 C 468 122 470 152 452 175 Z"
            stroke="#B98CA7"
            strokeWidth="1.5"
            fill="#F5E9E8"
          />
          <path
            d="M 476 132 C 502 125 514 98 490 88 C 470 80 462 110 476 132 Z"
            stroke="#754C68"
            strokeWidth="1.5"
            fill="#EAE2F3"
          />
          {/* Minimal Line-Art Boutique Hospital Pavilion */}
          <rect
            x="230"
            y="58"
            width="104"
            height="162"
            rx="16"
            stroke="#754C68"
            strokeWidth="1.8"
          />
          <rect
            x="162"
            y="102"
            width="68"
            height="118"
            rx="12"
            stroke="#B98CA7"
            strokeWidth="1.6"
          />
          <rect
            x="334"
            y="94"
            width="74"
            height="126"
            rx="12"
            stroke="#B98CA7"
            strokeWidth="1.6"
          />
          {/* Delicate Medical Cross Emblem */}
          <circle
            cx="282"
            cy="86"
            r="14"
            stroke="#754C68"
            strokeWidth="1.5"
          />
          <path
            d="M 282 78 V 94 M 274 86 H 290"
            stroke="#754C68"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Gentle Heartbeat & Organic Wave */}
          <path
            d="M 20 220 H 130 L 146 198 L 162 238 L 180 156 L 198 244 L 214 208 L 230 220 H 530"
            stroke="#754C68"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none no-print"
      aria-hidden="true"
    >
      <div
        className="absolute -top-36 -right-24 h-[520px] w-[520px] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(97,155,255,0.28) 0%, rgba(137,117,213,0.12) 45%, rgba(233,239,248,0) 72%)',
        }}
      />
      <div
        className="absolute -bottom-44 left-36 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(232,228,255,0.85) 0%, rgba(255,227,217,0.35) 50%, rgba(233,239,248,0) 75%)',
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.36]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="luxe-medical-pattern"
            width="112"
            height="112"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 112 0 L 0 0 0 112"
              fill="none"
              stroke="#D6E1F2"
              strokeWidth="0.8"
            />
            <path
              d="M 52 56 H 60 M 56 52 V 60"
              stroke="#8975D5"
              strokeWidth="1.2"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#luxe-medical-pattern)" />
      </svg>
    </div>
  );
};

/**
 * Editorial Hospital & Care Sanctuary Illustration
 * Adapts automatically between Blossom Care (warm editorial line-art & botanical curves)
 * and Initial Theme (Luxe Medical).
 */
export const HospitalHeroIllustration: React.FC = () => {
  const { isBlossom } = useTheme();

  if (isBlossom) {
    return (
      <svg
        className="w-full h-full max-h-[220px]"
        viewBox="0 0 450 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Layered pastel editorial card canvas */}
        <rect
          x="12"
          y="14"
          width="426"
          height="192"
          rx="28"
          fill="#FAF1E8"
          fillOpacity="0.92"
          stroke="#D9B9C8"
          strokeWidth="1.4"
        />

        {/* Soft organic pastel blobs */}
        <circle cx="96" cy="82" r="58" fill="#F5E9E8" />
        <circle cx="348" cy="76" r="64" fill="#EAE2F3" />
        <ellipse cx="236" cy="156" rx="85" ry="36" fill="#E9B9A7" fillOpacity="0.28" />

        {/* Delicate Floral / Botanical Sprig on Left */}
        <path
          d="M 38 178 C 46 134 62 96 86 58"
          stroke="#B98CA7"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 54 134 C 36 126 34 104 52 98 C 68 94 70 116 54 134 Z"
          fill="#EAE2F3"
          stroke="#754C68"
          strokeWidth="1.3"
        />
        <path
          d="M 68 98 C 86 90 92 70 74 64 C 58 58 54 80 68 98 Z"
          fill="#E9B9A7"
          fillOpacity="0.55"
          stroke="#754C68"
          strokeWidth="1.3"
        />

        {/* Boutique Hospital Architecture Line-Art */}
        <rect
          x="74"
          y="64"
          width="56"
          height="108"
          rx="10"
          fill="#FFFDFB"
          stroke="#B98CA7"
          strokeWidth="1.6"
        />
        <rect
          x="124"
          y="38"
          width="92"
          height="134"
          rx="14"
          fill="#FFFDFB"
          stroke="#754C68"
          strokeWidth="1.8"
        />
        <rect
          x="210"
          y="72"
          width="58"
          height="100"
          rx="10"
          fill="#FFFDFB"
          stroke="#B98CA7"
          strokeWidth="1.6"
        />

        {/* Editorial Medical Cross Emblem */}
        <circle
          cx="170"
          cy="64"
          r="15"
          fill="#F5E9E8"
          stroke="#754C68"
          strokeWidth="1.5"
        />
        <path
          d="M 170 56 V 72 M 162 64 H 178"
          stroke="#754C68"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Arched Sanctuary Windows */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`bc-win-${row}-${col}`}
              x={140 + col * 23}
              y={90 + row * 24}
              width="13"
              height="16"
              rx="6.5"
              fill={
                row === 0 && col === 1
                  ? '#E9B9A7'
                  : (row + col) % 2 === 0
                  ? '#EAE2F3'
                  : '#F5E9E8'
              }
              stroke="#B98CA7"
              strokeWidth="1.1"
            />
          ))
        )}

        {/* Right Side: Minimal Line-Art Care Suite & Telemetry Monitor */}
        <rect
          x="286"
          y="42"
          width="132"
          height="130"
          rx="20"
          fill="#FFFDFB"
          stroke="#D9B9C8"
          strokeWidth="1.6"
        />
        <text
          x="302"
          y="63"
          fill="#754C68"
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="bold"
        >
          BLOSSOM CARE · SUITE
        </text>

        {/* Soft Lilac & Berry Heartbeat Line */}
        <path
          d="M 300 90 H 324 L 331 78 L 339 104 L 349 66 L 358 106 L 366 84 L 374 90 H 404"
          stroke="#754C68"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Minimalist Line-Art Hospital Bed */}
        <path
          d="M 304 146 V 120 M 304 136 H 392 V 146 M 308 126 H 332 C 337 126 339 129 339 134 H 304"
          stroke="#3D3440"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="314" cy="151" r="3" fill="#B98CA7" />
        <circle cx="382" cy="151" r="3" fill="#B98CA7" />

        {/* Tiny Floating Medical Crosses */}
        <path
          d="M 398 56 H 404 M 401 53 V 59"
          stroke="#E9B9A7"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 52 44 H 58 M 55 41 V 47"
          stroke="#B9A5D5"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Gentle Flowing Baseline Pulse */}
        <path
          d="M 28 184 H 215 L 226 172 L 236 192 L 248 158 L 260 194 L 270 180 L 280 184 H 422"
          stroke="#B98CA7"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-full h-full max-h-[210px]"
      viewBox="0 0 440 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="16"
        y="20"
        width="408"
        height="172"
        rx="24"
        fill="#202B52"
        stroke="#4169E1"
        strokeOpacity="0.4"
      />
      <circle cx="350" cy="70" r="68" fill="#4169E1" fillOpacity="0.16" />
      <circle cx="110" cy="140" r="56" fill="#8975D5" fillOpacity="0.16" />
      <rect
        x="46"
        y="46"
        width="62"
        height="118"
        rx="8"
        fill="#111A35"
        stroke="#619BFF"
        strokeWidth="1.5"
      />
      <rect
        x="108"
        y="30"
        width="86"
        height="134"
        rx="10"
        fill="#111A35"
        stroke="#619BFF"
        strokeWidth="1.8"
      />
      <rect
        x="194"
        y="62"
        width="64"
        height="102"
        rx="8"
        fill="#111A35"
        stroke="#8975D5"
        strokeWidth="1.5"
      />
      <circle cx="151" cy="56" r="15" fill="#202B52" stroke="#619BFF" strokeWidth="1.4" />
      <path
        d="M 151 48 V 64 M 143 56 H 159"
        stroke="#FF8278"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`win-${row}-${col}`}
            x={123 + col * 22}
            y={82 + row * 24}
            width="12"
            height="14"
            rx="3"
            fill={row === 1 && col === 1 ? '#FF8278' : '#619BFF'}
            fillOpacity={row === 1 && col === 1 ? '0.85' : '0.35'}
          />
        ))
      )}
      <rect
        x="278"
        y="40"
        width="128"
        height="124"
        rx="16"
        fill="#111A35"
        stroke="#8975D5"
        strokeWidth="1.5"
      />
      <text x="292" y="60" fill="#E8E4FF" fontSize="10" fontFamily="monospace" fontWeight="bold">
        ICU TELEMETRY · LIVE
      </text>
      <path
        d="M 290 88 H 316 L 323 76 L 331 102 L 341 64 L 350 106 L 358 82 L 365 88 H 394"
        stroke="#619BFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 294 142 V 118 M 294 132 H 374 V 142 M 298 124 H 320 C 324 124 326 126 326 130 H 294"
        stroke="#E8E4FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="304" cy="146" r="3" fill="#FF8278" />
      <circle cx="366" cy="146" r="3" fill="#FF8278" />
      <path
        d="M 28 176 H 215 L 226 164 L 236 186 L 248 148 L 260 188 L 270 172 L 280 176 H 412"
        stroke="#FF8278"
        strokeWidth="1.8"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AccessDeniedPanel: React.FC<{ requiredRoleLabel?: string }> = ({
  requiredRoleLabel = 'Administrator',
}) => {
  const { currentUser } = useAuth();
  const { isBlossom } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className={`rounded-3xl border p-10 text-center max-w-xl mx-auto my-8 shadow-xs space-y-4 ${
        isBlossom
          ? 'border-[#D9B9C8] bg-[#FFFDFB]'
          : 'border-[#D5E0F2] bg-white'
      }`}
    >
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
          isBlossom
            ? 'bg-[#F5E9E8] text-[#754C68]'
            : 'bg-[#FFE3D9] text-[#C4382B]'
        }`}
      >
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h2
        className={`text-2xl font-bold ${
          isBlossom ? 'text-[#3D3440] font-editorial' : 'text-[#252D43] font-display'
        }`}
      >
        Role Permission Restricted
      </h2>
      <p
        className={`text-xs sm:text-sm leading-relaxed ${
          isBlossom ? 'text-[#4E3D4A]' : 'text-[#414C66]'
        }`}
      >
        Your active staff role (
        <strong className={isBlossom ? 'text-[#3D3440]' : 'text-[#252D43]'}>
          {currentUser?.role}
        </strong>
        ) does not have clearance for this clinical module. Access requires{' '}
        <strong className={isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'}>
          {requiredRoleLabel}
        </strong>{' '}
        privileges.
      </p>
      <div className="pt-2">
        <button
          onClick={() => navigate('/')}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer ${
            isBlossom
              ? 'bg-[#754C68] hover:bg-[#5E3B53]'
              : 'bg-[#4169E1] hover:bg-[#3358D4]'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Operations Dashboard</span>
        </button>
      </div>
    </div>
  );
};
