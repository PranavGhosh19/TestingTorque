'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Check,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  X,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { RouteStop } from '@/lib/types';

interface Props {
  stop: RouteStop | null;
  isOpen: boolean;
  onClose: () => void;
  onFinishedNext?: () => void;
}

export default function WasherWashWorkflowModal({
  stop,
  isOpen,
  onClose,
  onFinishedNext,
}: Props) {
  const { washerCompleteWash, washerReportUnavailable, isOffline } = useStore();
  const [step, setStep] = useState<
    'before' | 'washing' | 'after' | 'verified' | 'unavailable_camera' | 'unavailable_confirmed'
  >('before');
  const [beforeCaptured, setBeforeCaptured] = useState(false);
  const [afterCaptured, setAfterCaptured] = useState(false);
  const [emptyBayCaptured, setEmptyBayCaptured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('before');
      setBeforeCaptured(false);
      setAfterCaptured(false);
      setEmptyBayCaptured(false);
    }
  }, [isOpen, stop]);

  if (!isOpen || !stop) return null;

  const handleCaptureBefore = () => {
    setBeforeCaptured(true);
    setTimeout(() => {
      setStep('washing');
    }, 400);
  };

  const handleFinishWash = () => {
    setStep('after');
  };

  const handleCaptureAfter = () => {
    setAfterCaptured(true);
    setTimeout(() => {
      washerCompleteWash(
        stop.stop_number,
        '/images/honda_city_before.jpg',
        '/images/honda_city_after.jpg'
      );
      setStep('verified');
    }, 500);
  };

  // Rule: Vehicle Not Available -> Open Live Camera -> Capture Bay Photo -> Protect Payout
  const handleCaptureEmptyBay = () => {
    setEmptyBayCaptured(true);
    setTimeout(() => {
      washerReportUnavailable(
        stop.stop_number,
        'Vehicle not at assigned parking bay',
        '/images/empty_parking_bay.jpg'
      );
      setStep('unavailable_confirmed');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Top Header */}
        <div className="bg-[#0B132B] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Stop #{stop.stop_number} of 12
              </span>
              {isOffline && (
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full">
                  Offline Queue Active
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold mt-1 text-white tracking-tight">
              {stop.vehicle_name}
            </h3>
            <p className="text-xs text-slate-300">
              {stop.registration_number} • {stop.parking_location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Dynamic Steps */}
        <div className="p-5">
          {/* STEP 1: BEFORE PHOTO */}
          {step === 'before' && (
            <div className="space-y-4 text-center">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Step 1 of 2
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  Capture Clean Inspection Photo
                </h4>
                <p className="text-xs text-slate-500">
                  Vehicle at assigned bay ({stop.parking_location}).
                </p>
              </div>

              {/* Camera Simulator Frame */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-300 flex items-center justify-center group shadow-inner">
                {beforeCaptured ? (
                  <Image
                    src="/images/honda_city_before.jpg"
                    alt="Captured Before"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    <Image
                      src="/images/honda_city_before.jpg"
                      alt="Camera Preview"
                      fill
                      className="object-cover opacity-60 filter blur-[0.5px]"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 border border-white/30">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-semibold text-white">
                        Point camera at {stop.parking_location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Auto telemetry tags */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-white/90 p-1.5 rounded-lg flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {stop.parking_location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" /> Auto-timestamped
                  </span>
                </div>
              </div>

              {/* Action 1: Vehicle Present */}
              <button
                onClick={handleCaptureBefore}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>[ Take Photo & Start Wash ]</span>
              </button>

              {/* Action 2: Rule - VEHICLE NOT AVAILABLE */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setStep('unavailable_camera')}
                  className="w-full py-3 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>VEHICLE NOT AVAILABLE</span>
                </button>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Vehicle not at {stop.parking_location}? Tap to verify empty bay & protect your payout.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: IN PROGRESS WASHING */}
          {step === 'washing' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center animate-pulse border border-blue-200">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Washing Vehicle...
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Gentle scratch-safe microfiber care. Wipe wheels, mirrors, and glass dry.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-4 h-4" /> Arrival verified (7:40 AM)
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-4 h-4" /> Parking location confirmed ({stop.parking_location})
                </div>
              </div>

              <button
                onClick={handleFinishWash}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Wash Completed → Take Clean Photo</span>
              </button>
            </div>
          )}

          {/* STEP 3: AFTER PHOTO */}
          {step === 'after' && (
            <div className="space-y-4 text-center">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Step 2 of 2
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  Capture Clean Photo
                </h4>
                <p className="text-xs text-slate-500">
                  Verify gleaming clean finish and spotless glass.
                </p>
              </div>

              {/* Camera Simulator Frame */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-emerald-400 flex items-center justify-center group shadow-inner">
                {afterCaptured ? (
                  <Image
                    src="/images/honda_city_after.jpg"
                    alt="Captured After"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    <Image
                      src="/images/honda_city_after.jpg"
                      alt="Camera Preview"
                      fill
                      className="object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-600/90 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-semibold text-white">
                        Ready to certify clean vehicle
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-white/90 p-1.5 rounded-lg flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> Bay Verified
                  </span>
                  <span className="text-emerald-400 font-bold">
                    +₹{stop.payout_amount} Payout
                  </span>
                </div>
              </div>

              <button
                onClick={handleCaptureAfter}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                <span>[ Take Clean Photo & Complete ]</span>
              </button>
            </div>
          )}

          {/* STEP 4: VERIFIED CELEBRATION */}
          {step === 'verified' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ✓ WASH VERIFIED
                </span>
                <h4 className="text-2xl font-extrabold text-[#0B132B] mt-2">
                  +₹{stop.payout_amount} Earned
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Added to your Available Payout Balance instantly.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs space-y-1">
                <div className="text-slate-600 flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-semibold text-slate-800">{stop.vehicle_name}</span>
                </div>
                <div className="text-slate-600 flex justify-between">
                  <span>Owner Notified:</span>
                  <span className="font-semibold text-emerald-700">Proof sent to {stop.owner_name}</span>
                </div>
                <div className="text-slate-600 flex justify-between">
                  <span>Parking Bay:</span>
                  <span className="font-semibold text-slate-800">{stop.parking_location}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onFinishedNext) onFinishedNext();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Next Vehicle →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 5: VEHICLE NOT AVAILABLE — LIVE CAMERA CAPTURE OF EMPTY PARKING BAY */}
          {step === 'unavailable_camera' && (
            <div className="space-y-4 text-center">
              <div className="text-left">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Absence Verification
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1.5">
                  Capture Empty Assigned Parking Bay
                </h4>
                <p className="text-xs text-slate-500">
                  Take a photo of <span className="font-bold text-slate-800">{stop.parking_location}</span> to certify your presence and protect your payout.
                </p>
              </div>

              {/* Camera Viewfinder with Empty Bay Preview */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-amber-400 flex items-center justify-center shadow-xl">
                <Image
                  src="/images/empty_parking_bay.jpg"
                  alt="Empty assigned parking bay"
                  fill
                  className="object-cover"
                />

                {/* Live viewfinder HUD */}
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-3 pointer-events-none">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white">
                    <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-amber-300 font-bold">
                      BAY: {stop.parking_location}
                    </span>
                    <span className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-white/20 text-emerald-400 font-bold">
                      LIVE CAMERA ACTIVE
                    </span>
                  </div>

                  <div className="bg-black/75 backdrop-blur-md p-2 rounded-xl text-left border border-white/20 space-y-0.5">
                    <div className="text-[10px] text-white font-mono flex items-center justify-between">
                      <span>BAY-VERIFIED: {stop.parking_location} (B1)</span>
                      <span className="text-amber-400 font-bold">EMPTY BAY</span>
                    </div>
                    <div className="text-[9px] text-slate-300 font-mono">
                      Timestamp: Today • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCaptureEmptyBay}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>[ Take Photo of Assigned Bay ]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('before')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel • Vehicle is present
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: RULE RECORD CONFIRMED (Customer / Vehicle Unavailable) */}
          {step === 'unavailable_confirmed' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-2 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-inner border border-amber-200">
                <ShieldCheck className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-black text-amber-700 uppercase tracking-wider bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
                  Customer / Vehicle Unavailable
                </span>
                <h4 className="text-xl font-black text-[#0B132B] mt-2">
                  Washer Payout Protected ✓
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Full wash fee (+₹{stop.payout_amount}) credited. Not classified as a missed wash.
                </p>
              </div>

              {/* Exact Rule Verification Record */}
              <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-200 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Record Status:</span>
                  <span className="font-bold text-slate-900">Customer / Vehicle Unavailable</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-slate-500">Washer Presence:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Present ✓
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500">Service Status:</span>
                  <span className="font-bold text-slate-700">Not possible</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700 border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Washer Payout:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Protected ✓ (+₹{stop.payout_amount})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 text-left leading-relaxed">
                ✓ Assigned bay photo recorded with timestamp. Owner notified that partner arrived on time. This is not recorded as a missed wash on your partner score.
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onFinishedNext) onFinishedNext();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Next Vehicle →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
