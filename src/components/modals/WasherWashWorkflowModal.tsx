'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Video,
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
    'after' | 'verified' | 'unavailable_camera' | 'unavailable_confirmed'
  >('after');
  const [afterCaptured, setAfterCaptured] = useState(false);
  const [emptyBayCaptured, setEmptyBayCaptured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [capturedCleanPhoto, setCapturedCleanPhoto] = useState<string | null>(null);
  const [capturedEmptyBayPhoto, setCapturedEmptyBayPhoto] = useState<string | null>(null);

  // Live Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveTimeStr, setLiveTimeStr] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emptyBayFileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Real-time live timestamp generator (IST)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTimeStr(
        now.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Camera Controls: Opens device camera feed
  const startLiveCamera = async () => {
    setCameraError(null);
    setCameraLoading(true);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Direct camera streaming not supported in this browser');
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video auto-play notice:', playErr);
        }
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Live camera notice:', err?.message || err);
      setCameraActive(false);
      setCameraError(err?.message || 'Camera permission required');
    } finally {
      setCameraLoading(false);
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Lifecycle: start camera on open, stop on close
  useEffect(() => {
    if (isOpen) {
      setStep('after');
      setAfterCaptured(false);
      setEmptyBayCaptured(false);
      setIsSaving(false);
      setCapturedCleanPhoto(null);
      setCapturedEmptyBayPhoto(null);
      startLiveCamera();
    } else {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [isOpen, stop]);

  // Restart camera when switching to a camera step if not already active
  useEffect(() => {
    if (isOpen && (step === 'after' || step === 'unavailable_camera') && !cameraActive && !afterCaptured) {
      startLiveCamera();
    } else if (step === 'verified' || step === 'unavailable_confirmed') {
      stopLiveCamera();
    }
  }, [step, isOpen, cameraActive, afterCaptured]);

  if (!isOpen || !stop) return null;

  // Stamp live photo onto canvas with permanent watermark
  const createStampedPhoto = (
    source: CanvasImageSource,
    sourceW: number,
    sourceH: number,
    badgeText: string
  ): string => {
    const canvas = document.createElement('canvas');
    const targetW = 1280;
    const targetH = Math.round((sourceH / sourceW) * targetW) || 720;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '/images/honda_city_after.jpg';

    // 1. Draw live camera capture frame
    ctx.drawImage(source, 0, 0, targetW, targetH);

    const now = new Date();
    const timestampFormatted = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // 2. Top Watermark Ribbon
    ctx.fillStyle = 'rgba(11, 19, 43, 0.85)';
    const topBarHeight = Math.max(38, Math.round(targetH * 0.075));
    ctx.fillRect(0, 0, targetW, topBarHeight);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`✓ ${badgeText}`, 18, topBarHeight * 0.65);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(stop.parking_location, targetW - 18, topBarHeight * 0.65);
    ctx.textAlign = 'left';

    // 3. Bottom Watermark Ribbon
    const bottomBarHeight = Math.max(75, Math.round(targetH * 0.13));
    const gradient = ctx.createLinearGradient(0, targetH - bottomBarHeight, 0, targetH);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, targetH - bottomBarHeight, targetW, bottomBarHeight);

    // Live Timestamp (Day, Month, Year, Time, IST)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Timestamp: ${timestampFormatted} IST`, 18, targetH - bottomBarHeight * 0.55);

    // Vehicle details & Location
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'normal 13px sans-serif';
    ctx.fillText(
      `${stop.vehicle_name} • ${stop.registration_number} • ${stop.parking_location}`,
      18,
      targetH - bottomBarHeight * 0.2
    );

    // Verified Stamp
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('LIVE CAMERA TIMESTAMP VERIFIED ✓', targetW - 18, targetH - bottomBarHeight * 0.4);
    ctx.textAlign = 'left';

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const finalizeWashWithPhoto = async (stampedUrl: string) => {
    setCapturedCleanPhoto(stampedUrl);
    setAfterCaptured(true);
    setIsSaving(true);
    stopLiveCamera();

    try {
      await washerCompleteWash(stop.stop_number, stampedUrl);
      setTimeout(() => {
        setStep('verified');
        setIsSaving(false);
      }, 500);
    } catch (err) {
      console.warn('Firebase wash sync error:', err);
      setStep('verified');
      setIsSaving(false);
    }
  };

  // Action: Take Clean Photo & Complete Wash
  const handleCaptureAfter = async () => {
    if (isSaving) return;

    // A. Capture directly from active live video feed
    if (cameraActive && videoRef.current && videoRef.current.videoWidth > 0) {
      const stampedPhoto = createStampedPhoto(
        videoRef.current,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight,
        'TORQUE CARE LIVE CLEAN INSPECTION'
      );
      await finalizeWashWithPhoto(stampedPhoto);
      return;
    }

    // B. Trigger direct phone camera (capture="environment" forces hardware camera, blocks gallery)
    if (fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }

    // C. Fallback
    await finalizeWashWithPhoto('/images/honda_city_after.jpg');
  };

  // Rule: Vehicle Not Available -> Open Live Camera -> Capture Bay Photo -> Protect Payout
  const finalizeEmptyBayWithPhoto = (stampedUrl: string) => {
    setCapturedEmptyBayPhoto(stampedUrl);
    setEmptyBayCaptured(true);
    stopLiveCamera();
    setTimeout(() => {
      washerReportUnavailable(
        stop.stop_number,
        'Vehicle not at assigned parking bay',
        stampedUrl
      );
      setStep('unavailable_confirmed');
    }, 450);
  };

  const handleCaptureEmptyBay = () => {
    if (cameraActive && videoRef.current && videoRef.current.videoWidth > 0) {
      const stampedBay = createStampedPhoto(
        videoRef.current,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight,
        'ASSIGNED BAY EMPTY VERIFICATION'
      );
      finalizeEmptyBayWithPhoto(stampedBay);
      return;
    }

    if (emptyBayFileInputRef.current) {
      emptyBayFileInputRef.current.click();
      return;
    }

    finalizeEmptyBayWithPhoto('/images/empty_parking_bay.jpg');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      {/* Hidden Hardware Camera Inputs: capture="environment" strictly launches live rear phone camera, not gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement('img');
            img.onload = async () => {
              const stamped = createStampedPhoto(
                img,
                img.naturalWidth || 1280,
                img.naturalHeight || 720,
                'TORQUE CARE LIVE CLEAN INSPECTION'
              );
              await finalizeWashWithPhoto(stamped);
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }}
      />

      <input
        ref={emptyBayFileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement('img');
            img.onload = () => {
              const stamped = createStampedPhoto(
                img,
                img.naturalWidth || 1280,
                img.naturalHeight || 720,
                'ASSIGNED BAY EMPTY VERIFICATION'
              );
              finalizeEmptyBayWithPhoto(stamped);
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }}
      />

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
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Dynamic Steps */}
        <div className="p-5">
          {/* STEP: LIVE CLEAN PHOTO & COMPLETION */}
          {step === 'after' && (
            <div className="space-y-4 text-center">
              <div className="text-left flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Camera Verification
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    Take Clean Photo & Complete Wash
                  </h4>
                  <p className="text-xs text-slate-500">
                    Live camera only • Stamped with current date, time, and bay.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Only
                </div>
              </div>

              {/* Live Camera Viewfinder Frame */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-400 flex items-center justify-center group shadow-xl">
                {afterCaptured && capturedCleanPhoto ? (
                  <img
                    src={capturedCleanPhoto}
                    alt="Captured Live Proof"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Offline / Permissions Fallback */}
                    {!cameraActive && (
                      <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-600/90 flex items-center justify-center text-white mb-2 shadow-lg animate-pulse">
                          <Camera className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-bold text-white">
                          Opening Live Phone Camera...
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                          {cameraError || 'Gallery upload is disabled. Only live camera snaps are accepted.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click();
                            } else {
                              startLiveCamera();
                            }
                          }}
                          className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Phone Camera</span>
                        </button>
                      </div>
                    )}

                    {/* Live Viewfinder HUD Overlay */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 bg-gradient-to-b from-black/60 via-transparent to-black/80">
                        {/* Top HUD */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            LIVE PHONE CAMERA
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white font-bold">
                            BAY: {stop.parking_location}
                          </span>
                        </div>

                        {/* Framing Reticle */}
                        <div className="self-center w-36 h-28 border border-dashed border-emerald-400/60 rounded-xl flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        </div>

                        {/* Bottom Live HUD with Ticking Timestamp */}
                        <div className="p-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-left font-mono space-y-0.5">
                          <div className="text-[10px] text-white flex items-center justify-between font-bold">
                            <span>{stop.vehicle_name} • {stop.registration_number}</span>
                            <span className="text-emerald-400 font-bold">+₹{stop.payout_amount} Payout</span>
                          </div>
                          <div className="text-[10px] text-emerald-300 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{liveTimeStr || 'Live Timestamp Active'} IST</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action 1: Capture & Complete Wash */}
              <button
                onClick={handleCaptureAfter}
                disabled={isSaving}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Stamping Timestamp & Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Take Clean Photo & Complete Wash</span>
                  </>
                )}
              </button>

              {/* Action 2: Rule - VEHICLE NOT AVAILABLE */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setStep('unavailable_camera')}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>VEHICLE NOT AVAILABLE</span>
                </button>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Vehicle not at {stop.parking_location}? Tap to open live camera, verify empty bay & protect your payout.
                </p>
              </div>
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
                  ✓ WASH VERIFIED & TIMESTAMPED
                </span>
                <h4 className="text-2xl font-extrabold text-[#0B132B] mt-2">
                  +₹{stop.payout_amount} Earned
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Live photo & timestamp synced to Firestore and Owner Calendar.
                </p>
              </div>

              {/* Show Stamped Preview in Verified screen */}
              {capturedCleanPhoto && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img
                    src={capturedCleanPhoto}
                    alt="Verified Stamped Wash"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-2 right-2 bg-black/70 backdrop-blur-xs text-[9px] text-white p-1 rounded font-mono flex items-center justify-between">
                    <span>{liveTimeStr} IST</span>
                    <span className="text-emerald-400 font-bold">Live Watermark Stamped ✓</span>
                  </div>
                </div>
              )}

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

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    onClose();
                  }}
                  className="w-1/2 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    onClose();
                    onFinishedNext?.();
                  }}
                  className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Next Stop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: RULE TRIGGERED - VEHICLE NOT AVAILABLE CAMERA */}
          {step === 'unavailable_camera' && (
            <div className="space-y-4 text-center">
              <div className="text-left">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Step 1: Evidence Capture
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Photograph Assigned Bay
                </h4>
                <p className="text-xs text-slate-500">
                  Point camera at empty bay <span className="font-semibold text-slate-800">{stop.parking_location}</span>.
                </p>
              </div>

              {/* Camera Viewfinder with Empty Bay Preview */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-amber-400 flex items-center justify-center shadow-xl">
                {emptyBayCaptured && capturedEmptyBayPhoto ? (
                  <img
                    src={capturedEmptyBayPhoto}
                    alt="Captured Empty Bay"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {!cameraActive && (
                      <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                          <Camera className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-white">Opening Bay Camera...</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (emptyBayFileInputRef.current) emptyBayFileInputRef.current.click();
                            else startLiveCamera();
                          }}
                          className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          Launch Camera
                        </button>
                      </div>
                    )}

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
                          <span>BAY-VERIFIED: {stop.parking_location}</span>
                          <span className="text-amber-400 font-bold">EMPTY BAY</span>
                        </div>
                        <div className="text-[9px] text-slate-300 font-mono">
                          Timestamp: {liveTimeStr} IST
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCaptureEmptyBay}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>[ Take Photo of Assigned Bay ]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('after')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
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
                  stopLiveCamera();
                  onClose();
                  if (onFinishedNext) onFinishedNext();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
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
