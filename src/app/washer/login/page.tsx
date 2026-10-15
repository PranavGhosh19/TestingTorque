'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { sendPhoneOtp, formatPhoneE164 } from '@/lib/firebaseAuth';
import { checkIsWasherAuthenticated } from '@/lib/authGuards';
import { findWasherByPhoneInFirestore } from '@/lib/firebaseService';
import { WasherPartner } from '@/lib/types';

export default function DedicatedWasherLoginPage() {
  const router = useRouter();
  const { setRole, isHydrated, isLoggedIn, user, role, washers } = useStore();

  // If already authenticated as washer, go straight to washer dashboard
  useEffect(() => {
    if (checkIsWasherAuthenticated(isHydrated, isLoggedIn, user, role)) {
      router.replace('/washer/dashboard');
    }
  }, [isHydrated, isLoggedIn, user, role, router]);

  // Login form fields
  const [phone, setPhone] = useState('');
  const [existingWasher, setExistingWasher] = useState<WasherPartner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect whether phone is existing partner
  useEffect(() => {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      setExistingWasher(null);
      return;
    }

    let isMounted = true;

    const checkExistingWasher = async () => {
      // 1. Check local store washers first
      const localMatch = washers.find(
        (w) =>
          w.phone.replace(/\D/g, '').endsWith(cleanDigits) ||
          cleanDigits.endsWith(w.phone.replace(/\D/g, '').slice(-10))
      );

      if (localMatch) {
        if (isMounted) {
          setExistingWasher(localMatch);
        }
        return;
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('torque_washers');
        } catch {}
      }

      // 2. Query Firestore Washers collection
      try {
        const remoteMatch = await findWasherByPhoneInFirestore(cleanDigits);
        if (isMounted) {
          if (remoteMatch) {
            setExistingWasher(remoteMatch);
          } else {
            setExistingWasher(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setExistingWasher(null);
        }
      }
    };

    const timer = setTimeout(checkExistingWasher, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [phone, washers]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formatted = formatPhoneE164(phone);
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setRole('washer');

    try {
      await sendPhoneOtp(formatted, 'recaptcha-container');
      router.push(`/auth/verify?role=washer&phone=${encodeURIComponent(formatted)}`);
    } catch (err: any) {
      console.warn('Firebase SMS OTP notice:', err);
      // If SMS quota exceeded, region policy restricted, or in development mode,
      // navigate to verify page with test code support (123456)
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.code === 'auth/quota-exceeded' ||
        err?.code === 'auth/too-many-requests' ||
        err?.message?.includes('region enabled') ||
        err?.message?.includes('operation-not-allowed') ||
        err?.message?.includes('reCAPTCHA') ||
        process.env.NODE_ENV === 'development'
      ) {
        router.push(`/auth/verify?role=washer&phone=${encodeURIComponent(formatted)}`);
        return;
      }
      setError(err?.message || 'Failed to send verification SMS. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-emerald-500 selection:text-black relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-3xl">🧼</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Washer Partner Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Log In or Sign Up
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Enter your mobile number to view your assigned morning route, wash queue, and daily wash verification.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleContinue} className="space-y-5">
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                Mobile Number
              </label>
              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                <span className="text-xs font-mono font-bold text-slate-300 px-3 py-1.5 border-r border-white/10">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-wider font-mono"
                  autoFocus
                />
              </div>
            </div>

            {/* Existing Partner Recognition */}
            {existingWasher && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 truncate">
                  <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">
                    Welcome back
                  </span>
                  <span className="text-white font-bold truncate block">
                    {existingWasher.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Verified Partner
                </span>
              </div>
            )}

            {/* Invisible reCAPTCHA mount node */}
            <div id="recaptcha-container" className="flex justify-center" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Sending Verification Code...'
                  : existingWasher
                  ? `Continue as ${existingWasher.name}`
                  : 'Continue with OTP'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
