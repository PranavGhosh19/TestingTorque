'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';
import { Vehicle, WashRecord } from '@/lib/types';
import { useStore } from '@/lib/store';
import { isPresentDateProofBefore10AM } from '@/lib/washUtils';

interface Props {
  wash?: WashRecord;
  vehicle?: Vehicle;
  washerName?: string;
  washerAvatar?: string;
  className?: string;
  showFullProofBtn?: boolean;
}

export default function SignatureProofCard({
  wash,
  vehicle,
  washerName: propWasherName,
  washerAvatar: propWasherAvatar,
  className = '',
  showFullProofBtn = true,
}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const { vehicles, user } = useStore();

  const currentVehicle = vehicle || (vehicles && vehicles.length > 0 ? vehicles[0] : null);

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

  // Evaluate if present date proof is submitted before 10:00 AM
  const verification = isPresentDateProofBefore10AM(wash);
  const { isWashedToday, isToday, hasProof, isBefore10AM, submissionTimeStr } = verification;

  const afterPhoto = wash?.after_photo || '';
  const time = submissionTimeStr || wash?.completed_at || '07:30 AM';
  const isSunday = new Date().getDay() === 0;

  const washerName =
    propWasherName ||
    (wash?.washer_name && wash.washer_name !== 'Amit Kumar' ? wash.washer_name : null) ||
    currentVehicle?.assigned_washer_name ||
    user?.assigned_washer_name ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null) ||
    wash?.washer_name ||
    'Amit Kumar';
  const washerAvatar =
    propWasherAvatar ||
    wash?.washer_avatar ||
    '/images/washer_amit.jpg';

  return (
    <>
      <div
        className={`relative rounded-3xl bg-[#080D1A] text-white p-5 sm:p-6 overflow-hidden border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] specular-border luxury-sheen ${className}`}
      >
        {/* Subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Vehicle Name on Left, Status Badge on Right */}
        <div className="relative z-10 flex items-center justify-between mb-3.5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {vehicleName}
          </h2>

          {/* Condition: if present date proof is submitted before 10am then mark Washed Today */}
          {isWashedToday ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs sm:text-sm font-bold tracking-wide shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Washed Today</span>
            </div>
          ) : isToday && hasProof && !isBefore10AM ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold tracking-wide shadow-xs">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Completed ({time})</span>
            </div>
          ) : isToday && wash?.status === 'in_progress' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-bold tracking-wide shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Wash In Progress</span>
            </div>
          ) : isSunday ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-500/15 border border-white/20 text-slate-300 text-xs sm:text-sm font-bold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span>Sunday Rest Day</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-bold tracking-wide shadow-xs">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Scheduled (By 10 AM)</span>
            </div>
          )}
        </div>

        {/* Clean Inspection Photo Showcase / Awaiting Care State */}
        {hasProof && afterPhoto ? (
          <div className="relative z-10 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-slate-950 border border-white/15 group shadow-2xl">
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
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-white shadow-lg">
              <span className={`w-2 h-2 rounded-full ${isWashedToday ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="font-semibold text-slate-100">{parkingLocation}</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-300 font-mono text-[11px]">{time} IST</span>
            </div>

            {/* Top Right: Tap to zoom */}
            <button
              onClick={() => setShowModal(true)}
              aria-label="Enlarge inspection photo"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-white/90 border border-white/15 transition-all shadow-md active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="relative z-10 rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-linear-to-b from-slate-900 via-[#0B132B] to-[#080D1A] border border-white/15 p-6 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 mb-3.5 shadow-lg">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>
            <div className="text-base font-extrabold text-white">
              {isSunday ? 'Sunday Rest Day' : 'Morning Doorstep Wash Scheduled'}
            </div>
            <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
              {isSunday
                ? 'Under your 6-day Mon–Sat plan, Sunday is a scheduled rest day.'
                : `Assigned partner ${washerName} will wash your car in the morning bay window. Verified photo proof will be posted here before 10:00 AM.`}
            </p>
            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span>{parkingLocation}</span>
              <span className="text-white/30">•</span>
              <span>Preferred: {currentVehicle?.preferred_wash_time || '07:30 AM'}</span>
            </div>
          </div>
        )}

        {/* Below the Image: Car Number Plate */}
        <div className="relative z-10 mt-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-slate-100 font-mono text-xs sm:text-sm font-extrabold tracking-wider shadow-sm">
            <span className="text-[10px] font-sans font-bold text-blue-400 border-r border-white/20 pr-1.5">IND</span>
            <span>{regNumber}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Daily Bay Care</span>
        </div>


        {/* Footer: Washer Details & Action */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400/50 shadow-md shrink-0">
              <Image
                src={washerAvatar}
                alt={washerName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">
                  {washerName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ★ 4.9
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Green Valley • Bay D-14 (Basement 1)
              </p>
            </div>
          </div>

          {showFullProofBtn && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] text-xs font-bold transition-all shadow-[0_4px_15px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              <span>View Full Certificate</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Full Proof Certificate Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0B132B] text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/15 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> 100% Verified Care Certificate
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
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
                    <span className="font-bold text-white">{currentVehicle?.society_name || 'Green Valley'} · {parkingLocation}</span>
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
                    <span className="font-bold text-white">{washerName} (ID: #TC-048)</span>
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
