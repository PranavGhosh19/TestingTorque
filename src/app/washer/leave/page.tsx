'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';

export default function WasherLeavePage() {
  const { washerRequestLeave } = useStore();
  const [startDate, setStartDate] = useState('10 Sept');
  const [endDate, setEndDate] = useState('12 Sept');
  const [selectedBackup, setSelectedBackup] = useState('Rahul');
  const [confirmed, setConfirmed] = useState(false);

  const backupNetwork = [
    { name: 'Rahul', rating: '4.8', activeCars: '33', status: 'Ready to cover' },
    { name: 'Suresh', rating: '4.9', activeCars: '30', status: 'Ready to cover' },
    { name: 'Vijay', rating: '4.7', activeCars: '28', status: 'Ready to cover' },
  ];

  const handleConfirmLeave = () => {
    washerRequestLeave(startDate, endDate, selectedBackup);
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/washer/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-[#0B132B]">
              Request Leave & Auto-Cover
            </h1>
            <span className="text-[11px] text-slate-500">
              Amit&apos;s Society Peer Network
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {!confirmed ? (
          <div className="premium-card p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Planned Absence
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B132B] mt-1">
                Request Leave
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your customers will be automatically routed to your chosen backup partner.
              </p>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  From
                </span>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 bg-transparent font-extrabold text-lg text-[#0B132B] focus:outline-hidden"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  To
                </span>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 bg-transparent font-extrabold text-lg text-[#0B132B] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Backup Washer Network */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Backup Washer (Amit&apos;s Network)
              </label>
              <div className="space-y-2.5">
                {backupNetwork.map((w) => (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => setSelectedBackup(w.name)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedBackup === w.name
                        ? 'border-emerald-600 bg-emerald-50/70 text-[#0B132B] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {w.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {w.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ★ {w.rating} • {w.activeCars} vehicles in society
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        {w.status}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedBackup === w.name
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedBackup === w.name && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmLeave}
              className="w-full py-4 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              [ Confirm Leave ]
            </button>
          </div>
        ) : (
          /* Confirmation Screen (Prompt Section 17) */
          <div className="premium-card p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Leave Approved
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B132B] mt-2">
                Your customers will be covered.
              </h2>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Backup Partner:</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedBackup}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Coverage Duration:</span>
                <span className="font-bold text-slate-900">{startDate} → {endDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Assigned Society:</span>
                <span className="font-bold text-slate-900">Green Valley Residency</span>
              </div>
            </div>

            <Link
              href="/washer/dashboard"
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center transition-colors"
            >
              Return to Route Dashboard
            </Link>
          </div>
        )}
      </div>

      <WasherBottomNav />
    </div>
  );
}
