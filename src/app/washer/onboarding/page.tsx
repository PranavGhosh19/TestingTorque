'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Check,
  Users,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  syncWasherToFirestore,
  fetchAllSocieties,
  FirestoreSociety,
  createSociety,
  fetchDistrictSocietiesForWasher,
  OwnerDistrictSociety,
} from '@/lib/firebaseService';
import { syncAuthUserToFirestore } from '@/lib/firebaseAuth';
import { WasherPartner } from '@/lib/types';
import {
  getStates,
  getCities,
  getDistricts,
} from '@/lib/locationData';
import SearchableSelect from '@/components/common/SearchableSelect';

function WasherOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole, setUser, washers, setWashers, setIsLoggedIn, user } = useStore();

  const phoneParam = searchParams.get('phone') || user?.phone || '';
  const uidParam = searchParams.get('uid') || user?.uid || user?.id || '';

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(phoneParam || '+91 98765 43210');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSocieties, setSelectedSocieties] = useState<string[]>([]);
  const [customSocietyInput, setCustomSocietyInput] = useState('');

  // Societies catalog from Firestore
  const [firestoreSocieties, setFirestoreSocieties] = useState<FirestoreSociety[]>([]);
  const [isLoadingSocieties, setIsLoadingSocieties] = useState(false);

  // Common societies registered by car owners in selected district
  const [districtOwnerSocieties, setDistrictOwnerSocieties] = useState<OwnerDistrictSociety[]>([]);
  const [isLoadingOwnerSocieties, setIsLoadingOwnerSocieties] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync phone from params or store on mount
  useEffect(() => {
    if (phoneParam) {
      setPhone(phoneParam);
    } else if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('torque_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.phone) setPhone(parsed.phone);
        } catch {}
      }
    }
  }, [phoneParam]);

  // Load societies from Firestore
  const loadSocieties = useCallback(async () => {
    setIsLoadingSocieties(true);
    try {
      const data = await fetchAllSocieties();
      setFirestoreSocieties(data);
    } catch (err) {
      console.warn('Failed to load societies:', err);
    } finally {
      setIsLoadingSocieties(false);
    }
  }, []);

  useEffect(() => {
    loadSocieties();
  }, [loadSocieties]);

  // Fetch common societies where car owners are registered in the chosen district
  useEffect(() => {
    if (!selectedDistrict) {
      setDistrictOwnerSocieties([]);
      return;
    }

    let isMounted = true;
    async function loadDistrictOwnerSocieties() {
      setIsLoadingOwnerSocieties(true);
      try {
        const societies = await fetchDistrictSocietiesForWasher({
          state: selectedState,
          city: selectedCity,
          district: selectedDistrict,
        });
        if (isMounted) {
          setDistrictOwnerSocieties(societies);
        }
      } catch (err) {
        console.warn('Notice loading district owner societies for washer:', err);
      } finally {
        if (isMounted) setIsLoadingOwnerSocieties(false);
      }
    }

    loadDistrictOwnerSocieties();
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, selectedCity, selectedState]);

  // Dependent Location Options
  const stateOptions = useMemo(() => getStates(), []);

  const cityOptions = useMemo(() => {
    if (!selectedState) return [];
    return getCities(selectedState);
  }, [selectedState]);

  const districtOptions = useMemo(() => {
    if (!selectedState || !selectedCity) return [];
    return getDistricts(selectedState, selectedCity);
  }, [selectedState, selectedCity]);

  // Societies matching current location filter (prioritizes common societies with registered car owners)
  const suggestedSocieties = useMemo(() => {
    const list: string[] = [];

    // 0. Common societies with registered car owners in this district
    districtOwnerSocieties.forEach((os) => {
      if (os.societyName && !list.includes(os.societyName)) {
        list.push(os.societyName);
      }
    });

    // 1. From Firestore matching state/city/district
    firestoreSocieties.forEach((soc) => {
      const matchState = !selectedState || soc.state?.toLowerCase() === selectedState.toLowerCase();
      const matchCity = !selectedCity || soc.city?.toLowerCase() === selectedCity.toLowerCase();
      const matchDistrict = !selectedDistrict || soc.district?.toLowerCase() === selectedDistrict.toLowerCase();

      if (matchState && matchCity && matchDistrict && soc.name) {
        if (!list.includes(soc.name)) {
          list.push(soc.name);
        }
      }
    });

    // 2. Default popular societies if list is sparse
    const defaults = [
      'Prestige Lakeside Habitat',
      'Sobha Dream Acres',
      'Godrej Eternity',
      'Palm Meadows',
      'Brigade Millennium',
      'Hiranandani Gardens',
      'Purva Westend',
      'Lodha Park',
      'Tata Promont',
      'DLF Phase 5',
    ];

    defaults.forEach((def) => {
      if (!list.includes(def)) {
        list.push(def);
      }
    });

    return list;
  }, [districtOwnerSocieties, firestoreSocieties, selectedState, selectedCity, selectedDistrict]);

  // Toggle society selection
  const handleToggleSociety = (societyName: string) => {
    const trimmed = societyName.trim();
    if (!trimmed) return;
    setError('');

    setSelectedSocieties((prev) => {
      if (prev.includes(trimmed)) {
        return prev.filter((s) => s !== trimmed);
      } else {
        return [...prev, trimmed];
      }
    });
  };

  // Remove society chip
  const handleRemoveSociety = (societyName: string) => {
    setSelectedSocieties((prev) => prev.filter((s) => s !== societyName));
  };

  // Add custom typed society
  const handleAddCustomSociety = async () => {
    const name = customSocietyInput.trim();
    if (!name) return;

    if (selectedSocieties.includes(name)) {
      setCustomSocietyInput('');
      return;
    }

    // Add to selected societies
    setSelectedSocieties((prev) => [...prev, name]);
    setCustomSocietyInput('');

    // Persist new society to Firestore catalog if location selected
    if (selectedState && selectedCity) {
      try {
        await createSociety({
          name: name,
          state: selectedState,
          city: selectedCity,
          district: selectedDistrict || 'General Locality',
          createdBy: uidParam || 'washer-onboarded',
        });
        loadSocieties();
      } catch (err) {
        console.warn('Could not auto-create society in catalog:', err);
      }
    }
  };

  // Submit Profile Setup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full legal name.');
      return;
    }

    if (!selectedState) {
      setError('Please select your State.');
      return;
    }

    if (!selectedCity) {
      setError('Please select your City.');
      return;
    }

    if (!selectedDistrict) {
      setError('Please select your District / Locality.');
      return;
    }

    if (selectedSocieties.length === 0) {
      setError('Please add or select at least one assigned Society.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanDigits = phone.replace(/\D/g, '').slice(-10);
      const washerId = uidParam || `w_${cleanDigits || Date.now()}`;
      const phoneWithCountry = phone.includes('+91') ? phone : `+91 ${cleanDigits}`;
      const primarySociety = selectedSocieties.join(', ');

      // 1. Build WasherPartner Record
      const washerRecord: WasherPartner = {
        id: washerId,
        name: fullName.trim(),
        phone: phoneWithCountry,
        state: selectedState,
        city: selectedCity,
        district: selectedDistrict,
        societies: selectedSocieties,
        society: primarySociety,
        status: 'Active on Route',
        avatar: '/images/washer_amit.jpg',
        rating: '5.0',
        reviewsCount: 1,
        assignedCarsPerDay: 30,
        routeWindow: '06:30 AM - 09:30 AM',
        avgTimePerCar: '5.5 mins',
        completionRate: '100%',
        totalLifetimeWashes: 0,
        kyc: 'Verified (Phone OTP)',
        absentThisMonth: 0,
        absentDates: [],
        leaveReason: '',
        backupWasherName: '',
        monthlyPayoutsGone: 0,
        pendingPayoutDue: 0,
        sundayBonusEarned: 0,
        disbursements: [],
        passwordSet: true,
        hasPassword: true,
        created_at: new Date().toISOString(),
        firebaseUid: uidParam || washerId,
      };

      // 2. Save directly to Firestore Washers & washer_directory
      await syncWasherToFirestore(washerRecord);

      // 3. Write Auth User Identity document
      await syncAuthUserToFirestore(
        { uid: washerId, phoneNumber: phoneWithCountry },
        {
          name: fullName.trim(),
          role: 'washer',
          status: 'active',
          washerId: washerId,
          state: selectedState,
          city: selectedCity,
          district: selectedDistrict,
          societies: selectedSocieties,
          society: primarySociety,
        }
      );

      // 4. Update Zustand Store
      setRole('washer');
      setWashers((prev) => {
        const idx = prev.findIndex(
          (w) => w.id === washerId || (w.phone && w.phone.replace(/\D/g, '').endsWith(cleanDigits))
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...washerRecord };
          return updated;
        }
        return [...prev, washerRecord];
      });

      // 5. Update logged-in user profile
      const washerUser = {
        id: washerId,
        uid: washerId,
        name: fullName.trim(),
        phone: phoneWithCountry,
        role: 'washer' as const,
        avatar_url: '/images/washer_amit.jpg',
        status: 'active' as const,
        hasPassword: true,
        passwordSet: true,
        created_at: washerRecord.created_at || new Date().toISOString(),
      };

      setUser(washerUser);
      setIsLoggedIn(true);

      // 6. Update local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_user', JSON.stringify(washerUser));
        localStorage.setItem('torque_washer_id', washerId);
        localStorage.setItem('torque_washer_name', fullName.trim());
        localStorage.setItem('torque_washer_has_password', 'true');
        localStorage.setItem('torque_washer_password_set', 'true');
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/washer/dashboard');
      }, 800);
    } catch (err: any) {
      console.error('Failed to complete washer onboarding:', err);
      setError(err?.message || 'Failed to save details to Firestore. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-12 selection:bg-emerald-500 selection:text-black relative">
      {/* Background Glow */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />

      <div className="w-full max-w-xl space-y-6 text-center">
        {/* Header Badge */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Step 2: Partner Profile & Route Setup
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Complete Your Partner Details
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Add your name and assigned operational location to start managing your daily morning car wash routes.
          </p>
        </div>

        {/* Main Onboarding Card */}
        <div className="p-7 sm:p-9 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Partner profile saved successfully! Navigating to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number (Verified Read-Only) */}
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                Mobile Number
              </label>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-sm font-bold text-white tracking-wider">
                    {phone}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                </span>
              </div>
            </div>

            {/* 1. Full Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                Full Name <span className="text-emerald-400">*</span>
              </label>
              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                <div className="pl-3 pr-2 text-slate-400">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your legal full name (e.g. Ramesh Kumar)"
                  className="w-full bg-transparent px-2 py-1.5 text-sm font-bold text-white focus:outline-hidden"
                  autoFocus
                />
              </div>
            </div>

            {/* Location Hierarchy: State -> City -> District */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold block">
                Operational Location
              </span>

              {/* State Dropdown */}
              <SearchableSelect
                label="1. State"
                required
                icon={<MapPin className="w-4 h-4 text-emerald-400" />}
                placeholder="Select State"
                searchPlaceholder="Search state (e.g. Maharashtra, Karnataka)..."
                options={stateOptions}
                value={selectedState}
                onChange={(val) => {
                  setSelectedState(val);
                  setSelectedCity('');
                  setSelectedDistrict('');
                  setSelectedSocieties([]);
                  if (error) setError('');
                }}
              />

              {/* City Dropdown */}
              <SearchableSelect
                label="2. City"
                required
                icon={<Building2 className="w-4 h-4 text-emerald-400" />}
                placeholder={selectedState ? 'Select City' : 'Select a State first'}
                searchPlaceholder="Search city (e.g. Mumbai, Bengaluru, Pune)..."
                options={cityOptions}
                value={selectedCity}
                disabled={!selectedState}
                disabledHint="Select a State first"
                onChange={(val) => {
                  setSelectedCity(val);
                  setSelectedDistrict('');
                  setSelectedSocieties([]);
                  if (error) setError('');
                }}
              />

              {/* District / Locality Dropdown */}
              <SearchableSelect
                label="3. District / Locality"
                required
                icon={<MapPin className="w-4 h-4 text-emerald-400" />}
                placeholder={selectedCity ? 'Select District / Area' : 'Select a City first'}
                searchPlaceholder="Search district (e.g. Whitefield, Andheri West, Hinjawadi)..."
                options={districtOptions}
                value={selectedDistrict}
                disabled={!selectedCity}
                disabledHint="Select a City first"
                onChange={(val) => {
                  setSelectedDistrict(val);
                  if (error) setError('');
                }}
              />
            </div>

            {/* Multiple Societies Selection & Add */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                    4. Assigned Societies (Multiple) <span className="text-emerald-400">*</span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Select or add all gated societies you will service on your morning route.
                  </p>
                </div>
                {selectedSocieties.length > 0 && (
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedSocieties.length} Selected
                  </span>
                )}
              </div>

              {/* Selected Societies Chips */}
              {selectedSocieties.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  {selectedSocieties.map((socName) => (
                    <span
                      key={socName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-xs animate-in zoom-in-95 duration-150"
                    >
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{socName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSociety(socName)}
                        className="ml-1 p-0.5 rounded-md hover:bg-emerald-500/30 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                        title={`Remove ${socName}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* COMMON SOCIETIES WITH REGISTERED CAR OWNERS IN DISTRICT */}
              {selectedDistrict && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#121A25] to-[#0D121B] border border-emerald-500/30 space-y-3 shadow-md animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                        Car Owners Waiting in {selectedDistrict}
                      </span>
                    </div>
                    {isLoadingOwnerSocieties ? (
                      <span className="text-[10px] text-white/50 flex items-center gap-1 font-mono">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> Checking demand...
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {districtOwnerSocieties.length} Common {districtOwnerSocieties.length === 1 ? 'Society' : 'Societies'}
                      </span>
                    )}
                  </div>

                  {districtOwnerSocieties.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Car owners are already registered in these societies. Click to add them to your morning route:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto">
                        {districtOwnerSocieties.map((os) => {
                          const isSelected = selectedSocieties.includes(os.societyName);
                          return (
                            <button
                              key={os.societyName}
                              type="button"
                              onClick={() => handleToggleSociety(os.societyName)}
                              className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_14px_rgba(45,212,160,0.35)]'
                                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white hover:border-emerald-500/40'
                              }`}
                            >
                              <Building2
                                className={`w-3.5 h-3.5 ${
                                  isSelected ? 'text-black' : 'text-emerald-400'
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold block truncate">{os.societyName}</span>
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                                      isSelected
                                        ? 'bg-black/20 text-black'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    }`}
                                  >
                                    ⚡ {os.ownerCount} {os.ownerCount === 1 ? 'Owner' : 'Owners'}
                                  </span>
                                </div>
                                {os.ownerNames.length > 0 && (
                                  <span
                                    className={`text-[10px] block truncate ${
                                      isSelected ? 'text-black/80' : 'text-slate-400'
                                    }`}
                                  >
                                    {os.ownerNames.slice(0, 2).join(', ')}
                                    {os.ownerNames.length > 2 ? '...' : ''}
                                  </span>
                                )}
                              </div>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-black ml-auto shrink-0 stroke-[3]" />
                              ) : (
                                <Plus className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : !isLoadingOwnerSocieties ? (
                    <p className="text-xs text-white/50 leading-relaxed">
                      No registered car owners in {selectedDistrict} yet. You can still select or add your operational societies below.
                    </p>
                  ) : null}
                </div>
              )}

              {/* Suggested Societies Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Quick Select Suggested Societies
                </span>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 rounded-2xl bg-black/20 border border-white/5 scrollbar-thin">
                  {suggestedSocieties.map((sName) => {
                    const isSelected = selectedSocieties.includes(sName);
                    return (
                      <button
                        key={sName}
                        type="button"
                        onClick={() => handleToggleSociety(sName)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <Plus className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{sName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Society Add Input */}
              <div className="pt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Can&apos;t find your society? Add custom name:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center rounded-xl border border-white/15 bg-white/5 p-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                    <Building2 className="w-4 h-4 text-slate-400 ml-2 mr-1 shrink-0" />
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
                      placeholder="Type custom society name..."
                      className="w-full bg-transparent px-2 py-1 text-xs font-bold text-white focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomSociety}
                    disabled={!customSocietyInput.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-all border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Save & Complete Button */}
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Details to Firestore...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Profile Saved! Opening Dashboard...</span>
                </>
              ) : (
                <>
                  <span>Save Details & Start Route</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function WasherOnboardingPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading profile setup...</div>}>
      <WasherOnboardingContent />
    </Suspense>
  );
}
