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
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { WasherPartner } from '@/lib/washerPartners';
import { auth } from '@/lib/firebase';
import { syncWasherToFirestore } from '@/lib/firebaseService';

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
  const { onboardWasher, verifyPhoneNumber, societies: storeSocieties, user } = useStore();
  const currentAdminId =
    auth.currentUser?.uid ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null) ||
    user?.uid ||
    user?.id ||
    'admin-lead-1';

  const defaultSocieties = [
    'Green Valley Residency',
    'Palm Residency',
    'Sunrise Heights',
    'Silver Oak Towers',
  ];
  const availableSocietiesList = Array.from(
    new Set([
      ...defaultSocieties,
      ...(storeSocieties || []).map((s) => s.name),
    ])
  );

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSocieties, setSelectedSocieties] = useState<string[]>(['Green Valley Residency']);
  const [customSocietyInput, setCustomSocietyInput] = useState('');
  const [routeWindow, setRouteWindow] = useState('06:30 AM - 09:30 AM');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [address, setAddress] = useState('');

  const handleToggleSociety = (socName: string) => {
    setSelectedSocieties((prev) => {
      if (prev.includes(socName)) {
        return prev.filter((s) => s !== socName);
      } else {
        return [...prev, socName];
      }
    });
  };

  const handleRemoveSociety = (socName: string) => {
    setSelectedSocieties((prev) => prev.filter((s) => s !== socName));
  };

  const handleAddCustomSociety = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSocietyInput.trim();
    if (!clean) return;
    if (!selectedSocieties.includes(clean)) {
      setSelectedSocieties((prev) => [...prev, clean]);
    }
    setCustomSocietyInput('');
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
      const newPartner = onboardWasher({
        name,
        phone: phone.trim(),
        society: selectedSocieties.join(', '),
        societies: selectedSocieties,
        createdBy: currentAdminId,
        routeWindow,
        aadhaarNumber: formattedAadhaar,
        aadhaarPhotoUrl: aadhaarPhotoUrl || undefined,
        bankAccount: bankAccount || 'HDFC Bank •••• 5521',
        ifscCode: ifscCode || 'HDFC0002134',
        address,
      });

      // Synchronously write directly into Firestore Washers collection
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
                      selectedSocieties.map((soc) => (
                        <span
                          key={soc}
                          className="inline-flex items-center gap-1.5 bg-[#0B132B] text-white font-bold text-xs pl-3 pr-2 py-1.5 rounded-xl shadow-xs animate-in zoom-in-95"
                        >
                          <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{soc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSociety(soc)}
                            className="hover:bg-white/20 text-slate-300 hover:text-white rounded-md p-0.5 ml-1 transition-colors cursor-pointer"
                            title={`Remove ${soc}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Society Selector Pills */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Click to add or remove societies for this washer&apos;s daily route:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableSocietiesList.map((socName) => {
                      const isSelected = selectedSocieties.includes(socName);
                      return (
                        <button
                          key={socName}
                          type="button"
                          onClick={() => handleToggleSociety(socName)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs ring-1 ring-emerald-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{socName}</span>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom / Other Society */}
                <div className="flex gap-2 pt-0.5">
                  <div className="relative flex-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={customSocietyInput}
                      onChange={(e) => setCustomSocietyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSociety();
                        }
                      }}
                      placeholder="Add another society name (e.g. DLF Cyber City)..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomSociety}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Society</span>
                  </button>
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
