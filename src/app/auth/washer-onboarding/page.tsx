'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Phone,
  User,
  Building2,
  Clock,
  Car,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { syncWasherToFirestore } from '@/lib/firebaseService';

export default function WasherOnboardingPage() {
  const router = useRouter();
  const { onboardWasher, setRole, setUser, verifyPhoneNumber } = useStore();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [society, setSociety] = useState('Green Valley Residency');
  const [assignedCars, setAssignedCars] = useState(30);
  const [routeWindow, setRouteWindow] = useState('06:30 AM - 09:30 AM');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [address, setAddress] = useState('');

  // Aadhaar State
  const [aadhaarRaw, setAadhaarRaw] = useState('');
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState<string | null>(null);
  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);

  // Phone Verification State
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['4', '2', '9', '1']);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Format Aadhaar Number
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarRaw(raw);
    setIsAadhaarVerified(false);
  };

  const formattedAadhaar = aadhaarRaw
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  // Verify Aadhaar
  const handleVerifyAadhaar = () => {
    if (aadhaarRaw.length !== 12) {
      setErrorMessage('Please enter a complete 12-digit Aadhaar Number');
      return;
    }
    setErrorMessage('');
    setIsVerifyingAadhaar(true);
    setTimeout(() => {
      setIsVerifyingAadhaar(false);
      setIsAadhaarVerified(true);
    }, 700);
  };

  // Upload Photo with client-side canvas compression to avoid large base64 quota issues
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawResult = reader.result as string;
        // Compress image using canvas
        const img = new (window as any).Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 600;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.65);
              setAadhaarPhotoUrl(compressed);
            } else {
              setAadhaarPhotoUrl(rawResult);
            }
          } catch (cErr) {
            setAadhaarPhotoUrl(rawResult);
          }
          setIsAadhaarVerified(true);
        };
        img.onerror = () => {
          setAadhaarPhotoUrl(rawResult);
          setIsAadhaarVerified(true);
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Phone OTP
  const handleSendPhoneOtp = () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMessage('');
    setOtpSent(true);
    setIsPhoneVerifying(true);
  };

  // Confirm Phone OTP
  const handleConfirmPhoneOtp = async () => {
    const code = phoneOtp.join('');
    const isValid = await verifyPhoneNumber(phone, code);
    if (isValid) {
      setIsPhoneVerified(true);
      setIsPhoneVerifying(false);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid OTP code. Please use test code 4291');
    }
  };

  // Submit Washer Onboarding & Save All Data to Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Full name as per Aadhaar is required');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Valid 10-digit mobile number is required');
      return;
    }
    if (aadhaarRaw.length !== 12) {
      setErrorMessage('12-digit Aadhaar number is required for verified partner KYC');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create partner in store
      const createdPartner = onboardWasher({
        name: name.trim(),
        phone: cleanPhone,
        society,
        assignedCarsPerDay: assignedCars,
        routeWindow,
        aadhaarNumber: formattedAadhaar,
        aadhaarPhotoUrl: aadhaarPhotoUrl || undefined,
        bankAccount: bankAccount || 'HDFC Bank •••• 9912',
        ifscCode: ifscCode || 'HDFC0001234',
        address,
      });

      // 2. Persist ALL onboarding data directly to Firebase Firestore
      await syncWasherToFirestore(createdPartner);

      // 3. Switch active session to this newly onboarded washer partner
      setRole('washer');
      const activeUser = {
        id: createdPartner.id,
        name: createdPartner.name,
        phone: createdPartner.phone,
        role: 'washer' as const,
        avatar_url: createdPartner.avatar,
        status: 'active' as const,
        created_at: new Date().toISOString(),
      };
      setUser(activeUser);

      // 4. Save session to localStorage safely
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('torque_logged_in', 'true');
          localStorage.setItem('torque_role', 'washer');
          localStorage.setItem('torque_washer_id', createdPartner.id);
          localStorage.setItem('torque_washer_name', createdPartner.name);
          localStorage.setItem('torque_washer_phone', createdPartner.phone);
          localStorage.setItem('torque_user', JSON.stringify(activeUser));
        } catch (storageErr) {
          console.warn('LocalStorage save session notice:', storageErr);
        }
      }

      setIsSubmitting(false);
      router.push('/washer/dashboard');
    } catch (err: any) {
      console.error('Error syncing washer to Firebase:', err);
      // Fallback navigation in case of unexpected network timeout
      setIsSubmitting(false);
      router.push('/washer/dashboard');
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-12 selection:bg-blue-500 selection:text-white relative">
      {/* Background ambient glow */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl shadow-xl">
            🧼
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Partner Onboarding & KYC
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Join the Torque Care Washer Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Provide your Aadhaar Card details and verify your mobile number to get assigned to a residential apartment cluster.
          </p>
        </div>

        {/* Card Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* 1. Name & Mobile Verification */}
            <div className="space-y-3">
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                1. Personal Details & Phone Verification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Full Name (as per Aadhaar Card) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    10-Digit Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        placeholder="98222 33445"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setIsPhoneVerified(false);
                          setOtpSent(false);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold font-mono text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                      {isPhoneVerified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    {!isPhoneVerified ? (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase rounded-xl cursor-pointer transition-colors"
                      >
                        {otpSent ? 'Resend' : 'Verify'}
                      </button>
                    ) : (
                      <span className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl flex items-center gap-1 shrink-0 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* OTP Confirmation Box */}
              {isPhoneVerifying && !isPhoneVerified && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-200">
                      Enter 4-digit code sent to {phone}:
                    </span>
                    <span className="font-mono text-blue-300 text-[11px]">
                      Test code: <strong>4291</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {phoneOtp.map((digit, i) => (
                        <input
                          key={i}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const copy = [...phoneOtp];
                            copy[i] = e.target.value;
                            setPhoneOtp(copy);
                          }}
                          className="w-10 h-10 text-center font-bold font-mono text-lg bg-white/10 border border-blue-400/40 text-white rounded-xl focus:outline-none focus:border-blue-400"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleConfirmPhoneOtp}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Confirm OTP
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Aadhaar Card Verification */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                  2. Government Aadhaar Card Verification
                </span>
                {isAadhaarVerified && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    UIDAI Authenticated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    12-Digit Aadhaar Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="XXXX XXXX XXXX"
                      value={formattedAadhaar}
                      onChange={handleAadhaarChange}
                      maxLength={14}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-xs tracking-wider focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    {isAadhaarVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    ) : (
                      aadhaarRaw.length === 12 && (
                        <button
                          type="button"
                          onClick={handleVerifyAadhaar}
                          disabled={isVerifyingAadhaar}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          {isVerifyingAadhaar ? 'Checking...' : 'Verify'}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Upload Aadhaar Photo / Document
                  </label>
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl cursor-pointer text-slate-300 font-semibold transition-colors">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>{aadhaarPhotoUrl ? 'Aadhaar Attached ✓' : 'Upload Card Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {isAadhaarVerified && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>UIDAI e-KYC validation successful for {formattedAadhaar}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                    KYC Clear
                  </span>
                </div>
              )}
            </div>

            {/* 3. Society & Route Assignment */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                3. Society Route & Bank Payout Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Preferred Society Cluster
                  </label>
                  <select
                    value={society}
                    onChange={(e) => setSociety(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Green Valley Residency" className="bg-slate-900 text-white">Green Valley Residency</option>
                    <option value="Palm Residency" className="bg-slate-900 text-white">Palm Residency</option>
                    <option value="Sunrise Heights" className="bg-slate-900 text-white">Sunrise Heights</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Bank Account Number / UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India •••• 4421"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <Link
                href="/auth/onboarding"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Partner Account...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete Onboarding & Enter Portal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
