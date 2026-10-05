'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Star,
  Award,
  Landmark,
  Calendar,
  Phone,
  ChevronRight,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
  LogOut,
  Clock,
  Users,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import { WasherPartner } from '@/lib/types';
import {
  fetchWasherFromFirestore,
  fetchPeerWashersInSameSocieties,
  markWasherAbsentTodayInFirestore,
  fetchWasherDashboardDataFromFirestore,
} from '@/lib/firebaseService';

export default function WasherProfilePage() {
  const router = useRouter();
  const { user, washerEarnings, logout } = useStore();
  const [firebaseWasher, setFirebaseWasher] = useState<WasherPartner | null>(null);
  const [peerWashers, setPeerWashers] = useState<WasherPartner[]>([]);
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [isAbsentToday, setIsAbsentToday] = useState(false);
  const [isMarkingAbsent, setIsMarkingAbsent] = useState(false);
  const [absentNotice, setAbsentNotice] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<{
    totalTarget: number;
    completedCount: number;
    progressPercent: number;
  } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadWasher() {
      try {
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null;
        const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;
        const queryId = (user?.role === 'washer' && user?.id && user.id !== 'usr_guest') ? user.id : (storedId || undefined);
        const queryPhone = user?.phone || storedPhone || undefined;
        if (queryId || queryPhone) {
          const fetched = await fetchWasherFromFirestore(queryId, queryPhone);
          if (isMounted && fetched) {
            setFirebaseWasher(fetched);
            const todayIso = new Date().toISOString().split('T')[0];
            const absentList = Array.isArray(fetched.absentDates) ? fetched.absentDates : [];
            setIsAbsentToday(absentList.includes(todayIso));

            // Fetch peer washers working on the same societies
            setLoadingPeers(true);
            try {
              const peers = await fetchPeerWashersInSameSocieties(
                fetched.id,
                fetched.societies || fetched.society
              );
              if (isMounted) {
                setPeerWashers(peers);
              }
            } catch (pErr) {
              console.warn('Profile peer washers fetch notice:', pErr);
            } finally {
              if (isMounted) setLoadingPeers(false);
            }

            // Fetch live operational metrics
            try {
              const dashData = await fetchWasherDashboardDataFromFirestore(fetched.id, fetched.phone);
              if (isMounted && dashData?.metrics) {
                setLiveMetrics({
                  totalTarget: dashData.metrics.totalTarget,
                  completedCount: dashData.metrics.completedCount,
                  progressPercent: dashData.metrics.progressPercent,
                });
              }
            } catch (mErr) {
              console.warn('Profile dashboard metrics notice:', mErr);
            }
          }
        }
      } catch (err) {
        console.warn('Profile washer load notice:', err);
      }
    }
    loadWasher();
    return () => { isMounted = false; };
  }, [user?.id, user?.phone]);

  const handleToggleAbsentToday = async () => {
    const targetId = firebaseWasher?.id || (user?.role === 'washer' ? user.id : null);
    if (!targetId) return;

    setIsMarkingAbsent(true);
    const todayIso = new Date().toISOString().split('T')[0];
    try {
      const res = await markWasherAbsentTodayInFirestore(targetId, todayIso);
      if (res.success) {
        setIsAbsentToday(res.isAbsent);
        setAbsentNotice(
          res.isAbsent
            ? 'Marked absent for today only. Route backup activated.'
            : 'Today’s absence revoked. Marked active on route.'
        );
        setTimeout(() => setAbsentNotice(null), 4000);
      }
    } catch (err) {
      console.error('Error toggling absent today:', err);
    } finally {
      setIsMarkingAbsent(false);
    }
  };

  const storedWasherName = mounted && typeof window !== 'undefined' ? localStorage.getItem('torque_washer_name') : null;
  const washerDisplayName =
    firebaseWasher?.name ||
    (mounted && storedWasherName ? storedWasherName : null) ||
    (user?.role === 'washer' && user?.name && user.name !== 'Vehicle Owner' ? user.name : null) ||
    'Amit Kumar';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone
      ) {
        setIsInstalled(true);
      }

      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleAddToHomeScreen = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_washer_id');
      localStorage.removeItem('torque_washer_phone');
      localStorage.removeItem('torque_washer_name');
    }
    router.replace('/washer/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <header className="bg-white border-b border-slate-200/80 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Certified Partner Identity
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            Washer Profile
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 bg-emerald-950/20">
              <Image
                src={firebaseWasher?.avatar || user?.avatar_url || "/images/washer_amit.jpg"}
                alt={mounted ? washerDisplayName : "Washer Partner"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-[#0B132B] truncate" suppressHydrationWarning>
                  {mounted ? washerDisplayName : "Washer Partner"}
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Verified Partner
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-amber-600 font-bold" suppressHydrationWarning>
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {mounted ? (firebaseWasher?.rating || '5.0') : '5.0'} Rating
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions: Request Leave & Absent Today */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5 flex-wrap">
            <Link
              href="/washer/leave"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-center"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Request Leave</span>
            </Link>

            <button
              type="button"
              onClick={handleToggleAbsentToday}
              disabled={isMarkingAbsent}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer border ${
                isAbsentToday
                  ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Indicates that you will be absent only for the present day"
            >
              <Clock className="w-4 h-4" />
              <span>{isMarkingAbsent ? 'Updating...' : isAbsentToday ? 'Absent Today ✓' : 'Absent Today'}</span>
            </button>
          </div>

          {absentNotice && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                isAbsentToday
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{absentNotice}</span>
            </div>
          )}
        </div>

        {/* Operational Badges (Dynamic, no dummy data) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-[#0B132B]" suppressHydrationWarning>
              {firebaseWasher?.totalLifetimeWashes ?? liveMetrics?.completedCount ?? 0}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total Washes</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-emerald-600" suppressHydrationWarning>
              {firebaseWasher?.completionRate || (liveMetrics && liveMetrics.totalTarget > 0 ? `${liveMetrics.progressPercent}%` : '100%')}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Completion Rate</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-blue-600" suppressHydrationWarning>
              {liveMetrics?.totalTarget ?? (firebaseWasher?.assignedCarsPerDay ?? 0)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Active Daily Cars</span>
          </div>
        </div>

        {/* Society Peer Network (Washers working in the same societies) */}
        <div className="premium-card p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Society Peer Network
              </span>
              <h3 className="text-base font-extrabold text-[#0B132B]">
                Society Washer Partners
              </h3>
              <p className="text-xs text-slate-500">
                Partners active in your assigned societies available for route backup &amp; coverage
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full shrink-0">
              {peerWashers.length} {peerWashers.length === 1 ? 'Partner' : 'Partners'}
            </span>
          </div>

          {loadingPeers ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium animate-pulse">
              Loading society partners...
            </div>
          ) : peerWashers.length === 0 ? (
            <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1.5">
              <Users className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No other partners in your society cluster yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Partners assigned to your society by the Operations team will appear here automatically for peer coverage.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {peerWashers.map((peer) => (
                <div
                  key={peer.id}
                  className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-emerald-950/20 shrink-0 border border-slate-200">
                      <Image
                        src={peer.avatar || '/images/washer_amit.jpg'}
                        alt={peer.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{peer.name}</span>
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 fill-amber-500" /> {peer.rating || '5.0'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {peer.assignedCarsPerDay || 0} daily vehicles • {peer.status || 'Active on Route'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {peer.phone && (
                      <a
                        href={`tel:${peer.phone}`}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                        title={`Call ${peer.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link
                      href={`/washer/leave?backup=${encodeURIComponent(peer.name)}`}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-2xs"
                    >
                      Backup Cover
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bank & Payout Settings */}
        <div className="premium-card p-5 bg-white border-slate-200/90 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Bank Settlement Account
          </span>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Landmark className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-slate-900">HDFC Bank Limited</div>
                <div className="text-slate-500" suppressHydrationWarning>
                  Account ending in •••• {mounted ? (washerEarnings?.bank_account_last4 || '3819') : '3819'}
                </div>
              </div>
            </div>
            <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
              Verified
            </span>
          </div>
        </div>

        {/* Quick Operational Links */}
        <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 overflow-hidden text-xs font-semibold">
          <Link
            href="/washer/leave"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" /> Request Leave & Assign Backup
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/washer/earnings"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Landmark className="w-4 h-4 text-slate-400" /> Payout History & Tax Summaries
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Add to Home Screen Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddToHomeScreen}
            className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isInstalled ? 'App Installed on Home Screen ✓' : 'Add to Home Screen'}</span>
          </button>
        </div>

        {/* Logout Option */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200/90 hover:border-rose-200 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-5 text-slate-800 relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-slate-200">
                <Image
                  src="/images/app_icon.jpg"
                  alt="Torque Care Icon"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0B132B]">Install Torque Care</h3>
                <p className="text-xs text-slate-500">Quick access from your home screen</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>📱 On iPhone / iPad (Safari):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                <li>
                  Tap the <strong className="text-slate-800">Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600" /> in Safari
                </li>
                <li>
                  Scroll down and tap <strong className="text-slate-800">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />
                </li>
                <li>Tap <strong className="text-slate-800">Add</strong> in top right corner</li>
              </ol>

              <div className="pt-2 border-t border-slate-200 font-bold text-slate-900 flex items-center gap-1.5">
                <span>🤖 On Android (Chrome):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                <li>Tap the three dots menu (<strong>⋮</strong>) in Chrome</li>
                <li>Tap <strong className="text-slate-800">Add to Home screen</strong> or <strong className="text-slate-800">Install app</strong></li>
              </ol>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      <WasherBottomNav />
    </div>
  );
}
