import React from 'react';
import TorqueEmblem from './TorqueEmblem';

interface TorqueAppIconProps {
  size?: number;
  className?: string;
  variant?: 'dark' | 'light' | 'mint';
}

/**
 * Torque Care App Icon
 * - Features the shield emblem inside a squircle container
 * - Automotive badge presence suitable for iOS/Android home screens and favicons
 */
export default function TorqueAppIcon({
  size = 64,
  className = '',
  variant = 'dark',
}: TorqueAppIconProps) {
  const isLight = variant === 'light';
  const isMint = variant === 'mint';

  const containerBg = isMint
    ? 'bg-[#2DD4A0]'
    : isLight
    ? 'bg-[#F8FAFC] border border-slate-200'
    : 'bg-[#0A0D12] border border-white/[0.1] shadow-2xl';

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-[22%] flex items-center justify-center shrink-0 transition-transform ${containerBg} ${className}`}
    >
      <TorqueEmblem
        size={size * 0.72}
        variant={variant}
      />
    </div>
  );
}
