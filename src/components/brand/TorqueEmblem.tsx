import React from 'react';

interface TorqueEmblemProps {
  className?: string;
  size?: number | string;
  variant?: 'dark' | 'light' | 'mint';
}

/**
 * Torque Care Shield Emblem
 * - Shield emblem: Automotive performance badge inspired by steering wheels, fenders, and key fobs.
 * - Angular T: Chamfered crossbar (roofline) with a tapered stem (blade/grille).
 * - Two mint slashes: Headlight and DRL signatures flanking the stem in verified mint (#2DD4A0).
 */
export default function TorqueEmblem({
  className = '',
  size = 40,
  variant = 'dark',
}: TorqueEmblemProps) {
  // Color configuration based on the design specification
  const isMint = variant === 'mint';
  const isLight = variant === 'light';

  const shieldStroke = isMint ? '#0A0D12' : isLight ? '#0A0D12' : '#FFFFFF';
  const tFill = isMint ? '#0A0D12' : isLight ? '#0A0D12' : '#FFFFFF';
  const slashFill = isMint ? '#FFFFFF' : '#2DD4A0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-label="Torque Care Emblem"
    >
      {/* OUTER SHIELD BADGE */}
      {/* Flat top, chamfered top-left & top-right, straight vertical sides, curving down to center apex point */}
      <path
        d="M 28 15 
           L 72 15 
           L 86 28 
           L 86 52 
           C 86 68, 66 82, 50 88 
           C 34 82, 14 68, 14 52 
           L 14 28 
           Z"
        stroke={shieldStroke}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ANGULAR 'T' (ROOFLINE & TAPERED BLADE/GRILLE) */}
      {/* 
        Crossbar: Chamfered top corners (roofline profile)
        Stem: Tapered downward like an aerodynamic blade
      */}
      <path
        d="M 25 28
           L 75 28
           L 68 37
           L 55 37
           L 54 68
           L 46 68
           L 45 37
           L 32 37
           Z"
        fill={tFill}
      />

      {/* TWO MINT SLASHES (HEADLIGHT / DRL SIGNATURES) */}
      {/* Left DRL headlight slash */}
      <polygon
        points="30,41 42,41 40,44.5 28,44.5"
        fill={slashFill}
      />

      {/* Right DRL headlight slash */}
      <polygon
        points="58,41 70,41 72,44.5 60,44.5"
        fill={slashFill}
      />
    </svg>
  );
}
