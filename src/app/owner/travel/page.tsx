'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  Star,
  ShieldCheck,
  Car,
  Clock,
  Check,
  ChevronDown,
  Repeat,
  History,
  Home,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import { useStore } from '@/lib/store';
import { AwayFrequency } from '@/lib/types';

export default function AwayModePage() {
  const router = useRouter();
  const { vehicles, travelBookings, createTravelBooking, endTravelBooking, washes, isLoggedIn, isHydrated } = useStore();

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  // Location & Vehicle selection
  const [currentLocation, setCurrentLocation] = useState('Jaipur, Rajasthan');
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'veh_honda_city');

  // Book Until I Return Controls
  const [awayUntilDate, setAwayUntilDate] = useState('12 Oct 2026');
  const [selectedFrequency, setSelectedFrequency] = useState<AwayFrequency>('every_3_days');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastBookedType, setLastBookedType] = useState<'single' | 'until_return'>('until_return');

  const availableLocations = [
    'Jaipur, Rajasthan',
    'Bengaluru, Karnataka',
    'Goa (North & South)',
    'Mumbai, Maharashtra',
    'Chandigarh, Punjab',
    'Delhi NCR (Home)',
  ];

  const partnersByLocation: Record<
    string,
    {
      id: string;
      name: string;
      distance: string;
      rating: number;
      reviews: number;
      avatar: string;
      availability: string;
      price: number;
    }[]
  > = {
    'Jaipur, Rajasthan': [
      {
        id: 'p_1',
        name: 'Vikram Singh',
        distance: '1.2 km',
        rating: 4.9,
        reviews: 320,
        avatar: '/images/washer_amit.jpg',
        availability: 'Available today · 7:30 PM',
        price: 39,
      },
      {
        id: 'p_2',
        name: 'Kailash Meena',
        distance: '2.4 km',
        rating: 4.8,
        reviews: 215,
        avatar: '/images/washer_amit.jpg',
        availability: 'Available today · 8:15 PM',
        price: 39,
      },
    ],
    default: [
      {
        id: 'p_def',
        name: 'Suresh Verma',
        distance: '1.5 km',
        rating: 4.9,
        reviews: 280,
        avatar: '/images/washer_amit.jpg',
        availability: 'Available today · 7:30 PM',
        price: 39,
      },
    ],
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || {
    id: 'veh_default',
    make: 'Car',
    model: 'Vehicle',
    registration_number: 'Not Registered',
    type: 'car' as const,
    color: 'Silver',
    parking_location: 'Bay 1',
    society_name: 'Society',
    owner_id: 'usr_guest',
    owner_name: 'Vehicle Owner',
    washes_this_month: 0,
    subscription_status: 'inactive' as const,
  };
  const activeBooking = travelBookings.find((b) => b.is_active);
  const partnerList = partnersByLocation[currentLocation] || partnersByLocation.default;
  const primaryPartner = partnerList[0];

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          <p className="text-xs font-bold text-slate-400 font-mono">Verifying owner session...</p>
        </div>
      </div>
    );
  }

  // Dynamic wash calculation for "Book Until I Return"
  const getWashCalculations = () => {
    switch (selectedFrequency) {
      case 'once':
        return { count: 1, total: 39, label: '1 wash' };
      case 'every_3_days':
        return { count: 3, total: 117, label: '3 washes' };
      case 'every_5_days':
        return { count: 2, total: 78, label: '2 washes' };
      case 'weekly':
        return { count: 2, total: 78, label: '2 washes' };
    }
  };

  const calc = getWashCalculations();

  // Handlers
  const handleBookOneTime = (partnerName: string) => {
    createTravelBooking({
      vehicle_name: `${selectedVehicle.make} ${selectedVehicle.model}`,
      registration_number: selectedVehicle.registration_number,
      destination_location: `${currentLocation}`,
      city: currentLocation.split(',')[0],
      temporary_bay: 'Temporary Parking Bay',
      washer_name: partnerName,
      washer_avatar: primaryPartner.avatar,
      washer_rating: primaryPartner.rating,
      start_date: 'Today',
      end_date: 'Today · One-time',
      daily_rate: 39,
      booking_type: 'single',
      frequency: 'once',
      wash_count: 1,
      total_amount: 39,
    });
    setLastBookedType('single');
    setIsSuccessModalOpen(true);
  };

  const handleBookUntilReturn = () => {
    createTravelBooking({
      vehicle_name: `${selectedVehicle.make} ${selectedVehicle.model}`,
      registration_number: selectedVehicle.registration_number,
      destination_location: `${currentLocation}`,
      city: currentLocation.split(',')[0],
      temporary_bay: 'Hotel / Society Parking Bay',
      washer_name: primaryPartner.name,
      washer_avatar: primaryPartner.avatar,
      washer_rating: primaryPartner.rating,
      start_date: 'Today',
      end_date: awayUntilDate,
      daily_rate: 39,
      booking_type: 'until_return',
      frequency: selectedFrequency,
      wash_count: calc.count,
      total_amount: calc.total,
    });
    setLastBookedType('until_return');
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 pb-28 md:pb-16 selection:bg-amber-500 selection:text-black">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* HEADER */}
      <header className="bg-[#0B132B]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/dashboard"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                  Torque Care
                </span>
                <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  Away Mode
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Going somewhere? We&apos;ve got your car.
              </h1>
            </div>
          </div>
          <Link
            href="/owner/washes/history"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all shadow-lg"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Vehicle History</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ACTIVE AWAY MODE BANNER */}
        {activeBooking && (
          <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/20 via-[#0B132B] to-[#080D1A] text-white border border-amber-500/40 shadow-2xl space-y-4 specular-border luxury-sheen">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-black text-amber-300 bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Away Mode Active
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Away until: {activeBooking.end_date}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h2 className="text-xl font-black text-white">
                  {activeBooking.vehicle_name} · {activeBooking.registration_number}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-2 mt-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>📍 {activeBooking.destination_location}</span>
                  <span className="text-slate-500">•</span>
                  <span>Assigned: {activeBooking.washer_name}</span>
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 text-right backdrop-blur-md">
                <div className="text-[11px] text-slate-300 uppercase tracking-wider">Scheduled Care</div>
                <div className="text-base font-black text-amber-400">
                  {activeBooking.wash_count || 1} washes · ₹{activeBooking.total_amount || 39}
                </div>
              </div>
            </div>

            <button
              onClick={() => endTravelBooking(activeBooking.id)}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>I&apos;m Back — Resume Home Subscription (Starting at ₹599/mo)</span>
            </button>
          </div>
        )}

        {/* LOCATION & VEHICLE SELECTOR CARD */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4 luxury-sheen">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Location */}
            <div className="relative">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 block">
                Your current location
              </label>
              <div
                onClick={() => setShowLocationSelect(!showLocationSelect)}
                className="w-full p-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer shadow-inner"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-sm font-black text-white">
                    {currentLocation}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Location Dropdown */}
              {showLocationSelect && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B132B] border border-white/20 rounded-2xl shadow-2xl z-30 overflow-hidden py-2 backdrop-blur-2xl">
                  {availableLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setCurrentLocation(loc);
                        setShowLocationSelect(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-xs font-bold flex items-center justify-between hover:bg-white/10 transition-colors ${
                        currentLocation === loc
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>📍</span> {loc}
                      </span>
                      {currentLocation === loc && (
                        <Check className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 block">
                Your vehicle
              </label>
              <div className="p-4 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <Car className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-sm font-black text-white">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">
                      · {selectedVehicle.registration_number}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: NEAREST TORQUE CARE PARTNERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span>Nearest Torque Care Partners in {currentLocation.split(',')[0]}</span>
            </h2>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Background-vetted
            </span>
          </div>

          <div className="space-y-3.5">
            {partnerList.map((partner) => (
              <div
                key={partner.id}
                className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl shadow-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 luxury-sheen"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shrink-0 shadow-md">
                    <Image
                      src={partner.avatar}
                      alt={partner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-white">
                        Torque Care Partner — {partner.name}
                      </h3>
                      <span className="text-[11px] font-mono font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                        {partner.distance}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-400 font-black gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{partner.rating}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                        Verified Partner
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{partner.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <div className="sm:text-right">
                    <span className="text-xl font-black text-white">
                      ₹{partner.price}
                    </span>
                    <span className="text-xs text-slate-400 block font-medium">one-time wash</span>
                  </div>

                  <button
                    onClick={() => handleBookOneTime(partner.name)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs shadow-md transition-all active:scale-95"
                  >
                    BOOK WASH
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: EVEN BETTER — "BOOK UNTIL I RETURN" */}
        <section className="p-7 rounded-3xl bg-linear-to-br from-[#0B132B] via-slate-900 to-[#080D1A] border-2 border-amber-500/40 shadow-2xl space-y-6 specular-border luxury-sheen relative">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                Automated Care
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                &ldquo;Book Until I Return&rdquo;
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                The customer doesn&apos;t have to repeatedly search and book.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Repeat className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Away Until Date */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">
                I&apos;m away until:
              </label>
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/15 focus-within:border-amber-400 flex items-center gap-2.5 shadow-inner">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={awayUntilDate}
                  onChange={(e) => setAwayUntilDate(e.target.value)}
                  placeholder="e.g. 12 Oct 2026"
                  className="bg-transparent font-bold text-sm text-white w-full outline-hidden"
                />
              </div>
            </div>

            {/* Partner Assignment preview */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">
                Assigned Local Partner:
              </label>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/15 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-400">
                    <Image
                      src={primaryPartner.avatar}
                      alt={primaryPartner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">
                      {primaryPartner.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      ★ {primaryPartner.rating} · Verified Partner
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-400">
                  {primaryPartner.distance}
                </span>
              </div>
            </div>
          </div>

          {/* Frequency selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 block">
              How often should we care for your car?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'once' as AwayFrequency, title: 'Once', desc: 'Single clean' },
                {
                  id: 'every_3_days' as AwayFrequency,
                  title: 'Every 3 days',
                  desc: 'Recommended',
                  badge: 'Popular',
                },
                { id: 'every_5_days' as AwayFrequency, title: 'Every 5 days', desc: 'Moderate' },
                { id: 'weekly' as AwayFrequency, title: 'Weekly', desc: 'Periodic' },
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setSelectedFrequency(freq.id)}
                  className={`p-3.5 rounded-2xl border text-center transition-all relative ${
                    selectedFrequency === freq.id
                      ? 'border-amber-400 bg-amber-500/20 text-white shadow-lg ring-1 ring-amber-400/50'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {freq.badge && (
                    <span className="absolute -top-2 right-2 text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-md font-sans">
                      {freq.badge}
                    </span>
                  )}
                  <div className="text-xs font-black">
                    {freq.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{freq.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Math calculation breakdown */}
          <div className="p-4.5 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between backdrop-blur-md">
            <div>
              <div className="text-xs text-slate-400">Estimated plan until {awayUntilDate}:</div>
              <div className="text-lg font-black text-white mt-0.5">
                {calc.count} washes × ₹39 = <span className="text-amber-400">₹{calc.total}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-400/30 block">
                Pay As You Go
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Verified photos daily
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleBookUntilReturn}
            className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>BOOK UNTIL I RETURN</span>
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
          </button>
        </section>

        {/* SECTION: TORQUE CARE VEHICLE HISTORY (Unified across cities!) */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                <span>Torque Care Vehicle History</span>
              </h2>
              <p className="text-xs text-slate-400">
                All services appear in one vehicle history, wherever you travel.
              </p>
            </div>
            <Link
              href="/owner/washes/history"
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              View Full Log →
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {washes.slice(0, 4).map((wash) => {
              const isAway = wash.service_type === 'away';
              return (
                <div
                  key={wash.id}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                        isAway
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      }`}
                    >
                      {isAway ? '🚗' : '🏠'}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-2 font-sans">
                        <span>
                          {wash.scheduled_date} — {wash.city || 'Delhi'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isAway
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {wash.service_type || 'home'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {wash.washer_name} • {wash.parking_location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed ✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION: THE TWO PILLARS OVERVIEW */}
        <section className="p-7 rounded-3xl bg-slate-950 border border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              The Bigger Proposition
            </span>
            <h2 className="text-xl font-black text-white">
              Torque Care — Your car. Cared for, wherever you go.
            </h2>
            <p className="text-xs text-slate-400 max-w-lg">
              Recurring car care + verified service + nationwide partner network.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Tier 1: Home */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Torque Care Home</h3>
                <div className="text-lg font-black text-blue-400">
                  <span className="text-xs font-normal text-slate-400 block">Starting at</span>
                  ₹599/month
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recurring society-based care. Clean car photo every morning before your commute.
              </p>
            </div>

            {/* Tier 2: Away */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
              {/* Car on Road Sign */}
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex flex-col items-center justify-center font-bold text-sm">
                <Car className="w-5 h-5" />
                <div className="w-5 h-0.5 bg-amber-400/80 rounded-full mt-0.5 flex justify-center gap-0.5">
                  <span className="w-1 h-0.5 bg-slate-900 rounded-full" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Torque Care Away</h3>
                <div className="text-lg font-black text-amber-400">
                  <span className="text-xs font-normal text-slate-400 block">Starting at</span>
                  ₹39/wash or Book Until Return
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                For washes while travelling. Book until you return with flexible intervals.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* CONFIRMATION MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B132B] text-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 border border-white/20 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-white">
                {lastBookedType === 'until_return'
                  ? 'Away Mode Activated!'
                  : 'Away Wash Scheduled!'}
              </h3>
              <p className="text-xs text-slate-300">
                {lastBookedType === 'until_return'
                  ? `Your car will receive ${calc.count} washes by ${primaryPartner.name} in ${currentLocation} until you return on ${awayUntilDate}.`
                  : `Your one-time wash is booked with ${primaryPartner.name} for today in ${currentLocation}.`}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-2.5 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Vehicle:</span>
                <span className="font-bold text-white">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.registration_number})
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Location:</span>
                <span className="font-bold text-white">{currentLocation}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-400 border-t border-white/10 pt-2">
                <span>Total Amount:</span>
                <span>
                  {lastBookedType === 'until_return' ? `₹${calc.total}` : '₹39'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <OwnerBottomNav />
    </div>
  );
}
