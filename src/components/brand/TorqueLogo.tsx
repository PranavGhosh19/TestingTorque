import React from 'react';
import TorqueEmblem from './TorqueEmblem';

interface TorqueLogoProps {
  className?: string;
  emblemSize?: number;
  variant?: 'dark' | 'light' | 'mint';
  showWordmark?: boolean;
}

/**
 * Torque Care Full Brand Lockup
 * - Shield emblem: Automotive performance badge (steering wheels, fenders, key fobs).
 * - Angular T: Chamfered roofline crossbar + tapered blade stem.
 * - Two mint slashes: Headlight and DRL signatures (#2DD4A0).
 * - Wordmark: Bold wide-tracked TORQUE + slanted mint rule + spec-sheet CARE.
 */
export default function TorqueLogo({
  className = '',
  emblemSize = 42,
  variant = 'dark',
  showWordmark = true,
}: TorqueLogoProps) {
  const isLight = variant === 'light';
  const isMint = variant === 'mint';

  const torqueColor = isLight ? 'text-[#0A0D12]' : isMint ? 'text-[#0A0D12]' : 'text-white';
  const careColor = isLight ? 'text-slate-500' : isMint ? 'text-slate-700' : 'text-white/50';
  const ruleBg = isMint ? 'bg-[#0A0D12]' : 'bg-[#2DD4A0]';

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* SHIELD EMBLEM */}
      <TorqueEmblem size={emblemSize} variant={variant} />

      {/* WORDMARK LOCKUP */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          {/* TORQUE - Bold & Wide-tracked */}
          <div
            className={`font-black text-sm sm:text-base tracking-[0.28em] uppercase leading-none font-sans ${torqueColor}`}
          >
            TORQUE
          </div>

          {/* SLANTED MINT RULE */}
          <div className="w-full mt-1.5 mb-1.5 flex items-center">
            <div
              className={`h-[2.5px] w-full ${ruleBg}`}
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 93% 100%, 0% 100%)',
              }}
            />
          </div>

          {/* CARE - Light & Grey, Spec-sheet style */}
          <div
            className={`font-light text-[10px] sm:text-[11px] tracking-[0.45em] uppercase leading-none font-sans pl-0.5 ${careColor}`}
          >
            C A R E
          </div>
        </div>
      )}
    </div>
  );
}
