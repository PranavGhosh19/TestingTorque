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
            {/* STATE */}
            <div>
              <SearchableSelect
                label="State"
                required
                options={stateOptions}
                value={selectedState}
                onChange={(val) => {
                  setSelectedState(val);
                  setSelectedCity('');
                  setSelectedDistrict('');
                }}
                placeholder="Select State (e.g. Maharashtra)"
              />
            </div>

            {/* CITY */}
            <div>
              <SearchableSelect
                label="City"
                required
                options={cityOptions}
                value={selectedCity}
                onChange={(val) => {
                  setSelectedCity(val);
                  setSelectedDistrict('');
                }}
                placeholder={selectedState ? 'Select City (e.g. Mumbai)' : 'First select State'}
                disabled={!selectedState}
              />
            </div>

            {/* DISTRICT / AREA */}
            <div>
              <SearchableSelect
                label="District / Area"
                required
                options={districtOptions}
                value={selectedDistrict}
                onChange={(val) => {
                  setSelectedDistrict(val);
                  setSocietyName('');
                }}
                placeholder={selectedCity ? 'Select District (e.g. Andheri West)' : 'First select City'}
                disabled={!selectedCity}
              />
            </div>

            {/* COMMON SOCIETIES SERVICED BY WASHERS IN SELECTED DISTRICT */}
            {selectedDistrict && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#141B24] to-[#10151E] border border-emerald-500/30 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2DD4A0]" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                      Washers Active in {selectedDistrict}
                    </span>
                  </div>
                  {isLoadingDistrictSocieties ? (
                    <span className="text-[10px] text-white/50 flex items-center gap-1 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin text-[#2DD4A0]" /> Checking routes...
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/30">
                      {districtWasherSocieties.length} Common {districtWasherSocieties.length === 1 ? 'Society' : 'Societies'}
                    </span>
                  )}
                </div>

                {districtWasherSocieties.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-white/70">
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
                            onClick={() => setSocietyName(ws.societyName)}
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
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    No washer currently servicing {selectedDistrict}. You can enter your society name below and we will assign one.
                  </p>
                ) : null}
              </div>
            )}

            {/* SOCIETY NAME */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Society / Apartment <span className="text-emerald-400">*</span>
              </label>
              {matchingSocieties.length > 0 ? (
                <div className="space-y-2">
                  <SearchableSelect
                    label=""
                    options={matchingSocieties}
                    value={societyName}
                    onChange={(val) => setSocietyName(val)}
                    placeholder="Select registered society..."
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/40">or enter custom:</span>
                    <input
                      type="text"
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      placeholder="Type your society name"
                      className="flex-1 px-3 py-1.5 bg-[#161C26] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-hidden focus:border-[#2DD4A0]"
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  placeholder="Enter Society Name (e.g. Oberoi Springs)"
                  className="w-full px-4 py-2.5 bg-[#161C26] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-hidden focus:border-[#2DD4A0]"
                />
              )}
            </div>

            {/* FLAT / TOWER */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Flat / Tower Number (Optional)
              </label>
              <input
                type="text"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. Tower B - Flat 402"
                className="w-full px-4 py-2.5 bg-[#161C26] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-hidden focus:border-[#2DD4A0]"
              />
            </div>

            {/* ========================================================= */}
            {/* LIVE WASHER MATCHING INDICATOR CARD */}
            {/* ========================================================= */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              {matchedWasher ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-[#162325] to-[#121A24] border border-emerald-500/40 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2DD4A0] text-black">
                      ✓ Equal / Common Match Found
                    </span>
                    <span className="text-xs font-mono text-emerald-300">Active on Route</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-emerald-400/30 overflow-hidden flex items-center justify-center font-bold text-white text-base">
                      {matchedWasher.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{matchedWasher.name}</span>
                        <ShieldCheck className="w-4 h-4 text-[#2DD4A0]" />
                      </h4>
                      <p className="text-[11px] text-white/60">
                        Dedicated specialist covering <strong>{societyName}</strong> ({selectedDistrict})
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 pt-1 leading-relaxed">
                    ✨ When saved, <strong>{matchedWasher.name}</strong> will be displayed as your assigned washer specialist across your garage dashboard.
                  </p>
                </div>
              ) : societyName.trim() ? (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-white/80 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#2DD4A0]" />
                    <span>No Washer Registered for {societyName} Yet</span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Once a washer partner registers with State: <strong>{selectedState || 'Any'}</strong>, City: <strong>{selectedCity || 'Any'}</strong>, District: <strong>{selectedDistrict || 'Any'}</strong>, and Society: <strong>{societyName}</strong>, their name will automatically appear on your dashboard!
                  </p>
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
                    <span>Save Society & Match Washer</span>
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
