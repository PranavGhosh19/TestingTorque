'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ArrowRight,
  Car,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
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
  setWasherPasswordInFirestore,
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

  // First-time washer password setup state
  const [step, setStep] = useState<'otp' | 'set_password'>('otp');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingWasher, setPendingWasher] = useState<{
    id: string;
    uid: string;
    name: string;
    phone: string;
    avatar: string;
  } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setRole, setUser, washers, user, setIsLoggedIn, setWasherPassword } = useStore();

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
        const washerId = matchedWasher?.id || uid;

        // Check if washer already has a password set!
        const hasExistingPassword = Boolean(
          (matchedWasher as any)?.password ||
          (matchedWasher as any)?.hasPassword ||
          (matchedWasher as any)?.has_password
        );

        // If this is the washer's first time (or no password set), ask them to set a password!
        if (!hasExistingPassword) {
          setPendingWasher({
            id: washerId,
            uid,
            name: washerName,
            phone: verifiedPhone,
            avatar: matchedWasher?.avatar || '/images/washer_amit.jpg',
          });
          setStep('set_password');
          setLoading(false);
          return;
        }

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
          id: washerId,
          uid: uid,
          name: washerName,
          phone: verifiedPhone,
          role: 'washer' as const,
          avatar_url: matchedWasher?.avatar || '/images/washer_amit.jpg',
          status: 'active' as const,
          hasPassword: true,
          created_at: new Date().toISOString(),
        };

        setUser(washerUser);
        setIsLoggedIn(true);

        if (typeof window !== 'undefined') {
          localStorage.setItem('torque_logged_in', 'true');
          localStorage.setItem('torque_user', JSON.stringify(washerUser));
          localStorage.setItem('torque_washer_id', washerId);
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

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('Please choose a password of at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const washerId = pendingWasher?.id || 'wsh_partner';
      const washerUid = pendingWasher?.uid || washerId;
      const washerPhone = pendingWasher?.phone || phone;
      const washerName = pendingWasher?.name || 'Verified Washer Partner';
      const washerAvatar = pendingWasher?.avatar || '/images/washer_amit.jpg';

      // 1. Save password to Firestore Washers collection
      await setWasherPasswordInFirestore(washerId, newPassword);
      await setWasherPasswordInFirestore(washerPhone, newPassword);

      // 2. Update local state in store
      setWasherPassword(washerId, newPassword);

      // 3. Sync primary identity in users/{uid}
      await syncAuthUserToFirestore(
        { uid: washerUid, phoneNumber: washerPhone },
        {
          name: washerName,
          role: 'washer',
          status: 'active',
        }
      );

      // 4. Set active user session
      const washerUser = {
        id: washerId,
        uid: washerUid,
        name: washerName,
        phone: washerPhone,
        role: 'washer' as const,
        avatar_url: washerAvatar,
        status: 'active' as const,
        hasPassword: true,
        created_at: new Date().toISOString(),
      };

      setUser(washerUser);
      setIsLoggedIn(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_user', JSON.stringify(washerUser));
        localStorage.setItem('torque_washer_id', washerId);
        localStorage.setItem('torque_washer_name', washerName);
        localStorage.setItem('torque_washer_has_password', 'true');
      }

      await recordUserLogin(washerUser, 'first_time_password_set');

      setTimeout(() => {
        router.push('/washer/dashboard');
      }, 400);
    } catch (err: any) {
      console.error('Save password error:', err);
      setError(err?.message || 'Failed to save password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-blue-500 selection:text-white relative">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div
        className={`fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none -z-10 ${
          roleParam === 'washer' ? 'bg-emerald-600/10' : 'bg-blue-600/10'
        }`}
      />

      {/* Hidden reCAPTCHA container for resend requests */}
      <div id="recaptcha-container" className="hidden" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon */}
        <div className="space-y-3">
          <div
            className={`w-16 h-16 rounded-2xl border text-white mx-auto flex items-center justify-center shadow-2xl ${
              step === 'set_password'
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                : 'bg-white/10 border-white/15'
            }`}
          >
            {step === 'set_password' ? (
              <KeyRound className="w-8 h-8 text-emerald-400" />
            ) : roleParam === 'washer' ? (
              <span className="text-3xl">🧼</span>
            ) : roleParam === 'admin' ? (
              <span className="text-3xl">🛡️</span>
            ) : (
              <Car className="w-8 h-8 text-blue-400" />
            )}
          </div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              step === 'set_password'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : roleParam === 'washer'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : roleParam === 'admin'
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}
          >
            {step === 'set_password'
              ? 'First-Time Partner Setup'
              : roleParam === 'washer'
              ? 'Partner Phone Verification'
              : roleParam === 'admin'
              ? 'Operations Admin 2FA'
              : 'Owner Phone Verification'}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {step === 'set_password' ? 'Create Your Password' : 'Verify One-Time Password'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto">
            {step === 'set_password' ? (
              <span>
                Welcome, <strong className="text-white">{pendingWasher?.name}</strong>! Set a secret password for your mobile number to log in easily anytime.
              </span>
            ) : (
              <span className="font-mono">
                Enter the 6-digit code sent to <span className="font-bold text-white">{phone}</span>
              </span>
            )}
          </p>
        </div>

        {/* Dynamic Card: Password Setup vs OTP Input */}
        {step === 'set_password' ? (
          <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen animate-in fade-in zoom-in-95 duration-200">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                  Create Secret Password
                </label>
                <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter at least 4 characters"
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-hidden tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                  Confirm Password
                </label>
                <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-hidden tracking-wider"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>One-Time Setup</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Next time you open <span className="text-emerald-300 font-semibold">/washer/login</span>, you can simply type your mobile number and this password to sign in immediately without waiting for SMS codes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Saving & Signing In...' : 'Save Password & Enter Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* OTP Input Card */
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
        )}
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
