'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, UserCheck, ShieldCheck, X } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function WasherLeaveModal({ isOpen, onClose }: Props) {
  const { washerRequestLeave } = useStore();
  const [startDate, setStartDate] = useState('10 Oct');
  const [endDate, setEndDate] = useState('12 Oct');
  const [backupId, setBackupId] = useState('wsh_rahul');
  const [isApproved, setIsApproved] = useState(false);

  if (!isOpen) return null;

  const backupWashers = [
    { id: 'wsh_rahul', name: 'Rahul Sharma', rating: '4.8', activeVehicles: '33', status: 'Available' },
    { id: 'wsh_suresh', name: 'Suresh Verma', rating: '4.9', activeVehicles: '30', status: 'Available' },
    { id: 'wsh_vijay', name: 'Vijay Pal', rating: '4.7', activeVehicles: '28', status: 'Available' },
  ];

  const handleConfirm = () => {
    washerRequestLeave(startDate, endDate, backupId);
    setIsApproved(true);
  };

  const selectedBackup = backupWashers.find((b) => b.id === backupId) || backupWashers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="bg-[#0B132B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/20">
              <Calendar className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Request Leave & Auto-Cover
              </h3>
              <p className="text-xs text-slate-300">
                Zero missed washes for your customers
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

        <div className="p-6">
          {!isApproved ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    From Date
                  </span>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full mt-1 bg-transparent font-bold text-sm text-[#0B132B] focus:outline-hidden"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    To Date
                  </span>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full mt-1 bg-transparent font-bold text-sm text-[#0B132B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Select Backup Partner (Amit&apos;s Network)
                </label>
                <div className="space-y-2">
                  {backupWashers.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setBackupId(w.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        backupId === w.id
                          ? 'border-blue-600 bg-blue-50/70 text-[#0B132B]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {w.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {w.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ★ {w.rating} • {w.activeVehicles} vehicles in society
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        {w.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  All 34 vehicles in your Green Valley route will be auto-synced to {selectedBackup.name}&apos;s route app.
                </span>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-sm shadow-sm transition-all"
              >
                [ Confirm Leave & Assign Backup ]
              </button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ Leave Approved
                </span>
                <h4 className="text-lg font-bold text-[#0B132B] mt-2">
                  Your customers will be covered.
                </h4>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Backup:</span>
                  <span className="font-bold text-slate-900">{selectedBackup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-900">{startDate} → {endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold">Auto-Notified to Owners</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#0B132B] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
