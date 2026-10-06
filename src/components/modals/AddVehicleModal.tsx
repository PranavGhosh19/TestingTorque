'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Clock, MapPin, X, Check, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddVehicleModal({ isOpen, onClose }: Props) {
  const { addVehicle, societies } = useStore();
  const [type, setType] = useState<'car' | 'suv' | 'bike'>('car');
  const [make, setMake] = useState('Honda');
  const [model, setModel] = useState('Elevate');
  const [regNo, setRegNo] = useState('DL 03 TR 9942');
  const [color, setColor] = useState('Obsidian Blue');
  const [parking, setParking] = useState('Block C • Parking 58');
  const [preferredTime, setPreferredTime] = useState('8:00 AM');
  const [societyId, setSocietyId] = useState(societies[0]?.id || 'soc_green_valley');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const soc = societies.find((s) => s.id === societyId) || societies[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0);

    addVehicle({
      registration_number: regNo.toUpperCase(),
      make,
      model,
      type,
      color,
      parking_location: parking,
      preferred_wash_time: preferredTime,
      needWashBefore: preferredTime,
      need_wash_before: preferredTime,
      subscriptionStartDate: tomorrow.toISOString(),
      society_id: soc.id,
      society_name: soc.name,
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="bg-[#0B132B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/20">
              <Car className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Add Vehicle
              </h3>
              <p className="text-xs text-slate-300">
                Setup daily washing & parking bay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#0B132B]">
                Vehicle Added Successfully!
              </h4>
              <p className="text-xs text-slate-500">
                A verified washer in your society cluster has been matched to your parking bay.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle Type Picker */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['car', 'suv', 'bike'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                        type === t
                          ? 'border-[#0B132B] bg-[#0B132B] text-white'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Brand / Make
                  </label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Honda"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. City ZX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Registration Number */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. DL 01 AB 4291"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Society Selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Gated Society
                </label>
                <select
                  value={societyId}
                  onChange={(e) => setSocietyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                >
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parking Location & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Parking Bay
                  </label>
                  <input
                    type="text"
                    required
                    value={parking}
                    onChange={(e) => setParking(e.target.value)}
                    placeholder="Block B • Parking 42"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Need the Wash before:
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600 font-mono"
                  >
                    <option value="6:00 AM">6am</option>
                    <option value="7:00 AM">7am</option>
                    <option value="8:00 AM">8am</option>
                    <option value="9:00 AM">9am</option>
                    <option value="10:00 AM">10am</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Save Vehicle & Activate Route
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
