'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Clock,
  X,
  ChevronRight,
  Maximize2,
  Award,
  Layers,
  Check,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';
import { Vehicle, WashRecord } from '@/lib/types';
import { useStore } from '@/lib/store';
import { isPresentDateProofBefore10AM, getTodayISTDate, getNextDayIso } from '@/lib/washUtils';

interface Props {
  wash?: WashRecord;
  vehicle?: Vehicle;
  washerName?: string;
  washerAvatar?: string;
  location?: string;
  societiesCovered?: string;
  className?: string;
  showFullProofBtn?: boolean;
  todayFeedbackStatus?: 'yes' | 'no' | null;
}

export default function SignatureProofCard({
  wash,
  vehicle,
  washerName: propWasherName,
  washerAvatar: propWasherAvatar,
  location,
  societiesCovered,
  className = '',
  showFullProofBtn = true,
  todayFeedbackStatus,
}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const { vehicles, user } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentVehicle = vehicle || (mounted && vehicles && vehicles.length > 0 ? vehicles[0] : null);

  const todayIst = getTodayISTDate();
  const todayIso = todayIst.dateIso;

  const signupDate =
    currentVehicle?.signupDate ||
    user?.signupDate ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_signup_date') : null) ||
    (user?.created_at && user.created_at.includes('T') ? user.created_at.split('T')[0] : null);

  const serviceStartDate =
    currentVehicle?.serviceStartDate ||
    user?.serviceStartDate ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_service_start_date') : null) ||
    (signupDate ? getNextDayIso(signupDate) : null);

  const isPriorToServiceStart = Boolean(
    serviceStartDate && todayIso < serviceStartDate
  );

  const vehicleName =
    (currentVehicle ? `${currentVehicle.make} ${currentVehicle.model}`.trim() : '') ||
    (wash?.vehicle_name && wash.vehicle_name !== 'Honda City' ? wash.vehicle_name : '') ||
    (currentVehicle ? `${currentVehicle.make} ${currentVehicle.model}` : (wash?.vehicle_name || 'Your Vehicle'));

  const regNumber =
    currentVehicle?.registration_number ||
    (wash?.registration_number && wash.registration_number !== 'DL 01 AB 4291' ? wash.registration_number : '') ||
    wash?.registration_number ||
    '';

  const parkingLocation =
    currentVehicle?.parking_location ||
    wash?.parking_location ||
    'Assigned Bay';

  const cleanBay = parkingLocation.includes('•')
    ? parkingLocation.split('•').slice(1).join('•').trim()
    : parkingLocation;
  const fallbackSociety =
    currentVehicle?.society_name ||
    user?.society ||
    (parkingLocation.includes('•') ? parkingLocation.split('•')[0].trim() : '') ||
    'Assigned Society';
  const displayLocationText =
    location ||
    (societiesCovered ? `${societiesCovered} • ${cleanBay}` : `${fallbackSociety} • ${cleanBay}`);

  // Evaluate if present date proof is submitted before 10:00 AM
  const verification = isPresentDateProofBefore10AM(wash);
  const { isWashedToday, isToday, hasProof, isBefore10AM, submissionTimeStr } = verification;

  const afterPhoto = wash?.after_photo || '';
  const time = submissionTimeStr || wash?.completed_at || '07:30 AM';
  const isSunday = new Date().getDay() === 0;

  // Check if a real washer partner is assigned (not dummy placeholder data)
  const isDummyName = (name?: string | null) =>
    !name ||
    name === 'Amit Kumar' ||
    name === 'Assigned Route Partner' ||
    name === 'Assigned Partner';

  const washerName =
    (!isDummyName(propWasherName) ? propWasherName : null) ||
    (!isDummyName(wash?.washer_name) ? wash?.washer_name : null) ||
    (mounted && !isDummyName(currentVehicle?.assigned_washer_name) ? currentVehicle?.assigned_washer_name : null) ||
    (mounted && !isDummyName(user?.assigned_washer_name) ? user?.assigned_washer_name : null) ||
    null;

  const hasAssignedWasher = Boolean(washerName);

  const washerAvatar =
    (propWasherAvatar && !propWasherAvatar.includes('washer_amit') ? propWasherAvatar : null) ||
    (wash?.washer_avatar && !wash.washer_avatar.includes('washer_amit') ? wash.washer_avatar : null) ||
    (washerName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(washerName)}&background=161C25&color=2DD4A0&bold=true` : '');

  const isFlaggedNo =
    todayFeedbackStatus === 'no' ||
    wash?.flaggedNotCleaned ||
    wash?.status === 'missed' ||
    wash?.ownerFeedback === 'no';

  const isVerifiedYes =
    !isFlaggedNo &&
    (todayFeedbackStatus === 'yes' ||
      wash?.ownerFeedback === 'yes' ||
      wash?.status === 'completed' ||
      isWashedToday);

  return (
    <>
      <div
        className={`relative rounded-[20px] bg-[#11161D] text-white p-5 sm:p-6 overflow-hidden border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${className}`}
      >
        {/* Subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#2DD4A0]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Vehicle Name on Left, Status Badge on Right */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-0.5">
              Assigned Vehicle
            </span>
            <h2 suppressHydrationWarning className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {vehicleName}
            </h2>
          </div>

          {/* Condition: if present date proof is submitted or owner verified */}
          {isPriorToServiceStart ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 text-[#2DD4A0] text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <Sparkles className="w-4 h-4 text-[#2DD4A0]" />
              <span>Care Starts Tomorrow</span>
            </div>
          ) : isFlaggedNo ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Flagged Not Cleaned (Orange)</span>
            </div>
          ) : isVerifiedYes ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 text-[#2DD4A0] text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#2DD4A0]" />
              <span>Washed Today • Verified</span>
            </div>
          ) : isToday && hasProof && !isBefore10AM ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Completed ({time})</span>
            </div>
          ) : isToday && wash?.status === 'in_progress' ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Wash In Progress</span>
            </div>
          ) : isSunday ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <Sparkles className="w-4 h-4 text-white/50" />
              <span>Sunday Rest Day</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white/80 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <Clock className="w-4 h-4 text-[#2DD4A0]" />
              <span>Scheduled (By 10 AM)</span>
            </div>
          )}
        </div>

        {/* Clean Inspection Photo Showcase / Flagged State / Awaiting Care State */}
        {isFlaggedNo ? (
          <div className="relative z-10 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-[#161C25] border border-amber-500/30 p-6 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3.5 shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="text-base font-bold text-amber-300 uppercase tracking-wide">
              Flagged: Car Not Cleaned Today
            </div>
            <p suppressHydrationWarning className="text-xs text-white/65 max-w-sm mt-1 leading-relaxed">
              You marked that your vehicle was not cleaned today by {washerName}. Today has been flagged Orange in your Care Calendar.
            </p>
            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-white/70">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{parkingLocation}</span>
              <span className="text-white/30">•</span>
              <span className="text-amber-300">Flagged Orange in Calendar</span>
            </div>
          </div>
        ) : hasProof && afterPhoto ? (
          <div className="relative z-10 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-slate-950 border border-white/10 group shadow-2xl">
            <Image
              src={afterPhoto}
              alt="Verified Clean Inspection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />

            {/* Minimal top gradient for contrast */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

            {/* Top Left: Single Clean Information Pill */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-white shadow-lg">
              <span className={`w-2 h-2 rounded-full ${isVerifiedYes ? 'bg-[#2DD4A0]' : 'bg-amber-400'}`} />
              <span className="font-semibold text-white/90">{parkingLocation}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/70 font-mono text-[11px]">{time} IST</span>
            </div>

            {/* Top Right: Tap to zoom */}
            <button
              onClick={() => setShowModal(true)}
              aria-label="Enlarge inspection photo"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-white/90 border border-white/15 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}

        {/* Below the Image: Car Number Plate & Washer Details (Same line on smaller & larger screens) */}
        <div className={`relative z-10 flex flex-row items-center justify-between gap-2 sm:gap-3 ${hasProof && afterPhoto ? 'mt-3.5' : ''}`}>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#161C25] border border-white/[0.12] text-white font-mono text-xs sm:text-sm font-bold tracking-wider shadow-sm shrink-0">
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-[#2DD4A0] border-r border-white/20 pr-1.5">IND</span>
            <span>{regNumber}</span>
          </div>

          {hasAssignedWasher ? (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
              {washerAvatar && (
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#2DD4A0]/60 shadow-md shrink-0">
                  <Image
                    src={washerAvatar}
                    alt={washerName || 'Care Partner'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight truncate">
                    {washerName}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-white/60 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-[#2DD4A0] shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">{displayLocationText}</span>
                </p>
              </div>
              <Link
                href="/owner/settings"
                className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#2DD4A0] border border-white/10 text-[11px] font-mono font-bold tracking-wider transition-all shrink-0 cursor-pointer"
              >
                Change
              </Link>
            </div>
          ) : (
            <Link
              href="/owner/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-black text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Washer</span>
            </Link>
          )}
        </div>
      </div>

      {/* Full Proof Certificate Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#11161D] text-white rounded-[20px] max-w-lg w-full overflow-hidden shadow-2xl border border-white/[0.12] max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161C25]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#2DD4A0] bg-[#2DD4A0]/15 px-2.5 py-0.5 rounded-full border border-[#2DD4A0]/30 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> 100% Verified Care Certificate
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {vehicleName} — Clean Inspection
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-950">
                  <Image
                    src={afterPhoto || '/images/honda_city_after.jpg'}
                    alt="Inspected clean vehicle"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>INSPECTED & VERIFIED CLEAN</span>
                  </div>
                </div>

                {/* Audit checklist */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs font-mono">
                  <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Audit Record Hash: #TC-2026-0928</span>
                    <span className="text-emerald-400 font-semibold">VERIFIED</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Parking Bay Log
                    </span>
                    <span className="font-bold text-white">{displayLocationText}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Timestamp
                    </span>
                    <span className="font-bold text-white">Today · {time} IST</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Wash Protocol
                    </span>
                    <span className="font-bold text-emerald-400">Scratch-Safe Microfiber</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Certified Partner
                    </span>
                    <span className="font-bold text-white">{washerName ? `${washerName} (ID: #TC-048)` : 'Route Specialist Pending'}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Every Torque Care service is logged with tamper-proof timestamp and parking bay verification. 2-hour complimentary touch-up guarantee active.
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Service Guarantee Active</span>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-xl bg-white text-[#0B132B] text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Close Certificate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
