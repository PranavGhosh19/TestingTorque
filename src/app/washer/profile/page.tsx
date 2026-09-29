'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';

export default function WasherProfilePage() {
  const { washerEarnings } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Certified Partner Identity
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            Washer Profile
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
            <Image
              src="/images/washer_amit.jpg"
              alt="Amit Kumar"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#0B132B]">Amit Kumar</h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Verified Partner
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9 Rating
              </span>
              <span>•</span>
              <span>Green Valley Residency Cluster</span>
            </div>
          </div>
        </div>

        {/* Operational Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-[#0B132B]">1,240</div>
            <span className="text-[11px] text-slate-500 font-medium">Total Washes</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-emerald-600">99.2%</div>
            <span className="text-[11px] text-slate-500 font-medium">Completion Rate</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-blue-600">34</div>
            <span className="text-[11px] text-slate-500 font-medium">Active Daily Cars</span>
          </div>
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
                <div className="text-slate-500">Account ending in •••• {washerEarnings.bank_account_last4}</div>
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
