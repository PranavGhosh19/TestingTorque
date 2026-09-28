'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  UserCheck,
  Star,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentWasherName: string;
  onWasherChanged: (newWasherName: string) => void;
}

export default function ChangeWasherModal({
  isOpen,
  onClose,
  currentWasherName,
  onWasherChanged,
}: Props) {
  const [selectedWasher, setSelectedWasher] = useState('Rahul Sharma');
  const [reason, setReason] = useState('prefer_different_slot');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const alternativeWashers = [
    {
      id: 'wsh_rahul',
      name: 'Rahul Sharma',
      rating: 4.8,
      washes: 384,
      experience: '2.5 years',
      specialty: 'Microfiber scratchless specialist',
      avatar: '/images/washer_amit.jpg',
    },
    {
      id: 'wsh_suresh',
      name: 'Suresh Verma',
      rating: 4.9,
      washes: 512,
      experience: '3 years',
      specialty: 'High-gloss sealants & windshield clarity',
      avatar: '/images/washer_amit.jpg',
    },
  ];

  const handleConfirmChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onWasherChanged(selectedWasher);
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0B132B] border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Change Assigned Washer
              </h3>
              <p className="text-xs text-slate-400">
                Current Partner: <span className="text-white font-bold">{currentWasherName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-white">
              Washer Reassigned Successfully!
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your car care will now be handled by{' '}
              <span className="text-emerald-300 font-bold">{selectedWasher}</span> starting from your next scheduled morning wash.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmChange} className="p-6 space-y-5">
            {/* Choose New Verified Washer */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Select Alternative Verified Washer in Your Society
              </label>

              <div className="space-y-2.5">
                {alternativeWashers.map((w) => {
                  const isSelected = selectedWasher === w.name;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWasher(w.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-400 shadow-md ring-1 ring-blue-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl relative overflow-hidden border border-white/15 shrink-0">
                          <Image
                            src={w.avatar}
                            alt={w.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                              {w.name}
                            </span>
                            <span className="text-[10px] font-bold text-amber-300 flex items-center gap-0.5 bg-amber-500/20 px-1.5 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                              {w.rating}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {w.specialty} • {w.washes} washes completed
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-400 bg-blue-500 text-white'
                            : 'border-white/30 bg-transparent'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reason selection */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Reason for change (Helps us improve)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#080D1A] border border-white/15 text-xs font-semibold text-white focus:outline-hidden focus:border-blue-400"
              >
                <option value="prefer_different_slot">Prefer a different time window</option>
                <option value="wash_quality">Want different detailing technique / finish</option>
                <option value="punctuality">Washer timing / arrival preference</option>
                <option value="other">Other reason / Personal preference</option>
              </select>
            </div>

            {/* Optional feedback note */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any specific notes for your society operations supervisor..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Confirm Washer Switch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
