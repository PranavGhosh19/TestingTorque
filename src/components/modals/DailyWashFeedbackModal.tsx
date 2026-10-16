'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  Car,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface DailyWashFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnswer: (answer: 'yes' | 'no') => void;
  vehicleName?: string;
  parkingLocation?: string;
  washerName?: string;
  dateDisplay?: string;
}

export default function DailyWashFeedbackModal({
  isOpen,
  onClose,
  onAnswer,
  vehicleName = 'Your Vehicle',
  parkingLocation = 'Assigned Bay',
  washerName = 'Assigned Washer',
  dateDisplay = 'Today',
}: DailyWashFeedbackModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (answer: 'yes' | 'no') => {
    setSubmitting(true);
    try {
      await onAnswer(answer);
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-md bg-[#11161D] border border-white/[0.12] rounded-[24px] shadow-2xl overflow-hidden relative text-white"
          >
            {/* Top ambient luxury glows */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#2DD4A0]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header with close button */}
            <div className="p-5 pb-3 flex items-center justify-between relative z-10 border-b border-white/[0.06]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/25 text-[#2DD4A0] text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#2DD4A0]" />
                <span>Daily Care Verification • {dateDisplay}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-8 h-8 rounded-full bg-[#161C25] hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Dismiss daily check"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 pt-5 space-y-5 relative z-10">
              {/* Question */}
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#161C25] border border-white/[0.08] text-[#2DD4A0] flex items-center justify-center mx-auto mb-3 shadow-md">
                  <ShieldCheck className="w-6 h-6 text-[#2DD4A0]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  Was your car washed today ({dateDisplay})?
                </h3>
                <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
                  Help us verify your morning route standard for today.
                </p>
              </div>

              {/* Vehicle Context Card */}
              <div className="p-3.5 rounded-2xl bg-[#161C25] border border-white/[0.08] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/70 shrink-0">
                    <Car className="w-4 h-4 text-[#2DD4A0]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{vehicleName}</span>
                    <span className="text-[11px] text-white/50 flex items-center gap-1 font-mono truncate">
                      <MapPin className="w-3 h-3 text-[#2DD4A0] shrink-0" />
                      <span className="truncate">{parkingLocation}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Specialist</span>
                  <span className="text-xs font-bold text-white">{washerName}</span>
                </div>
              </div>

              {/* Yes / No Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* YES BUTTON */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSelect('yes')}
                  className="py-3.5 px-4 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] active:scale-[0.98] text-[#0A0D12] text-xs font-black tracking-wide transition-all shadow-[0_0_20px_rgba(45,212,160,0.3)] flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0A0D12]" />
                    <span className="text-sm">Yes</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium opacity-80">Cleaned ✓</span>
                </button>

                {/* NO BUTTON */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSelect('no')}
                  className="py-3.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-[0.98] text-amber-300 border border-amber-500/35 text-xs font-black tracking-wide transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">No</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium opacity-90">Flag Orange in Calendar</span>
                </button>
              </div>

              {/* Protocol explainer note */}
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-white/45 text-center leading-normal">
                If not answered by the end of the day, your car is automatically considered washed successfully (<strong className="text-[#2DD4A0]">Yes</strong>). Answering <strong className="text-amber-300">No</strong> flags the day Orange in your calendar for billing deduction.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
