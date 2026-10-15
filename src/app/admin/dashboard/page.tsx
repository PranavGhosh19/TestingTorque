'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Car,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Building2,
  ArrowRight,
  ShieldAlert,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Users,
  Loader2,
  Sparkles,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';
import {
  fetchAllSocieties,
  fetchAllWashersFromFirestore,
  fetchAdminCustomers,
  FirestoreSociety,
  AdminCustomer,
} from '@/lib/firebaseService';
import { WasherPartner } from '@/lib/washerPartners';

export default function AdminDashboardPage() {
  const { exceptions, resolveException, routeStops, user } = useStore();
  const currentAdminId =
    user?.uid ||
    user?.id ||
    (typeof window !== 'undefined' ? (localStorage.getItem('torque_admin_uid') || localStorage.getItem('torque_owner_id')) : null) ||
    'admin-lead-1';

  const [firestoreSocieties, setFirestoreSocieties] = useState<FirestoreSociety[]>([]);
  const [firestoreWashers, setFirestoreWashers] = useState<WasherPartner[]>([]);
  const [adminCustomers, setAdminCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedExceptionFilter, setSelectedExceptionFilter] = useState<'all' | 'unresolved'>('unresolved');

  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [socList, washersList, custList] = await Promise.all([
        fetchAllSocieties(),
        fetchAllWashersFromFirestore(currentAdminId),
        fetchAdminCustomers(),
      ]);

      if (socList) setFirestoreSocieties(socList);
      if (washersList) setFirestoreWashers(washersList);
      if (custList) setAdminCustomers(custList);
    } catch (err) {
      console.warn('Error loading admin dashboard Firestore telemetry:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentAdminId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // All enrolled vehicles across customers
  const allVehiclesFromCustomers = useMemo(() => {
    return adminCustomers.flatMap((c) => c.vehicles);
  }, [adminCustomers]);

  const activeVehiclesCount = allVehiclesFromCustomers.length;
  const activeSocietiesCount = useMemo(() => {
    return firestoreSocieties.filter((s) => s.status === 'active').length || firestoreSocieties.length;
  }, [firestoreSocieties]);

  const activeWashersCount = useMemo(() => {
    return firestoreWashers.filter((w) => w.status !== 'Dismissed').length;
  }, [firestoreWashers]);

  // Today's wash progress
  const totalScheduledDaily = activeVehiclesCount;
  const completedRouteStopsCount = routeStops.filter((rs) => rs.status === 'completed').length;
  const todayWashesCount = completedRouteStopsCount;
  const overallCompletionRate = totalScheduledDaily > 0
    ? Math.round((todayWashesCount / totalScheduledDaily) * 100)
    : 0;

  const openExceptionsCount = exceptions.filter((e) => !e.resolved).length;
  const filteredExceptions = exceptions.filter((e) =>
    selectedExceptionFilter === 'all' ? true : !e.resolved
  );

  // Enriched societies list linking real washers and vehicles
  const enrichedSocietiesList = useMemo(() => {
    return firestoreSocieties.map((soc) => {
      const sId = soc.societyId || soc.id || '';
      const sName = (soc.name || '').trim();

      const assignedWashers = firestoreWashers.filter((w) => {
        if (w.status === 'Dismissed') return false;
        if (Array.isArray(w.societies) && (w.societies.includes(sId) || w.societies.includes(sName))) {
          return true;
        }
        if (w.society && (w.society === sName || w.society === sId || w.society.includes(sName))) {
          return true;
        }
        return false;
      });

      const assignedVehicles = allVehiclesFromCustomers.filter((v) => {
        const cust = adminCustomers.find((c) => c.vehicles.some((cv) => cv.id === v.id));
        if (cust) {
          if (cust.societyId === sId || (cust.society && cust.society.toLowerCase() === sName.toLowerCase())) {
            return true;
          }
        }
        return false;
      });

      const totalCars = assignedVehicles.length;
      const totalWashers = assignedWashers.length;

      let statusIndicator: 'green' | 'yellow' | 'rose' = 'green';
      let statusText = '🟢 Normal';

      if (soc.status === 'inactive') {
        statusIndicator = 'yellow';
        statusText = '⚪ Inactive';
      } else if (totalCars > 0 && totalWashers === 0) {
        statusIndicator = 'rose';
        statusText = '🔴 No Washer';
      } else if (totalWashers > 0 && totalCars > totalWashers * 25) {
        statusIndicator = 'yellow';
        statusText = '🟡 High Load';
      }

      return {
        id: sId,
        name: soc.name,
        city: soc.city,
        state: soc.state,
        totalVehicles: totalCars,
        activeWashers: totalWashers,
        statusIndicator,
        statusText,
      };
    });
  }, [firestoreSocieties, firestoreWashers, allVehiclesFromCustomers, adminCustomers]);

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Realtime Exceptions & Society Ops
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh live Firestore data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Operational
            </span>
          </div>
        </div>

        {/* TOP FIVE STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Active Vehicles */}
          <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Active Vehicles
              </span>
              <Car className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#0B132B] mt-1">
              {isLoading ? (
                <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
              ) : (
                activeVehiclesCount.toLocaleString('en-IN')
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-semibold block mt-1">
              Enrolled customer cars
            </span>
          </div>

          {/* Card 2: Societies Covered */}
          <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Societies Covered
              </span>
              <Building2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#0B132B] mt-1">
              {isLoading ? (
                <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
              ) : (
                activeSocietiesCount.toLocaleString('en-IN')
              )}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              Active residential complexes
            </span>
          </div>

          {/* Card 3: Washer Partners */}
          <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Washer Partners
              </span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#0B132B] mt-1">
              {isLoading ? (
                <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
              ) : (
                activeWashersCount.toLocaleString('en-IN')
              )}
            </div>
            <span className="text-[11px] text-purple-600 font-semibold block mt-1">
              Route specialists active
            </span>
          </div>

          {/* Card 4: Today's Washes */}
          <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Today&apos;s Washes
              </span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#0B132B] mt-1">
              {isLoading ? (
                <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
              ) : (
                todayWashesCount.toLocaleString('en-IN')
              )}
            </div>
            <span className="text-[11px] text-blue-600 font-semibold block mt-1">
              {totalScheduledDaily.toLocaleString('en-IN')} scheduled daily ({overallCompletionRate}%)
            </span>
          </div>

          {/* Card 5: Exceptions */}
          <div className={`premium-card p-5 bg-white shadow-xs ${openExceptionsCount > 0 ? 'border-amber-300' : 'border-slate-200/90'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider block ${openExceptionsCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                Open Issues
              </span>
              <AlertTriangle className={`w-4 h-4 ${openExceptionsCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            </div>
            <div className={`text-3xl font-extrabold mt-1 ${openExceptionsCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {openExceptionsCount}
            </div>
            <span className={`text-[11px] font-semibold block mt-1 ${openExceptionsCount > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
              {openExceptionsCount > 0 ? 'Requires Ops Attention' : 'All Routes Clear'}
            </span>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: LIVE OPERATIONS & EXCEPTIONS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: LIVE OPERATIONS TABLE */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B132B]">
                  Live Society Operations
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time society progress & capacity health from Firestore
                </p>
              </div>
              <Link
                href="/admin/societies"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Manage All Societies →
              </Link>
            </div>

            <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Society</th>
                    <th className="p-4 text-center">Vehicles</th>
                    <th className="p-4 text-center">Washers</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                        <div className="text-xs font-bold text-slate-600">Loading society operations...</div>
                      </td>
                    </tr>
                  ) : enrichedSocietiesList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm font-bold text-slate-700">No active society operations found</div>
                        <div className="text-xs text-slate-400 mt-0.5">Enrolled societies in Firestore will appear here in real time.</div>
                        <div className="mt-3">
                          <Link
                            href="/admin/societies"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs"
                          >
                            View Societies Directory
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    enrichedSocietiesList.map((soc) => (
                      <tr key={soc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900 text-sm">
                            {soc.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {[soc.city, soc.state].filter(Boolean).join(', ') || 'Coverage Area'}
                          </div>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-800 text-sm">
                          {soc.totalVehicles} cars
                        </td>
                        <td className="p-4 text-center font-bold text-purple-700 text-sm">
                          {soc.activeWashers} active
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              soc.statusIndicator === 'green'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : soc.statusIndicator === 'yellow'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span>{soc.statusText}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href="/admin/societies"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: EXCEPTIONS RESOLUTION QUEUE */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B132B]">
                  Exception Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Where operations managers resolve delays
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setSelectedExceptionFilter('unresolved')}
                  className={`px-2 py-1 rounded-md cursor-pointer ${
                    selectedExceptionFilter === 'unresolved'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Open Only
                </button>
                <button
                  onClick={() => setSelectedExceptionFilter('all')}
                  className={`px-2 py-1 rounded-md cursor-pointer ${
                    selectedExceptionFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredExceptions.length === 0 ? (
                <div className="premium-card p-8 bg-white border border-slate-200/90 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">No Open Exceptions</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    All active washer routes are currently operating on schedule without reported delays.
                  </p>
                </div>
              ) : (
                filteredExceptions.map((exc) => (
                  <div
                    key={exc.id}
                    className={`premium-card p-4 bg-white border shadow-xs space-y-2.5 transition-all ${
                      exc.resolved ? 'border-slate-200 opacity-60' : 'border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 text-sm">⚠</span>
                        <h3 className="text-xs font-extrabold text-[#0B132B]">
                          {exc.title}
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {exc.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {exc.description}
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex justify-between">
                      <span>
                        <strong>Society:</strong> {exc.society}
                      </span>
                      <span>
                        <strong>Partner:</strong> {exc.washer}
                      </span>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Target: {exc.vehicle}
                      </span>
                      {!exc.resolved ? (
                        <button
                          onClick={() => resolveException(exc.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-[11px] shadow-xs active:scale-[0.98] cursor-pointer"
                        >
                          Resolve Exception
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
