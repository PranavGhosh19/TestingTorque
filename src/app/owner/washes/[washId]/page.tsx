'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Check,
  Info,
} from 'lucide-react';
import SignatureProofCard from '@/components/SignatureProofCard';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import { useStore } from '@/lib/store';

export default function WashDetailsPage() {
  const params = useParams();
  const washId = (params?.washId as string) || '';
  const { todayWash, washes } = useStore();

  // Find targeted wash or fallback to todayWash or fallbackWash
  const fallbackWash = {
    id: 'wash_sep_24_unavailable',
    vehicle_id: 'veh_honda_city',
    vehicle_name: 'Honda City',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'Green Valley Residency • Bay D-14 (Basement 1)',
    washer_id: 'wsh_amit_1',
    washer_name: 'Amit Kumar',
    washer_avatar: '/images/washer_amit.jpg',
    washer_rating: 4.9,
    status: 'vehicle_unavailable' as const,
    outcome_label: 'Customer / Vehicle Unavailable',
    washer_present: true,
    service_possible: false,
    payout_protected: true,
    bay_empty_photo: '/images/empty_parking_bay.jpg',
    scheduled_date: '24 Sep',
    scheduled_time: '7:30 AM',
    started_at: '7:31 AM',
    completed_at: '7:34 AM',
    location_verified: true,
    service_type: 'home' as const,
    city: 'Delhi',
    after_photo: '/images/empty_parking_bay.jpg',
    is_sunday_priority: false,
    is_backup_covered: false,
    notes: 'Customer / Vehicle Unavailable',
  };

  const wash = washes.find((w) => w.id === washId) || todayWash || fallbackWash;
  const isUnavailable = wash.status === 'vehicle_unavailable';

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/washes/history"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-extrabold text-[#0B132B]">
                {isUnavailable
                  ? 'Vehicle Absence Verification'
                  : 'Wash Verification Certificate'}
              </h1>
              <span className="text-[11px] text-slate-500 font-mono">
                Audit log #{wash.id ? wash.id.replace('wash_', 'WP-') : 'WP-902148'}
              </span>
            </div>
          </div>

          {isUnavailable ? (
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              Absence Logged
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              Verified Clean ✓
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ============================================================ */}
        {/* CASE A: VEHICLE UNAVAILABLE (USER RULE IMPLEMENTATION)        */}
        {/* ============================================================ */}
        {isUnavailable ? (
          <div className="space-y-6">
            {/* Live Camera Photo of Assigned Parking Bay */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
              <div className="relative aspect-16/10 sm:aspect-16/9 w-full">
                <Image
                  src={wash.bay_empty_photo || '/images/empty_parking_bay.jpg'}
                  alt="Empty assigned parking bay verified by live camera"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Camera HUD Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 p-4 sm:p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-amber-300 font-bold">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      LIVE CAMERA BAY AUDIT
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/30 text-emerald-400 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      GEO-FENCE LOCKED
                    </span>
                  </div>

                  <div className="space-y-1.5 text-white">
                    <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono font-bold text-amber-200">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {wash.parking_location || 'Green Valley Residency • Bay D-14'}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between">
                      <span>Recorded: {wash.scheduled_date} • {wash.started_at || '7:31 AM'} IST</span>
                      <span className="text-emerald-400 font-bold">Assigned Bay Empty</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* THE RULE: OPERATIONAL AUDIT RECORD */}
            <div className="p-6 rounded-3xl bg-linear-to-br from-amber-500/10 via-white to-amber-50/40 border border-amber-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  Customer / Vehicle Unavailable
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Payout Protected
                </span>
              </div>

              {/* 3-Point Verifiable Result Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Washer Presence
                  </span>
                  <div className="text-base font-black text-emerald-600 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Present ✓
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Arrived inside scheduled window
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Service Status
                  </span>
                  <div className="text-base font-black text-slate-800 flex items-center gap-1.5 mt-1">
                    Not possible
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Vehicle was not in assigned bay
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Washer Payout
                  </span>
                  <div className="text-base font-black text-emerald-600 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Protected ✓
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Partner compensated (+₹20)
                  </span>
                </div>
              </div>

              {/* Rule Explicit Declaration */}
              <div className="p-4 rounded-2xl bg-[#0B132B] text-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  Torque Care Operating Guarantee
                </div>
                <p className="text-xs font-bold text-white leading-relaxed">
                  It should not be classified as a missed wash by the washer.
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                  The partner reached your assigned parking bay during the scheduled window (07:30 AM). As the vehicle was absent, the partner tapped <span className="font-mono text-amber-300 font-bold">VEHICLE NOT AVAILABLE</span>, opened the live camera, and captured objective photographic verification of the bay.
                </p>
              </div>
            </div>

            {/* Detailed Audit Table */}
            <div className="premium-card p-6 bg-white border-slate-200/90 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Absence Verification Audit Log
              </h2>

              <div className="divide-y divide-slate-100 text-xs text-slate-700">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Assigned Bay
                  </span>
                  <span className="font-semibold text-slate-900">
                    {wash.parking_location || 'Green Valley Residency • Bay D-14'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Scheduled Window
                  </span>
                  <span className="font-semibold text-slate-900">
                    {wash.scheduled_time || '07:30 AM'} – 08:00 AM IST
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Partner Arrival Logged
                  </span>
                  <span className="font-semibold text-slate-900">
                    {wash.started_at || '07:31 AM'} IST (On-Time Presence)
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Service Partner
                  </span>
                  <span className="font-semibold text-slate-900">
                    {wash.washer_name || 'Amit Kumar'} (Rating ★ {wash.washer_rating || '4.9'})
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-purple-600" /> Verification Protocol
                  </span>
                  <span className="font-semibold text-slate-900">
                    Live Camera Bay Capture
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Classification
                  </span>
                  <span className="font-bold text-emerald-700">
                    Not Classified as Missed Wash by Washer
                  </span>
                </div>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="p-5 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-800 block">Has your vehicle returned?</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If your car was out during the morning window and is back in Bay D-14, you can request an afternoon touch-up or update your preferred wash window in settings.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/owner/dashboard"
                  className="px-4 py-2 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Return to Dashboard
                </Link>
                <Link
                  href="/owner/washes/history"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-colors"
                >
                  View All Washes
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* CASE B: COMPLETED WASH CERTIFICATE                           */
          /* ============================================================ */
          <div className="space-y-6">
            {/* Hero Interactive Swipe Proof Card */}
            <SignatureProofCard wash={wash} showFullProofBtn={false} />

            {/* Detailed Verification Breakdown */}
            <div className="premium-card p-6 bg-white border-slate-200/90 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Daily Care Audit Log
              </h2>

              <div className="divide-y divide-slate-100 text-xs text-slate-700">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Parking Location
                  </span>
                  <span className="font-semibold text-slate-900">
                    {wash.parking_location || 'Green Valley Residency • Bay D-14 (Basement 1)'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Completion Timestamp
                  </span>
                  <span className="font-semibold text-slate-900">
                    {wash.scheduled_date} • {wash.completed_at || '7:42 AM'} IST
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Service Partner
                  </span>
                  <span className="font-semibold text-slate-900">
                    {wash.washer_name || 'Amit Kumar'} (Rating ★ {wash.washer_rating || '4.9'})
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Integrity Verification
                  </span>
                  <span className="text-emerald-700 font-bold">
                    ✓ Care Protocol Verified & Passed
                  </span>
                </div>
              </div>
            </div>

            {/* Service Feedback */}
            <div className="p-5 bg-slate-100/70 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="text-xs font-bold text-slate-700">
                How was today&apos;s wash?
              </div>
              <div className="flex items-center justify-center gap-2 text-xl text-amber-400 cursor-pointer">
                ★ ★ ★ ★ ★
              </div>
              <p className="text-[11px] text-slate-500">
                Tap to submit feedback for {wash.washer_name || 'Amit Kumar'}.
              </p>
            </div>
          </div>
        )}
      </div>

      <OwnerBottomNav />
    </div>
  );
}
