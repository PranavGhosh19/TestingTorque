'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  Star,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import { WasherPartner } from '@/lib/types';
import {
  fetchWasherFromFirestore,
  fetchPeerWashersInSameSocieties,
  markWasherAbsentTodayInFirestore,
} from '@/lib/firebaseService';

export default function WasherLeavePage() {
  const { user, washerRequestLeave } = useStore();
  const [currentWasher, setCurrentWasher] = useState<WasherPartner | null>(null);
  const [startDate, setStartDate] = useState('Today');
  const [endDate, setEndDate] = useState('Tomorrow');
  const [selectedBackup, setSelectedBackup] = useState('');
  const [backupNetwork, setBackupNetwork] = useState<
    { name: string; rating: string; activeCars: number | string; status: string }[]
  >([]);
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [isAbsentTodayOnly, setIsAbsentTodayOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    setStartDate(todayFormatted);
    setEndDate(tomorrowFormatted);

    let isSubscribed = true;
    async function loadData() {
      try {
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null;
        const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;
        const queryId = (user?.role === 'washer' && user?.id && user.id !== 'usr_guest') ? user.id : (storedId || undefined);
        const queryPhone = user?.phone || storedPhone || undefined;

        if (queryId || queryPhone) {
          const w = await fetchWasherFromFirestore(queryId, queryPhone);
          if (isSubscribed && w) {
            setCurrentWasher(w);
            setLoadingPeers(true);

            // Fetch peer washers in the same society
            const peers = await fetchPeerWashersInSameSocieties(w.id, w.societies || w.society);
            if (isSubscribed) {
              if (peers.length > 0) {
                const mapped = peers.map((p) => ({
                  name: p.name,
                  rating: p.rating || '5.0',
                  activeCars: p.assignedCarsPerDay || 0,
                  status: p.status || 'Ready to cover',
                }));
                setBackupNetwork(mapped);
                
                // Check if URL specified a backup
                const urlBackup = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('backup') : null;
                if (urlBackup && mapped.some((m) => m.name.toLowerCase() === urlBackup.toLowerCase())) {
                  setSelectedBackup(urlBackup);
                } else if (mapped[0]) {
                  setSelectedBackup(mapped[0].name);
                }
              } else {
                // Fallback default peer options if single washer in cluster
                setBackupNetwork([
                  { name: 'Society Area Backup', rating: '5.0', activeCars: 25, status: 'On Standby' }
                ]);
                setSelectedBackup('Society Area Backup');
              }
              setLoadingPeers(false);
            }
          }
        }
      } catch (err) {
        console.warn('Error loading leave page data:', err);
      }
    }
    loadData();
    return () => { isSubscribed = false; };
  }, [user?.id, user?.phone]);

  const washerName = currentWasher?.name || (mounted && typeof window !== 'undefined' ? localStorage.getItem('torque_washer_name') : null) || 'Partner';
  const societyName = currentWasher?.society || 'Assigned Society';

  // "Absent Today" action button
  const handleAbsentTodayClick = () => {
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    setStartDate(todayFormatted);
    setEndDate(todayFormatted);
    setIsAbsentTodayOnly(true);
  };

  const handleConfirmLeave = async () => {
    setIsSubmitting(true);
    try {
      washerRequestLeave(startDate, endDate, selectedBackup || 'Society Area Backup');
      
      // If absent today only, also record in Firestore
      if (isAbsentTodayOnly && currentWasher?.id) {
        const todayIso = new Date().toISOString().split('T')[0];
        await markWasherAbsentTodayInFirestore(currentWasher.id, todayIso);
      }
      setConfirmed(true);
    } catch (e) {
      console.error('Error confirming leave:', e);
      setConfirmed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <header className="bg-white border-b border-slate-200/80 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/washer/profile"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-[#0B132B]">
              Request Leave &amp; Auto-Cover
            </h1>
            <span className="text-[11px] text-slate-500" suppressHydrationWarning>
              {washerName}&apos;s Society Peer Network
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {!confirmed ? (
          <div className="premium-card p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
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

              {/* Quick Button: Absent Today */}
              <button
                type="button"
                onClick={handleAbsentTodayClick}
                className={`shrink-0 py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs border cursor-pointer ${
                  isAbsentTodayOnly
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title="Mark absent only for today"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isAbsentTodayOnly ? 'Absent Today Selected ✓' : 'Absent Today'}</span>
              </button>
            </div>

            {isAbsentTodayOnly && (
              <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center gap-2 text-xs text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="font-bold">Absent for Today Only:</strong> You will be marked absent strictly for the present day ({startDate}).
                </div>
              </div>
            )}

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  From
                </span>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setIsAbsentTodayOnly(false);
                  }}
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
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setIsAbsentTodayOnly(false);
                  }}
                  className="w-full mt-1 bg-transparent font-extrabold text-lg text-[#0B132B] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Backup Washer Network */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2" suppressHydrationWarning>
                Backup Washer ({washerName}&apos;s Society Network)
              </label>
              
              {loadingPeers ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading society peers...</div>
              ) : (
                <div className="space-y-2.5">
                  {backupNetwork.map((w) => (
                    <button
                      key={w.name}
                      type="button"
                      onClick={() => setSelectedBackup(w.name)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
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
              )}
            </div>

            <button
              onClick={handleConfirmLeave}
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? 'Confirming...' : '[ Confirm Leave ]'}
            </button>
          </div>
        ) : (
          /* Confirmation Screen */
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
                <span className="font-bold text-slate-900" suppressHydrationWarning>{societyName}</span>
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
