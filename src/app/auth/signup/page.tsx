'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  MapPin,
  Clock,
  Check,
  AlertCircle,
  Building2,
  Loader2,
  Layers,
  Calendar,
  Smartphone,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  fetchAllSocieties,
  FirestoreSociety,
  findCarOwnerByIdInFirestore,
  fetchCarOwnerVehiclesFromFirestore,
  fetchAllWashersFromFirestore,
  isWasherMatchForOwner,
  fetchDistrictSocietiesForOwner,
  WasherDistrictSociety,
} from '@/lib/firebaseService';
import { WasherPartner } from '@/lib/types';
import SearchableSelect from '@/components/common/SearchableSelect';
import {
  getStates,
  getCities,
  getDistricts,
  mergeFirestoreSocieties,
} from '@/lib/locationData';
import {
  getCarMakes,
  getCarModels,
  inferVehicleType,
  PREFERRED_COMPLETION_TIMES,
} from '@/lib/carData';

interface VehicleDraft {
  id: string;
  make: string;
  model: string;
  registration_number: string;
  type: 'car' | 'suv' | 'luxury' | 'bike';
  color: string;
  parking_location: string;
  preferred_wash_time: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { registerOwner, setUser, setVehicles, setRole, setIsLoggedIn, isLoggedIn, isHydrated, role } = useStore();

  // Redirect if already logged in
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

  // Stepper state: 1 = Google Auth, 2 = Cars, 3 = Society (Optional)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // -------------------------------------------------------------
  // STEP 1 STATE: Google Authentication
  // -------------------------------------------------------------
  const [googleUser, setGoogleUser] = useState<{
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
  } | null>(null);
  const [phone, setPhone] = useState('');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // -------------------------------------------------------------
  // STEP 2 STATE: Car Registration
  // -------------------------------------------------------------
  const [vehicles, setRegisteredVehicles] = useState<VehicleDraft[]>([]);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [preferredTime, setPreferredTime] = useState('07:30 AM');
  const [parkingLocation, setParkingLocation] = useState('');
  const [isAddingAnotherCar, setIsAddingAnotherCar] = useState(true);
  const [vehicleError, setVehicleError] = useState('');
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // Available car makes & models
  const carMakeOptions = useMemo(() => getCarMakes(), []);
  const carModelOptions = useMemo(() => getCarModels(vehicleMake), [vehicleMake]);

  // -------------------------------------------------------------
  // STEP 3 STATE: Society & Location Details (Optional)
  // -------------------------------------------------------------
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [firestoreSocieties, setFirestoreSocieties] = useState<FirestoreSociety[]>([]);
  const [availableWashers, setAvailableWashers] = useState<WasherPartner[]>([]);
  const [isLoadingSocieties, setIsLoadingSocieties] = useState(false);
  const [societyError, setSocietyError] = useState('');

  // Common societies serviced by washers in the selected district
  const [districtWasherSocieties, setDistrictWasherSocieties] = useState<WasherDistrictSociety[]>([]);
  const [isLoadingDistrictSocieties, setIsLoadingDistrictSocieties] = useState(false);

  // Helper converters for time input
  const get24HourTimeString = (time12: string) => {
    if (!time12) return '07:30';
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return '07:30';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const format24to12Hour = (time24: string) => {
    if (!time24) return '07:30 AM';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${mStr || '00'} ${suffix}`;
  };

  const handleUseDeviceTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
    setPreferredTime(formatted);
  };

  // Load Firestore societies and live washers
  useEffect(() => {
    let isMounted = true;
    async function loadSocietiesAndWashers() {
      setIsLoadingSocieties(true);
      try {
        const [socList, washersList] = await Promise.all([
          fetchAllSocieties(),
          fetchAllWashersFromFirestore(),
        ]);
        if (isMounted) {
          setFirestoreSocieties(socList);
          mergeFirestoreSocieties(socList);
          if (washersList && washersList.length > 0) {
            setAvailableWashers(washersList);
          }
        }
      } catch (err) {
        console.warn('Notice: Firestore societies or washers fetch in signup:', err);
      } finally {
        if (isMounted) setIsLoadingSocieties(false);
      }
    }
    loadSocietiesAndWashers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch common societies serviced by washers in the chosen district
  useEffect(() => {
    if (!selectedDistrict) {
      setDistrictWasherSocieties([]);
      return;
    }

    let isMounted = true;
    async function loadDistrictSocieties() {
      setIsLoadingDistrictSocieties(true);
      try {
        const societies = await fetchDistrictSocietiesForOwner({
          state: selectedState,
          city: selectedCity,
          district: selectedDistrict,
        });
        if (isMounted) {
          setDistrictWasherSocieties(societies);
        }
      } catch (err) {
        console.warn('Notice loading district washer societies in signup:', err);
      } finally {
        if (isMounted) setIsLoadingDistrictSocieties(false);
      }
    }

    loadDistrictSocieties();
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, selectedCity, selectedState, availableWashers]);

  // Live match check: if Washer and Owner have equal/common State, City, District, Society
  const matchedWasherPreview = useMemo(() => {
    if (!selectedState || !selectedCity || !selectedDistrict || !societyName) return null;
    const ownerLoc = {
      state: selectedState,
      city: selectedCity,
      district: selectedDistrict,
      society: societyName,
      societyName: societyName,
    };
    return availableWashers.find((w) => isWasherMatchForOwner(w, ownerLoc)) || null;
  }, [availableWashers, selectedState, selectedCity, selectedDistrict, societyName]);

  // Filter Firestore societies matching the selected state/city/district
  const matchingSocieties = useMemo(() => {
    if (!selectedState && !selectedCity && !selectedDistrict) return [];
    const washerSocList = districtWasherSocieties.map((d) => d.societyName);
    const catalogueList = firestoreSocieties
      .filter((s) => {
        const stMatch = !selectedState || s.state?.toLowerCase() === selectedState.toLowerCase();
        const ctMatch = !selectedCity || s.city?.toLowerCase() === selectedCity.toLowerCase();
        const dtMatch =
          !selectedDistrict || (s.district && s.district.toLowerCase() === selectedDistrict.toLowerCase());
        return stMatch && ctMatch && dtMatch;
      })
      .map((s) => s.name);

    return Array.from(new Set([...washerSocList, ...catalogueList]));
  }, [districtWasherSocieties, firestoreSocieties, selectedState, selectedCity, selectedDistrict]);

  // Dependent location options
  const stateOptions = useMemo(() => getStates(), []);
  const cityOptions = useMemo(() => getCities(selectedState), [selectedState]);
  const districtOptions = useMemo(
    () => getDistricts(selectedState, selectedCity),
    [selectedState, selectedCity]
  );

  // -------------------------------------------------------------
  // STEP 1 HANDLER: Google Sign In
  // -------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsGoogleSigningIn(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error('Google authentication cancelled or failed.');
      }

      const uid = user.uid;
      const displayName = user.displayName || user.email?.split('@')[0] || 'Car Owner';
      const email = user.email || '';
      const photoURL = user.photoURL || undefined;

      setGoogleUser({
        uid,
        displayName,
        email,
        photoURL,
      });

      // Check if this owner has already fully registered in Firestore
      try {
        const existingOwner = await findCarOwnerByIdInFirestore(uid);
        if (existingOwner) {
          const existingVehicles = await fetchCarOwnerVehiclesFromFirestore(uid);
          if (existingVehicles && existingVehicles.length > 0) {
            setUser({
              ...existingOwner,
              role: 'owner',
              status: 'active',
            });
            setVehicles(existingVehicles);
            setRole('owner');
            setIsLoggedIn(true);

            if (typeof window !== 'undefined') {
              localStorage.setItem('torque_logged_in', 'true');
              localStorage.setItem('torque_owner_name', existingOwner.name);
              localStorage.setItem('torque_owner_id', uid);
              localStorage.setItem('torque_user', JSON.stringify(existingOwner));
              localStorage.removeItem('torque_vehicles');
            }

            router.replace('/owner/dashboard');
            return;
          }
        }
      } catch (checkErr) {
        console.warn('Notice checking existing owner record:', checkErr);
      }

      // Move directly to Step 2: Cars
      setStep(2);
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Please tap "Continue with Google" to proceed.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Popup blocked by your browser. Please allow popups for this site.');
      } else {
        setAuthError(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2 HANDLER: Add Vehicle to Draft List
  // -------------------------------------------------------------
  const handleSaveCurrentVehicle = (): boolean => {
    setVehicleError('');

    if (!vehicleMake.trim()) {
      setVehicleError('Please select or specify your car make.');
      return false;
    }
    if (!vehicleModel.trim()) {
      setVehicleError('Please select or specify your car model.');
      return false;
    }
    const cleanPlate = registrationNumber.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
    if (cleanPlate.length < 5) {
      setVehicleError('Please enter a valid registration/license plate number.');
      return false;
    }

    const bodyType = inferVehicleType(vehicleMake, vehicleModel);
    const newVehicle: VehicleDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      make: vehicleMake.trim(),
      model: vehicleModel.trim(),
      registration_number: cleanPlate,
      type: bodyType,
      color: 'Pearl White',
      parking_location: parkingLocation.trim() || 'Assigned Parking Bay',
      preferred_wash_time: preferredTime || '07:30 AM',
    };

    setRegisteredVehicles((prev) => [...prev, newVehicle]);

    // Reset current vehicle form
    setVehicleMake('');
    setVehicleModel('');
    setRegistrationNumber('');
    setParkingLocation('');
    setIsAddingAnotherCar(false);
    return true;
  };

  const handleRemoveVehicle = (id: string) => {
    setRegisteredVehicles((prev) => prev.filter((v) => v.id !== id));
    if (vehicles.length <= 1) {
      setIsAddingAnotherCar(true);
    }
  };

  // Proceed to Step 3 (Society - Optional)
  const handleProceedToSociety = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVehicleError('');

    // If currently drafting a car, save it
    if (isAddingAnotherCar && (vehicleMake.trim() || vehicleModel.trim() || registrationNumber.trim())) {
      const added = handleSaveCurrentVehicle();
      if (!added) return;
    } else if (vehicles.length === 0) {
      setVehicleError('Please add at least 1 car to continue.');
      return;
    }

    setStep(3);
  };

  // -------------------------------------------------------------
  // FINAL SIGNUP HANDLER (Can be called from Cars OR Society)
  // -------------------------------------------------------------
  const handleCompleteSignup = async (skipSociety = false) => {
    setVehicleError('');
    setSocietyError('');

    let finalVehicles = [...vehicles];

    // If currently filling out a car in the form, validate & save it
    if (isAddingAnotherCar && (vehicleMake.trim() || vehicleModel.trim() || registrationNumber.trim())) {
      const added = handleSaveCurrentVehicle();
      if (!added) return;
      const cleanPlate = registrationNumber.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
      const bodyType = inferVehicleType(vehicleMake, vehicleModel);
      finalVehicles = [
        ...vehicles,
        {
          id: `draft_${Date.now()}`,
          make: vehicleMake.trim(),
          model: vehicleModel.trim(),
          registration_number: cleanPlate,
          type: bodyType,
          color: 'Pearl White',
          parking_location: parkingLocation.trim() || 'Assigned Parking Bay',
          preferred_wash_time: preferredTime || '07:30 AM',
        },
      ];
    }

    if (finalVehicles.length === 0) {
      setVehicleError('Please add at least 1 car to activate your daily morning tracking.');
      if (step !== 2) setStep(2);
      return;
    }

    setIsSubmittingFinal(true);

    try {
      const ownerUid = googleUser?.uid || `usr_${Date.now()}`;
      const ownerName = googleUser?.displayName || 'Car Owner';
      const ownerEmail = googleUser?.email || '';
      const formattedPhone = phone.trim() ? phone.trim() : '';

      const hasSociety = !skipSociety && societyName.trim().length > 0;
      const resolvedState = hasSociety ? selectedState.trim() : '';
      const resolvedCity = hasSociety ? selectedCity.trim() : '';
      const resolvedDistrict = hasSociety ? selectedDistrict.trim() : '';
      const resolvedSociety = hasSociety ? societyName.trim() : '';
      const resolvedFlat = hasSociety ? flatNumber.trim() : '';

      const fullSocietyDisplay = resolvedSociety
        ? [resolvedSociety, resolvedDistrict, resolvedCity].filter(Boolean).join(', ')
        : '';

      // Convert vehicles to store domain format (no subscription details)
      const storeVehicles = finalVehicles.map((v) => ({
        make: v.make,
        model: v.model,
        registration_number: v.registration_number,
        type: v.type,
        color: v.color,
        parking_location: v.parking_location,
        preferred_wash_time: v.preferred_wash_time,
        needWashBefore: v.preferred_wash_time,
      }));

      // Call store registerOwner (not a subscription-based product anymore)
      await registerOwner(
        {
          id: ownerUid,
          uid: ownerUid,
          name: ownerName,
          email: ownerEmail,
          phone: formattedPhone,
          state: resolvedState,
          city: resolvedCity,
          district: resolvedDistrict,
          society: fullSocietyDisplay,
          societyName: resolvedSociety,
          flatNumber: resolvedFlat,
          address: resolvedFlat && fullSocietyDisplay ? `${resolvedFlat}, ${fullSocietyDisplay}` : fullSocietyDisplay,
          needWashBefore: finalVehicles[0]?.preferred_wash_time || '07:30 AM',
          selectedWasherId: hasSociety ? (matchedWasherPreview?.id || '') : '',
          selectedWasherName: hasSociety ? (matchedWasherPreview?.name || '') : '',
        },
        storeVehicles as any
      );

      // Successfully registered -> navigate to Owner Dashboard
      setTimeout(() => {
        router.push('/owner/dashboard');
      }, 300);
    } catch (err: any) {
      console.error('Final signup error:', err);
      setVehicleError(err.message || 'Failed to complete registration. Please try again.');
      setIsSubmittingFinal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between selection:bg-[#2DD4A0] selection:text-black relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[#0A0D12] -z-20 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0A0D12]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center">
          <Link href="/" className="inline-flex items-center justify-center group hover:opacity-95 transition-opacity">
            <TorqueLogo emblemSize={42} />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* Stepper Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xs mx-auto mb-3">
            {[
              { num: 1, label: 'Google Auth' },
              { num: 2, label: 'Cars' },
              { num: 3, label: 'Society' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? 'bg-[#2DD4A0] text-black ring-4 ring-[#2DD4A0]/20'
                        : step > s.num
                        ? 'bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/40'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-mono uppercase tracking-wider ${
                      step === s.num ? 'text-[#2DD4A0] font-bold' : 'text-white/40'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 transition-all ${
                      step > idx + 1 ? 'bg-[#2DD4A0]' : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: Google Authentication */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="p-7 sm:p-10 rounded-3xl bg-[#11161D] border border-white/[0.08] shadow-2xl space-y-7 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Car Owner Registration
              </h1>
              <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                Connect your Google account to get verified morning care at your society parking bay with certified daily photos.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Sign-in Button */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSigningIn}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {isGoogleSigningIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: Cars (Option 2) */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="p-7 sm:p-10 rounded-3xl bg-[#11161D] border border-white/[0.08] shadow-2xl space-y-7 animate-in fade-in duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2DD4A0]">
                    Step 2 of 3 • Vehicle Registration
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Register Your Vehicle(s)
                  </h2>
                </div>

                {googleUser && (
                  <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt="Profile"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-[#2DD4A0]" />
                    )}
                    <span className="font-bold text-white max-w-[120px] truncate">
                      {googleUser.displayName}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4A0]" />
                  </div>
                )}
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                Add your car details, set your preferred morning wash completion time, and specify your washer&apos;s rest day.
              </p>
            </div>

            {vehicleError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{vehicleError}</span>
              </div>
            )}

            {/* List of Already Added Vehicles */}
            {vehicles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">
                  Registered Garage Vehicles ({vehicles.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 text-[#2DD4A0] flex items-center justify-center font-bold">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">
                            {v.make} {v.model}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-white/60 font-mono mt-0.5 flex-wrap">
                            <span className="text-[#2DD4A0] font-bold">{v.registration_number}</span>
                            <span>•</span>
                            <span>Ready by {v.preferred_wash_time}</span>
                            {v.parking_location && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{v.parking_location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(v.id)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form to Add Current / Another Vehicle */}
            {isAddingAnotherCar ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2DD4A0] flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span>{vehicles.length === 0 ? 'Vehicle #1 Details' : `Vehicle #${vehicles.length + 1} Details`}</span>
                  </h4>
                  {vehicles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAnotherCar(false)}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Car Make */}
                  <SearchableSelect
                    label="Car Make"
                    required
                    placeholder="Select Make (e.g. Maruti, Hyundai, Tata)"
                    searchPlaceholder="Search make..."
                    options={carMakeOptions}
                    value={vehicleMake}
                    allowCustom={true}
                    onChange={(val) => {
                      setVehicleMake(val);
                      setVehicleModel('');
                      setVehicleError('');
                    }}
                  />

                  {/* Car Model */}
                  <SearchableSelect
                    label="Car Model"
                    required
                    placeholder={vehicleMake ? 'Select or enter Model' : 'Select Make first'}
                    searchPlaceholder="Search model (e.g. Swift, Creta, Nexon)..."
                    options={carModelOptions}
                    value={vehicleModel}
                    allowCustom={true}
                    disabled={!vehicleMake}
                    disabledHint="Select Car Make first"
                    onChange={(val) => {
                      setVehicleModel(val);
                      setVehicleError('');
                    }}
                  />

                  {/* License Plate Number */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-2">
                      License / Registration Plate <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => {
                        setRegistrationNumber(e.target.value.toUpperCase());
                        setVehicleError('');
                      }}
                      placeholder="e.g. MH 02 AB 1234 or DL 10 CA 9999"
                      className="w-full px-4 py-3.5 bg-[#11161D] border border-white/[0.1] rounded-2xl text-sm font-semibold text-white placeholder-white/25 focus:outline-hidden focus:border-[#2DD4A0] focus:ring-1 focus:ring-[#2DD4A0]/30 transition-all font-mono tracking-wider uppercase"
                    />
                  </div>

                  {/* Preferred Completion Time Picker with Custom Input & Local Device Time */}
                  <div className="sm:col-span-2 space-y-3 pt-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-white/80 uppercase tracking-wider block flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#2DD4A0]" />
                        Preferred Wash Completion Time
                      </label>

                      {/* Use Local Device Time Button */}
                      <button
                        type="button"
                        onClick={handleUseDeviceTime}
                        className="px-3 py-1.5 rounded-xl bg-[#2DD4A0]/15 hover:bg-[#2DD4A0]/25 border border-[#2DD4A0]/40 text-[#2DD4A0] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Set time to current device clock"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Use Local Device Time</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      {/* Native 24-hr Time Input allowing full custom time entry */}
                      <div className="sm:col-span-1">
                        <input
                          type="time"
                          value={get24HourTimeString(preferredTime)}
                          onChange={(e) => {
                            if (e.target.value) {
                              setPreferredTime(format24to12Hour(e.target.value));
                            }
                          }}
                          className="w-full px-4 py-3 bg-[#11161D] border border-white/[0.1] rounded-2xl text-sm font-mono font-bold text-white focus:outline-hidden focus:border-[#2DD4A0] focus:ring-1 focus:ring-[#2DD4A0]/30 transition-all"
                        />
                      </div>

                      {/* Quick preset chips */}
                      <div className="sm:col-span-2 flex flex-wrap gap-1.5 items-center">
                        {PREFERRED_COMPLETION_TIMES.slice(0, 5).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setPreferredTime(t)}
                            className={`px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                              preferredTime === t
                                ? 'bg-[#2DD4A0] text-black font-black shadow-[0_0_12px_rgba(45,212,160,0.3)]'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-white/40 block">
                      Currently set to: <strong className="text-[#2DD4A0] font-mono">{preferredTime}</strong>. Wash will be completed before this time every morning.
                    </span>
                  </div>


                  {/* Optional Tower / Parking location */}
                  <div className="sm:col-span-2 pt-2">
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-2">
                      Tower / Block / Parking Spot <span className="text-white/40 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={parkingLocation}
                      onChange={(e) => setParkingLocation(e.target.value)}
                      placeholder="e.g. Tower 3, Basement 1, Bay 14"
                      className="w-full px-4 py-3.5 bg-[#11161D] border border-white/[0.1] rounded-2xl text-sm font-semibold text-white placeholder-white/25 focus:outline-hidden focus:border-[#2DD4A0] focus:ring-1 focus:ring-[#2DD4A0]/30 transition-all"
                    />
                  </div>
                </div>

                {/* Add current vehicle button if already has at least 1 car */}
                {vehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveCurrentVehicle}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Save this Vehicle to Garage
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingAnotherCar(true)}
                className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-white/20 hover:border-[#2DD4A0] text-[#2DD4A0] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#2DD4A0]/5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Register Another Vehicle to Garage</span>
              </button>
            )}

            {/* Stepper Buttons */}
            <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] flex-wrap">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 text-xs font-bold text-white/60 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2.5 sm:gap-3 ml-auto flex-wrap">
                {/* Skip Society & Finish Direct */}
                <button
                  type="button"
                  onClick={() => handleCompleteSignup(true)}
                  disabled={isSubmittingFinal}
                  className="px-4 sm:px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer disabled:opacity-50"
                >
                  Skip Society & Finish
                </button>

                {/* Continue to Society (Optional) */}
                <button
                  type="button"
                  onClick={handleProceedToSociety}
                  className="px-5 sm:px-7 py-3.5 rounded-2xl bg-[#2DD4A0] hover:bg-[#25ba8c] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(45,212,160,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <span>Society (Optional)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: Society & Location Details (Option 3 - Optional) */}
        {/* ========================================================= */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCompleteSignup(false);
            }}
            className="p-7 sm:p-10 rounded-3xl bg-[#11161D] border border-white/[0.08] shadow-2xl space-y-7 animate-in fade-in duration-200"
          >
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2DD4A0]">
                      Step 3 of 3 • Building Location
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      Optional
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                    Select Your Society Route
                  </h2>
                </div>

                <div className="px-3 py-1 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-xs font-mono font-bold text-[#2DD4A0]">
                  {vehicles.length + (isAddingAnotherCar && registrationNumber ? 1 : 0)} Car(s) Configured
                </div>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                Registering your society is completely optional. Adding it connects you with certified washers active in your apartment complex. You can skip this step and start using your dashboard right away.
              </p>
            </div>

            {societyError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{societyError}</span>
              </div>
            )}

            {/* Dependent Searchable Selects */}
            <div className="space-y-5">
              {/* 1. STATE */}
              <SearchableSelect
                label="1. State (Optional)"
                icon={<MapPin className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                placeholder="Select State"
                searchPlaceholder="Search state (e.g. Maharashtra, Karnataka)..."
                options={stateOptions}
                value={selectedState}
                onChange={(val) => {
                  setSelectedState(val);
                  setSelectedCity('');
                  setSelectedDistrict('');
                  setSocietyName('');
                  setSocietyError('');
                }}
              />

              {/* 2. CITY */}
              <SearchableSelect
                label="2. City (Optional)"
                icon={<Building2 className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                placeholder={selectedState ? 'Select City' : 'Select a State first (Optional)'}
                searchPlaceholder="Search city (e.g. Mumbai, Bengaluru, Pune)..."
                options={cityOptions}
                value={selectedCity}
                disabled={!selectedState}
                disabledHint="Select a State first"
                onChange={(val) => {
                  setSelectedCity(val);
                  setSelectedDistrict('');
                  setSocietyName('');
                  setSocietyError('');
                }}
              />

              {/* 3. DISTRICT / LOCALITY */}
              <SearchableSelect
                label="3. District / Locality (Optional)"
                icon={<Layers className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                placeholder={selectedCity ? 'Select District / Area' : 'Select a City first (Optional)'}
                searchPlaceholder="Search district (e.g. Whitefield, Andheri West, Hinjawadi)..."
                options={districtOptions}
                value={selectedDistrict}
                disabled={!selectedCity}
                disabledHint="Select a City first"
                onChange={(val) => {
                  setSelectedDistrict(val);
                  setSocietyName('');
                  setSocietyError('');
                }}
              />

              {/* COMMON SOCIETIES SERVICED BY WASHERS IN SELECTED DISTRICT */}
              {selectedDistrict && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#141B24] to-[#10151E] border border-emerald-500/30 space-y-3 shadow-md animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2DD4A0]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                        Washers Active in {selectedDistrict}
                      </span>
                    </div>
                    {isLoadingDistrictSocieties ? (
                      <span className="text-[10px] text-white/50 flex items-center gap-1 font-mono">
                        <Loader2 className="w-3 h-3 animate-spin text-[#2DD4A0]" /> Checking routes...
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/30">
                        {districtWasherSocieties.length} Common {districtWasherSocieties.length === 1 ? 'Society' : 'Societies'}
                      </span>
                    )}
                  </div>

                  {districtWasherSocieties.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-white/70">
                        Washers already service these societies in your district. Click any society to select it:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 max-h-44 overflow-y-auto">
                        {districtWasherSocieties.map((ws) => {
                          const isCurrent =
                            societyName.trim().toLowerCase() === ws.societyName.toLowerCase();
                          return (
                            <button
                              key={ws.societyName}
                              type="button"
                              onClick={() => {
                                setSocietyName(ws.societyName);
                                setSocietyError('');
                              }}
                              className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#2DD4A0]/25 border-[#2DD4A0] text-white shadow-[0_0_14px_rgba(45,212,160,0.3)]'
                                  : 'bg-[#18202C] hover:bg-[#1E2838] border-white/10 text-slate-200 hover:border-emerald-500/40'
                              }`}
                            >
                              <Building2
                                className={`w-3.5 h-3.5 ${
                                  isCurrent ? 'text-[#2DD4A0]' : 'text-slate-400'
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate">
                                  {ws.societyName}
                                </span>
                                <span className="text-[10px] text-emerald-300/90 block font-mono">
                                  Specialist: {ws.washerName}
                                </span>
                              </div>
                              {isCurrent && (
                                <Check className="w-3.5 h-3.5 text-[#2DD4A0] ml-1 shrink-0 stroke-[3]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : !isLoadingDistrictSocieties ? (
                    <p className="text-xs text-white/50 leading-relaxed">
                      No washer currently registered specifically for {selectedDistrict}. You can enter your society name below.
                    </p>
                  ) : null}
                </div>
              )}

              {/* 4. SOCIETY NAME */}
              <SearchableSelect
                label="4. Society / Apartment Complex (Optional)"
                icon={<Home className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                placeholder={selectedDistrict ? 'Select or type Society Name' : 'Select or type Society Name'}
                searchPlaceholder="Type society name (e.g. Green Valley Residency, Prestige Falcon)..."
                options={matchingSocieties}
                value={societyName}
                allowCustom={true}
                disabledHint="Select a District first"
                onChange={(val) => {
                  setSocietyName(val);
                  setSocietyError('');
                }}
              />

              {/* 5. Flat / Tower / Bay */}
              <div>
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-2">
                  Flat / Tower / Bay <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="e.g. Tower B, Flat 402, Basement Bay 14"
                  className="w-full px-4 py-3.5 bg-[#11161D] border border-white/[0.1] rounded-2xl text-sm font-semibold text-white placeholder-white/25 focus:outline-hidden focus:border-[#2DD4A0] focus:ring-1 focus:ring-[#2DD4A0]/30 transition-all"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#2DD4A0]" />
                  Mobile Number <span className="text-white/40 font-normal">(For morning wash SMS / WhatsApp alerts - Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98101 23456"
                  className="w-full px-4 py-3.5 bg-[#11161D] border border-white/[0.1] rounded-2xl text-sm font-semibold text-white placeholder-white/25 focus:outline-hidden focus:border-[#2DD4A0] focus:ring-1 focus:ring-[#2DD4A0]/30 transition-all font-mono"
                />
              </div>
            </div>

            {/* LIVE MATCHED WASHER PREVIEW BANNER */}
            {matchedWasherPreview ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2DD4A0]/15 via-[#162325]/80 to-[#11161D] border border-[#2DD4A0]/40 flex items-center justify-between gap-3 shadow-xl animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/20 border border-[#2DD4A0]/40 flex items-center justify-center text-[#2DD4A0] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#2DD4A0] font-bold tracking-wider">
                      Location & Society Match Found!
                    </div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Dedicated Specialist: <strong>{matchedWasherPreview.name}</strong></span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/30 font-mono">
                        Active in {societyName}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-0.5">
                      This certified partner will automatically be linked to your doorstep morning car care route.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Stepper Buttons */}
            <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] flex-wrap">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 text-xs font-bold text-white/60 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Cars</span>
              </button>

              <div className="flex items-center gap-2.5 sm:gap-3 ml-auto flex-wrap">
                {/* Skip Society Button */}
                <button
                  type="button"
                  onClick={() => handleCompleteSignup(true)}
                  disabled={isSubmittingFinal}
                  className="px-4 sm:px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer disabled:opacity-50"
                >
                  Skip Society & Finish
                </button>

                {/* Submit Final Button */}
                <button
                  type="submit"
                  disabled={isSubmittingFinal}
                  className="px-6 sm:px-8 py-3.5 rounded-2xl bg-[#2DD4A0] hover:bg-[#25ba8c] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(45,212,160,0.35)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingFinal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Activating Garage...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup & Open Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#0A0D12] py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-xs text-white/40">
          Torque Care • Water-Conscious Morning Vehicle Care Network
        </div>
      </footer>
    </div>
  );
}
