'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Clock, MapPin, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function SundayPriorityPage() {
  const router = useRouter();
  const { sundayRequestState, requestSundayWash, isLoggedIn, isHydrated } = useStore();
  const [slot, setSlot] = useState('7:30 – 8:00 AM');

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-xs tracking-wider text-slate-400 font-mono uppercase">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <header className="bg-white border-b border-slate-200/80 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/owner/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-[#0B132B]">
              Sunday Priority Booking
            </h1>
            <span className="text-[11px] text-slate-500">
              Weekend guaranteed exterior finish
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {sundayRequestState.status === 'idle' && (
          <div className="premium-card p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selected Date
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B132B] mt-1">
                Sunday, 29 September
              </h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Honda City (DL 01 AB 4291) • Green Valley Bay D-14
              </p>
            </div>

            {/* Price comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500 block">
                  Your normal price
                </span>
                <div className="text-2xl font-bold text-slate-400 line-through mt-1">
                  ₹25
                </div>
                <span className="text-[10px] text-slate-400">Weekday standard</span>
              </div>

              <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/50">
                <span className="text-xs font-bold text-blue-700 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Priority price
                </span>
                <div className="text-3xl font-extrabold text-[#0B132B] mt-1">
                  ₹50
                </div>
                <span className="text-[10px] text-blue-700 font-semibold">
                  100% direct partner incentive
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Preferred Morning Window
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['7:30 – 8:00 AM', '8:00 – 8:30 AM'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold text-center transition-all ${
                      slot === s
                        ? 'border-[#0B132B] bg-[#0B132B] text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {s}
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

        {/* Searching Status */}
        {sundayRequestState.status === 'searching' && (
          <div className="premium-card p-12 bg-white border-slate-200/90 shadow-sm text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#0B132B]">
                Finding a washer...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Searching trusted washers in your cluster
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              We&apos;ll notify you when accepted by Amit Kumar or another verified peer.
            </p>
          </div>
        )}

        {/* Confirmed Status */}
        {sundayRequestState.status === 'confirmed' && (
          <div className="premium-card p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Sunday Wash Confirmed
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B132B] mt-2">
                Sunday, 29 September
              </h2>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                    <Image
                      src="/images/washer_amit.jpg"
                      alt="Amit Kumar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Amit Kumar
                    </div>
                    <div className="text-xs text-slate-500">
                      Your regular trusted washer ★ 4.9
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                  Confirmed
                </span>
              </div>

              <div className="border-t border-slate-200/70 pt-3 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-blue-600" /> Arrival Time:
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  7:30 – 8:00 AM
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Priority Service Charge</span>
                <span className="font-extrabold text-[#0B132B] text-base">
                  ₹50
                </span>
              </div>
            </div>

            <Link
              href="/owner/dashboard"
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-xs flex items-center justify-center transition-colors"
            >
              Return to Home Screen
            </Link>
          </div>
        )}
      </div>

      <OwnerBottomNav />
    </div>
  );
}
