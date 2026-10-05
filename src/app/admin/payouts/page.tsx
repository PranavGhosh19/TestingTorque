'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Trophy,
  CheckCircle2,
  Download,
  Search,
  ArrowUpRight,
  Building2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  Filter,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { WasherPartner, PayoutDisbursement } from '@/lib/washerPartners';
import { useStore } from '@/lib/store';
import { encryptWasherId } from '@/lib/idSecurity';

interface FlatDisbursement extends PayoutDisbursement {
  washerId: string;
  washerName: string;
  washerPhone: string;
  society: string;
  rating: string;
}

export default function AdminPayoutsPage() {
  const { washers, isDataErased } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSocietyFilter, setSelectedSocietyFilter] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  // Flatten all disbursements for the audit log
  const allDisbursements: FlatDisbursement[] = useMemo(() => {
    const list: FlatDisbursement[] = [];
    washers.forEach((w) => {
      w.disbursements.forEach((d) => {
        list.push({
          ...d,
          washerId: w.id,
          washerName: w.name,
          washerPhone: w.phone,

          society: w.society,
          rating: w.rating,
        });
      });
    });
    // Sort latest first
    return list.sort((a, b) => b.utr.localeCompare(a.utr));
  }, [washers]);

  // Compute stats dynamically from washer partners
  const totalMonthPayout = useMemo(() => {
    return washers.reduce((sum, w) => sum + (w.monthlyPayoutsGone || 0), 0);
  }, [washers]);

  // Lifetime cumulative disbursements dynamically calculated from recorded disbursements
  const totalLifetimePayout = useMemo(() => {
    return allDisbursements.reduce((sum, d) => sum + (d.netAmount || 0), 0);
  }, [allDisbursements]);

  // Partner with highest payout this month
  const topEarner = useMemo(() => {
    if (washers.length === 0) return null;
    return washers.reduce((max, w) => {
      return (w.monthlyPayoutsGone || 0) > (max.monthlyPayoutsGone || 0) ? w : max;
    }, washers[0]);
  }, [washers]);

  // Filtered disbursements
  const filteredDisbursements = useMemo(() => {
    return allDisbursements.filter((d) => {
      const matchesSearch =
        d.washerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.utr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bankAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.society.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSociety =
        selectedSocietyFilter === 'All' || d.society === selectedSocietyFilter;

      return matchesSearch && matchesSociety;
    });
  }, [allDisbursements, searchQuery, selectedSocietyFilter]);

  // Export CSV function
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['UTR Number', 'Date', 'Washer Name', 'Phone', 'Society', 'Bank Account', 'Gross Amount (INR)', 'Fee', 'Net Amount (INR)', 'Status'];
      const rows = filteredDisbursements.map((d) => [
        `"${d.utr}"`,
        `"${d.date}"`,
        `"${d.washerName}"`,
        `"${d.washerPhone}"`,
        `"${d.society}"`,
        `"${d.bankAccount}"`,
        d.grossAmount,
        d.fee,
        d.netAmount,
        `"${d.status}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `washer_disbursements_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setTimeout(() => setIsExporting(false), 600);
    }
  };

  const societiesList = ['All', ...Array.from(new Set(washers.map((w) => w.society)))];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Treasury & Settlements
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Automated CMS Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight mt-1">
              Washer Payouts & Disbursements
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Overview of automated bank clearances, cumulative partner disbursements, and monthly earnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{isExporting ? 'Exporting...' : 'Export Disbursements CSV'}</span>
            </button>
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Approve Weekly Batch</span>
            </button>
          </div>
        </div>

        {/* 3 HIGHLIGHT METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total washers payout till now (Lifetime Cumulative) */}
          <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Washers Payout Till Now
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-[#0B132B] tracking-tight">
                ₹{totalLifetimePayout.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  100% Settled
                </span>
                <span>•</span>
                <span>Lifetime cumulative disbursements</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Across all completed cycles</span>
              <span className="font-bold text-slate-600">Zero Failed Transfers</span>
            </div>
          </div>

          {/* Card 2: Total washers payout this month */}
          <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Washers Payout This Month
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-emerald-600 tracking-tight">
                ₹{totalMonthPayout.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">September 2026 Cycle</span>
                <span>•</span>
                <span>{washers.length} Active routes paid</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Next batch due: Mon, Oct 5</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Auto-Cleared
              </span>
            </div>
          </div>

          {/* Card 3: Highest washers payout of the month */}
          <div className="premium-card p-6 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 border-amber-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                  Highest Payout of Month
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                  Top Earner
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-[#0B132B] tracking-tight">
                {topEarner ? `₹${topEarner.monthlyPayoutsGone.toLocaleString('en-IN')}` : '₹0'}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                {topEarner ? (
                  <>
                    <Link
                      href={`/admin/washers/${encryptWasherId(topEarner.id)}`}
                      className="font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 group-hover:underline"
                    >
                      <span>{topEarner.name}</span>
                      <ExternalLink className="w-3 h-3 text-amber-600" />
                    </Link>
                    <span>•</span>
                    <span className="text-slate-500">{topEarner.society}</span>
                  </>
                ) : (
                  <span className="text-slate-400">No partner payouts yet</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {topEarner ? `${topEarner.assignedCarsPerDay} cars/day • 0 absences` : 'Awaiting cycle'}
              </span>
              <span className="font-extrabold text-amber-700">
                {topEarner ? `⭐ ${topEarner.rating} Rating` : 'Active'}
              </span>
            </div>
          </div>
        </div>


        {/* Audit Log / Payouts Table Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#0B132B]">
                Recent Bank Disbursements & UTR Logs
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredDisbursements.length} cleared transaction records
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search washer, UTR, or bank..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              {/* Society Filter */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedSocietyFilter}
                  onChange={(e) => setSelectedSocietyFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  {societiesList.map((soc) => (
                    <option key={soc} value={soc}>
                      {soc === 'All' ? 'All Societies' : soc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Washer Partner</th>
                    <th className="px-5 py-3.5">Bank & UTR Reference</th>
                    <th className="px-5 py-3.5">Clearance Date</th>
                    <th className="px-5 py-3.5">Settlement Type</th>
                    <th className="px-5 py-3.5 text-right">Gross Amount</th>
                    <th className="px-5 py-3.5 text-right">Net Disbursed</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDisbursements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                        <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm font-bold text-slate-700">No disbursement records found</div>
                        <div className="text-xs text-slate-400 mt-0.5">Automated bank clearances and route partner disbursements will appear here.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredDisbursements.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/washers/${encryptWasherId(d.washerId)}`}
                            className="font-extrabold text-slate-900 hover:text-blue-600 flex items-center gap-1.5"
                          >
                            <span>{d.washerName}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-400" />
                          </Link>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{d.society}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{d.bankAccount}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            UTR: {d.utr}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-700">{d.date}</div>
                          <div className="text-[10px] text-slate-400">CMS Host-to-Host</div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {d.type}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-slate-600">
                          ₹{d.grossAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="px-5 py-4 text-right font-extrabold text-emerald-700 text-sm">
                          ₹{d.netAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{d.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

