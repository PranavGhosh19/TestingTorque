'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  X,
  UserCheck,
  Car,
  Search,
  CheckCircle2,
  RefreshCw,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { WasherPartner } from '@/lib/washerPartners';

interface AppointWasherModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedWasherId?: string;
  preselectedVehicleId?: string;
  onSuccess?: () => void;
}

export default function AppointWasherModal({
  isOpen,
  onClose,
  preselectedWasherId,
  preselectedVehicleId,
  onSuccess,
}: AppointWasherModalProps) {
  const { washers, vehicles, routeStops, appointWasherToVehicle } = useStore();

  const [selectedWasherId, setSelectedWasherId] = useState<string>(
    preselectedWasherId || (washers.find((w) => w.status !== 'Dismissed')?.id || '')
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    preselectedVehicleId || (vehicles[0]?.id || '')
  );
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active washers only (cannot assign to dismissed washers)
  const activeWashers = useMemo(() => {
    return washers.filter((w) => w.status !== 'Dismissed');
  }, [washers]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicles;
    const term = vehicleSearch.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.registration_number.toLowerCase().includes(term) ||
        v.make.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.owner_name.toLowerCase().includes(term) ||
        v.parking_location.toLowerCase().includes(term)
    );
  }, [vehicles, vehicleSearch]);

  if (!isOpen) return null;

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const currentWasher = washers.find((w) => w.id === selectedWasherId);

  const handleAppoint = async () => {
    if (!selectedVehicleId || !selectedWasherId) return;
    setIsSubmitting(true);
    await appointWasherToVehicle(selectedVehicleId, selectedWasherId, currentVehicle?.owner_id);
    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-400 block">
                Manager Control • Route Assignment
              </span>
              <h2 className="text-lg font-black text-white">Appoint Washer to Owner</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* STEP 1: SELECT VEHICLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                1. Select Owner Vehicle ({vehicles.length} Available)
              </label>
              {currentVehicle && (
                <span className="text-[11px] font-semibold text-slate-500">
                  Current: <strong className="text-slate-800">{currentVehicle.assigned_washer_name || 'Unassigned'}</strong>
                </span>
              )}
            </div>

            {/* Vehicle Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                placeholder="Search by plate number, car name, or owner..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 bg-slate-50"
              />
            </div>

            {/* Vehicle Selector List */}
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white">
              {filteredVehicles.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching vehicles found.
                </div>
              ) : (
                filteredVehicles.map((v) => {
                  const isSelected = v.id === selectedVehicleId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {v.registration_number}
                          </span>
                          <span className="truncate">{v.make} {v.model}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          Owner: {v.owner_name} • Bay: {v.parking_location}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Select</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* STEP 2: SELECT WASHER PARTNER */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Appoint to Active Washer Partner
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
              {activeWashers.map((w) => {
                const isSelected = w.id === selectedWasherId;
                // Count current stops for this washer
                const currentLoad = routeStops.filter((s) => s.washer_id === w.id).length;

                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWasherId(w.id)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                      <Image
                        src={w.avatar}
                        alt={w.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-xs text-slate-900 truncate flex items-center justify-between">
                        <span>{w.name}</span>
                        {isSelected && (
                          <span className="text-emerald-700 text-xs">✓</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {w.society}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">
                        Route Load: {currentLoad > 0 ? `${currentLoad} cars` : `${w.assignedCarsPerDay} cap`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview of Appointment */}
          {currentVehicle && currentWasher && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
              <span className="font-sans font-bold text-[11px] text-slate-500 uppercase tracking-wider block">
                Appointment Summary
              </span>
              <div className="flex items-center justify-between text-slate-800">
                <span>Vehicle:</span>
                <span className="font-bold">{currentVehicle.registration_number} ({currentVehicle.make} {currentVehicle.model})</span>
              </div>
              <div className="flex items-center justify-between text-slate-800">
                <span>Owner:</span>
                <span className="font-bold">{currentVehicle.owner_name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-800">
                <span>Assigned Bay:</span>
                <span>{currentVehicle.parking_location}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 pt-1 border-t border-slate-200 font-bold">
                <span>Appointed Washer:</span>
                <span>{currentWasher.name} ({currentWasher.society})</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAppoint}
              disabled={isSubmitting || !selectedVehicleId || !selectedWasherId}
              className="w-1/2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Appointing...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Appoint Washer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
