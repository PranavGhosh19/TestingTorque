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
        className={`relative rounded-[20px] bg-[#11161D] text-white p-5 sm:p-6 overflow-hidden border transition-all duration-300 ${
          isFlaggedNo
            ? 'border-amber-500/40 shadow-[0_20px_50px_rgba(245,158,11,0.15)]'
            : isVerifiedYes
            ? 'border-[#2DD4A0]/40 shadow-[0_20px_50px_rgba(45,212,160,0.15)]'
            : 'border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
        } ${className}`}
      >
        {/* Subtle ambient lighting reacting to orange/green */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            isFlaggedNo
              ? 'bg-amber-500/15'
              : isVerifiedYes
              ? 'bg-[#2DD4A0]/15'
              : 'bg-[#2DD4A0]/10'
          }`}
        />
        <div
          className={`absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            isFlaggedNo
              ? 'bg-amber-500/10'
              : isVerifiedYes
              ? 'bg-blue-500/10'
              : 'bg-blue-500/5'
          }`}
        />

        {/* LINE 1 & LINE 2 SECTION */}
        <div className="relative z-10 flex flex-col gap-2.5 mb-3.5">
          {/* LINE FIRST: Status badge */}
          <div className="flex items-center">
            {isFlaggedNo ? (
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

          {/* LINE SECOND: Vehicle Name */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-0.5">
                Assigned Vehicle
              </span>
              <Link
                href="/owner/vehicles"
                className="group inline-flex items-center gap-1.5 hover:text-[#2DD4A0] transition-colors"
                title="Manage vehicles in garage"
              >
                <h2 suppressHydrationWarning className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#2DD4A0] tracking-tight transition-colors">
                  {vehicleName}
                </h2>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-[#2DD4A0] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
            <Link
              href="/owner/vehicles"
              className="text-xs font-mono font-medium text-[#2DD4A0] hover:underline"
            >
              Garage →
            </Link>
          </div>
        </div>

        {/* LINE THIRD: Car Number Plate */}
        <div className="relative z-10 mb-3">
          <Link
            href="/owner/vehicles"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#161C25] hover:bg-white/10 border border-white/[0.12] hover:border-white/20 text-white font-mono text-xs sm:text-sm font-bold tracking-wider shadow-sm shrink-0 transition-all cursor-pointer"
            title="View in Garage"
          >
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-[#2DD4A0] border-r border-white/20 pr-1.5">IND</span>
            <span>{regNumber}</span>
          </Link>
        </div>

        {/* LINE FORTH: Washer Details & Change button */}
        <div className="relative z-10 pt-2.5 border-t border-white/[0.06]">
          {hasAssignedWasher ? (
            <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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
                </div>
              </div>
              <Link
                href="/owner/profile"
                className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#2DD4A0] border border-white/10 text-[11px] font-mono font-bold tracking-wider transition-all shrink-0 cursor-pointer"
              >
                Change
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">No specialist assigned yet</span>
              <Link
                href="/owner/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-black text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Washer</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
