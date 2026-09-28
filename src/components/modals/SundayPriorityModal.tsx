'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, CheckCircle2, Clock, MapPin, X, Loader2, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SundayPriorityModal({ isOpen, onClose }: Props) {
  const { sundayRequestState, requestSundayWash } = useStore();
  const [selectedSlot, setSelectedSlot] = useState('7:30 – 8:00 AM');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Sunday Priority Wash
              </h3>
              <p className="text-xs text-slate-300">
                Guaranteed slot on your weekend off
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content based on status */}
        <div className="p-6">
          {sundayRequestState.status === 'idle' && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Date
                </span>
                <div className="text-lg font-extrabold text-[#0B132B] mt-0.5">
                  Sunday, 29 September
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Honda City (DL 01 AB 4291) • Bay D-14
                </div>
              </div>

              {/* Price comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Your normal price
                  </span>
                  <div className="text-xl font-bold text-slate-500 line-through mt-0.5">
                    ₹25
                  </div>
                  <span className="text-[10px] text-slate-400">Weekdays plan</span>
                </div>

                <div className="p-3.5 rounded-2xl border-2 border-blue-500/80 bg-blue-50/50">
                  <span className="text-[11px] font-bold text-blue-700 block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Priority price
                  </span>
                  <div className="text-2xl font-extrabold text-[#0B132B] mt-0.5">
                    ₹50
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    100% to washer bonus
                  </span>
                </div>
              </div>

              {/* Slot selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Select Preferred Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['7:30 – 8:00 AM', '8:00 – 8:30 AM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        selectedSlot === slot
                          ? 'border-[#0B132B] bg-[#0B132B] text-white'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={requestSundayWash}
                className="w-full py-4 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <span>[ Request Sunday Wash ]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SEARCHING ANIMATION */}
          {sundayRequestState.status === 'searching' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Finding a washer...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Searching trusted washers in Green Valley Residency
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                We&apos;ll notify you as soon as your designated washer accepts.
              </p>
            </div>
          )}

          {/* CONFIRMED */}
          {sundayRequestState.status === 'confirmed' && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ Sunday Wash Confirmed
                </span>
                <h4 className="text-xl font-extrabold text-[#0B132B] mt-2">
                  Sunday, 29 September
                </h4>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                      <Image
                        src="/images/washer_amit.jpg"
                        alt="Amit Kumar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Amit Kumar
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Your regular trusted washer ★ 4.9
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Accepted
                  </span>
                </div>

                <div className="border-t border-slate-200/70 pt-2 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Arrival Time
                  </span>
                  <span className="font-bold text-slate-900">7:30 – 8:00 AM</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Priority Fee</span>
                  <span className="font-extrabold text-[#0B132B] text-sm">₹50</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
