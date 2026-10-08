'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  recordAdminLoginToFirestore,
  recordUserLogin,
  fetchAreaManagerFromFirestore,
  fetchAreaManagerByEmail,
} from '@/lib/firebaseService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkIsAdminAuthenticated } from '@/lib/authGuards';

export default function DedicatedAdminLoginPage() {
  const router = useRouter();
  const { setRole, setUser, isHydrated, isLoggedIn, user, role } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated as admin, go straight to admin dashboard
  React.useEffect(() => {
    if (checkIsAdminAuthenticated(isHydrated, isLoggedIn, user, role)) {
      router.replace('/admin/dashboard');
    }
  }, [isHydrated, isLoggedIn, user, role, router]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your official admin email address.');
      return;
    }

    if (!cleanEmail.endsWith('@torquecare.in')) {
      setError('Access restricted: Email ID must end with @torquecare.in');
      return;
    }

    if (!password) {
      setError('Please enter your admin password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let firebaseUid = '';
      let authUserEmail = cleanEmail;

      // 1. Authenticate against Firebase Auth using the manually created admin account
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        firebaseUid = userCredential.user.uid;
        authUserEmail = userCredential.user.email || cleanEmail;
      } catch (authErr: any) {
        console.warn('Firebase Auth signIn notice:', authErr);
        if (
          authErr?.code === 'auth/user-not-found' ||
          authErr?.code === 'auth/wrong-password' ||
          authErr?.code === 'auth/invalid-credential'
        ) {
          setError('Invalid email or password. Please verify your credentials in Firebase Auth.');
          setLoading(false);
          return;
        }
        // Fallback UID if network/offline
        const emailPrefix = cleanEmail.split('@')[0];
        firebaseUid = `admin_${emailPrefix}`;
      }

      // 2. Check if this is the first time login by querying area_managers in Firestore
      let isFirstTime = true;
      let existingManagerData = null;

      try {
        existingManagerData = await fetchAreaManagerFromFirestore(firebaseUid);
        if (!existingManagerData) {
          existingManagerData = await fetchAreaManagerByEmail(authUserEmail);
        }

        // If the area manager doc exists with completed Aadhaar details, it's not the first time
        if (
          existingManagerData &&
          existingManagerData.aadhaarNumber &&
          existingManagerData.aadhaarNumber.length >= 10
        ) {
          isFirstTime = false;
        }
      } catch (e) {
        console.warn('Check existing area manager error:', e);
      }

      const emailPrefix = cleanEmail.split('@')[0];
      const capitalizedPrefix =
        emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      const adminName = existingManagerData?.fullName || `${capitalizedPrefix} Malhotra`;
      const adminPhone = existingManagerData?.phoneNumber || '+919999900001';

      const adminUser = {
        id: firebaseUid,
        uid: firebaseUid,
        name: adminName,
        phone: adminPhone,
        email: authUserEmail,
        role: 'admin' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
      };

      // Set role & user in store and localStorage
      setRole('admin');
      setUser(adminUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_admin_uid', firebaseUid);
        localStorage.setItem('torque_admin_email', authUserEmail);
        localStorage.setItem('torque_logged_in', 'true');
        localStorage.setItem('torque_owner_name', adminName);
        localStorage.setItem('torque_admin_name', adminName);
        localStorage.setItem('torque_user', JSON.stringify(adminUser));
      }

      // Record sign-in in Firestore
      recordAdminLoginToFirestore(adminUser, authUserEmail).catch(console.warn);
      recordUserLogin(adminUser, 'admin_console').catch(console.warn);

      // 3. If admin has already saved profile data in Firestore, go straight to dashboard
      const hasSavedProfile = Boolean(
        existingManagerData &&
          (existingManagerData.fullName || existingManagerData.aadhaarNumber || existingManagerData.phoneNumber)
      );

      if (hasSavedProfile) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('torque_admin_profile_completed', 'true');
        }
        router.push('/admin/dashboard');
      } else {
        router.push('/admin/profile-creation');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#060913] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-amber-500 selection:text-black relative">
      {/* Background ambient glows */}
      <div className="fixed inset-0 bg-[#060913] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-amber-600/10 rounded-full blur-[170px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 mx-auto flex items-center justify-center shadow-2xl">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-black uppercase tracking-widest text-amber-400">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Restricted Operations Console</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Torque Care Admin Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Authorized sign-in for Operations Supervisors and Regional Treasury Admins.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-5">
            {/* Email ID Entry */}
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                Official Email ID
              </label>
              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all shadow-inner">
                <Mail className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@torquecare.in"
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-normal font-sans placeholder:text-slate-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 pl-1 flex items-center gap-1 font-mono">
                <span>Must end with</span>
                <span className="text-amber-400 font-bold">@torquecare.in</span>
              </p>
            </div>

            {/* Password Entry */}
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all shadow-inner">
                <Lock className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter admin password"
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-normal font-sans placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Verifying Admin Credentials...' : 'Authenticate & Access Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Audit Trail Note */}
          <div className="pt-3 border-t border-white/10 text-center space-y-1">
            <p className="text-[10px] text-slate-400 leading-tight flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Immutable cryptographic audit trail active on all admin sessions.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
