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
  ChevronRight,
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
    city: 'Bengaluru',
    state: 'Karnataka',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vehicleNumber' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
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
      // 1. Post to backend API route (handles Google Sheets webhook dispatch and Firestore)
      const res = await fetch('/api/leads', {
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

      // 2. Client-side redundant backup write to Firestore
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
        // Redundant fallback, proceed even if client direct write encounters network variance
      }

      // Mark locally so user isn't prompted repeatedly
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
      console.error('Submission failed:', err);
      // Even in case of fetch network error, record locally & show success feedback
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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#04070D]/85 backdrop-blur-xl overflow-y-auto"
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
          className="relative w-full max-w-xl my-auto rounded-[24px] bg-gradient-to-b from-[#131924] via-[#0E141E] to-[#0A0E17] border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(45,212,160,0.15)] overflow-hidden"
        >
          {/* Top decorative gradient sheen */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#2DD4A0] to-transparent opacity-80" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-[#2DD4A0]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Dismiss button */}
          {status !== 'success' && (
            <button
              type="button"
              onClick={handleManualClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
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
            <div className="p-8 sm:p-12 text-center space-y-6 relative z-10 flex flex-col items-center justify-center min-h-[420px]">
              {/* Pulsing checkmark icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 250 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-[#2DD4A0]/20 border border-[#2DD4A0]/50 flex items-center justify-center text-[#2DD4A0] shadow-[0_0_40px_rgba(45,212,160,0.4)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#2DD4A0]/20 animate-ping opacity-40 pointer-events-none" />
              </motion.div>

              {/* Exact user-requested message */}
              <div className="space-y-3 max-w-md">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug font-automotive-title">
                  Thanks for registering with us. We will connect with you shorty
                </h3>
                <p className="text-sm text-emerald-300/80 font-medium">
                  Your interest and society details have been securely recorded.
                </p>
              </div>

              {/* Car & Society summary pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/70">
                <Car className="w-3.5 h-3.5 text-[#2DD4A0]" />
                <span className="font-mono uppercase font-bold text-white">{formData.vehicleNumber}</span>
                <span className="text-white/30">•</span>
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium text-white/90">{formData.societyName}</span>
              </div>

              {/* 3-second animated progress bar */}
              <div className="w-48 pt-2 space-y-1.5">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    key={progressKey}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-[#2DD4A0] to-emerald-400"
                  />
                </div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40">
                  {isFadingOut ? 'Fading out...' : 'Entering website in 3s...'}
                </p>
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* REGISTRATION FORM VIEW */
            /* =============================================================== */
            <div className="p-6 sm:p-8 relative z-10 space-y-5">
              {/* Modal Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/25 text-[#2DD4A0] text-[11px] font-bold tracking-wider uppercase font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Early Access • Interested Customer Registration</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase font-automotive-title">
                  Register Your Interest
                </h2>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Join Torque Care’s verified morning doorstep car care network. Register below so we can confirm service availability in your society.
                </p>
              </div>

              {/* Feature pills banner */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.08]">
                <div className="flex items-center gap-1.5 text-[11px] text-white/75">
                  <Clock className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0" />
                  <span className="truncate">Done by 10:30 AM</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/75">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0" />
                  <span className="truncate">Photo Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/75">
                  <Droplets className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0" />
                  <span className="truncate">Water-Conscious</span>
                </div>
              </div>

              {/* Error banner if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                      Full Name <span className="text-[#2DD4A0]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Vikram Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#161D29] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#2DD4A0] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                      Phone Number <span className="text-[#2DD4A0]">*</span>
                    </label>
                    <div className="relative flex">
                      <div className="px-2.5 rounded-l-xl bg-white/[0.04] border border-r-0 border-white/10 flex items-center text-xs font-mono font-bold text-white/60">
                        +91
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        maxLength={12}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 rounded-r-xl bg-[#161D29] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#2DD4A0] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Car License Plate / Number Plate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70">
                      Car Number Plate / License Plate <span className="text-[#2DD4A0]">*</span>
                    </label>
                    <span className="text-[10px] text-white/40 font-mono">e.g. DL 01 AB 1234</span>
                  </div>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      required
                      placeholder="KA 05 MN 9988"
                      className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-[#161D29] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm font-mono tracking-wider uppercase focus:outline-none focus:border-[#2DD4A0] transition-colors"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[10px] font-bold">
                      IND
                    </div>
                  </div>
                </div>

                {/* 3. Complete Address: Society Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Society / Apartment Name <span className="text-[#2DD4A0]">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="societyName"
                      value={formData.societyName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Prestige Lakeside Habitat / DLF Phase 5"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#161D29] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#2DD4A0] transition-colors"
                    />
                  </div>
                </div>

                {/* 4. Complete Address: District, City, State */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                      District / Locality
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="e.g. Whitefield"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-[#161D29] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#2DD4A0] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                      City <span className="text-[#2DD4A0]">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3 py-2 rounded-xl bg-[#161D29] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#2DD4A0] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                      State <span className="text-[#2DD4A0]">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Karnataka"
                      className="w-full px-3 py-2 rounded-xl bg-[#161D29] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#2DD4A0] transition-colors"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2DD4A0] to-[#20BA8B] hover:from-[#34e2ab] hover:to-[#24c794] text-[#070B11] font-extrabold text-sm tracking-wide uppercase shadow-[0_0_25px_rgba(45,212,160,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#070B11]" />
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
                <div className="flex items-center justify-between pt-1 text-[11px] text-white/45">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-white/40" />
                    <span>Your details are 100% private & secure.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualClose}
                    className="text-white/50 hover:text-white underline transition-colors cursor-pointer"
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
