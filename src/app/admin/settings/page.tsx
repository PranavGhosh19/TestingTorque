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
  LogOut,
  FileText,
  BadgeCheck,
  Check,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/firebase';
import {
  saveAreaManagerToFirestore,
  fetchAreaManagerFromFirestore,
  fetchAreaManagerByEmail,
} from '@/lib/firebaseService';

const extract10Digits = (phoneStr?: string) => {
  if (!phoneStr) return '9999900001';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length >= 12) {
    return digits.slice(2, 12);
  }
  return digits.slice(-10);
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useStore();

  const [fullName, setFullName] = useState(user?.name || 'Vikram Malhotra');
  const [phoneDigits, setPhoneDigits] = useState(extract10Digits(user?.phone));
  const [aadhaarRaw, setAadhaarRaw] = useState('781290345612');
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState<string | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState<string>('');
  const [role] = useState<'Area Manager'>('Area Manager');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [managerDocId, setManagerDocId] = useState<string>(user?.id || 'am_lead_1');

  // Format 12-digit Aadhaar as XXXX XXXX XXXX
  const formattedAadhaar = aadhaarRaw
    .replace(/\D/g, '')
    .slice(0, 12)
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  // Load existing Area Manager record from Firebase Firestore
  useEffect(() => {
    const loadManagerData = async () => {
      try {
        const storedAdminUid =
          typeof window !== 'undefined'
            ? localStorage.getItem('torque_admin_uid')
            : null;
        const storedAdminEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('torque_admin_email')
            : null;

        const currentAuthUser = auth.currentUser;
        const effectiveId =
          currentAuthUser?.uid || storedAdminUid || user?.uid || user?.id || '';
        if (effectiveId) setManagerDocId(effectiveId);

        let data = await fetchAreaManagerFromFirestore(effectiveId);
        if (!data && storedAdminEmail) {
          data = await fetchAreaManagerByEmail(storedAdminEmail);
        }

        if (data && data.aadhaarNumber && data.aadhaarNumber.length >= 10) {
          setIsFirstTime(false);
          if (data.fullName) setFullName(data.fullName);
          if (data.phoneNumber) {
            setPhoneDigits(extract10Digits(data.phoneNumber));
          }
          if (data.aadhaarNumber) {
            setAadhaarRaw(data.aadhaarNumber.replace(/\D/g, ''));
          }
          if (data.aadhaarPhotoUrl) {
            setAadhaarPhotoUrl(data.aadhaarPhotoUrl);
            setAadhaarFileName('aadhaar_card_verified.jpg');
          }
        } else {
          // First-time setup: user created in Firebase Auth needs to complete details
          setIsFirstTime(true);
          if (storedAdminEmail) {
            const emailPrefix = storedAdminEmail.split('@')[0];
            const capitalized =
              emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
            setFullName(
              user?.name && !user.name.includes('Unregistered')
                ? user.name
                : `${capitalized} Malhotra`
            );
          }
        }
      } catch (err) {
        console.warn('Error loading area manager from Firebase:', err);
      }
    };

    loadManagerData();
  }, [user?.id, user?.uid]);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSaveToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    if (phoneDigits.length !== 10) {
      setErrorMsg('Phone Number must be exactly 10 digits without any spaces.');
      return;
    }

    const cleanPhone = `+91${phoneDigits}`;

    if (aadhaarRaw.length !== 12) {
      setErrorMsg('Aadhaar Number must be exactly 12 digits.');
      return;
    }

    setIsSaving(true);

    try {
      const storedAdminEmail =
        typeof window !== 'undefined'
          ? localStorage.getItem('torque_admin_email') || 'admin@torquecare.in'
          : 'admin@torquecare.in';
      const currentAuthUid = auth.currentUser?.uid;
      const effectiveManagerId = currentAuthUid || managerDocId || (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null);

      const result = await saveAreaManagerToFirestore({
        id: effectiveManagerId || undefined,
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        aadhaarNumber: formattedAadhaar,
        aadhaarPhotoUrl: aadhaarPhotoUrl || null,
        role: 'Area Manager',
        email: storedAdminEmail,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save to Firebase');
      }

      // Update local store state so admin sidebar/header reflects updated name
      setUser({
        ...user,
        name: fullName.trim(),
        phone: cleanPhone,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_owner_name', fullName.trim());
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err: any) {
      console.error('Error saving Area Manager to Firebase:', err);
      setErrorMsg(err?.message || 'Error saving to Firebase area_managers');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-8 sm:p-6 lg:p-10 space-y-6 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Area Manager Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Area Manager Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified identity, contact information, and Aadhaar documentation for Operations Area Management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {isFirstTime && !saveSuccess && (
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-blue-950">First-Time Setup Required</p>
              <p className="text-[11px] text-blue-800/90 mt-0.5">
                Welcome! Your account was authenticated via Firebase Auth. Please complete your official Area Manager details below and save them to activate your Operations Console.
              </p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span>Area Manager data successfully saved.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-colors"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Area Manager Profile Form Card */}
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B132B]">
                  Area Manager Identity Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Verified identity, contact, and government documentation.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Admin
            </span>
          </div>

          <form onSubmit={handleSaveToFirebase} className="space-y-5">
            {/* 1. Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Full Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Vikram Malhotra"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Saved in Firebase as <code className="font-mono text-slate-500">full_name</code>
              </span>
            </div>

            {/* 2. Phone Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Phone Number</span>
                  <span className="text-rose-500">*</span>
                </div>
                {phoneDigits.length === 10 && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3" /> 10 Digits Valid
                  </span>
                )}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all overflow-hidden">
                <span className="px-3.5 py-2.5 bg-slate-200/90 text-slate-900 text-xs font-black font-mono border-r border-slate-200 shrink-0 select-none tracking-wider">
                  +91
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={phoneDigits}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneDigits(cleaned);
                    if (errorMsg) setErrorMsg('');
                  }}
                  maxLength={10}
                  placeholder="9999900001"
                  className="w-full px-3.5 py-2.5 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 tracking-wider"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                Saved in Firebase as <code className="font-mono text-slate-700 font-bold">{`+91${phoneDigits || 'XXXXXXXXXX'}`}</code> (no spaces)
              </span>
            </div>

            {/* 3. Aadhaar Number & Upload */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Aadhaar Number (12 Digits)</span>
                    <span className="text-rose-500">*</span>
                  </div>
                  {aadhaarRaw.length === 12 && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> 12 Digits Valid
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={formattedAadhaar}
                  onChange={handleAadhaarChange}
                  maxLength={14}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Saved in Firebase as <code className="font-mono text-slate-500">aadhaar_number</code>
                </span>
              </div>

              {/* Aadhaar Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Aadhaar Document Upload
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs shrink-0">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>{aadhaarPhotoUrl ? 'Change Document Photo' : 'Upload Aadhaar Card'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {aadhaarPhotoUrl ? (
                    <div className="flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-full truncate">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-semibold">
                        {aadhaarFileName || 'Aadhaar Attached ✓'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      PNG, JPG or PDF up to 5MB (Saved in Firebase as <code className="font-mono text-slate-500">aadhaar_photo_url</code>)
                    </span>
                  )}
                </div>

                {/* Aadhaar Preview Thumbnail */}
                {aadhaarPhotoUrl && (
                  <div className="mt-3 p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative flex items-center justify-center">
                      <img
                        src={aadhaarPhotoUrl}
                        alt="Aadhaar Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Aadhaar Card Preview</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Ready to persist in Firebase Firestore
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Role - Area Manager */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Role</span>
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {role}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                  Fixed Area Manager
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Saved in Firebase as <code className="font-mono text-slate-500">role: &quot;Area Manager&quot;</code>
              </span>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Area Manager Data...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Area Manager Data</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
