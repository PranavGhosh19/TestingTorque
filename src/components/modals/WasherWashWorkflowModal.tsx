'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  AlertTriangle,
  RefreshCw,
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
  const [step, setStep] = useState<'after' | 'unavailable_camera'>('after');
  const [isSaving, setIsSaving] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Live Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveTimeStr, setLiveTimeStr] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emptyBayFileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartingCameraRef = useRef<boolean>(false);

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

  // Bulletproof camera shutdown: stops all hardware tracks & clears video pipeline
  const stopLiveCamera = () => {
    isStartingCameraRef.current = false;

    // 1. Terminate all tracks on streamRef
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      } catch (err) {
        console.warn('Error stopping stream tracks:', err);
      }
      streamRef.current = null;
    }

    // 2. Pause video and release srcObject tracks to clear Dynamic Island / iOS recording indicator
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (_) {}

      if (videoRef.current.srcObject) {
        try {
          const srcStream = videoRef.current.srcObject as MediaStream;
          srcStream.getTracks?.().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
        } catch (err) {
          console.warn('Error stopping video srcObject tracks:', err);
        }
        videoRef.current.srcObject = null;
      }
    }

    setCameraActive(false);
    setCameraLoading(false);
  };

  // Live Camera Controls: Opens device rear camera feed
  const startLiveCamera = async () => {
    if (isStartingCameraRef.current) return;
    if (streamRef.current && cameraActive) return;

    isStartingCameraRef.current = true;
    setCameraError(null);
    setCameraLoading(true);

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Direct camera streaming not supported in this browser');
      }

      // Stop any prior tracks before requesting a new stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      // If user closed modal while awaiting camera permission prompt, shut down immediately
      if (!isStartingCameraRef.current) {
        stream.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
        return;
      }

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
      isStartingCameraRef.current = false;
    }
  };

  // Lifecycle: Single clean effect to start camera on open, stop on close
  useEffect(() => {
    if (isOpen && stop) {
      setStep('after');
      setIsSaving(false);
      startLiveCamera();
    } else {
      stopLiveCamera();
    }

    return () => {
      stopLiveCamera();
    };
  }, [isOpen, stop?.stop_number]);

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

  // Action: GREEN TICK BUTTON CLICK -> Capture, Shut down camera recorder, Complete wash & Close
  const handleCaptureAfter = async () => {
    if (isSaving || !stop) return;
    setIsSaving(true);

    // Flash animation for native shutter sensation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    let stampedPhoto = '/images/honda_city_after.jpg';

    // A. Capture directly from active live video feed
    if (cameraActive && videoRef.current && videoRef.current.videoWidth > 0) {
      try {
        stampedPhoto = createStampedPhoto(
          videoRef.current,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight,
          'TORQUE CARE LIVE CLEAN INSPECTION'
        );
      } catch (err) {
        console.warn('Canvas capture error:', err);
      }
    } else if (fileInputRef.current) {
      setIsSaving(false);
      fileInputRef.current.click();
      return;
    }

    // B. IMMEDIATELY TURN OFF CAMERA RECORDER (Stops camera hardware indicator on iOS/Android)
    stopLiveCamera();

    // C. Persist wash completion in Firestore and local store
    try {
      await washerCompleteWash(stop.stop_number, stampedPhoto);
    } catch (err) {
      console.warn('Firebase wash sync error:', err);
    }

    // D. Close camera modal immediately
    setIsSaving(false);
    onClose();
    if (onFinishedNext) {
      onFinishedNext();
    }
  };

  // Action: Empty Bay Capture -> Shut down camera recorder, Report unavailable & Close
  const handleCaptureEmptyBay = async () => {
    if (isSaving || !stop) return;
    setIsSaving(true);

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    let stampedBay = '/images/empty_parking_bay.jpg';
    if (cameraActive && videoRef.current && videoRef.current.videoWidth > 0) {
      try {
        stampedBay = createStampedPhoto(
          videoRef.current,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight,
          'ASSIGNED BAY EMPTY VERIFICATION'
        );
      } catch (err) {
        console.warn('Canvas empty bay capture error:', err);
      }
    } else if (emptyBayFileInputRef.current) {
      setIsSaving(false);
      emptyBayFileInputRef.current.click();
      return;
    }

    // Stop recorder immediately
    stopLiveCamera();

    try {
      await washerReportUnavailable(
        stop.stop_number,
        'Vehicle not at assigned parking bay',
        stampedBay
      );
    } catch (err) {
      console.warn('Firebase empty bay sync error:', err);
    }

    setIsSaving(false);
    onClose();
    if (onFinishedNext) {
      onFinishedNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white w-full h-[100dvh] overflow-hidden select-none">
      {/* Hidden Hardware Camera Fallbacks for browsers with strict permissions */}
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
              stopLiveCamera();
              await washerCompleteWash(stop.stop_number, stamped);
              onClose();
              if (onFinishedNext) onFinishedNext();
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
            img.onload = async () => {
              const stamped = createStampedPhoto(
                img,
                img.naturalWidth || 1280,
                img.naturalHeight || 720,
                'ASSIGNED BAY EMPTY VERIFICATION'
              );
              stopLiveCamera();
              await washerReportUnavailable(
                stop.stop_number,
                'Vehicle not at assigned parking bay',
                stamped
              );
              onClose();
              if (onFinishedNext) onFinishedNext();
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }}
      />

      {/* FULL SCREEN VIDEO FEED (Native Camera Viewfinder) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Shutter White Flash Animation */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150" />
      )}

      {/* Camera Loading / Permissions Fallback Overlay */}
      {!cameraActive && (
        <div className="absolute inset-0 z-10 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-white">
            {cameraLoading ? 'Opening Phone Camera...' : 'Camera Access Required'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
            {cameraError || 'Live camera access is needed to capture timestamped wash proof.'}
          </p>

          <div className="mt-5 flex flex-col gap-2.5 w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  startLiveCamera();
                }
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Device Camera</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-white/20 text-slate-300 font-semibold text-xs hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. FLOATING TOP HEADER OVERLAY                                */}
      {/* ============================================================ */}
      <div className="relative z-20 w-full bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-3 pb-8 px-4 pt-[max(env(safe-area-inset-top),1rem)] flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold tracking-wider text-emerald-400 uppercase bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Stop #{stop.stop_number} of 12
            </span>
            {isOffline && (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                Offline
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>

          <h2 className="text-xl font-black mt-1 text-white tracking-tight drop-shadow-md">
            {stop.vehicle_name}
          </h2>
          <p className="text-xs text-slate-200 drop-shadow-sm font-medium">
            <span className="text-emerald-300 font-bold">{stop.registration_number}</span> • Bay: <span className="text-white font-bold">{stop.parking_location}</span>
          </p>
        </div>

        {/* Close Button: Stops live camera tracks immediately and closes */}
        <button
          type="button"
          onClick={() => {
            stopLiveCamera();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-lg"
          aria-label="Close Camera"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. CENTER FRAMING RETICLE                                    */}
      {/* ============================================================ */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none px-6">
        <div
          className={`relative w-full max-w-sm aspect-4/3 rounded-3xl border-2 border-dashed flex items-center justify-center transition-all ${
            step === 'unavailable_camera'
              ? 'border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
              : 'border-emerald-400/80 shadow-[0_0_40px_rgba(16,185,129,0.25)]'
          }`}
        >
          {/* Viewfinder corner brackets */}
          <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl ${step === 'unavailable_camera' ? 'border-amber-400' : 'border-emerald-400'}`} />
          <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl ${step === 'unavailable_camera' ? 'border-amber-400' : 'border-emerald-400'}`} />
          <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl ${step === 'unavailable_camera' ? 'border-amber-400' : 'border-emerald-400'}`} />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-xl ${step === 'unavailable_camera' ? 'border-amber-400' : 'border-emerald-400'}`} />

          {/* Center target dot */}
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              step === 'unavailable_camera'
                ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]'
            }`}
          />

          {/* Reticle guide caption */}
          <div className="absolute bottom-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/15 flex items-center gap-1.5">
            {step === 'unavailable_camera' ? (
              <span className="text-amber-300">Point at Empty Bay: {stop.parking_location}</span>
            ) : (
              <span className="text-emerald-300">Align Clean Vehicle in Frame</span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. FLOATING BOTTOM CONTROLS & GREEN TICK BUTTON               */}
      {/* ============================================================ */}
      <div className="relative z-20 w-full bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-6 pb-6 px-4 pb-[max(env(safe-area-inset-bottom),1.75rem)] flex flex-col items-center space-y-4">
        {/* Live Timestamp & Payout Ribbon */}
        <div className="w-full max-w-sm flex items-center justify-between text-[11px] font-mono bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{liveTimeStr || 'Live Timestamp'} IST</span>
          </div>
          <div className="text-emerald-400 font-bold shrink-0">
            +₹{stop.payout_amount} Payout
          </div>
        </div>

        {/* STEP A: NORMAL WASH PROOF -> GREEN TICK BUTTON */}
        {step === 'after' && (
          <>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleCaptureAfter}
                disabled={isSaving}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-90 border-4 border-white shadow-[0_0_35px_rgba(16,185,129,0.85)] flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-50"
                aria-label="Capture Wash Proof & Finish Wash"
              >
                {isSaving ? (
                  <RefreshCw className="w-10 h-10 animate-spin text-white" />
                ) : (
                  <Check className="w-11 h-11 stroke-[3.5] text-white" />
                )}
              </button>
              <span className="text-[11px] font-bold text-emerald-300 tracking-wide uppercase drop-shadow-sm">
                {isSaving ? 'Saving & Turning Off Camera...' : 'Tap tick to capture & finish'}
              </span>
            </div>

            {/* Vehicle Not Available Switch */}
            <button
              type="button"
              onClick={() => setStep('unavailable_camera')}
              disabled={isSaving}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-amber-950/60 border border-amber-500/40 backdrop-blur-md transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Vehicle not at {stop.parking_location}? Report Empty Bay</span>
            </button>
          </>
        )}

        {/* STEP B: EMPTY BAY VERIFICATION */}
        {step === 'unavailable_camera' && (
          <>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleCaptureEmptyBay}
                disabled={isSaving}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-90 border-4 border-white shadow-[0_0_35px_rgba(245,158,11,0.85)] flex items-center justify-center text-slate-950 transition-all cursor-pointer disabled:opacity-50"
                aria-label="Capture Empty Bay Proof"
              >
                {isSaving ? (
                  <RefreshCw className="w-10 h-10 animate-spin text-slate-950" />
                ) : (
                  <Check className="w-11 h-11 stroke-[3.5] text-slate-950" />
                )}
              </button>
              <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase drop-shadow-sm">
                {isSaving ? 'Saving Evidence & Closing...' : 'Tap tick to record empty bay & protect payout'}
              </span>
            </div>

            {/* Return to Vehicle Wash */}
            <button
              type="button"
              onClick={() => setStep('after')}
              disabled={isSaving}
              className="text-xs font-semibold text-slate-300 hover:text-white py-1 px-3 rounded-full bg-black/60 border border-white/20 transition-colors cursor-pointer"
            >
              Cancel • Vehicle is present
            </button>
          </>
        )}
      </div>
    </div>
  );
}
