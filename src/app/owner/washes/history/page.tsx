'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import OwnerProofCalendar from '@/components/OwnerProofCalendar';
import ChangeWasherModal from '@/components/modals/ChangeWasherModal';
import { fetchOwnerDashboardFromFirestore } from '@/lib/firebaseService';

export default function WashHistoryPage() {
  const router = useRouter();
  const { washes, isLoggedIn, isHydrated, user, vehicles } = useStore();

  const resolvedInitialWasher =
    user?.assigned_washer_name ||
    vehicles[0]?.assigned_washer_name ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null) ||
    'Assigned Partner';

  const [assignedWasher, setAssignedWasher] = useState(resolvedInitialWasher);
  const [washerAvatar, setWasherAvatar] = useState('/images/washer_amit.jpg');
  const [showChangeWasherModal, setShowChangeWasherModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadWasherData = async () => {
      const localName =
        user?.assigned_washer_name ||
        vehicles[0]?.assigned_washer_name ||
        (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null);

      if (localName && localName !== 'Amit Kumar') {
        setAssignedWasher(localName);
      }

      if (user?.id || user?.phone) {
        try {
          const fbData = await fetchOwnerDashboardFromFirestore(user.id, user.phone);
          if (!isMounted) return;
          if (fbData.assignedWasher?.name) {
            setAssignedWasher(fbData.assignedWasher.name);
            if (fbData.assignedWasher.avatar) {
              setWasherAvatar(fbData.assignedWasher.avatar);
            }
          } else if (fbData.user?.assigned_washer_name) {
            setAssignedWasher(fbData.user.assigned_washer_name);
          }
        } catch (err) {
          console.warn('History washer lookup notice:', err);
        }
      }
    };
    loadWasherData();
    return () => {
      isMounted = false;
    };
  }, [user.id, user.phone, user.assigned_washer_name, vehicles]);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#2DD4A0]" />
        <p className="text-xs tracking-widest text-white/50 font-mono uppercase">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* TOP HEADER */}
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/dashboard"
              className="p-2.5 rounded-xl bg-[#161C25] border border-white/[0.08] text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
                Verified Audit Records
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Wash History & Proof Matrix
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ASSIGNED WASHER CARD */}
        <div className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <Image
                src={washerAvatar || '/images/washer_amit.jpg'}
                alt={assignedWasher}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2DD4A0]">
                  Society Dedicated Specialist
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Assigned Specialist: <span className="text-[#2DD4A0]">{assignedWasher}</span>
              </h2>
            </div>
          </div>

        </div>

        {/* INTERACTIVE MODERN UI CALENDAR */}
        <div className="space-y-6">
          <OwnerProofCalendar
            assignedWasherName={assignedWasher}
            assignedWasherAvatar={washerAvatar}
            parkingLocation={vehicles[0]?.parking_location}
            selectedVehicleId={vehicles[0]?.id}
            signupDate={vehicles[0]?.signupDate || user?.signupDate}
            serviceStartDate={vehicles[0]?.serviceStartDate || user?.serviceStartDate}
          />
        </div>
      </div>

      {/* CHANGE WASHER MODAL */}
      <ChangeWasherModal
        isOpen={showChangeWasherModal}
        onClose={() => setShowChangeWasherModal(false)}
        currentWasherName={assignedWasher}
        onWasherChanged={(newWasher) => setAssignedWasher(newWasher)}
      />

      <OwnerBottomNav />
    </div>
  );
}
