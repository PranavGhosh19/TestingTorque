'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Car,
  Building2,
  MapPin,
  Phone,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  MessageCircle,
  Filter,
  Trash2,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  fetchLeadRegistrationsFromFirestore,
  updateLeadRegistrationInFirestore,
  deleteLeadRegistrationInFirestore,
} from '@/lib/firebaseService';
import { LeadRegistration } from '@/lib/types';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Load leads from Firestore
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeadRegistrationsFromFirestore();
      setLeads(data);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: any) => {
    const ok = await updateLeadRegistrationInFirestore(id, { status });
    if (ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  };

  const handleDeleteLead = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to remove this registration?')) return;
    
    // Call server DELETE route and local DB method
    try {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    await deleteLeadRegistrationInFirestore(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  // Filter leads by search query and status filter
  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.fullName?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.vehicleNumber?.toLowerCase().includes(q) ||
      l.societyName?.toLowerCase().includes(q) ||
      l.district?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'new' && (l.status === 'new' || !l.status)) ||
      l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const uniqueSocieties = new Set(
    leads.map((l) => l.societyName?.trim().toLowerCase()).filter(Boolean)
  ).size;

  const newLeadsCount = leads.filter((l) => l.status === 'new' || !l.status).length;
  const contactedLeadsCount = leads.filter((l) => l.status === 'contacted').length;
  const convertedLeadsCount = leads.filter((l) => l.status === 'converted').length;

  /**
   * Export leads directly into an Excel-ready CSV spreadsheet.
   * Uses UTF-8 BOM (\uFEFF) so Microsoft Excel, Apple Numbers,
   * and Google Sheets open Indian names and special characters without encoding errors.
   */
  const handleExportExcel = (filteredOnly: boolean = false) => {
    setIsExporting(true);
    try {
      const dataToExport = filteredOnly ? filteredLeads : leads;

      if (!dataToExport || dataToExport.length === 0) {
        alert('No leads available to export.');
        setIsExporting(false);
        return;
      }

      const headers = [
        'Registration Date & Time (IST)',
        'Full Name',
        'Phone Number',
        'Car License Plate',
        'Society Name',
        'District / Locality',
        'City',
        'State',
        'Lead Status',
        'Source',
      ];

      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = dataToExport.map((l) => {
        const rawDigits = (l.phone || '').replace(/\D/g, '');
        const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

        return [
          escapeCsv(
            l.createdAtIST ||
              (l.createdAt
                ? new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                : 'Recently')
          ),
          escapeCsv(l.fullName),
          escapeCsv(`+91 ${cleanPhone}`),
          escapeCsv(l.vehicleNumber),
          escapeCsv(l.societyName),
          escapeCsv(l.district || ''),
          escapeCsv(l.city || ''),
          escapeCsv(l.state || ''),
          escapeCsv(l.status || 'new'),
          escapeCsv(l.source || 'Torque Care Landing Page'),
        ];
      });

      // Prepend UTF-8 BOM (\uFEFF) for 100% native Excel compatibility
      const csvContent =
        '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `Torque_Care_Interested_Customers_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070A0F] text-white">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Demand Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase font-automotive-title">
              Interested Customers & Leads
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Prospective customers who registered their interest, vehicle, and society location from the landing page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
              title="Refresh list from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Primary Excel Export Button */}
            <button
              onClick={() => handleExportExcel(false)}
              disabled={isExporting || leads.length === 0}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              title="Download Excel spreadsheet of all customer registrations"
            >
              <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />
              <span>Export to Excel</span>
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0E141E] border border-white/10 relative overflow-hidden">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Interested Customers
            </div>
            <div className="text-3xl font-bold font-mono text-white mt-2">{leads.length}</div>
            <div className="text-[11px] text-[#2DD4A0] mt-1 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Demand Capture Active</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E141E] border border-white/10">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Societies Represented
            </div>
            <div className="text-3xl font-bold font-mono text-blue-400 mt-2">{uniqueSocieties}</div>
            <div className="text-[11px] text-slate-400 mt-1">Expansion target clusters</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E141E] border border-white/10">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Registered Today
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">
              {
                leads.filter((l) => {
                  const d = new Date(l.createdAt || 0);
                  const today = new Date();
                  return d.toDateString() === today.toDateString();
                }).length
              }
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Live 24h intake</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E141E] border border-white/10">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              New / Awaiting Callback
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400 mt-2">{newLeadsCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {contactedLeadsCount} contacted • {convertedLeadsCount} converted
            </div>
          </div>
        </div>

        {/* Leads Table Section */}
        <div className="p-6 rounded-2xl bg-[#0E141E] border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2DD4A0]" />
                <span>Customer Registrations ({filteredLeads.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All submitted leads saved securely in database. Ready for Excel export and follow-up.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#090D14] border border-white/10 text-xs text-white focus:outline-none focus:border-[#2DD4A0] cursor-pointer"
                >
                  <option value="all">All Statuses ({leads.length})</option>
                  <option value="new">New Interest ({newLeadsCount})</option>
                  <option value="contacted">Contacted ({contactedLeadsCount})</option>
                  <option value="converted">Subscribed ({convertedLeadsCount})</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="w-full sm:w-64 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, plate, society..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090D14] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4A0]"
                />
              </div>

              {/* Table Export Button (for filtered view) */}
              {searchQuery && (
                <button
                  onClick={() => handleExportExcel(true)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs text-white font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Export only currently searched leads"
                >
                  <Download className="w-3.5 h-3.5 text-[#2DD4A0]" />
                  <span>Export Filtered ({filteredLeads.length})</span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#2DD4A0]" />
              <p className="text-xs">Loading registrations from database...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Car className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-white">No registrations found</p>
              <p className="text-xs text-slate-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try clearing your search query or status filter.'
                  : 'Open the landing page to register your first interested lead!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-3">Date (IST)</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Car Plate</th>
                    <th className="py-3 px-3">Society & Location</th>
                    <th className="py-3 px-3">Lead Status</th>
                    <th className="py-3 px-3 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => {
                    const formattedDate = lead.createdAtIST
                      ? lead.createdAtIST
                      : lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recently';

                    const rawDigits = (lead.phone || '').replace(/\D/g, '');
                    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

                    return (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3 text-slate-400 font-mono whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {lead.fullName}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                          +91 {cleanPhone}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono font-bold uppercase tracking-wider text-[11px]">
                            {lead.vehicleNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-white/90">{lead.societyName}</div>
                          <div className="text-[10px] text-slate-400">
                            {[lead.district, lead.city, lead.state].filter(Boolean).join(', ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={lead.status || 'new'}
                            onChange={(e) => lead.id && handleUpdateStatus(lead.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#090D14] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#2DD4A0] cursor-pointer"
                          >
                            <option value="new">🟢 New Interest</option>
                            <option value="contacted">📞 Contacted</option>
                            <option value="converted">⭐ Subscribed</option>
                            <option value="archived">📁 Archived</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={`tel:+91${cleanPhone}`}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
                              title="Call Customer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                `Hi ${lead.fullName}, thank you for registering with Torque Care for ${lead.societyName}! We are preparing doorstep morning car care in your society.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-colors"
                              title="WhatsApp Customer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
