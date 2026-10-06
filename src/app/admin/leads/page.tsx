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
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchLeadRegistrationsFromFirestore, updateLeadRegistrationInFirestore } from '@/lib/firebaseService';
import { LeadRegistration } from '@/lib/types';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savedWebhookDisplay, setSavedWebhookDisplay] = useState('');
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Load leads and current webhook settings
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeadRegistrationsFromFirestore();
      setLeads(data);

      const settingsRes = await fetch('/api/leads/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.activeUrl) {
          setSavedWebhookDisplay(settingsData.activeUrl);
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    setIsSavingWebhook(true);
    try {
      const res = await fetch('/api/leads/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setSavedWebhookDisplay(`${webhookUrl.slice(0, 35)}...`);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleTestSync = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const urlToTest = webhookUrl.trim() || undefined;
      const res = await fetch('/api/leads/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, webhookUrl: urlToTest }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult('Success: Test row added to Google Sheet!');
      } else {
        setTestResult('Test failed. Please verify the Webhook URL and Apps Script permissions.');
      }
    } catch (err) {
      setTestResult('Error connecting to webhook.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: any) => {
    const ok = await updateLeadRegistrationInFirestore(id, { status });
    if (ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  };

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.fullName?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.vehicleNumber?.toLowerCase().includes(q) ||
      l.societyName?.toLowerCase().includes(q) ||
      l.district?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q)
    );
  });

  const uniqueSocieties = new Set(leads.map((l) => l.societyName?.trim().toLowerCase()).filter(Boolean)).size;

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Phone Number",
        "License Plate",
        "Society Name",
        "District",
        "City",
        "State",
        "Source"
      ]);
    }
    
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.fullName || '',
      data.phone || '',
      data.vehicleNumber || '',
      data.societyName || '',
      data.district || '',
      data.city || '',
      data.state || '',
      data.source || 'Torque Care Lead Form'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
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

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href="/api/leads?format=csv"
              download
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4A0] to-[#20BA8B] hover:from-[#34e2ab] hover:to-[#24c794] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(45,212,160,0.3)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export CSV for Google Sheets</span>
            </a>
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
              Google Sheet Integration
            </div>
            <div className="text-sm font-bold text-white mt-2 flex items-center gap-2">
              {savedWebhookDisplay ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4A0] animate-pulse" />
                  <span className="text-[#2DD4A0]">Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-amber-400">Ready to Connect</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {savedWebhookDisplay || 'Paste Webhook URL below'}
            </div>
          </div>
        </div>

        {/* Google Sheets Integration Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121A26] to-[#0D131D] border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Sheets Real-Time Sync</h3>
                <p className="text-xs text-slate-400">
                  Every submitted registration is automatically appended as a new row to your Google Sheet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-xs text-[#2DD4A0] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>{showSetupGuide ? 'Hide Setup Guide' : '60-Second Setup Instructions'}</span>
              {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Form to update webhook URL */}
          <form onSubmit={handleSaveWebhook} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex-1 relative">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={
                  savedWebhookDisplay
                    ? `Current: ${savedWebhookDisplay} (Paste new URL to change)`
                    : 'Paste Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec)'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#090D14] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#2DD4A0]"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingWebhook || !webhookUrl.trim()}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingWebhook ? 'Saving...' : 'Save Webhook URL'}
            </button>

            <button
              type="button"
              onClick={handleTestSync}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              {isTesting ? 'Sending test...' : 'Send Test Row'}
            </button>
          </form>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Google Sheets Webhook URL updated successfully! All new registrations will sync in real time.</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.startsWith('Success')
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}
            >
              {testResult.startsWith('Success') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{testResult}</span>
            </div>
          )}

          {/* Setup Guide Accordion */}
          {showSetupGuide && (
            <div className="p-5 rounded-xl bg-[#0A0E16] border border-white/10 space-y-4 text-xs text-slate-300">
              <div className="font-bold text-white text-sm">How to link any Google Sheet in 30 seconds:</div>
              <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
                <li>
                  Open your Google Sheet (or create a new blank Google Sheet at{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2DD4A0] underline"
                  >
                    sheets.new
                  </a>
                  ).
                </li>
                <li>In Google Sheets menu bar, click <strong>Extensions</strong> → <strong>Apps Script</strong>.</li>
                <li>Delete any code in the editor, and paste the code snippet below:</li>
              </ol>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#06080D] border border-white/10 text-[11px] font-mono text-emerald-300/90 overflow-x-auto">
                  {appsScriptCode}
                </pre>
                <button
                  type="button"
                  onClick={copyScriptToClipboard}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2DD4A0]" />
                      <span className="text-[#2DD4A0]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <ol start={4} className="list-decimal pl-4 space-y-2 leading-relaxed">
                <li>Click <strong>Deploy</strong> (top right blue button) → <strong>New deployment</strong>.</li>
                <li>Click the gear icon next to &quot;Select type&quot; → choose <strong>Web app</strong>.</li>
                <li>
                  Set <strong>Execute as:</strong> &quot;Me&quot;, and set <strong>Who has access:</strong> &quot;Anyone&quot;.
                </li>
                <li>Click <strong>Deploy</strong> and copy the generated <strong>Web app URL</strong>.</li>
                <li>Paste that URL into the box above and click &quot;Save Webhook URL&quot;!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Leads Table Section */}
        <div className="p-6 rounded-2xl bg-[#0E141E] border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2DD4A0]" />
              <span>Registered Prospective Customers ({filteredLeads.length})</span>
            </h2>

            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, plate, society..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090D14] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4A0]"
              />
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
                {searchQuery ? 'Try matching another search term.' : 'Open the landing page to register your first interested lead!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Car Plate</th>
                    <th className="py-3 px-3">Society & Location</th>
                    <th className="py-3 px-3">Sync Status</th>
                    <th className="py-3 px-3">Lead Status</th>
                    <th className="py-3 px-3 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => {
                    const formattedDate = lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recently';

                    return (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3 text-slate-400 font-mono whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {lead.fullName}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-300">
                          +91 {lead.phone}
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
                          {lead.syncedToGoogleSheets ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Sheets Synced</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              <span>Database Saved</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={lead.status || 'new'}
                            onChange={(e) => lead.id && handleUpdateStatus(lead.id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-[#090D14] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#2DD4A0] cursor-pointer"
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
                              href={`tel:+91${lead.phone}`}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
                              title="Call Customer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(
                                `Hi ${lead.fullName}, thank you for registering with Torque Care for ${lead.societyName}! We are preparing doorstep morning car care in your society.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-colors"
                              title="WhatsApp Customer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
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
