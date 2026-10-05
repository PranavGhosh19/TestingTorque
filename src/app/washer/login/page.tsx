'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  findWasherByEmailInFirestore,
  findWasherByPhoneInFirestore,
  verifyWasherPasswordInFirestore,
  setWasherPasswordInFirestore,
  fetchAllWashersFromFirestore,
  recordUserLogin,
} from '@/lib/firebaseService';
import { sendPhoneOtp, formatPhoneE164 } from '@/lib/firebaseAuth';
import { WasherPartner } from '@/lib/washerPartners';

export default function DedicatedWasherLoginPage() {
  const router = useRouter();
  const { setRole, washers, setUser, setIsLoggedIn, setWasherPassword } = useStore();

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'login' | 'set_password'>('login');

  // Login form fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // First-time password creation fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Flow State
  const [matchedWasher, setMatchedWasher] = useState<WasherPartner | null>(null);
  const [phoneOtpMode, setPhoneOtpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // -------------------------------------------------------------
  // 1. Email ID Login & First-Time Detection
  // -------------------------------------------------------------
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid registered Email ID.');
      return;
    }

    setLoading(true);

    try {
      // Look up washer in Firestore by Email
      let washer = await findWasherByEmailInFirestore(cleanEmail);

      // Fallback 1: check local store
      if (!washer) {
        washer = washers.find((w) => (w.email || '').toLowerCase().trim() === cleanEmail) || null;
      }

      // Fallback 2: fetch all washers directly from Firestore
      if (!washer) {
        try {
          const allWashers = await fetchAllWashersFromFirestore();
          washer = allWashers.find((w) => (w.email || '').toLowerCase().trim() === cleanEmail) || null;
        } catch (e) {
          // ignore
        }
      }

      if (!washer) {
        setError('No washer partner registered with this email address. Please contact your Society Area Manager.');
        setLoading(false);
        return;
      }

      // 1. First-Time Detection:
      // When the Washer logs in for the first time using the email created by the Admin,
      // detect that this is their first login and redirect them to a "Set Password" page instead of the Washer Dashboard.
      const isFirstLogin = washer.passwordSet !== true;

      if (isFirstLogin) {
        setLoading(false);
        router.push(`/washer/set-password?email=${encodeURIComponent(cleanEmail)}`);
        return;
      }

      // 2. Subsequent Logins:
      // Washer enters email + password. Authenticate normally through Firebase Authentication.
      if (!password) {
        setError('Please enter your password to sign in.');
        setLoading(false);
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const authUid = userCredential?.user?.uid || washer.id;
        await completeWasherLogin(washer, cleanEmail, authUid);
      } catch (authErr: any) {
        console.error('Washer Firebase Auth login error:', authErr);
        if (
          authErr.code === 'auth/wrong-password' ||
          authErr.code === 'auth/invalid-credential'
        ) {
          setError('Incorrect password. Please verify your credentials or contact your Society Area Manager.');
          setLoading(false);
          return;
        } else if (authErr.code === 'auth/user-not-found') {
          // If no Firebase Auth record exists yet, route to set password
          router.push(`/washer/set-password?email=${encodeURIComponent(cleanEmail)}`);
          return;
        } else {
          // Fallback verify in case of network issue
          const storedPassword = (washer as any).password;
          if (storedPassword && storedPassword === password) {
            await completeWasherLogin(washer, cleanEmail, washer.id);
            return;
          }
          setError(authErr?.message || 'Authentication failed. Please verify your password.');
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error('Washer email login error:', err);
      setError(err?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. First-Time Password Setup & Login
  // -------------------------------------------------------------
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const washerId = matchedWasher?.id || 'wsh_partner';
      const washerEmail = matchedWasher?.email || email;
      const washerPhone = matchedWasher?.phone || phone || '+91 98000 00000';
      const washerName = matchedWasher?.name || 'Verified Washer Partner';

      // 1. Save password to Firestore Washers collection
      await setWasherPasswordInFirestore(washerId, newPassword);
      if (washerEmail) {
        await setWasherPasswordInFirestore(washerEmail, newPassword);
      }
      if (washerPhone) {
        await setWasherPasswordInFirestore(washerPhone, newPassword);
      }

      // 2. Update local state in store
      setWasherPassword(washerId, newPassword);

      // 3. Set active user session
      const washerUser = {
        id: washerId,
        uid: washerId,
        name: washerName,
        phone: washerPhone,
        email: washerEmail,
        role: 'washer' as const,
        avatar_url: matchedWasher?.avatar || '/images/washer_amit.jpg',
        status: 'active' as const,
        hasPassword: true,
        created_at: matchedWasher?.created_at || new Date().toISOString(),
      };

      setUser(washerUser);
      setRole('washer');
      setIsLoggedIn(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_user', JSON.stringify(washerUser));
        localStorage.setItem('torque_washer_id', washerId);
        localStorage.setItem('torque_washer_name', washerName);
        localStorage.setItem('torque_washer_has_password', 'true');
      }

      await recordUserLogin(washerUser, 'washer_first_time_password_set');

      setTimeout(() => {
        router.push('/washer/dashboard');
      }, 350);
    } catch (err: any) {
      console.error('Save password error:', err);
      setError(err?.message || 'Failed to save password. Please try again.');
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. Phone Number Login Option (Fallback)
  // -------------------------------------------------------------
  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const formatted = formatPhoneE164(phone);
    const cleanDigits = formatted.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const washer = await findWasherByPhoneInFirestore(formatted);
      if (!washer) {
        setError('No washer partner found with this phone number. Please check or contact your Area Manager.');
        setLoading(false);
        return;
      }

      const hasPassword = Boolean((washer as any).password || (washer as any).hasPassword);

      if (!hasPassword) {
        setMatchedWasher(washer);
        setStep('set_password');
        setInfoMessage(`Welcome ${washer.name}! As this is your first time logging in, please create a password for yourself.`);
        setLoading(false);
        return;
      }

      if (!password) {
        setError('Please enter your partner password.');
        setLoading(false);
        return;
      }

      if ((washer as any).password !== password) {
        setError('Incorrect password. Please verify your credentials.');
        setLoading(false);
        return;
      }

      await completeWasherLogin(washer, formatted);
    } catch (err: any) {
      console.error('Phone login error:', err);
      setError(err?.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePhoneOtpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const formatted = formatPhoneE164(phone);
    const cleanDigits = formatted.replace(/\D/g, '');
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
      console.error('SMS OTP error:', err);
      setError(err?.message || 'Failed to send verification SMS.');
      setLoading(false);
    }
  };

  const completeWasherLogin = async (
    washer: WasherPartner,
    identifier: string,
    firebaseUid?: string
  ) => {
    setRole('washer');
    const washerUser = {
      id: washer.id,
      uid: firebaseUid || washer.firebaseUid || washer.id,
      name: washer.name || 'Verified Washer Partner',
      phone: washer.phone || identifier,
      email: washer.email,
      role: 'washer' as const,
      avatar_url: washer.avatar || '/images/washer_amit.jpg',
      status: 'active' as const,
      hasPassword: true,
      passwordSet: true,
      created_at: washer.created_at || new Date().toISOString(),
    };

    setUser(washerUser);
    setIsLoggedIn(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('torque_logged_in', 'true');
      localStorage.setItem('torque_user', JSON.stringify(washerUser));
      localStorage.setItem('torque_washer_id', washer.id);
      localStorage.setItem('torque_washer_name', washerUser.name);
      localStorage.setItem('torque_washer_has_password', 'true');
      localStorage.setItem('torque_washer_password_set', 'true');
    }

    await recordUserLogin(washerUser, 'washer_login');

    setTimeout(() => {
      router.push('/washer/dashboard');
    }, 300);
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
            {step === 'set_password' ? (
              <KeyRound className="w-8 h-8 text-emerald-400" />
            ) : (
              <span className="text-3xl">🧼</span>
            )}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {step === 'set_password' ? 'First-Time Setup' : 'Dedicated Partner Portal'}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {step === 'set_password' ? 'Create Your Password' : 'Washer Partner Login'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            {step === 'set_password' ? (
              <span>
                Welcome, <strong className="text-white">{matchedWasher?.name}</strong>! As this is your first time logging in, please create a password for yourself.
              </span>
            ) : (
              'Sign in with your registered partner credentials to view your assigned route, mark washes, and monitor earnings.'
            )}
          </p>
        </div>

        {/* Login Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {/* STEP 2: First-Time Password Setup */}
          {step === 'set_password' ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs leading-relaxed font-semibold">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white mb-0.5">First-Time Setup for {matchedWasher?.name}</div>
                  <div className="text-[11px] text-emerald-300">
                    Account: <span className="font-mono font-bold text-white">{matchedWasher?.email || matchedWasher?.phone}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                    Create New Password
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
                      placeholder="Confirm your password"
                      className="w-full bg-transparent text-sm font-semibold text-white focus:outline-hidden tracking-wider"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Always Remember This Password</span>
                  </div>
                  <p>
                    You will use this password to sign into the washer portal whenever you log in with your email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Saving & Logging In...' : 'Save Password & Enter Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setError('');
                      setInfoMessage('');
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 1: Standard Login Form */
            <div className="space-y-6">
              {/* Method Switcher Tabs */}
              <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('email');
                    setError('');
                    setInfoMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    method === 'email'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email ID Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('phone');
                    setError('');
                    setInfoMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    method === 'phone'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Number</span>
                </button>
              </div>

              {infoMessage && (
                <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs leading-relaxed font-semibold">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {method === 'email' ? (
                /* Method 1: Email ID Login */
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                      Registered Partner Email ID
                    </label>
                    <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                      <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                          if (infoMessage) setInfoMessage('');
                        }}
                        placeholder="e.g. partner@torquecare.com"
                        className="w-full bg-transparent text-sm font-semibold text-white focus:outline-hidden tracking-wider"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                        Password
                      </label>
                      <Link
                        href={`/washer/set-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        First-time? Set Password →
                      </Link>
                    </div>
                    <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                      <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Enter password (if already set)"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying Account...' : 'Continue to Washer Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>First-Time Washer Login</span>
                      </div>
                      <Link
                        href={`/washer/set-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                        className="text-emerald-400 hover:underline font-bold text-[10px]"
                      >
                        Create Password →
                      </Link>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      If your supervisor onboarded you, enter your registered email address and click <strong>Continue</strong>. You will be automatically redirected to set your password.
                    </p>
                  </div>
                </form>
              ) : (
                /* Method 2: Phone Number Login */
                <form
                  onSubmit={phoneOtpMode ? handlePhoneOtpSend : handlePhonePasswordLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                      Registered Mobile Number
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
                      />
                    </div>
                  </div>

                  {!phoneOtpMode && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                          Partner Password
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (First-time? Leave blank & click Sign In)
                        </span>
                      </div>
                      <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                        <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError('');
                          }}
                          placeholder="Enter your password"
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
                  )}

                  {/* Invisible reCAPTCHA mount node for OTP mode */}
                  <div id="recaptcha-container" className="flex justify-center" />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {loading
                        ? 'Verifying...'
                        : phoneOtpMode
                        ? 'Send Verification SMS'
                        : 'Sign In with Phone'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setPhoneOtpMode(!phoneOtpMode)}
                      className="text-xs text-slate-400 hover:text-emerald-300 font-semibold transition-colors"
                    >
                      {phoneOtpMode ? '← Sign in with Password instead' : 'Or verify with Phone SMS OTP →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Admin Onboarding Info */}
          <div className="pt-4 border-t border-white/10 text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Partner Network</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Washer partners are onboarded directly by Area Managers with official Email ID & Aadhaar e-KYC.
            </p>
            <p className="text-[10px] text-slate-500">
              Contact your society operations supervisor for route activation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
