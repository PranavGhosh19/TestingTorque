'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car,
  User,
  Phone,
  Home,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface VehicleDraft {
  make: string;
  model: string;
  registration_number: string;
  type: 'car' | 'suv' | 'bike';
  color: string;
  parking_location: string;
  preferred_wash_time: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { registerOwner, verifyPhoneNumber } = useStore();

  // Multi-step state: 1 = Owner Details, 2 = Vehicles, 3 = Completed/Redirecting
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Owner Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [ownerErrors, setOwnerErrors] = useState<{ name?: string; phone?: string }>({});

  // Phone Verification State
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['4', '2', '9', '1']);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Step 2: Vehicles List (can be 1, 2, or more)
  const [vehicles, setVehicles] = useState<VehicleDraft[]>([
    {
      make: '',
      model: '',
      registration_number: '',
      type: 'car',
      color: '',
      parking_location: '',
      preferred_wash_time: '07:30 AM',
    },
  ]);
  const [vehicleErrors, setVehicleErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick suggestions for easy onboarding
  const popularModels = [
    { make: 'Honda', model: 'City', type: 'car' as const },
    { make: 'Hyundai', model: 'Creta', type: 'suv' as const },
    { make: 'Tata', model: 'Nexon', type: 'suv' as const },
    { make: 'Maruti', model: 'Swift', type: 'car' as const },
    { make: 'Mahindra', model: 'XUV700', type: 'suv' as const },
    { make: 'BMW', model: '3 Series', type: 'car' as const },
  ];

  // Send OTP
  const handleSendOtp = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setOwnerErrors({ phone: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    setOwnerErrors({});
    setOtpSent(true);
    setIsPhoneVerifying(true);
  };

  // Confirm OTP
  const handleConfirmOtp = async () => {
    const code = phoneOtp.join('');
    const isValid = await verifyPhoneNumber(phone, code);
    if (isValid) {
      setIsPhoneVerified(true);
      setIsPhoneVerifying(false);
      setOwnerErrors({});
    } else {
      setOwnerErrors({ phone: 'Invalid code. Use test verification code 4291' });
    }
  };

  // Validate Step 1
  const handleProceedToVehicles = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(errors).length > 0) {
      setOwnerErrors(errors);
      return;
    }

    if (!isPhoneVerified) {
      // Prompt OTP verification
      setIsPhoneVerifying(true);
      setOtpSent(true);
      return;
    }

    setOwnerErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Add another vehicle
  const handleAddVehicle = () => {
    setVehicles((prev) => [
      ...prev,
      {
        make: 'Hyundai',
        model: 'Creta',
        registration_number: '',
        type: 'suv',
        color: 'Phantom Black',
        parking_location: `Bay ${String.fromCharCode(65 + prev.length)}-${10 + prev.length} (Basement 1)`,
        preferred_wash_time: '08:00 AM',
      },
    ]);
  };

  // Remove vehicle (only if > 1)
  const handleRemoveVehicle = (index: number) => {
    if (vehicles.length <= 1) return;
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  // Update specific vehicle field
  const handleVehicleChange = (index: number, field: keyof VehicleDraft, value: string) => {
    setVehicles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Final Submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate registration numbers
    const errors: string[] = [];
    vehicles.forEach((v, i) => {
      if (!v.registration_number.trim()) {
        errors[i] = `Vehicle #${i + 1} registration number is required (e.g. DL 01 AB 4291)`;
      }
    });

    if (errors.length > 0) {
      setVehicleErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Call store action
    registerOwner(
      {
        name: name.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        address: address.trim() || undefined,
        alt_phone: altPhone.trim() || undefined,
      },
      vehicles
    );

    // Redirect to Owner Dashboard
    setTimeout(() => {
      router.push('/owner/dashboard');
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-slate-100 overflow-hidden selection:bg-blue-500 selection:text-white py-16 sm:py-24">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* TOP BRAND HEADER & STEP PROGRESS */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Torque Care • Owner Sign Up</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {step === 1 ? 'Owner Registration' : 'Add Your Vehicles'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {step === 1
              ? 'Enter your name, contact details, and society residence.'
              : 'Add 1, 2, or more vehicles for verified morning society care.'}
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 1
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <span>1</span>
              <span>Owner Details</span>
              {step === 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>

            <div className="w-8 h-0.5 bg-white/15 rounded-full" />

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 2
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              <span>2</span>
              <span>Add Vehicles ({vehicles.length})</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 1: OWNER DETAILS (Name, Phone, Address, Alt Phone)       */}
        {/* ============================================================ */}
        {step === 1 && (
          <form
            onSubmit={handleProceedToVehicles}
            className="p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-6 luxury-sheen relative"
          >
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Primary Contact
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Car Owner Details</h2>
            </div>

            {/* Name & Primary Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (ownerErrors.name) setOwnerErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Pranav Ghosh"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all"
                />
                {ownerErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{ownerErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Phone Number <span className="text-rose-400">*</span>
                  </span>
                  {isPhoneVerified && (
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Phone Verified
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setIsPhoneVerified(false);
                        setOtpSent(false);
                        if (ownerErrors.phone) setOwnerErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-13 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all font-mono"
                    />
                  </div>
                  {!isPhoneVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-4 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-colors shrink-0"
                    >
                      {otpSent ? 'Resend' : 'Verify'}
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {ownerErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{ownerErrors.phone}</p>
                )}

                {/* Inline OTP Verification Box */}
                {isPhoneVerifying && !isPhoneVerified && (
                  <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-3 animate-in fade-in">
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
                        onClick={handleConfirmOtp}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Confirm OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details: Home Address & Alternative Phone */}
            <div className="pt-2 border-t border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Additional Details
                </span>
                <span className="text-[10px] text-slate-400">For morning access & backup</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  Home Address / Society Residence
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Tower B, Green Valley Residency, Sector 62, Noida"
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all leading-relaxed resize-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used by our verified society partner to locate your assigned tower and bay.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  Alternative Phone Number (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="98111 22334 (Spouse / Family / Emergency)"
                    className="w-full pl-13 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <Link
                href="/auth/login"
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Already registered? <span className="text-blue-400 underline">Log In</span>
              </Link>

              <button
                type="submit"
                className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-sm shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Add Vehicles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 2: ADD VEHICLES (1, 2, OR MORE)                         */}
        {/* ============================================================ */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                  Vehicle Garage
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Add Vehicles for {name || 'Your Account'}
                </h2>
              </div>

              {/* Add Vehicle Button */}
              <button
                type="button"
                onClick={handleAddVehicle}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Vehicle</span>
              </button>
            </div>

            {/* List of Vehicles */}
            <div className="space-y-6">
              {vehicles.map((v, index) => (
                <div
                  key={index}
                  className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-6 relative luxury-sheen"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">
                          Vehicle #{index + 1}: {v.make} {v.model || 'New Vehicle'}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {v.type === 'suv' ? 'SUV Care' : v.type === 'car' ? 'Sedan / Hatch' : 'Two-Wheeler'}
                        </span>
                      </div>
                    </div>

                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(index)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove this vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Segment Pills */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Vehicle Segment
                    </label>
                    <div className="flex items-center gap-2">
                      {(['car', 'suv', 'bike'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleVehicleChange(index, 'type', type)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                            v.type === type
                              ? 'bg-white text-[#080D1A] shadow-md'
                              : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {type === 'car' ? 'Hatch / Sedan' : type === 'suv' ? 'Compact / SUV' : 'Motorcycle'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Make, Model & Registration Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Make <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={v.make}
                        onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                        placeholder="e.g. Honda, Hyundai"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Model <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={v.model}
                        onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                        placeholder="e.g. City ZX, Creta"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Plate / Reg Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={v.registration_number}
                        onChange={(e) => {
                          handleVehicleChange(index, 'registration_number', e.target.value.toUpperCase());
                          if (vehicleErrors[index]) {
                            const copy = [...vehicleErrors];
                            delete copy[index];
                            setVehicleErrors(copy);
                          }
                        }}
                        placeholder="e.g. DL 01 AB 4291"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all uppercase font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Parking Location Bay & Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Assigned Parking Bay <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={v.parking_location}
                        onChange={(e) => handleVehicleChange(index, 'parking_location', e.target.value)}
                        placeholder="e.g. Bay D-14 (Basement 1) or Pillar 42"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        Preferred Wash Window
                      </label>
                      <select
                        value={v.preferred_wash_time}
                        onChange={(e) => handleVehicleChange(index, 'preferred_wash_time', e.target.value)}
                        className="w-full px-4 py-3 bg-[#0B132B] border border-white/15 rounded-2xl text-xs font-semibold text-white focus:outline-hidden focus:border-blue-400 transition-all"
                      >
                        <option value="07:00 AM">07:00 AM – Early Commuter</option>
                        <option value="07:30 AM">07:30 AM – Morning Standard</option>
                        <option value="08:00 AM">08:00 AM – Standard</option>
                        <option value="08:30 AM">08:30 AM – Mid Morning</option>
                      </select>
                    </div>
                  </div>

                  {/* Popular preset pills */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-mono block mb-1.5">
                      Or select quick model:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {popularModels.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            handleVehicleChange(index, 'make', p.make);
                            handleVehicleChange(index, 'model', p.model);
                            handleVehicleChange(index, 'type', p.type);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/10 transition-colors"
                        >
                          {p.make} {p.model}
                        </button>
                      ))}
                    </div>
                  </div>

                  {vehicleErrors[index] && (
                    <p className="text-xs text-rose-400 font-medium">{vehicleErrors[index]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Personal Details</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all"
                >
                  + Add Another Car ({vehicles.length})
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {isSubmitting
                      ? 'Creating Your Account...'
                      : `Complete Sign Up (${vehicles.length} Vehicle${vehicles.length > 1 ? 's' : ''})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
