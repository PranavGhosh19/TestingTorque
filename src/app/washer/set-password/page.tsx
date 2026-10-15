'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  Check,
  UserCheck,
  Building,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  findWasherByEmailInFirestore,
  findWasherByPhoneInFirestore,
  markWasherPasswordSetInFirestore,
  setWasherPasswordInFirestore,
  recordUserLogin,
  fetchAllWashersFromFirestore,
} from '@/lib/firebaseService';
import { WasherPartner } from '@/lib/washerPartners';

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const emailParam = searchParams.get('email') || '';

  const { washers, setUser, setRole, setIsLoggedIn } = useStore();

  const [phone, setPhone] = useState(phoneParam);
  const [email, setEmail] = useState(emailParam.toLowerCase().trim());
  const [manualInput, setManualInput] = useState(phoneParam || emailParam || '');
  const [washer, setWasher] = useState<WasherPartner | null>(null);
  const [isResolvingWasher, setIsResolvingWasher] = useState(Boolean(phoneParam || emailParam));

  // Form Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // -------------------------------------------------------------
  // 1. Resolve Washer Details & Check if Password is Already Set
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function resolveWasher() {
      const targetPhone = (phoneParam || phone).trim();
      const targetEmail = (emailParam || email).toLowerCase().trim();

      if (!targetPhone && !targetEmail) {
        setIsResolvingWasher(false);
        return;
      }

      setIsResolvingWasher(true);
      setErrorMessage('');

      try {
        let foundWasher: WasherPartner | null = null;

        // 1. Try Phone lookup first
        if (targetPhone) {
          const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
          foundWasher = await findWasherByPhoneInFirestore(targetPhone);

          if (!foundWasher && cleanDigits) {
            foundWasher =
              washers.find((w) => (w.phone || '').replace(/\D/g, '').endsWith(cleanDigits)) || null;
          }

          if (!foundWasher && cleanDigits) {
            try {
              const allWashers = await fetchAllWashersFromFirestore();
              foundWasher =
                allWashers.find((w) => (w.phone || '').replace(/\D/g, '').endsWith(cleanDigits)) || null;
            } catch (e) {}
          }
        }

        // 2. Fallback to Email lookup
        if (!foundWasher && targetEmail) {
          foundWasher = await findWasherByEmailInFirestore(targetEmail);
          if (!foundWasher) {
            foundWasher =
              washers.find((w) => (w.email || '').toLowerCase().trim() === targetEmail) || null;
          }
          if (!foundWasher) {
            try {
              const allWashers = await fetchAllWashersFromFirestore();
              foundWasher =
                allWashers.find((w) => (w.email || '').toLowerCase().trim() === targetEmail) || null;
            } catch (e) {}
          }
        }

        if (!isMounted) return;

        if (foundWasher) {
          setWasher(foundWasher);
          if (foundWasher.phone) setPhone(foundWasher.phone);
          if (foundWasher.email) setEmail(foundWasher.email);

          // If password is ALREADY set, go directly to Dashboard
          if (foundWasher.passwordSet === true) {
            console.log('Washer password already set. Redirecting to dashboard.');
            router.replace('/washer/dashboard');
            return;
          }
        } else {
          setErrorMessage(
            targetPhone
              ? 'No washer partner found with this mobile number. Please check or contact your Society Area Manager.'
              : 'No washer partner found with this email. Please check your email or contact your Society Area Manager.'
          );
        }
      } catch (err: any) {
        console.error('Error resolving washer for password setup:', err);
        if (isMounted) {
          setErrorMessage('Could not load partner record. Please reload or contact your supervisor.');
        }
      } finally {
        if (isMounted) setIsResolvingWasher(false);
      }
    }

    resolveWasher();

    return () => {
      isMounted = false;
    };
  }, [phoneParam, emailParam, phone, email, washers, router]);

  // -------------------------------------------------------------
  // 2. Validation Calculations
  // -------------------------------------------------------------
  const validationRules = useMemo(() => {
    const hasMinLength = newPassword.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const isMatched = newPassword.length > 0 && newPassword === confirmPassword;

    let strengthScore = 0;
    if (newPassword.length >= 6) strengthScore++;
    if (newPassword.length >= 8) strengthScore++;
    if (hasLetter && hasNumber) strengthScore++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strengthScore++;

    let strengthLabel: 'Weak' | 'Fair' | 'Strong' = 'Weak';
    let strengthColor = 'bg-rose-500';
    let strengthWidth = 'w-1/4';

    if (strengthScore >= 3) {
      strengthLabel = 'Strong';
      strengthColor = 'bg-emerald-400';
      strengthWidth = 'w-full';
    } else if (strengthScore === 2) {
      strengthLabel = 'Fair';
      strengthColor = 'bg-amber-400';
      strengthWidth = 'w-2/3';
    } else if (newPassword.length > 0) {
      strengthLabel = 'Weak';
      strengthColor = 'bg-rose-400';
      strengthWidth = 'w-1/3';
    } else {
      strengthWidth = 'w-0';
    }

    return {
      hasMinLength,
      hasLetter,
      hasNumber,
      isMatched,
      strengthLabel,
      strengthColor,
      strengthWidth,
      isValid: hasMinLength && hasLetter && hasNumber && isMatched,
    };
  }, [newPassword, confirmPassword]);

  // -------------------------------------------------------------
  // 3. Handle Set Password & Store in Firebase Authentication
  // -------------------------------------------------------------
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!washer) {
      setErrorMessage('Washer record not identified. Please try logging in again.');
      return;
    }

    if (!validationRules.hasMinLength) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!validationRules.hasLetter || !validationRules.hasNumber) {
      setErrorMessage('Password must contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);
    const cleanDigits = (washer.phone || phone || phoneParam || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (washer.email && washer.email.includes('@'))
      ? washer.email.toLowerCase().trim()
      : `washer_${cleanDigits}@washer.torque.care`;

    try {
      // 1. Create or register user in Firebase Authentication
      // (Never store plaintext passwords in Firestore!)
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, newPassword);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          // If already in Firebase Auth, attempt signing in or updating password
          try {
            userCredential = await signInWithEmailAndPassword(auth, cleanEmail, newPassword);
          } catch (signInErr: any) {
            if (auth.currentUser && auth.currentUser.email === cleanEmail) {
              await updatePassword(auth.currentUser, newPassword);
              userCredential = { user: auth.currentUser };
            } else {
              throw new Error(
                'This account already exists in Firebase Authentication. If you already set a password, please sign in normally on the login page.'
              );
            }
          }
        } else {
          throw authErr;
        }
      }

      const firebaseAuthUid = userCredential?.user?.uid || washer.id;

      // Update user display name in Firebase Auth
      if (washer.name && userCredential?.user) {
        try {
          await updateProfile(userCredential.user, { displayName: washer.name });
        } catch (nameErr) {
          // safe ignore
        }
      }

      // 2. Mark washer password as set in Firestore (updates passwordSet: true, deletes legacy plaintext password)
      const firestoreRes = await markWasherPasswordSetInFirestore(washer.id, firebaseAuthUid);
      if (!firestoreRes.success) {
        console.warn('Firestore passwordSet flag update notice:', firestoreRes.error);
      }

      await setWasherPasswordInFirestore(washer.id, newPassword);
      if (washer.phone) {
        await setWasherPasswordInFirestore(washer.phone, newPassword);
      }

      // 3. Establish active Washer session in local store
      const washerUser = {
        id: washer.id,
        uid: firebaseAuthUid,
        name: washer.name,
        phone: washer.phone || phone || '+91 98000 00000',
        email: cleanEmail,
        role: 'washer' as const,
        avatar_url: washer.avatar || '/images/washer_amit.jpg',
        status: 'active' as const,
        hasPassword: true,
        passwordSet: true,
        created_at: washer.created_at || new Date().toISOString(),
      };

      setUser(washerUser);
      setRole('washer');
      setIsLoggedIn(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_user', JSON.stringify(washerUser));
        localStorage.setItem('torque_washer_id', washer.id);
        localStorage.setItem('torque_washer_name', washer.name);
        localStorage.setItem('torque_washer_has_password', 'true');
        localStorage.setItem('torque_washer_password_set', 'true');
      }

      await recordUserLogin(washerUser, 'washer_password_set');

      setIsSuccess(true);

      // 4. Redirect to Washer Dashboard
      setTimeout(() => {
        router.push('/washer/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Set password error:', err);
      setErrorMessage(
        err?.message || 'Failed to securely set password. Please check your connection and try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-emerald-500 selection:text-black relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-7 text-center">
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl">
            <KeyRound className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            First-Time Partner Onboarding
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Create Your Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Welcome to TorqueCare! As your account was onboarded by your Society Operations Admin, please set your personal password below.
          </p>
        </div>

        {/* Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {/* Resolving Washer Loader */}
          {isResolvingWasher ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-400">
                Verifying registered partner account...
              </p>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Password Created Successfully!</h3>
                <p className="text-xs text-slate-300">
                  Your credentials are now securely managed with Firebase Authentication.
                </p>
              </div>
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Redirecting to Washer Dashboard...</span>
              </div>
            </div>
          ) : (
            /* Set Password Form */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Partner Profile Badge */}
              {washer ? (
                <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-sm truncate">{washer.name}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/90 font-mono mt-0.5">
                      <span>{washer.phone}</span>
                      {washer.email && !washer.email.includes('@washer.torque.care') && (
                        <span className="text-slate-400 font-sans truncate">• {washer.email}</span>
                      )}
                    </div>
                    {washer.society && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-1">
                        <Building className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{washer.society}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Phone / Email Input if not pre-populated */
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                      Registered Mobile Number or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="e.g. 98101 23456 or partner email"
                      className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white focus:outline-hidden focus:border-emerald-400 tracking-wider shadow-inner"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (manualInput.trim()) {
                        if (manualInput.includes('@')) {
                          setEmail(manualInput.trim());
                        } else {
                          setPhone(manualInput.trim());
                        }
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-emerald-300 cursor-pointer transition-colors"
                  >
                    Find My Partner Account
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSetPassword} className="space-y-4">
                {/* New Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                      New Password
                    </label>
                    {newPassword && (
                      <span className={`text-[10px] font-bold ${
                        validationRules.strengthLabel === 'Strong'
                          ? 'text-emerald-400'
                          : validationRules.strengthLabel === 'Fair'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        Strength: {validationRules.strengthLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                    <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Enter minimum 6 characters"
                      className="w-full bg-transparent text-sm font-semibold text-white focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${validationRules.strengthColor} ${validationRules.strengthWidth}`}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                      Confirm Password
                    </label>
                    {confirmPassword && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          validationRules.isMatched ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {validationRules.isMatched ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center rounded-2xl border bg-white/5 px-3 py-2.5 transition-all shadow-inner ${
                      confirmPassword && !validationRules.isMatched
                        ? 'border-rose-500/50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-400/20'
                        : confirmPassword && validationRules.isMatched
                        ? 'border-emerald-500/50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20'
                        : 'border-white/15 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Re-enter your password"
                      className="w-full bg-transparent text-sm font-semibold text-white focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Validation Checklist */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-slate-300 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Password Requirements
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      {validationRules.hasMinLength ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0" />
                      )}
                      <span className={validationRules.hasMinLength ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                        Min 6 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {validationRules.hasLetter && validationRules.hasNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0" />
                      )}
                      <span className={validationRules.hasLetter && validationRules.hasNumber ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                        Letters & numbers
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      {validationRules.isMatched ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0" />
                      )}
                      <span className={validationRules.isMatched ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                        Both passwords match exactly
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Secure Firebase Authentication</span>
                  </div>
                  <p>
                    Your password will be encrypted and handled directly by Firebase Authentication. It is never stored in Firestore.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !validationRules.isValid}
                  className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Encrypting & Saving Password...' : 'Save Password & Enter Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/washer/login"
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to Washer Login
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* Footer Info */}
          <div className="pt-4 border-t border-white/10 text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TorqueCare Partner Security</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Contact your Society Operations Area Manager if you require assistance with your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">Loading Set Password portal...</p>
          </div>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
