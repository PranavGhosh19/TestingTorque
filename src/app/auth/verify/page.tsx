'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowRight, Car, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  recordUserLogin,
  recordAdminLoginToFirestore,
  findUserByPhoneInFirestore,
  findWasherByPhoneInFirestore,
  syncOwnerToFirestore,
} from '@/lib/firebaseService';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '+91 98765 43210';
  const roleParam = searchParams.get('role') || 'owner';
  const [otp, setOtp] = useState(['4', '2', '9', '1']);
  const [loading, setLoading] = useState(false);
  const { setRole, setUser, washers, user, setIsLoggedIn } = useStore();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanPhone = phone.replace(/\D/g, '');

    if (roleParam === 'washer') {
      setRole('washer');
      let matchedWasher = washers.find(
        (w) =>
          w.phone.replace(/\D/g, '').includes(cleanPhone) ||
          cleanPhone.includes(w.phone.replace(/\D/g, ''))
      );

      // If not in local store, attempt lookup in Firestore
      if (!matchedWasher) {
        matchedWasher = (await findWasherByPhoneInFirestore(cleanPhone)) || undefined;
      }

      const washerUser = {
        id: matchedWasher?.id || `wsh_${cleanPhone.slice(-6)}`,
        name: matchedWasher?.name || 'Verified Washer Partner',
        phone: matchedWasher?.phone || phone,
        role: 'washer' as const,
        avatar_url: matchedWasher?.avatar || '/images/washer_amit.jpg',
        status: 'active' as const,
        created_at: new Date().toISOString(),
      };

      setUser(washerUser);
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_user', JSON.stringify(washerUser));
      }

      // Record washer login in Firebase Firestore
      recordUserLogin(washerUser, 'otp').catch((err) => {
        console.warn('Firebase washer login record notice:', err);
      });

      setTimeout(() => {
        router.push('/washer/dashboard');
      }, 350);
    } else if (roleParam === 'admin') {
      setRole('admin');
      const adminUser = {
        id: 'admin-lead-1',
        name: 'Vikram Malhotra (Ops Lead)',
        phone: phone,
        role: 'admin' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
      };

      setUser(adminUser);
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_user', JSON.stringify(adminUser));
      }

      // Record admin login in Firebase Firestore
      recordAdminLoginToFirestore(adminUser, phone).catch((err) => {
        console.warn('Firebase admin login record notice:', err);
      });
      recordUserLogin(adminUser, 'otp').catch((err) => {
        console.warn('Firebase user login record notice:', err);
      });

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 350);
    } else {
      setRole('owner');
      // Look up user from Firestore or store
      let ownerName = user?.name && user.name !== 'Unregistered User' ? user.name : 'Verified Vehicle Owner';
      const existingFirestoreUser = await findUserByPhoneInFirestore(phone);
      if (existingFirestoreUser) {
        ownerName = existingFirestoreUser.name;
      }

      const ownerUser = {
        id: existingFirestoreUser?.id || user.id || `usr_${Date.now()}`,
        name: ownerName,
        phone: phone,
        role: 'owner' as const,
        status: 'active' as const,
        created_at: existingFirestoreUser?.created_at || user.created_at || new Date().toISOString(),
      };

      setUser(ownerUser);
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_user', JSON.stringify(ownerUser));
      }

      // Save/Sync login in Firebase Firestore
      recordUserLogin(ownerUser, 'otp').catch((err) => {
        console.warn('Firebase owner login record notice:', err);
      });
      syncOwnerToFirestore(ownerUser).catch((err) => {
        console.warn('Firebase syncOwner notice:', err);
      });

      setTimeout(() => {
        router.push('/owner/dashboard');
      }, 350);
    }
  };


  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-blue-500 selection:text-white relative">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 text-white mx-auto flex items-center justify-center shadow-2xl">
            {roleParam === 'washer' ? (
              <span className="text-3xl">🧼</span>
            ) : roleParam === 'admin' ? (
              <span className="text-3xl">🛡️</span>
            ) : (
              <Car className="w-8 h-8 text-blue-400" />
            )}
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            roleParam === 'washer'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : roleParam === 'admin'
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}>
            {roleParam === 'washer'
              ? 'Partner Verification'
              : roleParam === 'admin'
              ? 'Operations Admin 2FA'
              : 'Owner Verification'}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Verify One-Time Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto font-mono">
            Enter the 4-digit code sent to <span className="font-bold text-white">{phone}</span>
          </p>
        </div>

        {/* OTP Input Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-3 text-center">
                One-Time Password
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[index] = e.target.value;
                      setOtp(newOtp);
                    }}
                    className="w-13 h-15 sm:w-14 sm:h-16 text-center font-mono font-black text-2xl text-white bg-white/5 border border-white/15 rounded-2xl focus:outline-hidden focus:border-blue-400 focus:bg-white/10 shadow-inner transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Resend Code (30s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading verification...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
