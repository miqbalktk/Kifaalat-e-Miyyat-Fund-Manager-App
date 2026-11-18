import React from 'react';

interface OfficialSignAndStampProps {
  signatoryName?: string;
  signatoryTitle?: string;
  showStamp?: boolean;
  className?: string;
}

export const OfficialSignAndStamp: React.FC<OfficialSignAndStampProps> = ({
  signatoryName = 'Muhammad Iqbal Khattak',
  signatoryTitle = 'Finance Secretary / Khazanchi (خزانچی)',
  showStamp = true,
  className = '',
}) => {
  return (
    <div className={`relative inline-flex flex-col items-center sm:items-end ${className}`}>
      {/* Signature & Stamp Stack Container */}
      <div className="relative w-56 h-28 flex items-center justify-center">
        
        {/* 1. Official Welfare Society Verification Stamp */}
        {showStamp && (
          <div className="absolute right-2 top-0 pointer-events-none select-none opacity-90 transform -rotate-6">
            <svg
              width="116"
              height="116"
              viewBox="0 0 140 140"
              className="drop-shadow-xs"
            >
              <defs>
                {/* Text Path for Top Curve */}
                <path
                  id="topCircle"
                  d="M 22,70 A 48,48 0 1,1 118,70"
                  fill="none"
                />
                {/* Text Path for Bottom Curve */}
                <path
                  id="bottomCircle"
                  d="M 118,70 A 48,48 0 0,1 22,70"
                  fill="none"
                />
              </defs>

              {/* Outer Thick Ring */}
              <circle
                cx="70"
                cy="70"
                r="64"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="2.5"
                strokeDasharray="1 0"
              />
              
              {/* Outer Decorative Dashed Ring */}
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1"
                strokeDasharray="3 2"
              />

              {/* Inner Double Ring */}
              <circle
                cx="70"
                cy="70"
                r="42"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="1.8"
              />
              <circle
                cx="70"
                cy="70"
                r="39"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="0.8"
              />

              {/* Top Curved Text */}
              <text
                fontSize="7.8"
                fontWeight="bold"
                fill="#1e3a8a"
                letterSpacing="1.2"
                className="uppercase tracking-widest font-mono"
              >
                <textPath
                  href="#topCircle"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  ★ KIFAALAT E MIYYAT ★
                </textPath>
              </text>

              {/* Bottom Curved Urdu Text */}
              <text
                fontSize="8.5"
                fontWeight="bold"
                fill="#1e3a8a"
                className="font-urdu"
              >
                <textPath
                  href="#bottomCircle"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  ★ کفالتِ میت فنڈ ویلفیئر ★
                </textPath>
              </text>

              {/* Center Seal Text & Badges */}
              <g fill="#1e3a8a" textAnchor="middle" className="select-none">
                {/* Small Crescent & Star Icon in Center */}
                <path
                  d="M 68 47 A 5 5 0 1 0 74 53 A 4 4 0 1 1 68 47 Z"
                  fill="#1e3a8a"
                />
                <polygon
                  points="73,49 74,51 76,51 74.5,52 75,54 73.5,53 72,54 72.5,52 71,51 73,51"
                  fill="#1e3a8a"
                />

                <text x="70" y="63" fontSize="6.5" fontWeight="900" letterSpacing="0.8">
                  VERIFIED
                </text>
                
                {/* Divider Line */}
                <line x1="52" y1="67" x2="88" y2="67" stroke="#1e3a8a" strokeWidth="0.8" />

                <text x="70" y="76" fontSize="7.2" fontWeight="bold" className="font-urdu">
                  محمد اقبال خٹک
                </text>
                
                <text x="70" y="85" fontSize="5.5" fontWeight="bold" letterSpacing="0.5">
                  FINANCE SEC.
                </text>

                <line x1="56" y1="89" x2="84" y2="89" stroke="#1e3a8a" strokeWidth="0.6" strokeDasharray="2 1" />
                <text x="70" y="96" fontSize="5" fontWeight="bold" fill="#2563eb">
                  OFFICIAL SEAL
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* 2. Authentic Handwritten Blue Ink Signature (Vector Reproduction of Official Signature over Stamp) */}
        <div 
          className="absolute -right-2 top-0 z-10 pointer-events-none select-none transform -rotate-2"
          style={{ mixBlendMode: 'multiply' }}
        >
          <svg
            width="215"
            height="108"
            viewBox="0 0 240 120"
            className="filter drop-shadow-xs"
          >
            <g
              fill="none"
              stroke="#0a36c7"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer oval enclosing "M." */}
              <path
                d="M 88,48 C 88,24 60,18 36,25 C 16,31 6,56 12,80 C 18,102 46,112 76,106 C 98,101 112,85 116,68"
              />
              {/* Initial 'M' strokes inside oval */}
              <path
                d="M 30,78 L 33,52 L 42,75 L 53,46 L 56,70"
                strokeWidth="2.6"
              />
              {/* Dot after M */}
              <circle cx="67" cy="48" r="1.6" fill="#0a36c7" />

              {/* Connecting swoosh from oval to cursive Iqbal */}
              <path
                d="M 56,70 C 64,88 78,110 88,96 C 96,84 94,62 104,50 C 114,38 128,45 136,54"
                strokeWidth="2.6"
              />

              {/* Lower loop of 'q' / cursive stem */}
              <path
                d="M 136,54 C 142,60 144,76 138,88 C 134,96 142,98 148,84 C 154,70 152,56 160,54"
                strokeWidth="2.5"
              />

              {/* Middle letters 'ba' */}
              <path
                d="M 160,54 C 166,52 172,66 170,74 C 168,80 178,78 182,70 C 186,62 188,54 192,48"
                strokeWidth="2.4"
              />

              {/* Tall sweeping loop of 'l' rising high and swooshing down */}
              <path
                d="M 192,48 C 196,36 194,14 186,2 C 178,24 182,56 190,80 C 196,98 206,108 222,96 C 234,86 238,76 242,70"
                strokeWidth="2.9"
              />

              {/* Sharp underline stroke sweeping under the name to the right */}
              <path
                d="M 152,112 L 230,68"
                strokeWidth="2.7"
              />
            </g>
          </svg>
        </div>

      </div>

      {/* Signatory Name and Official Title */}
      <div className="text-center sm:text-right mt-1 z-20">
        <div className="border-t-2 border-slate-700 dark:border-slate-300 pt-1 px-4 inline-block">
          <span className="font-serif font-bold text-base text-emerald-950 dark:text-emerald-100 block">
            {signatoryName}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block font-urdu">
            محمد اقبال خٹک (خزانچی و ناظمِ مالیات)
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          {signatoryTitle}
        </p>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 mt-1">
          ✓ Digitally Verified & Stamped
        </span>
      </div>
    </div>
  );
};
