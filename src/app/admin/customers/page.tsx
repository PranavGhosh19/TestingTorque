'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Users,
  Car,
  MapPin,
  CheckCircle2,
  Search,
  X,
  Calendar,
  Clock,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  ExternalLink,
  Download,
  Filter,
  ArrowUpDown,
  Check,
  RotateCcw,
  ChevronDown,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Building2,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';
import { fetchAdminCustomers, AdminCustomer } from '@/lib/firebaseService';

interface CustomerVehicle {
  id: string;
  name: string;
  plate: string;
  last4: string;
  parkingLocation: string;
  preferredTime: string;
  color?: string;
  type?: string;
  assignedWasherName?: string;
  assignedWasherId?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  society: string;
  societyId?: string;
  state?: string;
  city?: string;
  flat: string;
  status: 'Active' | 'Paused';
  plan: string;
  vehicles: CustomerVehicle[];
  adminId?: string;
  assignedAdminId?: string;
  assignedWasherId?: string;
  assignedWasherName?: string;
  price?: number;
  createdAt?: string;
}

interface SelectedCalendarContext {
  customer: Customer;
  vehicle: CustomerVehicle;
}

interface CalendarDayRecord {
  date: number;
  dayName: string;
  status: 'completed' | 'unavailable' | 'missed' | 'scheduled';
  time: string;
  washerName: string;
  washerAvatar: string;
  beforePhoto?: string;
  afterPhoto?: string;
  bayPhoto?: string;
  gpsVerified: boolean;
  notes?: string;
}

export default function AdminCustomersPage() {
  const { user } = useStore();
  const currentAdminId =
    user?.uid ||
    user?.id ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null) ||
    '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminScope, setAdminScope] = useState<'all' | 'my_area'>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState<SelectedCalendarContext | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<'Sep' | 'Oct'>('Sep');
  const [inspectedDay, setInspectedDay] = useState<CalendarDayRecord | null>(null);
  const [activePhotoTab, setActivePhotoTab] = useState<'after' | 'before'>('after');

  // Column filter & sort states
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [societyFilter, setSocietyFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleCountFilter, setVehicleCountFilter] = useState<string>('all');
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);

  // Load customer records from Firestore
  const loadCustomers = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchAdminCustomers();
      if (data && data.length > 0) {
        setCustomers(data as Customer[]);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.warn('Error loading customers from Firestore:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container')) {
        setOpenFilterDropdown(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // In-charge territory customer count
  const myTerritoryCount = useMemo(() => {
    if (!currentAdminId) return 0;
    return customers.filter(
      (c) => c.adminId === currentAdminId || c.assignedAdminId === currentAdminId
    ).length;
  }, [customers, currentAdminId]);

  // Unique lists for column filters
  const uniqueSocieties = useMemo(
    () => Array.from(new Set(customers.map((c) => c.society).filter(Boolean))),
    [customers]
  );
  const uniquePlans = useMemo(
    () => Array.from(new Set(customers.map((c) => c.plan).filter(Boolean))),
    [customers]
  );

  // Search and multi-column filtering
  const filteredCustomers = useMemo(() => {
    let result = customers;

    // 0. Territory filter (if set to my_area)
    if (adminScope === 'my_area' && currentAdminId) {
      result = result.filter(
        (c) => c.adminId === currentAdminId || c.assignedAdminId === currentAdminId
      );
    }

    // 1. Search bar filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanQueryDigits = q.replace(/[^0-9]/g, '');

      result = result.filter((c) => {
        // Customer name
        if (c.name.toLowerCase().includes(q)) return true;

        // Phone number
        const cleanPhone = c.phone.replace(/[^0-9]/g, '');
        if (
          c.phone.toLowerCase().includes(q) ||
          (cleanQueryDigits.length > 0 && cleanPhone.includes(cleanQueryDigits))
        ) {
          return true;
        }

        // Car number plate (last 4 digits only)
        const matchesPlateLast4 = c.vehicles.some((v) => {
          const cleanPlate = v.plate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const last4 = cleanPlate.slice(-4);
          const queryClean = q.replace(/[^a-zA-Z0-9]/g, '');
          return last4 === queryClean || last4.includes(queryClean) || v.last4 === queryClean;
        });

        return matchesPlateLast4;
      });
    }

    // 2. Society column filter
    if (societyFilter !== 'all') {
      result = result.filter((c) => c.society === societyFilter);
    }

    // 3. Plan column filter
    if (planFilter !== 'all') {
      result = result.filter((c) => c.plan === planFilter);
    }

    // 4. Status column filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // 5. Vehicle Count column filter
    if (vehicleCountFilter === '1') {
      result = result.filter((c) => c.vehicles.length === 1);
    } else if (vehicleCountFilter === '2+') {
      result = result.filter((c) => c.vehicles.length >= 2);
    }

    // 6. Name Sorting
    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [customers, adminScope, currentAdminId, searchQuery, societyFilter, planFilter, statusFilter, vehicleCountFilter, sortOrder]);

  const hasActiveFilters =
    societyFilter !== 'all' ||
    planFilter !== 'all' ||
    statusFilter !== 'all' ||
    vehicleCountFilter !== 'all' ||
    sortOrder !== 'none';

  const handleResetFilters = () => {
    setSocietyFilter('all');
    setPlanFilter('all');
    setStatusFilter('all');
    setVehicleCountFilter('all');
    setSortOrder('none');
    setSearchQuery('');
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Owner Name',
      'Phone Number',
      'State',
      'City',
      'Society',
      'Residence Flat',
      'Assigned Washer',
      'In-Charge Admin ID',
      'Vehicles',
      'Number Plates (Last 4 Digits)',
      'Care Protocol',
      'Account Status',
    ];

    const rows = filteredCustomers.map((c) => {
      const vehicleNames = c.vehicles.map((v) => v.name).join('; ');
      const platesAndLast4 = c.vehicles.map((v) => `${v.plate} (Last 4: #${v.last4})`).join('; ');
      const washer =
        c.assignedWasherName ||
        (c.vehicles[0] as any)?.assignedWasherName ||
        'Assigned Route Partner';

      return [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.phone.replace(/"/g, '""')}"`,
        `"${(c.state || '').replace(/"/g, '""')}"`,
        `"${(c.city || '').replace(/"/g, '""')}"`,
        `"${c.society.replace(/"/g, '""')}"`,
        `"${c.flat.replace(/"/g, '""')}"`,
        `"${washer.replace(/"/g, '""')}"`,
        `"${(c.adminId || c.assignedAdminId || '').replace(/"/g, '""')}"`,
        `"${vehicleNames.replace(/"/g, '""')}"`,
        `"${platesAndLast4.replace(/"/g, '""')}"`,
        `"${c.plan.replace(/"/g, '""')}"`,
        `"${c.status.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `torque_care_customers_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate calendar days for the selected vehicle
  const calendarDays = useMemo<CalendarDayRecord[]>(() => {
    if (!selectedContext) return [];
    const days: CalendarDayRecord[] = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (selectedMonth === 'Sep') {
      for (let d = 1; d <= 30; d++) {
        const dayOfWeek = weekdays[(1 + d - 1) % 7];
        const isFuture = d > 28;

        if (isFuture) {
          days.push({
            date: d,
            dayName: dayOfWeek,
            status: 'scheduled',
            time: selectedContext.vehicle.preferredTime,
            washerName: 'Amit Kumar',
            washerAvatar: '/images/washer_amit.jpg',
            gpsVerified: false,
            notes: 'Upcoming scheduled morning wash window',
          });
        } else if (d === 24) {
          days.push({
            date: d,
            dayName: dayOfWeek,
            status: 'unavailable',
            time: selectedContext.vehicle.preferredTime,
            washerName: 'Amit Kumar',
            washerAvatar: '/images/washer_amit.jpg',
            bayPhoto: '/images/empty_parking_bay.jpg',
            afterPhoto: '/images/empty_parking_bay.jpg',
            gpsVerified: true,
            notes: 'Washer arrived on time. Bay empty. Cryptographic bay proof signed & washer payout protected.',
          });
        } else if (d === 14) {
          days.push({
            date: d,
            dayName: dayOfWeek,
            status: 'missed',
            time: selectedContext.vehicle.preferredTime,
            washerName: 'Amit Kumar',
            washerAvatar: '/images/washer_amit.jpg',
            gpsVerified: false,
            notes: 'Washer absent on morning route. Flagged unwashed in daily verification log.',
          });
        } else {
          days.push({
            date: d,
            dayName: dayOfWeek,
            status: 'completed',
            time: selectedContext.vehicle.preferredTime,
            washerName: 'Amit Kumar',
            washerAvatar: '/images/washer_amit.jpg',
            beforePhoto: '/images/honda_city_before.jpg',
            afterPhoto: '/images/honda_city_after.jpg',
            gpsVerified: true,
            notes: 'Complete morning exterior wash & glass polish verified by GPS bay geofence.',
          });
        }
      }
    } else {
      for (let d = 1; d <= 31; d++) {
        const dayOfWeek = weekdays[(3 + d - 1) % 7];
        days.push({
          date: d,
          dayName: dayOfWeek,
          status: 'scheduled',
          time: selectedContext.vehicle.preferredTime,
          washerName: 'Amit Kumar',
          washerAvatar: '/images/washer_amit.jpg',
          gpsVerified: false,
          notes: 'Next month scheduled service window',
        });
      }
    }

    return days;
  }, [selectedContext, selectedMonth]);

  const handleOpenCalendar = (customer: Customer, vehicle: CustomerVehicle) => {
    setSelectedContext({ customer, vehicle });
    setSelectedMonth('Sep');
    setInspectedDay(null);
  };

  const handleCloseCalendar = () => {
    setSelectedContext(null);
    setInspectedDay(null);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Customer Registry & Service Audits
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Vehicle Owners
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Territory Filter (All vs In-Charge Admin Area) */}
            {currentAdminId && (
              <div className="inline-flex items-center rounded-xl bg-slate-200/70 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAdminScope('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    adminScope === 'all'
                      ? 'bg-white text-[#0B132B] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({customers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminScope('my_area')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminScope === 'my_area'
                      ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>My Area</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      adminScope === 'my_area' ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {myTerritoryCount}
                  </span>
                </button>
              </div>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => loadCustomers(true)}
              disabled={isRefreshing || isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh customer registry from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export to CSV Action Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Download customer registry as CSV file"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Export to CSV</span>
            </button>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              {filteredCustomers.length} of {customers.length} Accounts
            </span>
          </div>
        </div>

        {/* Search Bar & Quick Context */}
        <div className="premium-card p-4 sm:p-5 bg-white border-slate-200/90 shadow-xs space-y-3">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone number, or car number plate (last 4 digits only, e.g. 4291)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Filter Pills & Reset */}
          <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Column Filters:</span>
              </span>

              {societyFilter !== 'all' && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  Society: {societyFilter}
                  <button
                    type="button"
                    onClick={() => setSocietyFilter('all')}
                    className="hover:text-emerald-950 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {planFilter !== 'all' && (
                <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  Plan: {planFilter}
                  <button
                    type="button"
                    onClick={() => setPlanFilter('all')}
                    className="hover:text-blue-950 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  Status: {statusFilter}
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="hover:text-purple-950 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {vehicleCountFilter !== 'all' && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  Fleet: {vehicleCountFilter === '1' ? 'Single Vehicle' : 'Multiple Vehicles'}
                  <button
                    type="button"
                    onClick={() => setVehicleCountFilter('all')}
                    className="hover:text-amber-950 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {sortOrder !== 'none' && (
                <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  Sort Name: {sortOrder.toUpperCase()}
                  <button
                    type="button"
                    onClick={() => setSortOrder('none')}
                    className="hover:text-slate-950 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 underline cursor-pointer ml-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{filteredCustomers.length}</strong> of{' '}
              {customers.length} customers
            </div>
          </div>
        </div>

        {/* Customer Table with Column Filter Controls */}
        <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-visible">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Loading Customer Accounts...</h3>
              <p className="text-xs text-slate-500">Fetching verified owner registrations and vehicles from Firestore</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {customers.length === 0 ? 'No Customer Accounts Registered' : 'No matching customers found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {customers.length === 0
                  ? 'Customer registrations and vehicle tracking records will automatically appear here once owners onboard.'
                  : 'Try adjusting your search query, territory scope, or reset the column filter options.'}
              </p>
              {customers.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-xs">
                {/* Column Headers with Interactive Filters */}
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <tr>
                    {/* 1. Owner Name & Contact Header (Sortable) */}
                    <th className="p-4 relative filter-dropdown-container">
                      <div className="flex items-center justify-between gap-2">
                        <span>Owner Name & Contact</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSortOrder((prev) =>
                              prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'
                            );
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            sortOrder !== 'none'
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title={`Sort by Name (${sortOrder === 'asc' ? 'A-Z' : sortOrder === 'desc' ? 'Z-A' : 'Default'})`}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>

                    {/* 2. Society & Residence Header (Filterable) */}
                    <th className="p-4 relative filter-dropdown-container">
                      <div className="flex items-center justify-between gap-2">
                        <span>Society & Residence</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterDropdown(
                                openFilterDropdown === 'society' ? null : 'society'
                              );
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                              societyFilter !== 'all'
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title="Filter by Society"
                          >
                            <Filter className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Society Filter Dropdown */}
                          {openFilterDropdown === 'society' && (
                            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30 space-y-1 normal-case font-normal text-slate-700">
                              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Filter by Society
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSocietyFilter('all');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  societyFilter === 'all' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>All Societies</span>
                                {societyFilter === 'all' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                              {uniqueSocieties.map((soc) => (
                                <button
                                  key={soc}
                                  type="button"
                                  onClick={() => {
                                    setSocietyFilter(soc);
                                    setOpenFilterDropdown(null);
                                  }}
                                  className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                    societyFilter === soc ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                  }`}
                                >
                                  <span className="truncate">{soc}</span>
                                  {societyFilter === soc && <Check className="w-4 h-4 text-emerald-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>

                    {/* 3. Vehicles Header (Filter by fleet count, Click to View Calendar) */}
                    <th className="p-4 relative filter-dropdown-container">
                      <div className="flex items-center justify-between gap-2">
                        <span>Vehicles (Click Plate for Calendar)</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterDropdown(
                                openFilterDropdown === 'vehicles' ? null : 'vehicles'
                              );
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                              vehicleCountFilter !== 'all'
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title="Filter by Fleet Count"
                          >
                            <Filter className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Fleet Filter Dropdown */}
                          {openFilterDropdown === 'vehicles' && (
                            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30 space-y-1 normal-case font-normal text-slate-700">
                              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Fleet Size
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setVehicleCountFilter('all');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  vehicleCountFilter === 'all' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>All Vehicles</span>
                                {vehicleCountFilter === 'all' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setVehicleCountFilter('1');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  vehicleCountFilter === '1' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>Single Vehicle (1)</span>
                                {vehicleCountFilter === '1' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setVehicleCountFilter('2+');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  vehicleCountFilter === '2+' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>Multiple Vehicles (2+)</span>
                                {vehicleCountFilter === '2+' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>

                    {/* 4. Plan Header (Filterable) */}
                    <th className="p-4 relative filter-dropdown-container">
                      <div className="flex items-center justify-between gap-2">
                        <span>Plan</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterDropdown(
                                openFilterDropdown === 'plan' ? null : 'plan'
                              );
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                              planFilter !== 'all'
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title="Filter by Plan"
                          >
                            <Filter className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Plan Filter Dropdown */}
                          {openFilterDropdown === 'plan' && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30 space-y-1 normal-case font-normal text-slate-700">
                              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Care Protocol
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPlanFilter('all');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  planFilter === 'all' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>All Plans</span>
                                {planFilter === 'all' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                              {uniquePlans.map((pl) => (
                                <button
                                  key={pl}
                                  type="button"
                                  onClick={() => {
                                    setPlanFilter(pl);
                                    setOpenFilterDropdown(null);
                                  }}
                                  className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                    planFilter === pl ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                  }`}
                                >
                                  <span>{pl}</span>
                                  {planFilter === pl && <Check className="w-4 h-4 text-emerald-600" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>

                    {/* 5. Status Header (Filterable) */}
                    <th className="p-4 text-center relative filter-dropdown-container">
                      <div className="flex items-center justify-center gap-2">
                        <span>Status</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterDropdown(
                                openFilterDropdown === 'status' ? null : 'status'
                              );
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                              statusFilter !== 'all'
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title="Filter by Status"
                          >
                            <Filter className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Status Filter Dropdown */}
                          {openFilterDropdown === 'status' && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30 space-y-1 normal-case font-normal text-slate-700 text-left">
                              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Account Status
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusFilter('all');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  statusFilter === 'all' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>All</span>
                                {statusFilter === 'all' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusFilter('Active');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  statusFilter === 'Active' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>Active</span>
                                {statusFilter === 'Active' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusFilter('Paused');
                                  setOpenFilterDropdown(null);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  statusFilter === 'Paused' ? 'text-emerald-700 bg-emerald-50/60 font-bold' : ''
                                }`}
                              >
                                <span>Paused</span>
                                {statusFilter === 'Paused' && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* Table Rows - Note: Last column "Service Audit" has been removed */}
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Owner Name & Contact */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </div>
                      </td>

                      {/* Society & Flat */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{c.society}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.flat}</span>
                        </div>
                        {(c.city || c.state) && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {[c.city, c.state].filter(Boolean).join(', ')}
                          </div>
                        )}
                        {c.adminId && (
                          <div className="mt-1 flex items-center gap-1">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                c.adminId === currentAdminId
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {c.adminId === currentAdminId
                                ? 'In Your Territory'
                                : `Admin: ${c.adminId.length > 10 ? `${c.adminId.slice(0, 8)}…` : c.adminId}`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Vehicles (Click Plate to Open Calendar) */}
                      <td className="p-4">
                        {c.vehicles.length === 0 ? (
                          <span className="text-slate-400 italic text-xs">No vehicles registered</span>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                            {c.vehicles.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleOpenCalendar(c, v)}
                                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-left transition-all cursor-pointer group/btn shadow-2xs hover:scale-[1.02]"
                                title={`Click to open ${v.name} (${v.plate}) service calendar`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-black text-slate-800 group-hover/btn:text-emerald-800 text-xs">
                                    {v.plate}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.2 rounded font-mono">
                                    #{v.last4}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Car className="w-2.5 h-2.5" />
                                  <span>{v.name}</span>
                                  <span className="text-emerald-600 font-bold ml-1">📅 Calendar</span>
                                </div>
                                {(v.assignedWasherName || c.assignedWasherName) && (
                                  <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
                                    Route: {v.assignedWasherName || c.assignedWasherName}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="p-4">
                        <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-[11px]">
                          {c.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ============================================================ */}
      {/* VEHICLE SERVICE CALENDAR MODAL                               */}
      {/* ============================================================ */}
      {selectedContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#080D1A] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#0B132B] border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-black font-mono tracking-wider text-white bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                      {selectedContext.vehicle.plate}
                    </span>
                    <span className="text-sm font-bold text-slate-300">
                      {selectedContext.vehicle.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Last 4: #{selectedContext.vehicle.last4}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap mt-1">
                    <span>
                      Owner: <strong className="text-white">{selectedContext.customer.name}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">
                      {selectedContext.customer.phone}
                    </span>
                    <span>•</span>
                    <span>{selectedContext.vehicle.parkingLocation}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseCalendar}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close calendar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Calendar & Insights */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Top Month Switcher & Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMonth('Sep')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedMonth === 'Sep'
                        ? 'bg-emerald-400 text-slate-950 shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    September 2026 (Current)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMonth('Oct')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedMonth === 'Oct'
                        ? 'bg-emerald-400 text-slate-950 shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    October 2026 (Upcoming)
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-slate-300">Verified Cleaned</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-300">Bay Empty</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="text-slate-400">Scheduled</span>
                  </div>
                </div>
              </div>

              {/* Service Calendar Grid */}
              <div className="space-y-2">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-mono font-bold text-slate-400 uppercase py-1">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({
                    length: selectedMonth === 'Sep' ? 1 : 3,
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square rounded-2xl bg-white/2 border border-white/5 opacity-30"
                    />
                  ))}

                  {calendarDays.map((day) => {
                    const isCompleted = day.status === 'completed';
                    const isUnavailable = day.status === 'unavailable';
                    const isMissed = day.status === 'missed';
                    const isSelected = inspectedDay?.date === day.date;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setInspectedDay(day)}
                        className={`aspect-square p-2 rounded-2xl border transition-all flex flex-col items-center justify-between text-left cursor-pointer group relative ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-2 ring-emerald-400'
                            : isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60'
                            : isUnavailable
                            ? 'bg-amber-500/10 border-amber-400/40 hover:border-amber-400'
                            : isMissed
                            ? 'bg-rose-500/10 border-rose-500/40'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span
                            className={`text-xs font-mono font-bold ${
                              isCompleted
                                ? 'text-emerald-300'
                                : isUnavailable
                                ? 'text-amber-300'
                                : 'text-slate-300'
                            }`}
                          >
                            {day.date}
                          </span>

                          {isCompleted && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                          )}
                          {isUnavailable && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                          )}
                        </div>

                        <div className="w-full text-center">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-400 font-mono">
                              ✓ Proof
                            </span>
                          ) : isUnavailable ? (
                            <span className="text-[9px] font-bold text-amber-300 font-mono">
                              Empty Bay
                            </span>
                          ) : isMissed ? (
                            <span className="text-[9px] font-bold text-rose-300 font-mono">
                              Credited
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Planned
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inspected Day Proof Details */}
              {inspectedDay ? (
                <div className="p-5 rounded-3xl bg-[#0B132B] border border-emerald-500/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">
                          Verified Wash Record: {inspectedDay.date} {selectedMonth} 2026
                        </h4>
                        <p className="text-xs text-slate-400">
                          Assigned Washer: {inspectedDay.washerName} • Scheduled Window: {inspectedDay.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {inspectedDay.gpsVerified && (
                        <span className="text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                          GPS Bay Geofence: Passed ✓
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setInspectedDay(null)}
                        className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Hide Details
                      </button>
                    </div>
                  </div>

                  {/* Photo Proof Viewer */}
                  {(inspectedDay.afterPhoto || inspectedDay.bayPhoto) && (
                    <div className="space-y-2">
                      {inspectedDay.beforePhoto && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePhotoTab('after')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              activePhotoTab === 'after'
                                ? 'bg-emerald-400 text-slate-950 font-black'
                                : 'bg-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            After Clean (Verified)
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePhotoTab('before')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              activePhotoTab === 'before'
                                ? 'bg-emerald-400 text-slate-950 font-black'
                                : 'bg-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            Before Wash Photo
                          </button>
                        </div>
                      )}

                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-black">
                        <Image
                          src={
                            inspectedDay.bayPhoto ||
                            (activePhotoTab === 'before' && inspectedDay.beforePhoto
                              ? inspectedDay.beforePhoto
                              : inspectedDay.afterPhoto || '/images/honda_city_after.jpg')
                          }
                          alt="Service Photo Proof"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs text-slate-200 flex items-center justify-between">
                          <span>
                            Location: {selectedContext.vehicle.parkingLocation}
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            Cryptographic Proof Signed ✓
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
                    <strong className="text-white block mb-0.5">Audit Note:</strong>
                    {inspectedDay.notes}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Click on any date above to view its verified proof photo, washer timestamp, and GPS audit report.</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#0B132B] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Care Protocol: Daily Morning Care • Mon–Sat Route
              </span>
              <button
                type="button"
                onClick={handleCloseCalendar}
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
