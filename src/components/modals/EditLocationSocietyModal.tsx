'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building2,
  X,
  Check,
  Sparkles,
  Loader2,
  ShieldCheck,
  AlertCircle,
  User,
  CheckCircle2,
  Home,
  Layers,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  getStates,
  getCities,
  getDistricts,
} from '@/lib/locationData';
import {
  fetchAllSocieties,
  FirestoreSociety,
  fetchAllWashersFromFirestore,
  updateOwnerLocationInFirestore,
  isWasherMatchForOwner,
  fetchDistrictSocietiesForOwner,
  WasherDistrictSociety,
} from '@/lib/firebaseService';
import SearchableSelect from '@/components/common/SearchableSelect';
import { WasherPartner, User as UserType } from '@/lib/types';

interface EditLocationSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedUser: UserType, matchedWasher: WasherPartner | null) => void;
}

export default function EditLocationSocietyModal({
  isOpen,
  onClose,
  onSaved,
}: EditLocationSocietyModalProps) {
  const { user, setUser, vehicles, setVehicles, washers } = useStore();

  const [selectedState, setSelectedState] = useState(user.state || '');
  const [selectedCity, setSelectedCity] = useState(user.city || '');
  const [selectedDistrict, setSelectedDistrict] = useState(user.district || '');
  const [societyName, setSocietyName] = useState(user.societyName || user.society || '');
  const [flatNumber, setFlatNumber] = useState(user.flat || user.flatNumber || '');

  // Firestore societies catalogue
  const [firestoreSocieties, setFirestoreSocieties] = useState<FirestoreSociety[]>([]);
  const [isLoadingSocieties, setIsLoadingSocieties] = useState(false);

  // Live Washers for matching
  const [liveWashers, setLiveWashers] = useState<WasherPartner[]>([]);
  const [isLoadingWashers, setIsLoadingWashers] = useState(false);

  // Common societies serviced by washers in the selected district
  const [districtWasherSocieties, setDistrictWasherSocieties] = useState<WasherDistrictSociety[]>([]);
  const [isLoadingDistrictSocieties, setIsLoadingDistrictSocieties] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize form state from user props whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedState(user.state || 'Maharashtra');
      setSelectedCity(user.city || 'Mumbai');
      setSelectedDistrict(user.district || 'Andheri West');
      const cleanSoc = user.societyName || (user.society ? user.society.split(',')[0].trim() : '');
      setSocietyName(cleanSoc);
      setFlatNumber(user.flat || user.flatNumber || '');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, user]);

  // Load Societies and Washers from Firestore
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadData() {
      setIsLoadingSocieties(true);
      setIsLoadingWashers(true);
      try {
        const [socList, washersList] = await Promise.all([
          fetchAllSocieties(),
          fetchAllWashersFromFirestore(),
        ]);
        if (isMounted) {
          setFirestoreSocieties(socList);
          setLiveWashers(washersList.length > 0 ? washersList : washers);
        }
      } catch (err) {
        console.warn('Notice loading modal data:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSocieties(false);
          setIsLoadingWashers(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, washers]);

  // Fetch common societies serviced by washers in the chosen district
  useEffect(() => {
    if (!isOpen || !selectedDistrict) {
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
        console.warn('Notice loading district washer societies:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDistrictSocieties(false);
        }
      }
    }

    loadDistrictSocieties();
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedDistrict, selectedCity, selectedState, liveWashers]);

  // Dependent Location Options
  const stateOptions = useMemo(() => getStates(), []);
  const cityOptions = useMemo(() => getCities(selectedState), [selectedState]);
  const districtOptions = useMemo(
    () => getDistricts(selectedState, selectedCity),
    [selectedState, selectedCity]
  );

  // Societies matching current State/City/District (prioritizes common societies serviced by washers)
  const matchingSocieties = useMemo(() => {
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

    // Common washer-serviced societies appear first, followed by catalogue
    return Array.from(new Set([...washerSocList, ...catalogueList]));
  }, [districtWasherSocieties, firestoreSocieties, selectedState, selectedCity, selectedDistrict]);

  // Real-time matched washer check
  const matchedWasher = useMemo(() => {
    if (!societyName.trim()) return null;
    const testLocation = {
      state: selectedState,
      city: selectedCity,
      district: selectedDistrict,
      society: societyName.trim(),
      societyName: societyName.trim(),
    };

    const pool = liveWashers.length > 0 ? liveWashers : washers;
    return pool.find((w) => isWasherMatchForOwner(w, testLocation)) || null;
  }, [societyName, selectedState, selectedCity, selectedDistrict, liveWashers, washers]);

  // Form submission handler
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedState) {
      setError('Please select your State.');
      return;
    }
    if (!selectedCity) {
      setError('Please select your City.');
      return;
    }
    if (!selectedDistrict) {
      setError('Please select your District / Area.');
      return;
    }
    if (!societyName.trim() || societyName.trim().length < 2) {
      setError('Please select or enter your Society Name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanSocName = societyName.trim();
      const fullSocietyString = `${cleanSocName}, ${selectedDistrict.trim()}, ${selectedCity.trim()}`;

      const ownerId =
        user.id ||
        user.uid ||
        (typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') || 'usr_owner' : 'usr_owner');

      // Update in Firestore
      const res = await updateOwnerLocationInFirestore(ownerId, {
        state: selectedState,
        city: selectedCity,
        district: selectedDistrict,
        society: fullSocietyString,
        societyName: cleanSocName,
        flat: flatNumber.trim(),
        flatNumber: flatNumber.trim(),
      });

      const effectiveWasher = res.matchedWasher || matchedWasher;

      // Update store user state
      const updatedUser: UserType = {
        ...user,
        state: selectedState,
        city: selectedCity,
        district: selectedDistrict,
        society: fullSocietyString,
        societyName: cleanSocName,
        flat: flatNumber.trim(),
        flatNumber: flatNumber.trim(),
        address: flatNumber.trim() ? `${flatNumber.trim()}, ${fullSocietyString}` : fullSocietyString,
        assigned_washer_id: effectiveWasher?.id || user.assigned_washer_id,
        assigned_washer_name: effectiveWasher?.name || user.assigned_washer_name,
        selectedWasherId: effectiveWasher?.id || user.selectedWasherId,
        selectedWasherName: effectiveWasher?.name || user.selectedWasherName,
      };

      setUser(updatedUser);

      // Update vehicles in store
      if (vehicles.length > 0) {
        setVehicles(
          vehicles.map((v) => ({
            ...v,
            society_name: cleanSocName,
            assigned_washer_id: effectiveWasher?.id || v.assigned_washer_id,
            assigned_washer_name: effectiveWasher?.name || v.assigned_washer_name,
          }))
        );
      }

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_user', JSON.stringify(updatedUser));
        if (effectiveWasher) {
          localStorage.setItem('torque_assigned_washer_id', effectiveWasher.id);
          localStorage.setItem('torque_assigned_washer_name', effectiveWasher.name);
        }
      }

      setSuccess(true);

      setTimeout(() => {
        if (onSaved) onSaved(updatedUser, effectiveWasher);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Save location error:', err);
      setError(err?.message || 'Failed to update location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-lg bg-[#0F141C] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#161C26] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
                Cluster & Society Selection
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {user.society || user.societyName ? 'Update Society & Location' : 'Add Society & Location'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#2DD4A0] shrink-0" />
              <div>
                <p className="font-bold text-white">Location Saved Successfully!</p>
                {matchedWasher && (
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    Dedicated specialist <strong>{matchedWasher.name}</strong> assigned to your parking bay.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveLocation} className="space-y-4">
            {/* 1. STATE */}
            <div>
              <SearchableSelect
                label="1. State"
                icon={<MapPin className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                options={stateOptions}
                value={selectedState}
                onChange={(val) => {
                  setSelectedState(val);
                  setSelectedCity('');
                  setSelectedDistrict('');
                  setSocietyName('');
                  setError('');
                }}
                placeholder="Select State"
                searchPlaceholder="Search state (e.g. Maharashtra, Karnataka)..."
              />
            </div>

            {/* 2. CITY */}
            <div>
              <SearchableSelect
                label="2. City"
                icon={<Building2 className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                options={cityOptions}
                value={selectedCity}
                onChange={(val) => {
                  setSelectedCity(val);
                  setSelectedDistrict('');
                  setSocietyName('');
                  setError('');
                }}
                placeholder={selectedState ? 'Select City' : 'Select a State first'}
                searchPlaceholder="Search city (e.g. Mumbai, Bengaluru, Pune)..."
                disabled={!selectedState}
                disabledHint="Select a State first"
              />
            </div>

            {/* 3. DISTRICT / LOCALITY */}
            <div>
              <SearchableSelect
                label="3. District / Locality"
                icon={<Layers className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                options={districtOptions}
                value={selectedDistrict}
                onChange={(val) => {
                  setSelectedDistrict(val);
                  setSocietyName('');
                  setError('');
                }}
                placeholder={selectedCity ? 'Select District / Area' : 'Select a City first'}
                searchPlaceholder="Search district (e.g. Whitefield, Andheri West, Hinjawadi)..."
                disabled={!selectedCity}
                disabledHint="Select a City first"
              />
            </div>

            {/* 4. SOCIETY NAME */}
            <div>
              <SearchableSelect
                label="4. Society / Apartment Complex"
                icon={<Home className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                placeholder="Select or type Society Name"
                searchPlaceholder="Type society name (e.g. Green Valley Residency, Prestige Falcon)..."
                options={matchingSocieties}
                value={societyName}
                allowCustom={true}
                disabledHint="Select a District first"
                onChange={(val) => {
                  setSocietyName(val);
                  setError('');
                }}
              />
            </div>

            {/* 5. FLAT / TOWER / BAY */}
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

            {/* ========================================================= */}
            {/* LIVE WASHER MATCHING INDICATOR CARD */}
            {/* ========================================================= */}
            <div className="pt-2">
              {matchedWasher ? (
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
                        <span>Dedicated Specialist: <strong>{matchedWasher.name}</strong></span>
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
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Society</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
