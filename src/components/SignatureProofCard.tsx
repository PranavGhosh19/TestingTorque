'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Clock,
  X,
  ChevronRight,
  Maximize2,
  Award,
  Layers,
  Check,
} from 'lucide-react';
import { WashRecord } from '@/lib/types';

interface Props {
  wash?: WashRecord;
  className?: string;
  showFullProofBtn?: boolean;
}

export default function SignatureProofCard({
  wash,
  className = '',
  showFullProofBtn = true,
}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const afterPhoto = wash?.after_photo || '/images/honda_city_after.jpg';
  const vehicleName = wash?.vehicle_name || 'Honda City';
  const time = wash?.completed_at || '7:42 AM';
  const washerName = wash?.washer_name || 'Amit Kumar';
  const washerAvatar = wash?.washer_avatar || '/images/washer_amit.jpg';

  return (
    <>
      <div
        className={`relative rounded-3xl bg-[#080D1A] text-white p-5 sm:p-6 overflow-hidden border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] specular-border luxury-sheen ${className}`}
      >
        {/* Subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Verification Label & Live Washed Badge */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Verified Photo Care
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{vehicleName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                DL 01 AB 4291
              </span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide text-[11px]">WASHED TODAY</span>
          </div>
        </div>

        {/* Inspection Photo Showcase */}
        <div className="relative z-10 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-slate-950 border border-white/15 group shadow-2xl">
          <Image
            src={afterPhoto}
            alt="Verified Clean Inspection"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 600px"
            priority
          />

          {/* Luxury Gloss Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-transparent to-black/30 pointer-events-none" />

          {/* Top Left: Parking Bay Timestamp Watermark */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-white flex items-center gap-2 border border-white/15 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>BAY-VERIFIED • Bay D-14</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-400 font-semibold">B-1</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-mono text-slate-300 flex items-center gap-1.5 border border-white/10 w-fit">
              <Clock className="w-2.5 h-2.5 text-blue-400" />
              <span>{time} IST</span>
            </div>
          </div>

          {/* Top Right: Inspection Zoom Trigger */}
          <button
            onClick={() => setShowModal(true)}
            aria-label="Enlarge inspection photo"
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-white/80 hover:text-white border border-white/15 transition-all shadow-md group-hover:scale-105"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Bottom Overlay: Finish Verification Pill */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white flex items-center gap-2 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold tracking-tight">
                Scratch-Safe Microfiber Finish
              </span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2.5 py-1.5 rounded-xl">
              100% Clean Proof
            </div>
          </div>
        </div>


        {/* Footer: Washer Details & Action */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400/50 shadow-md shrink-0">
              <Image
                src={washerAvatar}
                alt={washerName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">
                  {washerName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ★ 4.9
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Green Valley • Bay D-14 (Basement 1)
              </p>
            </div>
          </div>

          {showFullProofBtn && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] text-xs font-bold transition-all shadow-[0_4px_15px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              <span>View Full Certificate</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Full Proof Certificate Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0B132B] text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/15 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> 100% Verified Care Certificate
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {vehicleName} — Clean Inspection
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-950">
                  <Image
                    src={afterPhoto}
                    alt="Inspected clean vehicle"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>INSPECTED & VERIFIED CLEAN</span>
                  </div>
                </div>

                {/* Audit checklist */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs font-mono">
                  <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Audit Record Hash: #TC-2026-0928</span>
                    <span className="text-emerald-400 font-semibold">VERIFIED</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Parking Bay Log
                    </span>
                    <span className="font-bold text-white">Green Valley · Bay D-14 (B1)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Timestamp
                    </span>
                    <span className="font-bold text-white">Today · {time} IST</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Wash Protocol
                    </span>
                    <span className="font-bold text-emerald-400">Scratch-Safe Microfiber</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Certified Partner
                    </span>
                    <span className="font-bold text-white">{washerName} (ID: #TC-048)</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Every Torque Care service is logged with tamper-proof timestamp and parking bay verification. 2-hour complimentary touch-up guarantee active.
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Service Guarantee Active</span>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-xl bg-white text-[#0B132B] text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Close Certificate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
