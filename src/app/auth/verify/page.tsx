'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowRight, Car, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  verifyPhoneOtp,
  sendPhoneOtp,
  syncAuthUserToFirestore,
  formatPhoneE164,
} from '@/lib/firebaseAuth';
import {
  recordUserLogin,
  recordAdminLoginToFirestore,
  findUserByPhoneInFirestore,
  findWasherByPhoneInFirestore,
  syncOwnerToFirestore,
} from '@/lib/firebaseService';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '+91 98765 43210';
  const roleParam = (searchParams.get('role') || 'owner') as 'owner' | 'washer' | 'admin';

  // Standard Firebase Phone SMS OTP is 6 digits
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setRole, setUser, washers, user, setIsLoggedIn } = useStore();

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single digit input with auto-advance
  const handleDigitChange = (index: number, value: string) => {
    // Handle paste of full OTP code
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      cleanDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(cleanDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanChar;
    setOtp(newOtp);

    if (error) setError('');

    // Advance to next input if digit entered
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');

    try {
      const formatted = formatPhoneE164(phone);
      await sendPhoneOtp(formatted, 'recaptcha-container');
      setResendCooldown(30);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err?.message || 'Failed to resend verification code. Please wait.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('').trim();
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the 6-digit verification code sent to your phone');
      return;
    }

    setLoading(true);

    try {
      // 1. Live Firebase Phone Auth OTP Verification
      // This signs the user into Firebase and yields their primary stable UID
      const firebaseUser = await verifyPhoneOtp(otpCode);
      const uid = firebaseUser.uid; // PRIMARY IDENTITY KEY
      const verifiedPhone = firebaseUser.phoneNumber || phone;

      if (roleParam === 'washer') {
        setRole('washer');
        const cleanPhone = verifiedPhone.replace(/\D/g, '');

        let matchedWasher = washers.find(
          (w) =>
            w.phone.replace(/\D/g, '').includes(cleanPhone) ||
            cleanPhone.includes(w.phone.replace(/\D/g, ''))
        );

        if (!matchedWasher) {
          matchedWasher = (await findWasherByPhoneInFirestore(cleanPhone)) || undefined;
        }

        const washerName = matchedWasher?.name || 'Verified Washer Partner';

        // 2. Primary Identity: Write to users/{uid}
        await syncAuthUserToFirestore(
          { uid, phoneNumber: verifiedPhone },
          {
            name: washerName,
            role: 'washer',
            status: 'active',
          }
        );

        // 3. Washer Domain Profile: Washers/{uid}
        const washerUser = {
          id: uid,
          uid: uid,
          name: washerName,
          phone: verifiedPhone,
          role: 'washer' as const,
          avatar_url: matchedWasher?.avatar || '/images/washer_amit.jpg',
          status: 'active' as const,
          created_at: new Date().toISOString(),
        };

        setUser(washerUser);
        setIsLoggedIn(true);

        if (typeof window !== 'undefined') {
          localStorage.setItem('torque_logged_in', 'true');
          localStorage.setItem('torque_user', JSON.stringify(washerUser));
          localStorage.setItem('torque_washer_id', uid);
          localStorage.setItem('torque_washer_name', washerName);
        }

        await recordUserLogin(washerUser, 'phone_otp');

        setTimeout(() => {
          router.push('/washer/dashboard');
        }, 300);
      } else if (roleParam === 'admin') {
        setRole('admin');

        // 2. Primary Identity: Write to users/{uid}
        await syncAuthUserToFirestore(
          { uid, phoneNumber: verifiedPhone },
          {
            name: 'Vikram Malhotra (Ops Lead)',
            role: 'admin',
            status: 'active',
          }
        );

        const adminUser = {
          id: uid,
          uid: uid,
          name: 'Vikram Malhotra (Ops Lead)',
          phone: verifiedPhone,
          role: 'admin' as const,
          status: 'active' as const,
          created_at: new Date().toISOString(),
        };

        setUser(adminUser);
        setIsLoggedIn(true);

        if (typeof window !== 'undefined') {
          localStorage.setItem('torque_logged_in', 'true');
          localStorage.setItem('torque_user', JSON.stringify(adminUser));
        }

        await recordAdminLoginToFirestore(adminUser, verifiedPhone);
        await recordUserLogin(adminUser, 'phone_otp');

        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 300);
      } else {
        // Owner Role
        setRole('owner');

        // Check if existing owner profile is registered under this phone
        const existingFirestoreUser = await findUserByPhoneInFirestore(verifiedPhone);
        const ownerName =
          existingFirestoreUser?.name ||
          (user?.name && user.name !== 'Unregistered Owner' && user.name !== 'Unregistered User'
            ? user.name
            : 'Verified Vehicle Owner');

        // 2. Primary Identity: Write to users/{uid}
        await syncAuthUserToFirestore(
          { uid, phoneNumber: verifiedPhone },
          {
            name: ownerName,
            role: 'owner',
            status: 'active',
          }
        );

        // 3. Car Owner Document: Car_Owners/{uid}
        const ownerUser = {
          id: uid,
          uid: uid,
          name: ownerName,
          owner_name: ownerName,
          phone: verifiedPhone,
          role: 'owner' as const,
          status: 'active' as const,
          created_at: existingFirestoreUser?.created_at || new Date().toISOString(),
          selected_plan: existingFirestoreUser?.selected_plan || 'HOME BASIC',
          assigned_washer_id: existingFirestoreUser?.assigned_washer_id || '',
          assigned_washer_name: existingFirestoreUser?.assigned_washer_name || '',
        };

        setUser(ownerUser);
        setIsLoggedIn(true);

        if (typeof window !== 'undefined') {
          localStorage.setItem('torque_logged_in', 'true');
          localStorage.setItem('torque_owner_name', ownerName);
          localStorage.setItem('torque_owner_id', uid);
          localStorage.setItem('torque_user', JSON.stringify(ownerUser));
        }

        await recordUserLogin(ownerUser, 'phone_otp');
        await syncOwnerToFirestore(ownerUser);

        setTimeout(() => {
          router.push('/owner/dashboard');
        }, 300);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      let errorMsg = err?.message || 'Invalid verification code. Please check and try again.';
      if (err?.code === 'auth/invalid-verification-code') {
        errorMsg = 'Incorrect verification code. Please verify the 6 digits.';
      } else if (err?.code === 'auth/code-expired') {
        errorMsg = 'The verification code has expired. Please request a new code.';
      } else if (err?.code === 'auth/session-expired') {
        errorMsg = 'Verification session expired. Please resend the code.';
      }
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-blue-500 selection:text-white relative">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Hidden reCAPTCHA container for resend requests */}
      <div id="recaptcha-container" className="hidden" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 text-white mx-auto flex items-center justify-center shadow-2xl">
            {roleParam === 'washer' ? (
              <span className="text-3xl">🧼</span>
            ) : roleParam === 'admin' ? (
              <span className="text-3xl">🛡️</span>
            ) : (
              <Car className="w-8 h-8 text-blue-400" />
            )}
          </div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              roleParam === 'washer'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : roleParam === 'admin'
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}
          >
            {roleParam === 'washer'
              ? 'Partner Phone Verification'
              : roleParam === 'admin'
              ? 'Operations Admin 2FA'
              : 'Owner Phone Verification'}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Verify One-Time Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto font-mono">
            Enter the 6-digit code sent to <span className="font-bold text-white">{phone}</span>
          </p>
        </div>

        {/* OTP Input Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-3 text-center">
                Firebase OTP Verification Code
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center font-mono font-black text-xl text-white bg-white/5 border border-white/15 rounded-2xl focus:outline-hidden focus:border-blue-400 focus:bg-white/10 shadow-inner transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Phone with Firebase...' : 'Verify & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>
                {resendCooldown > 0
                  ? `Resend Code (${resendCooldown}s)`
                  : 'Resend Verification SMS'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
