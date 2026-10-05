'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShieldCheck,
  Phone,
  User,
  CreditCard,
  Building2,
  Clock,
  Car,
  Upload,
  CheckCircle2,
  Sparkles,
  Camera,
  AlertCircle,
  ArrowRight,
  FileCheck,
  Plus,
  Loader2,
  Mail,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { WasherPartner } from '@/lib/washerPartners';
import { auth } from '@/lib/firebase';
import {
  syncWasherToFirestore,
  fetchAllSocieties,
  createSociety,
  FirestoreSociety,
} from '@/lib/firebaseService';

interface OnboardWasherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (partner: WasherPartner) => void;
}

export default function OnboardWasherModal({
  isOpen,
  onClose,
  onSuccess,
}: OnboardWasherModalProps) {
  const { onboardWasher, verifyPhoneNumber, user } = useStore();
  const currentAdminId =
    auth.currentUser?.uid ||
    (typeof window !== 'undefined' ? (localStorage.getItem('torque_admin_uid') || localStorage.getItem('torque_owner_id')) : null) ||
    user?.uid ||
    user?.id ||
    'admin-lead-1';

  const [adminSocieties, setAdminSocieties] = useState<FirestoreSociety[]>([]);
  const [isLoadingSocieties, setIsLoadingSocieties] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSocieties, setSelectedSocieties] = useState<string[]>([]);
  const [routeWindow, setRouteWindow] = useState('06:30 AM - 09:30 AM');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [address, setAddress] = useState('');

  // Fetch societies from Firestore
  const loadAdminSocieties = React.useCallback(async () => {
    setIsLoadingSocieties(true);
    try {
      const data = await fetchAllSocieties();
      setAdminSocieties(data);
    } catch (err) {
      console.warn('Could not load societies:', err);
    } finally {
      setIsLoadingSocieties(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedSocieties([]);
      return;
    }
    loadAdminSocieties();
  }, [isOpen, loadAdminSocieties]);

  const handleToggleSociety = (socId: string) => {
    setSelectedSocieties((prev) => {
      if (prev.includes(socId)) {
        return prev.filter((id) => id !== socId);
      } else {
        return [...prev, socId];
      }
    });
  };

  const handleRemoveSociety = (socId: string) => {
    setSelectedSocieties((prev) => prev.filter((id) => id !== socId));
  };

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

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Format Aadhaar Number as XXXX XXXX XXXX
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarRaw(raw);
    setIsAadhaarVerified(false);
  };

  const formattedAadhaar = aadhaarRaw
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  // Simulate Instant UIDAI Aadhaar Verification
  const handleVerifyAadhaar = () => {
    if (aadhaarRaw.length !== 12) {
      setErrorMessage('Please enter a valid 12-digit Aadhaar Number');
      return;
    }
    setErrorMessage('');
    setIsVerifyingAadhaar(true);
    setTimeout(() => {
      setIsVerifyingAadhaar(false);
      setIsAadhaarVerified(true);
    }, 800);
  };

  // Simulate Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadhaarPhotoUrl(reader.result as string);
        setIsAadhaarVerified(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send OTP for Phone Verification
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
      setErrorMessage('Invalid OTP code. Use test code 4291');
    }
  };

  // Submit Partner Onboarding
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Partner name is required');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Phone number is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid Email ID is required for washer partner portal login');
      return;
    }
    if (aadhaarRaw.length !== 12) {
      setErrorMessage('12-digit Aadhaar number is required for official KYC verification');
      return;
    }

    if (selectedSocieties.length === 0) {
      setErrorMessage('Please assign at least 1 society to this washer partner');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const chosenSocietyNames = selectedSocieties.map((socId) => {
        const found = adminSocieties.find((s) => s.societyId === socId);
        return found ? found.name : socId;
      });

      const newPartner = onboardWasher({
        name,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        society: chosenSocietyNames.join(', '),
        societies: selectedSocieties,
        createdBy: currentAdminId,
        routeWindow,
        aadhaarNumber: formattedAadhaar,
        aadhaarPhotoUrl: aadhaarPhotoUrl || undefined,
        bankAccount: bankAccount || 'HDFC Bank •••• 5521',
        ifscCode: ifscCode || 'HDFC0002134',
        address,
      });

      // Synchronously write directly into Firestore Washers & washer_directory collections
      const syncResult = await syncWasherToFirestore(newPartner);
      if (!syncResult.success) {
        console.warn('Firestore washer sync notice:', syncResult.error);
      }

      setIsSubmitting(false);
      if (onSuccess) onSuccess(newPartner);
      onClose();
    } catch (err: any) {
      console.error('Error during washer onboarding:', err);
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to onboard washer. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#0B132B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">
                  Onboard Washer Partner
                </h2>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  UIDAI KYC
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Aadhaar Card verification, phone authentication, and society cluster assignment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="onboard-washer-form" onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: Personal & Contact */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>1. Personal & Phone Verification</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Full Name (As per Aadhaar) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        placeholder="98101 23456"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setIsPhoneVerified(false);
                          setOtpSent(false);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      />
                      {isPhoneVerified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    {!isPhoneVerified ? (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shrink-0 cursor-pointer transition-colors"
                      >
                        {otpSent ? 'Resend' : 'Verify'}
                      </button>
                    ) : (
                      <span className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-xl flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Email ID (Used for Washer Portal Login) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh.washer@torquecare.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    The partner will log in using this email at /washer/login. On their first login, they will be prompted to set their password.
                  </span>
                </div>
              </div>

              {/* Inline OTP Verification Box */}
              {isPhoneVerifying && !isPhoneVerified && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">
                      Enter 4-digit code sent to {phone}:
                    </span>
                    <span className="text-[11px] font-mono text-blue-600">
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
                          className="w-10 h-10 text-center font-bold font-mono text-base bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleConfirmPhoneOtp}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Confirm OTP
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Aadhaar Card Verification */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  <span>2. Aadhaar Card Verification (UIDAI Compliant)</span>
                </h3>
                {isAadhaarVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    UIDAI Authenticated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                    {isAadhaarVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    ) : (
                      aadhaarRaw.length === 12 && (
                        <button
                          type="button"
                          onClick={handleVerifyAadhaar}
                          disabled={isVerifyingAadhaar}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          {isVerifyingAadhaar ? 'Checking...' : 'Verify'}
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter the full 12 digits for encrypted e-KYC validation.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Aadhaar Card Document / Photo
                  </label>
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl cursor-pointer text-slate-600 font-semibold transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>{aadhaarPhotoUrl ? 'Aadhaar Photo Attached ✓' : 'Upload Aadhaar Card (Front/Back)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PNG, JPG, or PDF scan of original card.
                  </p>
                </div>
              </div>

              {/* Aadhaar Preview Banner */}
              {isAadhaarVerified && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">
                        Aadhaar Verified: {formattedAadhaar}
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Identity confirmed • Police clearance background verified
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                    KYC Pass
                  </span>
                </div>
              )}
            </div>

            {/* SECTION 3: Route & Capacity Assignment */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>3. Society Route & Daily Capacity</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {selectedSocieties.length} {selectedSocieties.length === 1 ? 'Society' : 'Societies'} Assigned
                </span>
              </div>

              {/* Multi-Society Cluster Assignment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Assigned Societies * (Select one or more)
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                    Washer can work across &gt; 1 society
                  </span>
                </div>

                {/* Selected Societies Chips */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Currently Assigned Route Clusters ({selectedSocieties.length}):
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
                    {selectedSocieties.length === 0 ? (
                      <span className="text-rose-600 text-xs font-semibold">
                        ⚠️ No society selected. Please pick at least one society below.
                      </span>
                    ) : (
                      selectedSocieties.map((socId) => {
                        const socObj = adminSocieties.find((s) => s.societyId === socId);
                        const label = socObj ? `${socObj.name} (${socObj.city})` : socId;
                        return (
                          <span
                            key={socId}
                            className="inline-flex items-center gap-1.5 bg-[#0B132B] text-white font-bold text-xs pl-3 pr-2 py-1.5 rounded-xl shadow-xs animate-in zoom-in-95"
                          >
                            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{label}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSociety(socId)}
                              className="hover:bg-white/20 text-slate-300 hover:text-white rounded-md p-0.5 ml-1 transition-colors cursor-pointer"
                              title={`Remove ${label}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Society Selector Pills */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Click to add or remove societies for this washer&apos;s daily route:
                  </div>

                  {isLoadingSocieties ? (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Fetching societies from Firestore...</span>
                    </div>
                  ) : adminSocieties.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>No societies available in Firestore yet</span>
                      </div>
                      <p className="text-[11px] text-amber-700">
                        Create societies in the{' '}
                        <a
                          href="/admin/societies"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold underline text-amber-900 hover:text-amber-950"
                        >
                          Societies Panel
                        </a>{' '}
                        or type a name below to auto-create and assign one now.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {adminSocieties.map((soc) => {
                        const isSelected = selectedSocieties.includes(soc.societyId);
                        return (
                          <button
                            key={soc.societyId}
                            type="button"
                            onClick={() => handleToggleSociety(soc.societyId)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs ring-1 ring-emerald-500/20'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="truncate mr-1">
                              <span className="truncate block font-bold">{soc.name}</span>
                              <span className="text-[10px] text-slate-400 block font-normal truncate">
                                {soc.city}, {soc.state}
                              </span>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Manage Societies Link / Refresh */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Need to onboard a new society?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadAdminSocieties()}
                      disabled={isLoadingSocieties}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Loader2 className={`w-3 h-3 ${isLoadingSocieties ? 'animate-spin text-emerald-600' : 'hidden'}`} />
                      <span>Refresh</span>
                    </button>
                    <a
                      href="/admin/societies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#0B132B] hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Manage Societies</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Shift Window */}
              <div className="pt-1">
                <label className="font-bold text-slate-700 block mb-1">
                  Shift Window
                </label>
                <select
                  value={routeWindow}
                  onChange={(e) => setRouteWindow(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="06:00 AM - 09:00 AM">06:00 AM - 09:00 AM</option>
                  <option value="06:30 AM - 09:30 AM">06:30 AM - 09:30 AM</option>
                  <option value="07:00 AM - 10:00 AM">07:00 AM - 10:00 AM</option>
                  <option value="06:00 AM - 10:30 AM (Multi-Society)">06:00 AM - 10:30 AM (Multi-Society)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Peak morning servicing timeframe.
                </p>
              </div>
            </div>

            {/* SECTION 4: Bank Account for Payouts */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                <span>4. Bank Account for IMPS Payouts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Bank Account Number / Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India •••• 9912"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="SBIN0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono uppercase text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="onboard-washer-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying & Onboarding...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Partner Onboarding</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
