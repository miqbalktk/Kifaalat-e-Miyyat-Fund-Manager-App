import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200 ${className}`}
    >
      <defs>
        {/* Background gradient */}
        <radialGradient id="skyGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#d1fae5" />
        </radialGradient>

        {/* Outer green ring gradient */}
        <linearGradient id="emeraldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>

        {/* Gold accent gradient */}
        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Shadow filter */}
        <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#064e3b" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Border Circle */}
      <circle cx="80" cy="80" r="77" fill="url(#skyGrad)" stroke="url(#emeraldRing)" strokeWidth="6" />
      {/* Inner Thin Gold Trim Ring */}
      <circle cx="80" cy="80" r="72" fill="none" stroke="url(#goldAccent)" strokeWidth="2" strokeDasharray="4 2" />

      {/* Sun rays / morning dawn glow */}
      <circle cx="80" cy="82" r="30" fill="#fef08a" opacity="0.4" />

      {/* Background silhouettes: Mosque dome, minarets, and graveyard headstones */}
      <path
        d="M20 115 C35 110, 50 112, 65 113 C80 114, 95 112, 110 113 C125 114, 135 110, 140 114 L140 135 C120 148, 40 148, 20 135 Z"
        fill="#064e3b"
        opacity="0.2"
      />
      {/* Mosque Minaret on the right */}
      <path
        d="M124 100 L124 82 L125 82 L125 76 L124 76 L124 72 Q125 68 126 66 Q127 68 128 72 L128 76 L127 76 L127 82 L128 82 L128 100 Z"
        fill="#064e3b"
        opacity="0.35"
      />
      {/* Mosque Dome silhouette */}
      <path
        d="M112 100 Q112 85 118 84 Q124 85 124 100 Z"
        fill="#064e3b"
        opacity="0.35"
      />

      {/* Islamic Arch Framework in upper crest */}
      <path
        d="M50 68 C50 46, 70 38, 80 32 C90 38, 110 46, 110 68"
        fill="none"
        stroke="#065f46"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M54 68 C54 50, 72 43, 80 38 C88 43, 106 50, 106 68"
        fill="none"
        stroke="url(#goldAccent)"
        strokeWidth="1.5"
      />

      {/* Loving Supporting Caring Hands (Left & Right) */}
      {/* Left Hand cupping from bottom left */}
      <path
        d="M44 68 C42 60, 48 50, 56 50 C60 50, 62 55, 62 60 C62 68, 54 75, 48 78 C45 74, 44 71, 44 68 Z"
        fill="#047857"
      />
      <path
        d="M42 66 C40 52, 46 44, 52 44 C53 44, 54 48, 52 54 C48 64, 46 70, 48 78 C42 75, 40 70, 42 66 Z"
        fill="#065f46"
      />
      {/* Right Hand cupping from bottom right */}
      <path
        d="M116 68 C118 60, 112 50, 104 50 C100 50, 98 55, 98 60 C98 68, 106 75, 112 78 C115 74, 116 71, 116 68 Z"
        fill="#047857"
      />
      <path
        d="M118 66 C120 52, 114 44, 108 44 C107 44, 106 48, 108 54 C112 64, 114 70, 112 78 C118 75, 120 70, 118 66 Z"
        fill="#065f46"
      />

      {/* Peaceful Shrouded Bier (Janaza / Mayyat) in white/emerald with gentle folds */}
      {/* Bed/Bier Base */}
      <rect x="58" y="66" width="44" height="4" rx="2" fill="url(#goldAccent)" />
      {/* Shrouded Body under protective care */}
      <path
        d="M60 66 C60 60, 68 56, 75 56 C85 56, 96 58, 100 66 Z"
        fill="#ffffff"
        stroke="#047857"
        strokeWidth="1.2"
      />
      {/* Shroud Folds */}
      <path d="M68 66 Q71 61 74 66" fill="none" stroke="#a7f3d0" strokeWidth="1" />
      <path d="M78 66 Q82 60 86 66" fill="none" stroke="#a7f3d0" strokeWidth="1" />
      <path d="M90 66 Q93 62 96 66" fill="none" stroke="#a7f3d0" strokeWidth="1" />

      {/* Main Title Banner & Calligraphy Backdrop Ribbon */}
      <g filter="url(#softGlow)">
        {/* Curved Central Emerald Ribbon */}
        <path
          d="M32 94 Q80 84 128 94 Q134 106 128 116 Q80 124 32 116 Q26 106 32 94 Z"
          fill="url(#emeraldRing)"
          stroke="url(#goldAccent)"
          strokeWidth="1.5"
        />
        {/* Banner notch details */}
        <polygon points="28,98 33,94 33,116 28,112 31,105" fill="#f59e0b" />
        <polygon points="132,98 127,94 127,116 132,112 129,105" fill="#f59e0b" />
      </g>

      {/* Arabic/Urdu Typography in Ribbon: کفالتِ میت */}
      <text
        x="80"
        y="108"
        textAnchor="middle"
        fontFamily="'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif"
        fontSize="16"
        fontWeight="bold"
        fill="#ffffff"
        letterSpacing="0.5"
      >
        کفالتِ میت
      </text>

      {/* Secondary Ribbon Text / Subtitle */}
      <text
        x="80"
        y="126"
        textAnchor="middle"
        fontFamily="'Noto Nastaliq Urdu', 'Noto Sans Arabic', sans-serif"
        fontSize="8"
        fontWeight="600"
        fill="#064e3b"
      >
        فنڈ کمیٹی
      </text>

      {/* 3 Pillars at Bottom: Trust (اعتماد), Service (خدمت), Humanity (انسانیت) */}
      <g transform="translate(80, 142)">
        {/* Center: Service */}
        <circle cx="0" cy="0" r="7" fill="#047857" stroke="url(#goldAccent)" strokeWidth="1" />
        <path d="M-2.5 1 A 2.5 2.5 0 0 1 2.5 1 A 2.5 2.5 0 0 1 -2.5 1 Z M-4 4 Q0 1 4 4 Z" fill="#ffffff" transform="scale(0.8) translate(0, -2)" />

        {/* Left: Trust */}
        <circle cx="-24" cy="-3" r="6" fill="#047857" stroke="url(#goldAccent)" strokeWidth="0.8" />
        <path d="M-26 -4 L-22 -2 L-26 0 Z" fill="#ffffff" transform="scale(0.8) translate(-6, 0)" />

        {/* Right: Humanity */}
        <circle cx="24" cy="-3" r="6" fill="#047857" stroke="url(#goldAccent)" strokeWidth="0.8" />
        <path d="M24 -4 C22 -6 20 -4 24 -1 C28 -4 26 -6 24 -4 Z" fill="#ffffff" transform="scale(0.8) translate(6, 0)" />
      </g>
    </svg>
  );
};
