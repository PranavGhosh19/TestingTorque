'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Check,
  X,
  ArrowRight,
  Calculator,
  Calendar,
  Sparkles,
  HelpCircle,
  Smartphone,
  ShieldAlert,
  Table,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function CarWashTrackingTemplatePage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Dynamic CSV Generator
  const handleDownloadCSV = () => {
    const headers = ['Day', 'Date', 'Day of Week', 'Status (Washed/Missed/Holiday)', 'Washer Name', 'Notes', 'Deduction Applicable?'];
    const rows = [
      ['1', '2026-10-01', 'Thursday', 'Washed', 'Amit Kumar', 'Morning exterior clean', 'No'],
      ['2', '2026-10-02', 'Friday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['3', '2026-10-03', 'Saturday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['4', '2026-10-04', 'Sunday', 'Holiday', 'Amit Kumar', 'Scheduled weekly off', 'No'],
      ['5', '2026-10-05', 'Monday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['6', '2026-10-06', 'Tuesday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['7', '2026-10-07', 'Wednesday', 'Missed', 'Amit Kumar', 'Skipped without notice', 'Yes (Deduct daily rate)'],
      ['8', '2026-10-08', 'Thursday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['9', '2026-10-09', 'Friday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['10', '2026-10-10', 'Saturday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['11', '2026-10-11', 'Sunday', 'Holiday', 'Amit Kumar', 'Scheduled weekly off', 'No'],
      ['12', '2026-10-12', 'Monday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['13', '2026-10-13', 'Tuesday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['14', '2026-10-14', 'Wednesday', 'Missed', 'Amit Kumar', 'Washer on leave (no backup)', 'Yes (Deduct daily rate)'],
      ['15', '2026-10-15', 'Thursday', 'Washed', 'Amit Kumar', 'Cleaned', 'No'],
      ['...', '...', '...', '...', '...', '...', '...'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n') +
      '\n\nSummary Formula:\nTotal Days,30\nMonthly Agreed Fee,500\nDaily Rate,=500/30\nMissed Washes,=COUNTIF(D2:D31;"Missed")\nDeduction Amount,=Missed_Washes*Daily_Rate\nFinal Payable,=Monthly_Agreed_Fee - Deduction_Amount\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'torque_care_car_wash_attendance_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans print:bg-white print:text-black">
      {/* Hero Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden print:hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Free Download • Excel &amp; Printable Sheet</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Car Wash Tracking Template &amp; Attendance Sheet
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Prefer using spreadsheets or a paper clipboard in your parking bay? Download our free monthly car wash attendance sheet, or see why app tracking eliminates manual logging.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-6 py-3 rounded-full bg-[#2DD4A0] hover:bg-[#25ba8c] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{downloadSuccess ? 'Downloaded!' : 'Download CSV / Excel Template'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white/70" />
              <span>Print Checklist</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">

        {/* ========================================================= */}
        {/* SPREADSHEET PREVIEW TABLE */}
        {/* ========================================================= */}
        <section className="bg-[#11161D] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl print:border-none print:shadow-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 print:border-b-2 print:border-black">
            <div>
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#2DD4A0] print:hidden" />
                <h2 className="text-lg font-bold text-white print:text-black">
                  Monthly Car Cleaning Attendance Log (Preview)
                </h2>
              </div>
              <p className="text-xs text-white/50 print:text-gray-600">
                Pre-configured formulas for scheduled rest days, missed washes, and net monthly payments.
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] print:border-black">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.04] text-white/60 uppercase border-b border-white/[0.08] print:bg-gray-100 print:text-black">
                <tr>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Weekday</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Cleaner</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Deduction?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/80 print:divide-gray-300 print:text-black">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-bold">01</td>
                  <td className="py-2.5 px-4 text-white/50">Oct 01</td>
                  <td className="py-2.5 px-4">Thursday</td>
                  <td className="py-2.5 px-4"><span className="text-[#2DD4A0] font-bold">Washed ✓</span></td>
                  <td className="py-2.5 px-4">Amit Kumar</td>
                  <td className="py-2.5 px-4 text-white/50">Cleaned before 7:30 AM</td>
                  <td className="py-2.5 px-4 text-right text-white/40">No</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-bold">02</td>
                  <td className="py-2.5 px-4 text-white/50">Oct 02</td>
                  <td className="py-2.5 px-4">Friday</td>
                  <td className="py-2.5 px-4"><span className="text-[#2DD4A0] font-bold">Washed ✓</span></td>
                  <td className="py-2.5 px-4">Amit Kumar</td>
                  <td className="py-2.5 px-4 text-white/50">Normal wash</td>
                  <td className="py-2.5 px-4 text-right text-white/40">No</td>
                </tr>
                <tr className="hover:bg-white/[0.02] bg-white/[0.01]">
                  <td className="py-2.5 px-4 font-bold">04</td>
                  <td className="py-2.5 px-4 text-white/50">Oct 04</td>
                  <td className="py-2.5 px-4">Sunday</td>
                  <td className="py-2.5 px-4"><span className="text-white/40 font-bold">Holiday (OFF)</span></td>
                  <td className="py-2.5 px-4">Amit Kumar</td>
                  <td className="py-2.5 px-4 text-white/50">Agreed Sunday Rest Day</td>
                  <td className="py-2.5 px-4 text-right text-white/40">No</td>
                </tr>
                <tr className="hover:bg-amber-500/5 bg-amber-500/[0.02]">
                  <td className="py-2.5 px-4 font-bold text-amber-400">07</td>
                  <td className="py-2.5 px-4 text-white/50">Oct 07</td>
                  <td className="py-2.5 px-4 text-amber-300">Wednesday</td>
                  <td className="py-2.5 px-4"><span className="text-amber-400 font-bold">Missed ✗</span></td>
                  <td className="py-2.5 px-4">Amit Kumar</td>
                  <td className="py-2.5 px-4 text-amber-300/80">No show, no backup provided</td>
                  <td className="py-2.5 px-4 text-right text-amber-400 font-bold">Yes (Deduct ₹16.67)</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 font-bold">08</td>
                  <td className="py-2.5 px-4 text-white/50">Oct 08</td>
                  <td className="py-2.5 px-4">Thursday</td>
                  <td className="py-2.5 px-4"><span className="text-[#2DD4A0] font-bold">Washed ✓</span></td>
                  <td className="py-2.5 px-4">Amit Kumar</td>
                  <td className="py-2.5 px-4 text-white/50">Normal wash</td>
                  <td className="py-2.5 px-4 text-right text-white/40">No</td>
                </tr>
                <tr className="hover:bg-amber-500/5 bg-amber-500/[0.02]">
                  <td className="py-2.5 px-4 font-bold text-amber-400">14</td>
                  <td className="py-2.5 px-4 text-white/50">Oct 14</td>
                  <td className="py-2.5 px-4 text-amber-300">Wednesday</td>
                  <td className="py-2.5 px-4"><span className="text-amber-400 font-bold">Missed ✗</span></td>
                  <td className="py-2.5 px-4">Amit Kumar</td>
                  <td className="py-2.5 px-4 text-amber-300/80">Cleaner out of town</td>
                  <td className="py-2.5 px-4 text-right text-amber-400 font-bold">Yes (Deduct ₹16.67)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Embedded Formula Summary Bar */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="text-white/60">
              Formulas Included: <span className="text-white font-bold">Daily Rate = Agreed Fee / 30</span> • <span className="text-white font-bold">Payable = Fee − (Missed × Rate)</span>
            </div>
            <Link
              href="/car-wash-payment-calculator"
              className="text-[#2DD4A0] hover:underline font-bold flex items-center gap-1 print:hidden"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Use Online Calculator Instead</span>
            </Link>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HONEST COMPARISON: SPREADSHEET VS. TORQUE CARE APP */}
        {/* ========================================================= */}
        <section className="space-y-8 print:hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              HONEST COMPARISON
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase font-automotive-title">
              Spreadsheets vs. Torque Care App
            </h2>
            <p className="text-base text-white/65 leading-relaxed font-normal">
              Spreadsheets are great for initial tracking, but maintaining one on your phone every morning requires high discipline. Here is how manual logging compares to Torque Care.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#11161D]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-white/[0.04] text-white/50 uppercase border-b border-white/[0.08] font-mono">
                <tr>
                  <th className="py-4 px-6">Feature / Workflow</th>
                  <th className="py-4 px-6 text-white/80">Manual Excel / Sheets</th>
                  <th className="py-4 px-6 text-[#2DD4A0] font-bold">Torque Care Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/80">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-bold text-white">Daily Habit Friction</td>
                  <td className="py-4 px-6 text-white/60">Must open Google Sheets / Excel app every morning</td>
                  <td className="py-4 px-6 text-[#2DD4A0] font-bold">1-tap notification prompt: &ldquo;Was it washed?&rdquo; (2 seconds)</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-bold text-white">Mobile Usability</td>
                  <td className="py-4 px-6 text-white/60">Pinching &amp; zooming small spreadsheet cells on mobile</td>
                  <td className="py-4 px-6 text-[#2DD4A0] font-bold">Native mobile-optimized UI designed for car owners</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-bold text-white">End-of-Day Fallback</td>
                  <td className="py-4 px-6 text-white/60">If forgotten, row remains blank forever</td>
                  <td className="py-4 px-6 text-[#2DD4A0] font-bold">Auto-assumes washed by midnight if no dispute filed</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-bold text-white">Formula Calculation</td>
                  <td className="py-4 px-6 text-white/60">Prone to accidental cell overrides and broken math</td>
                  <td className="py-4 px-6 text-[#2DD4A0] font-bold">Automated audit with calendar breakdown &amp; deduction totals</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-bold text-white">Sharing with Cleaner</td>
                  <td className="py-4 px-6 text-white/60">Awkward screenshots of row numbers over WhatsApp</td>
                  <td className="py-4 px-6 text-[#2DD4A0] font-bold">Clean, respectful 1-click summary card with payment breakdown</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-bold text-white">Cost to Use</td>
                  <td className="py-4 px-6 text-white/60">Free</td>
                  <td className="py-4 px-6 text-[#2DD4A0] font-bold">Free for Car Owners</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* BRIDGE TO SIGNUP */}
        {/* ========================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#121924] via-[#0E141D] to-[#0A0D12] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-8 print:hidden">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              EFFORTLESS AUTOMATION
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to Upgrade from Manual Spreadsheets?
            </h3>
            <p className="text-sm text-white/65 leading-relaxed">
              Start tracking with Torque Care. You keep your existing washer, answer a quick Yes / No, and we handle the math and monthly attendance calendar.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <span>Start Free Tracking</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#05080E] border-t border-white/[0.08] py-12 px-4 sm:px-6 lg:px-8 text-xs text-white/40 mt-16 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <TorqueLogo emblemSize={30} />
            </Link>
            <span>• Free Car Wash Tracking Template</span>
          </div>

          <div className="flex items-center gap-6 text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/car-wash-payment-calculator" className="hover:text-white">Calculator</Link>
            <Link href="/car-wash-tracking" className="hover:text-white">Tracking Guide</Link>
            <Link href="/car-wash-tracking-template" className="text-[#2DD4A0] font-bold">Free Template</Link>
            <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
          </div>

          <div>© 2026 Torque Care. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
