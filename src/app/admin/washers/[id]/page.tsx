'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Calendar,
  Wallet,
  Landmark,
  ArrowUpRight,
  Receipt,
  Phone,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { washerPartners, getWasherById } from '@/lib/washerPartners';
import { useStore } from '@/lib/store';

export default function WasherProfileDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'wsh_amit';
  const { washers } = useStore();
  const washer = washers.find((w) => w.id === id) || getWasherById(id) || washerPartners[0];

  const [selectedDisbursement, setSelectedDisbursement] = useState<string | null>(null);


  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/washers"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Washer Network</span>
          </Link>

          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Partner ID: {washer.id}
          </span>
        </div>

        {/* Profile Hero Header Card */}
        <div className="premium-card p-6 sm:p-8 bg-white border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-3 border-emerald-500 shadow-md shrink-0">
                <Image
                  src={washer.avatar}
                  alt={washer.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B] tracking-tight">
                    {washer.name}
                  </h1>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Partner
                  </span>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {washer.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-500" /> {washer.rating} Rating ({washer.reviewsCount} reviews)
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">{washer.society}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {washer.phone}
                  </span>
                </div>

                <div className="text-xs text-emerald-700 flex items-center gap-1 font-semibold pt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{washer.kyc}</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
              <a
                href={`tel:${washer.phone.replace(/[^0-9+]/g, '')}`}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Partner</span>
              </a>
            </div>
          </div>

          {/* Aadhaar Card Verification Strip */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 -mx-6 -mb-6 p-4 px-6 rounded-b-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Aadhaar Card:
                </span>
                <span className="font-mono font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {washer.aadhaarNumber ? `•••• •••• ${washer.aadhaarNumber.slice(-4)}` : '4821 9912 3410'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  UIDAI Verified
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Phone OTP:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {washer.phone} (Verified)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Bank Account: <span className="font-semibold text-slate-700">{washer.bankAccount || 'HDFC Bank •••• 4021'}</span>
            </div>
          </div>
        </div>


        {/* SECTION 1: PERFORMANCE & TRACK RECORD */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Track Record & Core Performance Metrics</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Lifetime Washes</span>
              <div className="text-2xl sm:text-3xl font-black text-[#0B132B] font-mono">
                {washer.totalLifetimeWashes.toLocaleString()}
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cryptographic Proof
              </span>
            </div>

            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Completion Rate</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                {washer.completionRate}
              </div>
              <span className="text-[11px] text-slate-500">Zero skipped apartment bays</span>
            </div>

            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Daily Cars Handled</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
                {washer.assignedCarsPerDay} <span className="text-xs font-normal text-slate-500">Cars/Day</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Window: {washer.routeWindow}</span>
            </div>

            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Average Wash Speed</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                {washer.avgTimePerCar}
              </div>
              <span className="text-[11px] text-slate-500">High microfiber care compliance</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: ATTENDANCE & MONTHLY ABSENCES */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Attendance & Monthly Absences (September 2026)</span>
          </div>

          <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 ${
                    washer.absentThisMonth === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {washer.absentThisMonth}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B132B]">
                    {washer.absentThisMonth === 0
                      ? '0 Absences this Month'
                      : `${washer.absentThisMonth} Day Absent in September 2026`}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {washer.absentDates.length > 0
                      ? `Absent Dates: ${washer.absentDates.join(', ')}`
                      : 'Perfect Route Attendance Recorded (No Leaves)'}
                  </p>
                </div>
              </div>

              {washer.absentThisMonth > 0 ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Peer Proxy Covered: {washer.backupWasherName} ✓
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  100% Full Attendance ✓
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Absence Audit Log:</span>
              <p>{washer.leaveReason}</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: MONTHLY PAYOUTS GONE & DISBURSEMENT HISTORY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Monthly Payouts Gone & Disbursed History</span>
            </span>
            <span className="text-emerald-700 font-sans font-bold">Direct Automated Wire Releases</span>
          </div>

          {/* Big Payouts Summary Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B132B] text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Payouts Gone (Disbursed This Month)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                  ₹{washer.monthlyPayoutsGone.toLocaleString()}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  4 Automated Weekly Bank Clearings Executed with 0 Late Transfers
                </span>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block font-mono uppercase">Pending Cycle Due</span>
                  <span className="text-xl font-bold font-mono text-white">₹{washer.pendingPayoutDue.toLocaleString()}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block font-mono uppercase">Sunday Bonus Retained</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">+₹{washer.sundayBonusEarned.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Torque Care enforces a <strong>0% platform commission on Sundays</strong>. All Sunday morning cleaning earnings are 100% disbursed to washers.
              </span>
            </div>
          </div>

          {/* Disbursements Table / Transaction History */}
          <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#0B132B]">
                  Disbursements & Bank Transaction Records
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  All weekly direct wire releases for September 2026
                </p>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                {washer.disbursements.length} Completed Transfers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Disbursement Event</th>
                    <th className="p-4">Bank Account</th>
                    <th className="p-4">UTR Reference</th>
                    <th className="p-4 text-right">Gross Amount</th>
                    <th className="p-4 text-right">Platform Fee</th>
                    <th className="p-4 text-right">Net Transferred</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {washer.disbursements.map((d, index) => (
                    <tr
                      key={d.id}
                      onClick={() =>
                        setSelectedDisbursement(selectedDisbursement === d.id ? null : d.id)
                      }
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="font-sans font-extrabold text-slate-900 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Week #{4 - index} Auto-Clearing</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {d.date}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-blue-600" />
                          {d.bankAccount}
                        </div>
                        <div className="text-[10px] text-slate-400">Direct Clearing IMPS</div>
                      </td>

                      <td className="p-4 text-slate-700 font-bold">
                        {d.utr}
                      </td>

                      <td className="p-4 text-right text-slate-600">
                        ₹{d.grossAmount.toLocaleString()}
                      </td>

                      <td className="p-4 text-right text-emerald-600 font-bold">
                        ₹0
                      </td>

                      <td className="p-4 text-right font-extrabold text-emerald-700 text-sm">
                        +₹{d.netAmount.toLocaleString()}
                      </td>

                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-sans">
                          {d.status} ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
