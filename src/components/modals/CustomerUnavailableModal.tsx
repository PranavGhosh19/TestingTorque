'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Camera, Check, X, ShieldAlert } from 'lucide-react';
import { useStore } from '@/lib/store';
import { RouteStop } from '@/lib/types';

interface Props {
  stop: RouteStop | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerUnavailableModal({ stop, isOpen, onClose }: Props) {
  const { washerReportUnavailable } = useStore();
  const [selectedReason, setSelectedReason] = useState<string>('Vehicle not accessible');
  const [hasEvidence, setHasEvidence] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !stop) return null;

  const reasons = [
    'Vehicle not accessible',
    'Customer unavailable',
    'Parking blocked / Car locked in bay',
    'Owner parked in non-assigned bay',
    'Other / Gate locked',
  ];

  const handleSubmit = () => {
    washerReportUnavailable(
      stop.stop_number,
      selectedReason,
      hasEvidence ? '/images/honda_city_before.jpg' : undefined
    );
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="bg-amber-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Log Wash Exception
              </h3>
              <p className="text-xs text-amber-100">
                {stop.vehicle_name} ({stop.parking_location})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Attempt Registered
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Operations team and vehicle owner have been notified with your verified timestamp and bay report. Your rating will not be penalized.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Reason for Attempt
                </label>
                <div className="space-y-2">
                  {reasons.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedReason(r)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        selectedReason === r
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{r}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedReason === r
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedReason === r && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional photo evidence */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Evidence Photo (Recommended to avoid disputes)
                </label>
                <button
                  type="button"
                  onClick={() => setHasEvidence(!hasEvidence)}
                  className={`w-full py-3 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                    hasEvidence
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-300 hover:border-slate-400 text-slate-600'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {hasEvidence
                      ? '✓ Evidence Photo Attached (Obstruction Captured)'
                      : 'Take Photo of Blocked Bay / Obstacle'}
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs active:scale-[0.98]"
                >
                  Submit Attempt
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
