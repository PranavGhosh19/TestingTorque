'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  Check,
  Lock,
  ArrowRight,
  LogOut,
  Sparkles,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  saveAreaManagerToFirestore,
  fetchAreaManagerFromFirestore,
  fetchAreaManagerByEmail,
  recordUserLogin,
} from '@/lib/firebaseService';

const extract10Digits = (phoneStr?: string) => {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length >= 12) {
    return digits.slice(2, 12);
  }
  return digits.slice(-10);
};

export default function AdminProfileCreationPage() {
  const router = useRouter();
  const { user, setUser, setRole, logout } = useStore();

  const [fullName, setFullName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [aadhaarRaw, setAadhaarRaw] = useState('');
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState<string | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState<string>('');
  const role = 'Area Manager';

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminUid, setAdminUid] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');

  // 12-digit Aadhaar formatted as XXXX XXXX XXXX
  const formattedAadhaar = aadhaarRaw
    .replace(/\D/g, '')
    .slice(0, 12)
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  // Load existing admin details from Firebase Firestore or Auth on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAdminUid(firebaseUser.uid);
        if (firebaseUser.email) setAdminEmail(firebaseUser.email);
      }
    });

    const loadProfile = async () => {
      setLoading(true);
      try {
        const currentAuthUser = auth.currentUser;
        const storedUid =
          typeof window !== 'undefined'
            ? localStorage.getItem('torque_admin_uid') || localStorage.getItem('torque_owner_id')
            : null;
        const storedEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('torque_admin_email')
            : null;

        const effectiveUid = currentAuthUser?.uid || storedUid || user?.uid || user?.id || '';
        const effectiveEmail = currentAuthUser?.email || storedEmail || '';
        if (effectiveUid) setAdminUid(effectiveUid);
        if (effectiveEmail) setAdminEmail(effectiveEmail);

        // Fetch existing record if available
        let existingData = await fetchAreaManagerFromFirestore(effectiveUid);
        if (!existingData && effectiveEmail) {
          existingData = await fetchAreaManagerByEmail(effectiveEmail);
        }

        if (existingData) {
          if (existingData.fullName) setFullName(existingData.fullName);
          if (existingData.phoneNumber) {
            setPhoneDigits(extract10Digits(existingData.phoneNumber));
          }
          if (existingData.aadhaarNumber) {
            setAadhaarRaw(existingData.aadhaarNumber.replace(/\D/g, ''));
          }
          if (existingData.aadhaarPhotoUrl) {
            setAadhaarPhotoUrl(existingData.aadhaarPhotoUrl);
            setAadhaarFileName('aadhaar_card_verified.jpg');
          }
        } else if (effectiveEmail) {
          // Pre-populate sensible defaults from admin email prefix
          const emailPrefix = effectiveEmail.split('@')[0];
          const capitalized =
            emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          setFullName(user?.name && !user.name.includes('Unregistered') ? user.name : `${capitalized} Malhotra`);
        }
      } catch (err) {
        console.warn('Error loading admin profile from Firebase:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    return () => unsubscribe();
  }, [user?.id, user?.uid, user?.name]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly numeric, exactly 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digitsOnly);
    if (errorMsg) setErrorMsg('');
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly numeric, exactly 12 digits
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarRaw(raw);
    if (errorMsg) setErrorMsg('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      setAadhaarFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadhaarPhotoUrl(reader.result as string);
        if (errorMsg) setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    if (phoneDigits.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit phone number without spaces.');
      return;
    }

    if (aadhaarRaw.length !== 12) {
      setErrorMsg('Please enter a complete 12-digit Aadhaar number.');
      return;
    }

    setIsSaving(true);

    try {
      const currentAuthUid = auth.currentUser?.uid;
      const effectiveId =
        currentAuthUid ||
        adminUid ||
        (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null) ||
        user?.uid ||
        user?.id;

      if (!effectiveId) {
        setErrorMsg('Authentication session not found. Please log in again.');
        setIsSaving(false);
        return;
      }

      const fullPhone = `+91${phoneDigits}`;
      const effectiveEmail = adminEmail || auth.currentUser?.email || undefined;

      // 1. Save data directly in Firebase Firestore 'area_managers' collection
      const result = await saveAreaManagerToFirestore({
        id: effectiveId,
        fullName: fullName.trim(),
        phoneNumber: fullPhone,
        aadhaarNumber: aadhaarRaw,
        aadhaarPhotoUrl: aadhaarPhotoUrl,
        role: 'Area Manager',
        email: effectiveEmail,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile in Firebase');
      }

      // 2. Update active user and store
      const updatedAdminUser = {
        id: effectiveId,
        uid: effectiveId,
        name: fullName.trim(),
        phone: fullPhone,
        email: effectiveEmail,
        role: 'admin' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
      };

      setRole('admin');
      setUser(updatedAdminUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_admin_uid', effectiveId);
        localStorage.setItem('torque_owner_name', fullName.trim());
        localStorage.setItem('torque_admin_name', fullName.trim());
        localStorage.setItem('torque_user', JSON.stringify(updatedAdminUser));
      }

      await recordUserLogin(updatedAdminUser, 'admin_profile_setup').catch(console.warn);

      setSuccessMsg('Profile verified & saved successfully! Entering console...');

      // Redirect into Admin Console Dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 700);
    } catch (err: any) {
      console.error('Error saving admin profile to Firebase:', err);
      setErrorMsg(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_admin_uid');
      localStorage.removeItem('torque_admin_email');
      localStorage.removeItem('torque_logged_in');
    }
    router.push('/admin/login');
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#060913] text-slate-100 flex items-center justify-center px-4 py-12 selection:bg-amber-500 selection:text-black relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[#060913] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-amber-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-[#2DD4A0]/10 rounded-full blur-[170px] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>OPERATIONS CREDENTIALS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-automotive-title">
            Area Manager Profile Creation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Register your official identity proofs. Your profile will be securely saved into Firebase to grant console permissions.
          </p>
        </div>

        {/* Profile Creation Card */}
        <div className="p-7 sm:p-10 rounded-[28px] bg-[#11161D]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl relative space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-semibold animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Loading profile credentials from Firebase...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitProfile} className="space-y-6">
              {/* 1. Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center rounded-2xl border border-white/[0.1] bg-[#0A0D14] px-4 py-3 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. Shubham Malhotra"
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-hidden placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* 2. Phone Number (Fixed +91, exactly 10 digits) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    Phone Number <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">10 digits without spaces</span>
                </label>
                <div className="flex items-center rounded-2xl border border-white/[0.1] bg-[#0A0D14] p-1.5 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-2 rounded-xl border border-amber-400/20 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    placeholder="9810122334"
                    className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden font-mono tracking-wider placeholder:text-slate-600"
                  />
                  {phoneDigits.length === 10 && (
                    <span className="px-2 text-emerald-400 text-xs flex items-center gap-1 shrink-0 font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="text-[10px] font-mono">10 Digits</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Aadhaar Number & Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Aadhaar Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Aadhaar Number <span className="text-rose-400">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">12 digits</span>
                  </label>
                  <div className="flex items-center rounded-2xl border border-white/[0.1] bg-[#0A0D14] px-4 py-3 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={formattedAadhaar}
                      onChange={handleAadhaarChange}
                      placeholder="7812 9034 5612"
                      className="w-full bg-transparent text-sm font-mono font-bold text-white focus:outline-hidden tracking-wider placeholder:text-slate-600"
                    />
                    {aadhaarRaw.length === 12 && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                    )}
                  </div>
                </div>

                {/* Role (Area Manager) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
                      Role
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Assigned</span>
                  </label>
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-white">
                    <span className="text-sm font-bold text-emerald-300 font-mono">{role}</span>
                    <Lock className="w-3.5 h-3.5 text-emerald-400/70" />
                  </div>
                </div>
              </div>

              {/* 4. Aadhaar Card Upload (Save in firebase) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                    Aadhaar Card Document Upload
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">JPG, PNG or PDF (Max 5MB)</span>
                </label>

                <div className="border border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-5 bg-[#0A0D14]/70 transition-all text-center relative group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {aadhaarPhotoUrl ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-white/20 shrink-0">
                          <img
                            src={aadhaarPhotoUrl}
                            alt="Aadhaar Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                            {aadhaarFileName || 'aadhaar_card_doc.jpg'}
                          </p>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" /> Document Ready to Save
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAadhaarPhotoUrl(null);
                          setAadhaarFileName('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 relative z-20 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-white">Click or drag Aadhaar Card here</p>
                      <p className="text-[10px] text-slate-500 font-mono">Stored securely in Firebase Storage</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 order-2 sm:order-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out & Exit</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer order-1 sm:order-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Profile to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Details & Enter Console</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
