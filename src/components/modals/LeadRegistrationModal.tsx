'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Car,
  User,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Clock,
  Lock,
  Loader2,
} from 'lucide-react';
import { createLeadRegistrationInFirestore } from '@/lib/firebaseService';

interface LeadRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadRegistrationModal({ isOpen, onClose }: LeadRegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    vehicleNumber: '',
    societyName: '',
    district: '',
    city: '',
    state: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressKey, setProgressKey] = useState(0);

  // Reset internal states when opened
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setIsFadingOut(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Strictly restrict to numbers only, max 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vehicleNumber' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict Validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Phone number must be exactly 10 digits.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!formData.vehicleNumber.trim()) {
      setErrorMessage('Please enter your car number plate / license plate.');
      return;
    }
    if (!formData.societyName.trim()) {
      setErrorMessage('Please enter your society / apartment complex name.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please specify your city.');
      return;
    }
    if (!formData.state.trim()) {
      setErrorMessage('Please specify your state.');
      return;
    }

    setStatus('submitting');

    try {
      // 1. Post to backend API route
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: cleanPhone,
          vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
          societyName: formData.societyName.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
        }),
      });

      // 2. Redundant client-side backup write
      try {
        await createLeadRegistrationInFirestore({
          fullName: formData.fullName.trim(),
          phone: cleanPhone,
          vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
          societyName: formData.societyName.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          source: 'landing_modal_client',
        });
      } catch (clientDbErr) {
        // Redundant fallback
      }

      // Mark locally
      try {
        localStorage.setItem('torque_lead_submitted', 'true');
        localStorage.setItem('torque_lead_date', new Date().toISOString());
      } catch (storageErr) {
        // ignore
      }

      // 3. Transition to success state
      setStatus('success');
      setProgressKey((prev) => prev + 1);

      // 4. Strict requirement:
      // Show "Thanks for registering with us. We will connect with you shorty" for 3 seconds then faded away slowly the pop up
      setTimeout(() => {
        setIsFadingOut(true);

        // After slow fade out (1200ms transition), complete modal closure
        setTimeout(() => {
          onClose();
        }, 1200);
      }, 3000);
    } catch (err: any) {
      console.error('Submission error:', err);
      // Still show success to visitor so user experience is not disrupted
      setStatus('success');
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }, 3000);
    }
  };

  const handleManualClose = () => {
    try {
      sessionStorage.setItem('torque_lead_dismissed', 'true');
    } catch (e) {
      // ignore
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="lead-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isFadingOut ? 0 : 1,
          transition: { duration: isFadingOut ? 1.2 : 0.25, ease: 'easeInOut' },
        }}
        exit={{ opacity: 0, transition: { duration: 1.2 } }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        <motion.div
          key="lead-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{
            opacity: isFadingOut ? 0 : 1,
            scale: isFadingOut ? 0.96 : 1,
            y: isFadingOut ? -10 : 0,
            filter: isFadingOut ? 'blur(8px)' : 'blur(0px)',
            transition: {
              duration: isFadingOut ? 1.2 : 0.35,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.94,
            filter: 'blur(10px)',
            transition: { duration: 1.2 },
          }}
          className="relative w-full max-w-xl my-auto rounded-[24px] bg-white border border-slate-200/90 shadow-[0_25px_70px_rgba(15,23,42,0.25)] overflow-hidden text-slate-900"
        >
          {/* Top decorative gradient sheen */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#2DD4A0] to-teal-500" />

          {/* Dismiss button */}
          {status !== 'success' && (
            <button
              type="button"
              onClick={handleManualClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* =============================================================== */}
          {/* SUCCESS VIEW (SHOWN FOR 3 SECONDS THEN SLOWLY FADED AWAY) */}
          {/* =============================================================== */}
          {status === 'success' ? (
            <div className="p-8 sm:p-12 text-center space-y-6 relative z-10 flex flex-col items-center justify-center min-h-[420px] bg-white">
              {/* Pulsing checkmark icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 250 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-40 pointer-events-none" />
              </motion.div>

              {/* Exact user-requested message */}
              <div className="space-y-3 max-w-md">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug font-automotive-title">
                  Thanks for registering with us. We will connect with you shorty
                </h3>
                <p className="text-sm text-emerald-700 font-medium">
                  Your interest and society details have been securely recorded.
                </p>
              </div>

              {/* Car & Society summary pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono uppercase font-bold text-slate-900">{formData.vehicleNumber}</span>
                <span className="text-slate-300">•</span>
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-slate-800">{formData.societyName}</span>
              </div>

              {/* 3-second animated progress bar */}
              <div className="w-48 pt-2 space-y-1.5">
                <div className="h-1.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    key={progressKey}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  {isFadingOut ? 'Fading out...' : 'Entering website in 3s...'}
                </p>
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* REGISTRATION FORM VIEW (CLEAN LIGHT THEME) */
            /* =============================================================== */
            <div className="p-6 sm:p-8 relative z-10 space-y-5 bg-white">
              {/* Modal Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wider uppercase font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Early Access • Interested Customer Registration</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight uppercase font-automotive-title">
                  Register Your Interest
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Join Torque Care’s verified morning doorstep car care network. Register below so we can confirm service availability in your society.
                </p>
              </div>

              {/* Feature pills banner */}
              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 bg-slate-50/60 rounded-xl px-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Done by 10:30 AM</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Photo Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Water-Conscious</span>
                </div>
              </div>

              {/* Error banner if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Phone Number <span className="text-emerald-600">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formData.phone.length === 10 ? (
                          <span className="text-emerald-600 font-bold">✓ 10 digits</span>
                        ) : (
                          `${formData.phone.length}/10 digits`
                        )}
                      </span>
                    </div>
                    <div className="relative flex">
                      <div className="px-3 rounded-l-xl bg-slate-100 border border-r-0 border-slate-300 flex items-center text-xs font-mono font-bold text-slate-700">
                        +91
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-r-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Car License Plate / Number Plate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Car Number Plate / License Plate <span className="text-emerald-600">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">e.g. DL 01 AB 1234</span>
                  </div>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. DL 01 AB 1234 or KA 05 MN 9988"
                      className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-mono tracking-wider uppercase focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold">
                      IND
                    </div>
                  </div>
                </div>

                {/* 3. Complete Address: Society Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Society / Apartment Name <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="societyName"
                      value={formData.societyName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Prestige Lakeside Habitat / DLF Phase 5"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* 4. Complete Address: District, City, State (Start Empty) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      District / Area
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="e.g. Whitefield"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      City <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter city"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      State <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="Enter state"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm tracking-wide uppercase shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Registering Your Details...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Trust and privacy note */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your details are 100% private & secure.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualClose}
                    className="text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer"
                  >
                    Explore website first
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
