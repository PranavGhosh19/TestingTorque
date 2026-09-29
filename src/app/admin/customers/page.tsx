'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

interface CustomerVehicle {
  id: string;
  name: string;
  plate: string;
  last4: string;
  parkingLocation: string;
  preferredTime: string;
  color?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  society: string;
  flat: string;
  status: 'Active' | 'Paused';
  plan: string;
  vehicles: CustomerVehicle[];
}

const customerList: Customer[] = [
  {
    id: 'cust_1',
    name: 'Pranav Ghosh',
    phone: '+91 98765 43210',
    society: 'Green Valley Residency',
    flat: 'Tower B • 402',
    status: 'Active',
    plan: 'Standard Plan',
    vehicles: [
      {
        id: 'veh_honda_city',
        name: 'Honda City ZX',
        plate: 'DL 01 AB 4291',
        last4: '4291',
        parkingLocation: 'Block B • Parking 42',
        preferredTime: '07:30 AM',
        color: 'Lunar Silver',
      },
      {
        id: 'veh_creta_1',
        name: 'Hyundai Creta',
        plate: 'KA 01 HY 4567',
        last4: '4567',
        parkingLocation: 'Block C • Parking 108',
        preferredTime: '08:00 AM',
        color: 'Phantom Black',
      },
    ],
  },
  {
    id: 'cust_2',
    name: 'Ananya Sharma',
    phone: '+91 98111 22334',
    society: 'Green Valley Residency',
    flat: 'Tower B • 108',
    status: 'Active',
    plan: 'Standard Plan',
    vehicles: [
      {
        id: 'v_2',
        name: 'Hyundai Creta',
        plate: 'DL 04 EF 2281',
        last4: '2281',
        parkingLocation: 'Block B • Parking 45',
        preferredTime: '07:45 AM',
        color: 'Polar White',
      },
    ],
  },
  {
    id: 'cust_3',
    name: 'Vikram Mehta',
    phone: '+91 99223 34455',
    society: 'Green Valley Residency',
    flat: 'Tower B • 304',
    status: 'Active',
    plan: 'Basic Plan',
    vehicles: [
      {
        id: 'v_3',
        name: 'Maruti Swift',
        plate: 'DL 09 PQ 9821',
        last4: '9821',
        parkingLocation: 'Block B • Parking 48',
        preferredTime: '08:00 AM',
        color: 'Solid Fire Red',
      },
    ],
  },
  {
    id: 'cust_4',
    name: 'Col. Rajesh Singh',
    phone: '+91 97112 33445',
    society: 'Green Valley Residency',
    flat: 'Tower C • 1201',
    status: 'Active',
    plan: 'Premium Plan',
    vehicles: [
      {
        id: 'v_6',
        name: 'Toyota Fortuner',
        plate: 'UP 16 AX 8800',
        last4: '8800',
        parkingLocation: 'Block C • Parking 04',
        preferredTime: '08:45 AM',
        color: 'Super White',
      },
    ],
  },
  {
    id: 'cust_5',
    name: 'Rohan Gupta',
    phone: '+91 98711 00223',
    society: 'Green Valley Residency',
    flat: 'Tower B • 502',
    status: 'Active',
    plan: 'Standard Plan',
    vehicles: [
      {
        id: 'v_4',
        name: 'Tata Nexon',
        plate: 'DL 02 ZB 5512',
        last4: '5512',
        parkingLocation: 'Block B • Parking 50',
        preferredTime: '08:15 AM',
        color: 'Daytona Grey',
      },
    ],
  },
  {
    id: 'cust_6',
    name: 'Pooja Verma',
    phone: '+91 98100 44556',
    society: 'Green Valley Residency',
    flat: 'Tower B • 801',
    status: 'Active',
    plan: 'Standard Plan',
    vehicles: [
      {
        id: 'v_5',
        name: 'Kia Seltos',
        plate: 'HR 26 AK 1190',
        last4: '1190',
        parkingLocation: 'Block B • Parking 52',
        preferredTime: '08:30 AM',
        color: 'Gravity Grey',
      },
    ],
  },
  {
    id: 'cust_7',
    name: 'Sameer Sen',
    phone: '+91 99990 11223',
    society: 'Palm Residency',
    flat: 'Tower A • 301',
    status: 'Active',
    plan: 'Premium Plan',
    vehicles: [
      {
        id: 'v_7',
        name: 'Mahindra XUV700',
        plate: 'DL 10 CP 3491',
        last4: '3491',
        parkingLocation: 'Block C • Parking 08',
        preferredTime: '09:00 AM',
        color: 'Midnight Black',
      },
    ],
  },
  {
    id: 'cust_8',
    name: 'Divya Rao',
    phone: '+91 98450 99887',
    society: 'Palm Residency',
    flat: 'Tower A • 604',
    status: 'Active',
    plan: 'Standard Plan',
    vehicles: [
      {
        id: 'v_8',
        name: 'Honda Elevate',
        plate: 'DL 05 TR 7721',
        last4: '7721',
        parkingLocation: 'Block C • Parking 12',
        preferredTime: '09:15 AM',
        color: 'Golden Brown',
      },
    ],
  },
  {
    id: 'cust_9',
    name: 'Aditya Kapoor',
    phone: '+91 98188 55443',
    society: 'Green Valley Residency',
    flat: 'Tower C • 202',
    status: 'Active',
    plan: 'Premium Plan',
    vehicles: [
      {
        id: 'v_9',
        name: 'BMW 3 Series',
        plate: 'DL 01 ZZ 0007',
        last4: '0007',
        parkingLocation: 'Block C • Parking 21',
        preferredTime: '09:30 AM',
        color: 'Portimao Blue',
      },
    ],
  },
  {
    id: 'cust_10',
    name: 'Neha Chawla',
    phone: '+91 98102 77889',
    society: 'Green Valley Residency',
    flat: 'Tower C • 505',
    status: 'Active',
    plan: 'Standard Plan',
    vehicles: [
      {
        id: 'v_10',
        name: 'Volkswagen Taigun',
        plate: 'DL 03 YK 4421',
        last4: '4421',
        parkingLocation: 'Block C • Parking 25',
        preferredTime: '09:45 AM',
        color: 'Wild Cherry Red',
      },
    ],
  },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState<SelectedCalendarContext | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<'Sep' | 'Oct'>('Sep');
  const [inspectedDay, setInspectedDay] = useState<CalendarDayRecord | null>(null);
  const [activePhotoTab, setActivePhotoTab] = useState<'after' | 'before'>('after');

  // Search filter implementation
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customerList;
    const q = searchQuery.toLowerCase().trim();
    const cleanQueryDigits = q.replace(/[^0-9]/g, '');

    return customerList.filter((c) => {
      // 1. Search by customer name
      if (c.name.toLowerCase().includes(q)) return true;

      // 2. Search by phone number
      const cleanPhone = c.phone.replace(/[^0-9]/g, '');
      if (
        c.phone.toLowerCase().includes(q) ||
        (cleanQueryDigits.length > 0 && cleanPhone.includes(cleanQueryDigits))
      ) {
        return true;
      }

      // 3. Search by car number plate (last 4 digits only)
      const matchesPlateLast4 = c.vehicles.some((v) => {
        const cleanPlate = v.plate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const last4 = cleanPlate.slice(-4);
        const queryClean = q.replace(/[^a-zA-Z0-9]/g, '');
        return last4 === queryClean || last4.includes(queryClean) || v.last4 === queryClean;
      });

      return matchesPlateLast4;
    });
  }, [searchQuery]);

  // Generate calendar days for the selected vehicle
  const calendarDays = useMemo<CalendarDayRecord[]>(() => {
    if (!selectedContext) return [];
    const days: CalendarDayRecord[] = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (selectedMonth === 'Sep') {
      // September 2026 (30 days, starts Tuesday)
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
          // Bay empty customer unavailable scenario
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
          // Washer absent / auto-credited scenario
          days.push({
            date: d,
            dayName: dayOfWeek,
            status: 'missed',
            time: selectedContext.vehicle.preferredTime,
            washerName: 'Amit Kumar',
            washerAvatar: '/images/washer_amit.jpg',
            gpsVerified: false,
            notes: 'Washer absent on morning route. Auto-credited +₹35 penalty compensation to owner wallet.',
          });
        } else {
          // Completed verified wash
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
      // October 2026 (31 days, starts Thursday)
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

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
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
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              {customerList.length} Registered Accounts
            </span>
          </div>
        </div>

        {/* Search Bar Component */}
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

          {/* Quick Filters / Search Context Feedback */}
          <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Quick Filters:</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]">
                Name
              </span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]">
                Phone
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
                Plate (Last 4 Digits)
              </span>
            </div>

            <div className="text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{filteredCustomers.length}</strong> of{' '}
              {customerList.length} customers
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No matching customers found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No customer found matching &ldquo;{searchQuery}&rdquo;. Try searching by name, 10-digit phone, or car plate last 4 digits (e.g. 4291).
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Owner Name & Contact</th>
                    <th className="p-4">Society & Residence</th>
                    <th className="p-4">Vehicles (Click to View Calendar)</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Service Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{c.society}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.flat}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                          {c.vehicles.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleOpenCalendar(c, v)}
                              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group/btn shadow-2xs hover:scale-[1.02]"
                              title={`View ${v.name} service calendar`}
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
                                {v.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                          {c.plan}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {c.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenCalendar(c, c.vehicles[0])}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>View Calendar</span>
                        </button>
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
                  {/* Empty offset days for start of month */}
                  {Array.from({
                    length: selectedMonth === 'Sep' ? 1 : 3,
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square rounded-2xl bg-white/2 border border-white/5 opacity-30"
                    />
                  ))}

                  {/* Calendar Days */}
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
                Subscription Plan: {selectedContext.customer.plan} • Daily Morning Care
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
