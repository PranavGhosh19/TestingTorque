'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Star,
  ShieldCheck,
  Check,
  Clock,
  Plus,
  Phone,
  Car,
  Calendar,
  AlertCircle,
  Wallet,
  Landmark,
  CheckCircle2,
  ArrowUpRight,
  Receipt,
  X,
  User,
  TrendingUp,
  FileText,
  ChevronRight,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

interface PayoutDisbursement {
  id: string;
  date: string;
  utr: string;
  bankAccount: string;
  grossAmount: number;
  fee: number;
  netAmount: number;
  type: 'Weekly Auto-Disbursement' | 'Instant On-Demand';
  status: 'Settled' | 'Processing';
}

interface WasherPartner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: string;
  reviewsCount: number;
  society: string;
  assignedCarsPerDay: number;
  routeWindow: string;
  avgTimePerCar: string;
  completionRate: string;
  totalLifetimeWashes: number;
  status: 'Active on Route' | 'Available Backup';
  kyc: string;
  absentThisMonth: number;
  absentDates: string[];
  leaveReason: string;
  backupWasherName: string;
  monthlyPayoutsGone: number; // Disbursed this month
  pendingPayoutDue: number;
  sundayBonusEarned: number;
  disbursements: PayoutDisbursement[];
}

const washerPartners: WasherPartner[] = [
  {
    id: 'wsh_amit',
    name: 'Amit Kumar',
    phone: '+91 98101 22334',
    avatar: '/images/washer_amit.jpg',
    rating: '4.9',
    reviewsCount: 312,
    society: 'Green Valley Residency',
    assignedCarsPerDay: 34,
    routeWindow: '06:30 AM - 09:30 AM',
    avgTimePerCar: '5.8 mins',
    completionRate: '99.2%',
    totalLifetimeWashes: 1240,
    status: 'Active on Route',
    kyc: 'Verified (Aadhaar & Police Clear)',
    absentThisMonth: 1,
    absentDates: ['14 Sep 2026'],
    leaveReason: 'Family emergency • Peer backup coverage assigned to Suresh Verma (0 missed washes)',
    backupWasherName: 'Suresh Verma',
    monthlyPayoutsGone: 18480,
    pendingPayoutDue: 1940,
    sundayBonusEarned: 3200,
    disbursements: [
      {
        id: 'disb_1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928987112',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921876543',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914765432',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907654321',
        bankAccount: 'HDFC Bank •••• 4021',
        grossAmount: 4620,
        fee: 0,
        netAmount: 4620,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
  {
    id: 'wsh_rahul',
    name: 'Rahul Sharma',
    phone: '+91 98222 33445',
    avatar: '/images/washer_amit.jpg',
    rating: '4.8',
    reviewsCount: 245,
    society: 'Green Valley Residency',
    assignedCarsPerDay: 33,
    routeWindow: '06:45 AM - 09:45 AM',
    avgTimePerCar: '6.0 mins',
    completionRate: '98.8%',
    totalLifetimeWashes: 980,
    status: 'Active on Route',
    kyc: 'Verified (Aadhaar & Police Clear)',
    absentThisMonth: 0,
    absentDates: [],
    leaveReason: 'Zero absences this month (Perfect Attendance Bonus qualified)',
    backupWasherName: 'None Required',
    monthlyPayoutsGone: 19140,
    pendingPayoutDue: 2100,
    sundayBonusEarned: 3300,
    disbursements: [
      {
        id: 'disb_r1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928771190',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_r2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921662281',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_r3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914553372',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_r4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907444463',
        bankAccount: 'State Bank of India •••• 1189',
        grossAmount: 4785,
        fee: 0,
        netAmount: 4785,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
  {
    id: 'wsh_suresh',
    name: 'Suresh Verma',
    phone: '+91 99111 88776',
    avatar: '/images/washer_amit.jpg',
    rating: '4.9',
    reviewsCount: 289,
    society: 'Palm Residency',
    assignedCarsPerDay: 33,
    routeWindow: '06:30 AM - 09:30 AM',
    avgTimePerCar: '5.9 mins',
    completionRate: '99.5%',
    totalLifetimeWashes: 1120,
    status: 'Active on Route',
    kyc: 'Verified (Aadhaar & Police Clear)',
    absentThisMonth: 1,
    absentDates: ['08 Sep 2026'],
    leaveReason: 'Approved scheduled leave • Covered by Amit Kumar as peer proxy',
    backupWasherName: 'Amit Kumar',
    monthlyPayoutsGone: 17820,
    pendingPayoutDue: 2350,
    sundayBonusEarned: 3100,
    disbursements: [
      {
        id: 'disb_s1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928114422',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_s2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921225533',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_s3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914336644',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_s4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907447755',
        bankAccount: 'ICICI Bank •••• 8841',
        grossAmount: 4455,
        fee: 0,
        netAmount: 4455,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
  {
    id: 'wsh_vijay',
    name: 'Vijay Pal',
    phone: '+91 97119 44332',
    avatar: '/images/washer_amit.jpg',
    rating: '4.7',
    reviewsCount: 164,
    society: 'Sunrise Heights',
    assignedCarsPerDay: 28,
    routeWindow: '07:00 AM - 09:45 AM',
    avgTimePerCar: '6.4 mins',
    completionRate: '98.2%',
    totalLifetimeWashes: 670,
    status: 'Available Backup',
    kyc: 'Verified (Aadhaar & Police Clear)',
    absentThisMonth: 0,
    absentDates: [],
    leaveReason: 'Zero absences this month',
    backupWasherName: 'None Required',
    monthlyPayoutsGone: 15400,
    pendingPayoutDue: 1200,
    sundayBonusEarned: 2400,
    disbursements: [
      {
        id: 'disb_v1',
        date: '28 Sep 2026, 09:00 AM',
        utr: 'CMS260928990011',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_v2',
        date: '21 Sep 2026, 09:00 AM',
        utr: 'CMS260921881122',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_v3',
        date: '14 Sep 2026, 09:00 AM',
        utr: 'CMS260914772233',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
      {
        id: 'disb_v4',
        date: '07 Sep 2026, 09:00 AM',
        utr: 'CMS260907663344',
        bankAccount: 'Axis Bank •••• 5590',
        grossAmount: 3850,
        fee: 0,
        netAmount: 3850,
        type: 'Weekly Auto-Disbursement',
        status: 'Settled',
      },
    ],
  },
];

export default function AdminWashersPage() {
  const [selectedWasher, setSelectedWasher] = useState<WasherPartner | null>(null);
  const [showDisbursementsModal, setShowDisbursementsModal] = useState(false);

  const handleOpenWasher = (washer: WasherPartner) => {
    setSelectedWasher(washer);
    setShowDisbursementsModal(false);
  };

  const handleCloseModal = () => {
    setSelectedWasher(null);
    setShowDisbursementsModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Partner Management & Audit Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Washer Network
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              {washerPartners.length} Active Partners
            </span>
            <button className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Onboard New Partner</span>
            </button>
          </div>
        </div>

        {/* Washer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {washerPartners.map((w) => (
            <div
              key={w.id}
              onClick={() => handleOpenWasher(w)}
              className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/80 shadow-xs">
                    <Image
                      src={w.avatar}
                      alt={w.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#0B132B] group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                      <span>{w.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </h2>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {w.rating} Rating ({w.reviewsCount} reviews)
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {w.status}
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">Cars / Day</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{w.assignedCarsPerDay}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 font-medium">Absences</div>
                  <div className={`text-sm font-black mt-0.5 ${w.absentThisMonth > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {w.absentThisMonth} {w.absentThisMonth === 1 ? 'day' : 'days'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-xs text-emerald-700 font-medium">Payouts Gone</div>
                  <div className="text-sm font-black text-emerald-800 font-mono mt-0.5">
                    ₹{w.monthlyPayoutsGone.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Sub-info list */}
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Society Cluster:</span>
                  <span className="font-semibold text-slate-900">{w.society}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Route Window:</span>
                  <span className="font-mono text-slate-800 font-semibold">{w.routeWindow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">KYC Status:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {w.kyc}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-emerald-700 font-bold border-t border-slate-100">
                <span>Click to view track record & payouts</span>
                <span className="text-slate-400 group-hover:text-emerald-600 transition-colors">Inspect Profile →</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ============================================================ */}
      {/* WASHER PROFILE & TRACK RECORD MODAL                          */}
      {/* ============================================================ */}
      {selectedWasher && !showDisbursementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#080D1A] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#0B132B] border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md">
                  <Image
                    src={selectedWasher.avatar}
                    alt={selectedWasher.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {selectedWasher.name}
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Verified Partner
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap mt-0.5">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedWasher.rating} Rating
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">{selectedWasher.society}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{selectedWasher.phone}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* 1. Track Record KPIs */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Performance & Track Record</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Lifetime Washes</span>
                    <div className="text-xl font-black text-white mt-1 font-mono">
                      {selectedWasher.totalLifetimeWashes.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">Verified proof ✓</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Completion Rate</span>
                    <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                      {selectedWasher.completionRate}
                    </div>
                    <span className="text-[10px] text-slate-400">Zero skipped bays</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Cars Every Day</span>
                    <div className="text-xl font-black text-blue-400 mt-1 font-mono">
                      {selectedWasher.assignedCarsPerDay}
                    </div>
                    <span className="text-[10px] text-slate-400">Daily morning route</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Avg Wash Speed</span>
                    <div className="text-xl font-black text-amber-300 mt-1 font-mono">
                      {selectedWasher.avgTimePerCar}
                    </div>
                    <span className="text-[10px] text-slate-400">High microfiber care</span>
                  </div>
                </div>
              </div>

              {/* 2. Route Schedule & Fleet Handling */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Daily Morning Window:
                  </span>
                  <span className="font-mono font-bold text-white">{selectedWasher.routeWindow}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Car className="w-3.5 h-3.5 text-emerald-400" /> Active Society Route:
                  </span>
                  <span className="font-bold text-white">{selectedWasher.society}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Background Verification:
                  </span>
                  <span className="font-bold text-emerald-400">{selectedWasher.kyc}</span>
                </div>
              </div>

              {/* 3. Monthly Absences & Peer Backup */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Monthly Attendance & Absences</span>
                </h4>
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                        {selectedWasher.absentThisMonth}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {selectedWasher.absentThisMonth === 0
                            ? '0 Absences in September 2026'
                            : `${selectedWasher.absentThisMonth} Day Absent this Month`}
                        </div>
                        <div className="text-xs text-amber-200/90 font-mono">
                          {selectedWasher.absentDates.length > 0
                            ? `Dates: ${selectedWasher.absentDates.join(', ')}`
                            : 'Perfect Route Attendance Recorded'}
                        </div>
                      </div>
                    </div>
                    {selectedWasher.absentThisMonth > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                        Peer Backup Assigned ✓
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-white/5">
                    <strong className="text-amber-300">Audit Status:</strong> {selectedWasher.leaveReason}
                  </p>
                </div>
              </div>

              {/* 4. Monthly Payouts Gone (Clickable to view disbursements) */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Monthly Payouts & Disbursements</span>
                  </span>
                  <span className="text-emerald-400 text-[11px] font-sans font-bold">
                    Click Card to Inspect Receipts →
                  </span>
                </h4>

                <div
                  onClick={() => setShowDisbursementsModal(true)}
                  className="p-5 rounded-3xl bg-linear-to-r from-emerald-950/50 via-[#0B132B] to-[#0B132B] border border-emerald-500/40 hover:border-emerald-400 text-white shadow-xl cursor-pointer group transition-all relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">
                        Monthly Payouts Gone (Disbursed This Month)
                      </span>
                      <div className="text-3xl font-black text-emerald-400 font-mono mt-1 flex items-center gap-2">
                        <span>₹{selectedWasher.monthlyPayoutsGone.toLocaleString()}</span>
                        <ArrowUpRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        4 automated weekly clearing transfers executed
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Pending Cycle Due</span>
                        <span className="text-sm font-bold font-mono text-white">₹{selectedWasher.pendingPayoutDue.toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDisbursementsModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs shadow-md group-hover:bg-emerald-300 transition-colors"
                      >
                        View Disbursement History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#0B132B] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Washer ID: {selectedWasher.id} • Partner since Jan 2026
              </span>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DISBURSEMENTS & TRANSACTION HISTORY MODAL                    */}
      {/* ============================================================ */}
      {selectedWasher && showDisbursementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#080D1A] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto">
            {/* Disbursements Modal Header */}
            <div className="p-5 sm:p-6 bg-[#0B132B] border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Disbursements & Bank Payout History
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Partner: {selectedWasher.name} • Total Gone: ₹{selectedWasher.monthlyPayoutsGone.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDisbursementsModal(false)}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Back to washer profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Disbursements Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase tracking-wider px-1">
                <span>Direct Bank Wire Releases</span>
                <span className="text-emerald-400 font-bold">100% On-Time Execution</span>
              </div>

              <div className="space-y-3">
                {selectedWasher.disbursements.map((d, index) => (
                  <div
                    key={d.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0B132B] border border-white/10 space-y-2.5 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            Week #{4 - index} Automated Disbursement
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {d.date}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-emerald-400 font-mono">
                          +₹{d.netAmount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-full uppercase">
                          {d.status} ✓
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
                      <div>
                        <span className="text-slate-500 block">Bank Account:</span>
                        <span className="text-white font-medium">{d.bankAccount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">UTR Reference:</span>
                        <span className="text-slate-300 font-bold">{d.utr}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-500 block">Transfer Mode:</span>
                        <span className="text-emerald-300">Automated Direct Wire</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sunday Bonus note */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Includes <strong>₹{selectedWasher.sundayBonusEarned.toLocaleString()}</strong> Sunday 100% bonus payments with 0% platform commission retained.
                </span>
              </div>
            </div>

            {/* Disbursements Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#0B132B] border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDisbursementsModal(false)}
                className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
              >
                ← Back to Washer Profile
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
