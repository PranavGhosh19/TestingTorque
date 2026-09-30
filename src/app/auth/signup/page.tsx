'use client';

import React, { useState, useEffect } from 'react';
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
  Check,
  Star,
  Award,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { WasherPartner } from '@/lib/washerPartners';

interface VehicleDraft {
  make: string;
  model: string;
  registration_number: string;
  type: 'car' | 'suv' | 'bike';
  color: string;
  parking_location: string;
  preferred_wash_time: string;
}

interface PlanOption {
  id: string;
  name: string;
  monthlyBasePrice: number;
  tagline: string;
  badge?: string;
  washesPerWeek: string;
  interiorFrequency: string;
  features: string[];
}

export default function SignUpPage() {
  const router = useRouter();
  const { registerOwner, verifyPhoneNumber, washers, isLoggedIn, isHydrated, role } = useStore();

  useEffect(() => {
    const storedLoggedIn =
      typeof window !== 'undefined' && localStorage.getItem('torque_logged_in') === 'true';
    if ((isHydrated && isLoggedIn) || storedLoggedIn) {
      let targetRole = role || 'owner';
      try {
        const savedUserStr =
          typeof window !== 'undefined' ? localStorage.getItem('torque_user') : null;
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          if (parsed?.role) targetRole = parsed.role;
        }
      } catch (e) {
        // ignore
      }
      router.replace(`/${targetRole}/dashboard`);
    }
  }, [isHydrated, isLoggedIn, role, router]);

  // Multi-step state: 1 = Owner Details, 2 = Vehicles, 3 = Choose Plan, 4 = Choose Washer
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Owner Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Green Valley Residency, Tower 4');
  const [altPhone, setAltPhone] = useState('');
  const [ownerErrors, setOwnerErrors] = useState<{ name?: string; phone?: string }>({});

  // Phone Verification State
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['4', '2', '9', '1']);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Step 2: Vehicles List
  const [vehicles, setVehicles] = useState<VehicleDraft[]>([
    {
      make: 'Hyundai',
      model: 'Creta',
      registration_number: '',
      type: 'suv',
      color: 'Phantom Black',
      parking_location: 'Bay B-14 (Basement 1)',
      preferred_wash_time: '07:30 AM',
    },
  ]);
  const [vehicleErrors, setVehicleErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 3: Choose a Plan
  const planOptions: PlanOption[] = [
    {
      id: 'basic',
      name: 'HOME BASIC',
      monthlyBasePrice: 599,
      tagline: 'Essential weekday care for daily office commuters',
      washesPerWeek: '5 Days / week (Mon – Fri)',
      interiorFrequency: '1x Monthly Interior Vacuum',
      features: [
        'Exterior microfiber gentle wash',
        'Windshield & side mirror clarity buff',
        'Tire dressing & dust wipe',
        'Verified photo proof every wash',
        'Washer-appointed backup coverage',
      ],
    },
    {
      id: 'standard',
      name: 'HOME COMPLETE',
      monthlyBasePrice: 799,
      badge: 'RECOMMENDED',
      tagline: 'Complete care with 6-day wash and deep cockpit cleaning',
      washesPerWeek: '6 Days / week (Mon – Sat)',
      interiorFrequency: '2x Monthly Deep Interior Vacuum',
      features: [
        'All Basic plan features',
        '6 Days comprehensive morning care',
        '2x Deep interior vacuum & dashboard wipe',
        'Rims & alloy detailing spray',
        'Sunday Priority Wash eligibility',
        'Touchup guarantee within 2 hours',
      ],
    },
    {
      id: 'premium',
      name: 'HOME CONNOISSEUR',
      monthlyBasePrice: 1199,
      badge: 'PRESTIGE',
      tagline: 'Showroom finish for luxury and ceramic coated vehicles',
      washesPerWeek: '6 Days + 1 Sunday Priority Included',
      interiorFrequency: 'Weekly Interior Cleaning & Disinfection',
      features: [
        'All Standard plan features',
        'Ceramic-safe pH-neutral care products',
        'Weekly full interior vacuum & steam mat sanitize',
        '1 Free Sunday Priority slot every month',
        'Top-rated senior partner assignment (★ 4.9+)',
        'Quarterly water-beading protective coat',
      ],
    },
  ];

  const [selectedPlanId, setSelectedPlanId] = useState<string>('standard');
  const selectedPlan = planOptions.find((p) => p.id === selectedPlanId) || planOptions[1];

  // Step 4: Choose a Washer
  const availableWashers: WasherPartner[] = washers && washers.length > 0
    ? washers
    : [
        {
          id: 'wsh_amit',
          name: 'Amit Kumar',
          phone: '+91 98101 22334',
          avatar: '/images/washer_amit.jpg',
          rating: '4.98',
          reviewsCount: 142,
          society: 'Green Valley Residency',
          assignedCarsPerDay: 30,
          routeWindow: '06:30 AM - 09:30 AM',
          avgTimePerCar: '5.5 mins',
          completionRate: '100%',
          totalLifetimeWashes: 1840,
          status: 'Active on Route',
          kyc: 'Verified (Aadhaar & Police Clear)',
          aadhaarVerified: true,
          phoneVerified: true,
          absentThisMonth: 0,
          absentDates: [],
          leaveReason: '',
          backupWasherName: 'Rajesh Sharma',
          monthlyPayoutsGone: 48200,
          pendingPayoutDue: 2840,
          sundayBonusEarned: 1200,
          disbursements: [],
        },
      ];

  const [selectedWasherId, setSelectedWasherId] = useState<string>(
    availableWashers[0]?.id || 'wsh_amit'
  );
  const selectedWasher =
    availableWashers.find((w) => w.id === selectedWasherId) || availableWashers[0];

  // Quick suggestions for easy vehicle adding
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

  // Validate Step 1 -> Move to Step 2
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

  // Validate Step 2 -> Move to Step 3 (Choose Plan)
  const handleProceedToPlan = (e: React.FormEvent) => {
    e.preventDefault();
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

    setVehicleErrors([]);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validate Step 3 -> Move to Step 4 (Choose Washer)
  const handleProceedToWasher = () => {
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submit on Step 4
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Call store action with owner data, selected plan, and selected washer
    registerOwner(
      {
        name: name.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        address: address.trim() || undefined,
        alt_phone: altPhone.trim() || undefined,
        selectedPlan: selectedPlan.name,
        selectedWasherId: selectedWasher.id,
        selectedWasherName: selectedWasher.name,
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* TOP BRAND HEADER & STEP PROGRESS */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Torque Care • Owner Onboarding</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {step === 1 && '1. Owner Registration'}
            {step === 2 && '2. Add Your Vehicles'}
            {step === 3 && '3. Choose a Care Plan'}
            {step === 4 && '4. Select Your Washer Partner'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {step === 1 && 'Enter your contact details and verified mobile number.'}
            {step === 2 && 'Add 1, 2, or more vehicles for verified society parking bay care.'}
            {step === 3 && 'Select a transparent monthly membership plan tailored for your commute.'}
            {step === 4 && 'Pick your assigned verified partner for morning route execution.'}
          </p>

          {/* Stepper Indicator (4 Steps) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-3 flex-wrap">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 1
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <span>1</span>
              <span>Details</span>
              {step > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>

            <div className="w-4 sm:w-6 h-0.5 bg-white/15 rounded-full" />

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 2
                  ? 'bg-blue-600 text-white shadow-md'
                  : step > 2
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              <span>2</span>
              <span>Vehicles ({vehicles.length})</span>
              {step > 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>

            <div className="w-4 sm:w-6 h-0.5 bg-white/15 rounded-full" />

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 3
                  ? 'bg-blue-600 text-white shadow-md'
                  : step > 3
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              <span>3</span>
              <span>Plan</span>
              {step > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>

            <div className="w-4 sm:w-6 h-0.5 bg-white/15 rounded-full" />

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 4
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              <span>4</span>
              <span>Washer</span>
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
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Phone Verified
                    </span>
                  )}
                </label>

                <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-1.5 focus-within:border-blue-400 focus-within:bg-white/10 transition-all">
                  <span className="text-xs font-mono font-bold text-slate-400 px-3 py-1 border-r border-white/10">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    disabled={isPhoneVerified}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (ownerErrors.phone) setOwnerErrors((prev) => ({ ...prev, phone: undefined }));
                      setIsPhoneVerified(false);
                    }}
                    placeholder="98765 43210"
                    className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden font-mono tracking-wider disabled:opacity-60"
                  />
                  {!isPhoneVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all"
                    >
                      {otpSent ? 'Resend' : 'Verify'}
                    </button>
                  )}
                </div>
                {ownerErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{ownerErrors.phone}</p>
                )}
              </div>
            </div>

            {/* OTP Verification Prompt */}
            {isPhoneVerifying && !isPhoneVerified && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">
                    Enter verification code sent to +91 {phone.replace(/\D/g, '')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Test code: 4291</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {phoneOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const copy = [...phoneOtp];
                          copy[idx] = e.target.value;
                          setPhoneOtp(copy);
                        }}
                        className="w-10 h-10 text-center font-mono font-black text-lg text-white bg-white/10 border border-white/20 rounded-xl focus:border-blue-400 focus:outline-hidden"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmOtp}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Confirm Code
                  </button>
                </div>
              </div>
            )}

            {/* Address & Alternate Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-blue-400" />
                  Society Residence / Apartment
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Green Valley Residency, Tower 4, Flat 602"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Alternate Contact (Optional)
                </label>
                <input
                  type="tel"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder="e.g. Spouse / Driver Phone"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:bg-white/10 transition-all font-mono"
                />
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/auth/login"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Already have an account? <span className="text-blue-400 underline">Sign In</span>
              </Link>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(79,124,255,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Add Vehicles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 2: ADD VEHICLES (1, 2, or more cars/SUVs)               */}
        {/* ============================================================ */}
        {step === 2 && (
          <form onSubmit={handleProceedToPlan} className="space-y-6">
            <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Registered Society Garage</h3>
                  <p className="text-xs text-slate-400">
                    Add all cars or SUVs you want our verified partners to wash every morning.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-white">
                {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
              </span>
            </div>

            {/* Vehicle Cards List */}
            <div className="space-y-5">
              {vehicles.map((v, index) => (
                <div
                  key={index}
                  className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-xl space-y-5 luxury-sheen relative"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Vehicle #{index + 1} Details
                      </h4>
                    </div>

                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(index)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Make, Model, Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Make / Brand <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={v.make}
                        onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                        placeholder="e.g. Hyundai"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white focus:outline-hidden focus:border-blue-400 transition-all"
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
                        placeholder="e.g. Creta"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white focus:outline-hidden focus:border-blue-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Body Type
                      </label>
                      <select
                        value={v.type}
                        onChange={(e) =>
                          handleVehicleChange(index, 'type', e.target.value as 'car' | 'suv' | 'bike')
                        }
                        className="w-full px-4 py-3 bg-[#0B132B] border border-white/15 rounded-2xl text-xs font-semibold text-white focus:outline-hidden focus:border-blue-400 transition-all"
                      >
                        <option value="car">Hatchback / Sedan</option>
                        <option value="suv">SUV / MUV</option>
                        <option value="bike">Motorcycle / Scooter</option>
                      </select>
                    </div>
                  </div>

                  {/* Registration Number & Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Number Plate <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={v.registration_number}
                        onChange={(e) =>
                          handleVehicleChange(index, 'registration_number', e.target.value.toUpperCase())
                        }
                        placeholder="e.g. DL 01 AB 4291"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-mono font-bold text-white uppercase focus:outline-hidden focus:border-blue-400 transition-all tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Vehicle Color
                      </label>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => handleVehicleChange(index, 'color', e.target.value)}
                        placeholder="e.g. Phantom Black"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white focus:outline-hidden focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Parking Bay & Preferred Wash Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        Assigned Parking Bay
                      </label>
                      <input
                        type="text"
                        value={v.parking_location}
                        onChange={(e) => handleVehicleChange(index, 'parking_location', e.target.value)}
                        placeholder="e.g. Bay B-14 (Basement 1)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-xs font-semibold text-white focus:outline-hidden focus:border-blue-400 transition-all"
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

                  {/* Quick Preset Buttons */}
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
                  className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(79,124,255,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Choose Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 3: CHOOSE A PLAN (Home Basic, Home Complete, Prestige)   */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Select Your Monthly Care Plan</h3>
                  <p className="text-xs text-slate-400">
                    Transparent monthly membership with verified photo proof and touchup guarantees.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-white">
                Step 3 of 4
              </span>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {planOptions.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const totalCost = plan.monthlyBasePrice * vehicles.length;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-400 shadow-[0_10px_35px_rgba(79,124,255,0.3)] scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-black text-white">{plan.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{plan.tagline}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-500 border-blue-400 text-white'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">₹{plan.monthlyBasePrice}</span>
                          <span className="text-xs text-slate-400">/ car / mo</span>
                        </div>
                        {vehicles.length > 1 && (
                          <div className="text-[11px] text-blue-300 font-mono font-semibold mt-1">
                            Total: ₹{totalCost}/mo ({vehicles.length} cars)
                          </div>
                        )}
                      </div>

                      {/* Key Frequencies */}
                      <div className="space-y-2 py-2 border-y border-white/10 text-xs">
                        <div className="flex items-center gap-2 text-slate-200">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="font-semibold">{plan.washesPerWeek}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{plan.interiorFrequency}</span>
                        </div>
                      </div>

                      {/* Bullet Features */}
                      <ul className="space-y-2 text-[11px] text-slate-400">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white font-black shadow-md'
                          : 'bg-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Vehicles</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToWasher}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(79,124,255,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Choose Washer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: CHOOSE A WASHER PARTNER                              */}
        {/* ============================================================ */}
        {step === 4 && (
          <form
            onSubmit={handleFinalSubmit}
            className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200"
          >
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <span className="text-xl">🧼</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Choose Your Dedicated Washer Partner</h3>
                  <p className="text-xs text-slate-400">
                    Verified service partner assigned to your society morning route with daily photo verification.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-white">
                Step 4 of 4
              </span>
            </div>

            {/* Washer Partner Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWashers.map((washer) => {
                const isSelected = selectedWasherId === washer.id;

                return (
                  <div
                    key={washer.id}
                    onClick={() => setSelectedWasherId(washer.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600/15 border-emerald-400 shadow-[0_10px_35px_rgba(16,185,129,0.25)] scale-[1.01]'
                        : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Washer Avatar */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shrink-0 bg-slate-800">
                        <img
                          src={washer.avatar || '/images/washer_amit.jpg'}
                          alt={washer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-white">{washer.name}</h4>
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                                : 'border-white/20'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{washer.society || 'Assigned Society Route'}</span>
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <div className="flex items-center gap-1 font-bold text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            <span>{washer.rating || '4.98'}</span>
                            <span className="text-[10px] text-slate-400">
                              ({washer.reviewsCount || 120}+ reviews)
                            </span>
                          </div>

                          <div className="text-[11px] text-emerald-400 font-semibold">
                            {washer.completionRate || '100%'} on-time
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Partner Metadata Specs */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">
                          Morning Window
                        </span>
                        <span className="font-bold text-slate-200">
                          {washer.routeWindow || '06:30 AM – 09:30 AM'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">
                          Aadhaar KYC
                        </span>
                        <span className="font-bold text-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Partner</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                          : 'bg-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Assigned Partner' : 'Select Partner'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary Review Card */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Membership Summary
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Owner & Vehicles
                  </span>
                  <div className="font-bold text-white mt-0.5">{name || 'Car Owner'}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {vehicles.length} Vehicle{vehicles.length > 1 ? 's' : ''} (
                    {vehicles.map((v) => v.registration_number).join(', ')})
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Selected Plan
                  </span>
                  <div className="font-bold text-blue-400 mt-0.5">{selectedPlan.name}</div>
                  <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                    ₹{selectedPlan.monthlyBasePrice * vehicles.length}/mo • {selectedPlan.washesPerWeek}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Assigned Washer Partner
                  </span>
                  <div className="font-bold text-emerald-400 mt-0.5">{selectedWasher.name}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5 font-mono">
                    Route: {selectedWasher.routeWindow}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Choose Plan</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? 'Activating Membership & Syncing...'
                    : 'Activate Care Plan & View Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
