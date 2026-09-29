'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is already running standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed in current session
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIosDevice);

    // If iOS and not standalone and not dismissed, show prompt after a short delay
    if (isIosDevice && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Listen for standard Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect when successfully installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native OS installation dialog
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS step-by-step installation instructions
      setShowIOSGuide(true);
    } else {
      // Fallback guide
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <aside
        aria-label="Install App"
        className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
      >
        <div className="p-4 rounded-3xl bg-[#0B132B]/95 border border-emerald-500/30 text-white backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/15 bg-slate-900">
              <Image
                src="/images/app_icon.jpg"
                alt="Torque Care"
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-tight truncate">
                  Torque Care
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full uppercase">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                Install for instant photo alerts & offline routes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS / Fallback Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0B132B] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 text-white relative">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-white/15">
                <Image
                  src="/images/app_icon.jpg"
                  alt="Torque Care Icon"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Install Torque Care</h3>
                <p className="text-xs text-slate-400">Add to your home screen</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
              {isIOS ? (
                <>
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Safari on iPhone / iPad:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1">
                    <li>
                      Tap the <strong className="text-white">Share</strong> icon{' '}
                      <Share className="w-3.5 h-3.5 inline text-blue-400" /> in the bottom toolbar
                    </li>
                    <li>
                      Scroll down and select <strong className="text-white">Add to Home Screen</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />
                    </li>
                    <li>
                      Tap <strong className="text-white">Add</strong> in top-right corner
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Chrome / Browser on Mobile:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1">
                    <li>
                      Tap the browser menu (<strong className="text-white">⋮</strong>)
                    </li>
                    <li>
                      Select <strong className="text-white">Add to Home screen</strong> or{' '}
                      <strong className="text-white">Install App</strong>
                    </li>
                    <li>Confirm installation</li>
                  </ol>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                setIsVisible(false);
              }}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
