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
      <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[#2DD4A0] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-white/50">Verifying session...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* HEADER */}
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/dashboard"
              className="p-2.5 rounded-xl bg-[#161C25] hover:bg-white/10 text-white/70 hover:text-white border border-white/[0.08] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-[#2DD4A0]">
                  TORQUE CARE
                </span>
                <span className="text-[10px] font-mono font-bold uppercase bg-[#161C25] text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Away Mode
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Going somewhere? We&apos;ve got your car.
              </h1>
            </div>
          </div>
          <Link
            href="/owner/washes/history"
            className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white px-3.5 py-2 rounded-full border border-white/[0.08] bg-[#161C25] hover:bg-white/10 transition-all"
          >
            <History className="w-3.5 h-3.5 text-[#2DD4A0]" />
            <span className="hidden sm:inline">Vehicle History</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ACTIVE AWAY MODE BANNER */}
        {activeBooking && (
          <div className="p-6 rounded-[20px] bg-[#11161D] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Away Mode Active
              </span>
              <span className="text-xs text-white/60 font-mono">
                Away until: {activeBooking.end_date}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeBooking.vehicle_name} · {activeBooking.registration_number}
                </h2>
                <p className="text-xs text-white/60 flex items-center gap-2 mt-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0" />
                  <span>📍 {activeBooking.destination_location}</span>
                  <span className="text-white/20">•</span>
                  <span>Specialist: {activeBooking.washer_name}</span>
                </p>
              </div>
              <div className="bg-[#161C25] px-4 py-2.5 rounded-xl border border-white/[0.08] text-right">
                <div className="text-[11px] text-white/50 uppercase tracking-wider font-mono">Scheduled Care</div>
                <div className="text-base font-bold text-[#2DD4A0]">
                  {activeBooking.wash_count || 1} washes · ₹{activeBooking.total_amount || 39}
                </div>
              </div>
            </div>

            <button
              onClick={() => endTravelBooking(activeBooking.id)}
              className="w-full py-3.5 rounded-full bg-white hover:bg-white/90 text-[#0A0D12] font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#2DD4A0]" />
              <span>I&apos;m Back — Resume Home Subscription (₹499/mo)</span>
            </button>
          </div>
        )}

        {/* LOCATION & VEHICLE SELECTOR CARD */}
        <div className="p-6 rounded-[20px] bg-[#11161D] border border-white/[0.08] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Location */}
            <div className="relative">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 mb-2 block">
                Current Location
              </label>
              <div
                onClick={() => setShowLocationSelect(!showLocationSelect)}
                className="w-full p-3.5 rounded-xl border border-white/[0.08] bg-[#161C25] hover:border-white/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span className="text-xs font-bold text-white">
                    {currentLocation}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </div>

              {/* Location Dropdown */}
              {showLocationSelect && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#161C25] border border-white/[0.12] rounded-xl shadow-2xl z-30 overflow-hidden py-1">
                  {availableLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setCurrentLocation(loc);
                        setShowLocationSelect(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between hover:bg-white/[0.06] transition-colors ${
                        currentLocation === loc
                          ? 'text-[#2DD4A0] bg-[#2DD4A0]/10'
                          : 'text-white/80'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>📍</span> {loc}
                      </span>
                      {currentLocation === loc && (
                        <Check className="w-4 h-4 text-[#2DD4A0]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 mb-2 block">
                Your Vehicle
              </label>
              <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#161C25] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                    <span className="text-xs text-white/50 ml-2 font-mono">
                      · {selectedVehicle.registration_number}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-[#2DD4A0]/10 text-[#2DD4A0] px-2 py-0.5 rounded-full border border-[#2DD4A0]/20">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: NEAREST PARTNERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-white/50 flex items-center gap-2">
              <span>Nearest Partners in {currentLocation.split(',')[0]}</span>
            </h2>
            <span className="text-[11px] text-[#2DD4A0] font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Background-vetted
            </span>
          </div>

          <div className="space-y-3">
            {partnerList.map((partner) => (
              <div
                key={partner.id}
                className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <Image
                      src={partner.avatar}
                      alt={partner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        {partner.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-white/60 bg-[#161C25] px-2 py-0.5 rounded-md border border-white/[0.06]">
                        {partner.distance}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-400 font-bold gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{partner.rating}</span>
                      </div>
                      <span className="text-white/20">•</span>
                      <span className="text-[#2DD4A0] font-mono font-bold bg-[#2DD4A0]/10 px-2 py-0.5 rounded text-[10px]">
                        Verified Specialist
                      </span>
                    </div>

                    <div className="text-xs text-white/50 flex items-center gap-1.5 pt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-[#2DD4A0]" />
                      <span>{partner.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/[0.08]">
                  <div className="sm:text-right">
                    <span className="text-xl font-black text-white">
                      ₹{partner.price}
                    </span>
                    <span className="text-xs text-white/40 block">one-time wash</span>
                  </div>

                  <button
                    onClick={() => handleBookOneTime(partner.name)}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-white/90 text-[#0A0D12] font-black text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    BOOK WASH
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: BOOK UNTIL I RETURN */}
        <section className="p-7 rounded-[20px] bg-[#11161D] border border-[#2DD4A0]/30 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0] bg-[#2DD4A0]/10 px-3 py-1 rounded-full border border-[#2DD4A0]/20">
                Automated Care
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                &ldquo;Book Until I Return&rdquo;
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Zero repeat bookings. Automated visits while travelling.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#161C25] text-[#2DD4A0] flex items-center justify-center border border-white/[0.08]">
              <Repeat className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-white/50 mb-2 block uppercase">
                I&apos;m away until:
              </label>
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.08] focus-within:border-[#2DD4A0] flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                <input
                  type="text"
                  value={awayUntilDate}
                  onChange={(e) => setAwayUntilDate(e.target.value)}
                  placeholder="e.g. 12 Oct 2026"
                  className="bg-transparent font-bold text-sm text-white w-full outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-white/50 mb-2 block uppercase">
                Assigned Local Specialist:
              </label>
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#2DD4A0]/40">
                    <Image
                      src={primaryPartner.avatar}
                      alt={primaryPartner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {primaryPartner.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      ★ {primaryPartner.rating} · Verified Specialist
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-white/60">
                  {primaryPartner.distance}
                </span>
              </div>
            </div>
          </div>

          {/* Frequency selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold text-white/50 uppercase block">
              Wash Frequency
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
                  className={`p-3.5 rounded-xl border text-center transition-all relative ${
                    selectedFrequency === freq.id
                      ? 'border-[#2DD4A0] bg-[#2DD4A0]/10 text-white shadow-sm'
                      : 'border-white/[0.08] bg-[#161C25] text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  {freq.badge && (
                    <span className="absolute -top-2 right-2 text-[9px] font-mono font-bold uppercase bg-[#2DD4A0] text-[#0A0D12] px-2 py-0.5 rounded-full">
                      {freq.badge}
                    </span>
                  )}
                  <div className="text-xs font-bold">{freq.title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{freq.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Math calculation breakdown */}
          <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="text-xs text-white/50 font-mono">Estimated plan until {awayUntilDate}:</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {calc.count} washes × ₹39 = <span className="text-[#2DD4A0]">₹{calc.total}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono font-bold text-[#2DD4A0] bg-[#2DD4A0]/10 px-2.5 py-1 rounded-full border border-[#2DD4A0]/20 block">
                Pay As You Go
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleBookUntilReturn}
            className="w-full py-4 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Activate Away Schedule</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* CONFIRMATION MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#11161D] text-white rounded-[20px] p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 border border-white/[0.08]">
            <div className="w-14 h-14 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-[#2DD4A0] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-white">
                {lastBookedType === 'until_return'
                  ? 'Away Mode Activated'
                  : 'Away Wash Scheduled'}
              </h3>
              <p className="text-xs text-white/60">
                {lastBookedType === 'until_return'
                  ? `Your car will receive ${calc.count} washes by ${primaryPartner.name} in ${currentLocation} until you return on ${awayUntilDate}.`
                  : `Your one-time wash is booked with ${primaryPartner.name} for today in ${currentLocation}.`}
              </p>
            </div>

            <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.08] text-xs space-y-2 font-mono">
              <div className="flex justify-between text-white/60">
                <span>Vehicle:</span>
                <span className="font-bold text-white">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.registration_number})
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Location:</span>
                <span className="font-bold text-white">{currentLocation}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2DD4A0] border-t border-white/[0.08] pt-2">
                <span>Total Amount:</span>
                <span>{lastBookedType === 'until_return' ? `₹${calc.total}` : '₹39'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3.5 rounded-full bg-white hover:bg-white/90 text-[#0A0D12] font-black text-xs transition-all uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}
