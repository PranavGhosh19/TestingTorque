'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Users, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';

interface WhyTorqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToRegister: () => void;
}

export default function WhyTorqueModal({
  isOpen,
  onClose,
  onProceedToRegister,
}: WhyTorqueModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      title: 'Wash Proof',
      desc: 'Check if your car is cleaned with real-time photos. Phone gallery uploads strictly blocked.',
      icon: Camera,
      iconColor: 'text-[#2DD4A0]',
      iconBg: 'bg-[#2DD4A0]/15 border-[#2DD4A0]/30',
    },
    {
      title: 'Backup Washer',
      desc: 'If your primary washer is on leave, another verified washer is assigned immediately.',
      icon: Users,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15 border-blue-500/30',
    },
    {
      title: 'Money Carry Forward',
      desc: "If your car wasn't washed, that day's pay rolls forward automatically. Your money is 100% safe.",
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="why-torque-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.25 } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        <motion.div
          key="why-torque-card"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          }}
          exit={{ opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.2 } }}
          className="relative w-full max-w-md my-auto rounded-[24px] bg-[#11161D] border border-white/[0.12] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden text-white"
        >
          {/* Top Decorative Mint Gradient Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-[#2DD4A0] to-teal-400" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close modal"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Header */}
            <div className="pr-8 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#2DD4A0]" />
                WHY CHOOSE TORQUE CARE?
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                3 reason you won&apos;t get anywhere else
              </h2>
            </div>

            {/* 3 Value Features - Compact for small screens */}
            <div className="space-y-2.5 pt-1">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-[#161C25]/80 border border-white/[0.06] flex items-start gap-3 hover:border-white/15 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${feat.iconBg} ${feat.iconColor} mt-0.5`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-white/65 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={onProceedToRegister}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#2DD4A0] to-[#1FB888] hover:from-[#35e0aa] hover:to-[#22c794] text-[#0A0D12] text-xs sm:text-sm font-bold shadow-[0_8px_25px_rgba(45,212,160,0.35)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              >
                <span>Like what you read? Register now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-1 text-center text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                Explore website first
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
