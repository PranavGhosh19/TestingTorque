'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  AlertTriangle,
  UserX,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { WasherPartner } from '@/lib/washerPartners';
import { useStore } from '@/lib/store';

interface DismissWasherModalProps {
  isOpen: boolean;
  onClose: () => void;
  washer: WasherPartner | null;
  onSuccess?: () => void;
}

export default function DismissWasherModal({
  isOpen,
  onClose,
  washer,
  onSuccess,
}: DismissWasherModalProps) {
  const { dismissWasher } = useStore();
  const [reason, setReason] = useState('Quality compliance & repeated missed bays');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !washer) return null;

  const handleDismiss = async () => {
    setIsSubmitting(true);
    const finalReason = customNote.trim() ? `${reason}: ${customNote.trim()}` : reason;
    await dismissWasher(washer.id, finalReason);
    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-red-200">
        {/* Header */}
        <div className="bg-red-950/90 text-white p-5 flex items-center justify-between border-b border-red-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-red-400 block">
                Manager Action • Partner Dismissal
              </span>
              <h2 className="text-lg font-black text-white">Dismiss Washer Partner</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target Washer Info */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-300 shrink-0">
              <Image
                src={washer.avatar}
                alt={washer.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-slate-900 truncate">
                {washer.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {washer.phone} • {washer.society}
              </p>
              <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                Currently assigned: {washer.assignedCarsPerDay} vehicles/day
              </div>
            </div>
          </div>

          {/* Warning Callout */}
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-xs text-red-900 flex items-start gap-2.5 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong>Immediate operational impact:</strong> This partner&apos;s live mobile route access will be revoked immediately. Their assigned vehicles will be flagged for reassignment to another partner so owners experience zero service gaps.
            </div>
          </div>

          {/* Dismissal Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Reason for Dismissal
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-400"
            >
              <option value="Quality compliance & repeated missed bays">
                Quality compliance & repeated missed bays
              </option>
              <option value="Unnotified repeated attendance absences">
                Unnotified repeated attendance absences
              </option>
              <option value="Partner requested voluntary release from route">
                Partner requested voluntary release from route
              </option>
              <option value="Disciplinary or residential policy breach">
                Disciplinary or residential policy breach
              </option>
              <option value="Route restructuring and area reallocation">
                Route restructuring and area reallocation
              </option>
            </select>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">
              Manager Audit Notes (Optional)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. 3 owner complaints received for Tower B..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dismissing...</span>
                </>
              ) : (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  <span>Confirm Dismissal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
