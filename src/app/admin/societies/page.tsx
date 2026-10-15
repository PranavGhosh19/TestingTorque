'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  ShieldCheck,
  Users,
  RefreshCw,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
  UserCheck,
  UserX,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Search,
  Pencil,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  fetchAllSocieties,
  createSociety,
  updateSociety,
  fetchAllDirectoryWashers,
  assignWasherToSociety,
  removeWasherFromSociety,
  FirestoreSociety,
  DirectoryWasher,
} from '@/lib/firebaseService';



// ─────────────────────────────────────────────────────────────────────────────
// Modal: Edit Society
// ─────────────────────────────────────────────────────────────────────────────
function EditSocietyModal({
  society,
  onClose,
  onUpdated,
}: {
  society: FirestoreSociety;
  onClose: () => void;
  onUpdated: (updated: FirestoreSociety) => void;
}) {
  const [name, setName] = useState(society.name);
  const [district, setDistrict] = useState(society.district || '');
  const [city, setCity] = useState(society.city);
  const [state, setState] = useState(society.state);
  const [status, setStatus] = useState<'active' | 'inactive'>(society.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !district.trim() || !city.trim() || !state.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await updateSociety(society.societyId, {
      name: name.trim(),
      district: district.trim(),
      city: city.trim(),
      state: state.trim(),
      status,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to update society.');
      return;
    }
    onUpdated({
      ...society,
      name: name.trim(),
      district: district.trim(),
      city: city.trim(),
      state: state.trim(),
      status,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center text-white shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0B132B]">Edit Society</h2>
            <p className="text-xs text-slate-500 font-mono">ID: {society.societyId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Society ID (Immutable)
            </label>
            <input
              type="text"
              value={society.societyId}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Society Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Green Valley Residency"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-[#0B132B] focus:outline-none focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              District <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Thane"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-[#0B132B] focus:outline-none focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]/20 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Ghaziabad"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-[#0B132B] focus:outline-none focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-[#0B132B] focus:outline-none focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]/20 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-[#0B132B] focus:outline-none focus:border-[#0B132B] transition-all cursor-pointer"
            >
              <option value="active">Active (Visible during customer signup)</option>
              <option value="inactive">Inactive (Hidden from customer signup)</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B132B] hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal: Manage Washers for a Society
// ─────────────────────────────────────────────────────────────────────────────
function ManageWashersModal({
  society,
  allWashers,
  onClose,
  onUpdated,
}: {
  society: FirestoreSociety;
  allWashers: DirectoryWasher[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingOps, setPendingOps] = useState<Record<string, 'assigning' | 'removing'>>({});
  const [localAssignments, setLocalAssignments] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    allWashers.forEach((w) => {
      map[w.id] = w.societies.includes(society.societyId);
    });
    return map;
  });

  const filtered = allWashers.filter((w) =>
    !searchQuery.trim() || w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleToggle(washer: DirectoryWasher) {
    const isCurrentlyAssigned = localAssignments[washer.id];
    setPendingOps((prev) => ({ ...prev, [washer.id]: isCurrentlyAssigned ? 'removing' : 'assigning' }));

    let result;
    if (isCurrentlyAssigned) {
      result = await removeWasherFromSociety(washer.id, society.societyId);
    } else {
      result = await assignWasherToSociety(washer.id, society.societyId);
    }

    setPendingOps((prev) => {
      const next = { ...prev };
      delete next[washer.id];
      return next;
    });

    if (result.success) {
      setLocalAssignments((prev) => ({ ...prev, [washer.id]: !isCurrentlyAssigned }));
      onUpdated();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 shrink-0">
          <h2 className="text-base font-extrabold text-[#0B132B]">Assign Washers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Toggle washers for{' '}
            <span className="font-bold text-[#0B132B]">{society.name}</span>
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search washers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-[#0B132B] focus:outline-none focus:border-[#0B132B] transition-all"
          />
        </div>

        {/* Washer list */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              {allWashers.length === 0
                ? 'No washers found in directory. Add washers first.'
                : 'No washers match your search.'}
            </div>
          )}
          {filtered.map((washer) => {
            const isAssigned = localAssignments[washer.id] ?? false;
            const opState = pendingOps[washer.id];

            return (
              <div
                key={washer.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  isAssigned
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#0B132B] text-white text-xs font-black flex items-center justify-center shrink-0 uppercase">
                  {washer.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0B132B] truncate">{washer.name}</div>
                  {isAssigned && (
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Assigned to this society
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleToggle(washer)}
                  disabled={!!opState}
                  title={isAssigned ? 'Remove from society' : 'Assign to society'}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-50 cursor-pointer ${
                    isAssigned
                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-600'
                      : 'bg-[#0B132B] hover:bg-slate-700 text-white'
                  }`}
                >
                  {opState ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isAssigned ? (
                    <UserX className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B132B] hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminSocietiesPage() {
  const [societies, setSocieties] = useState<FirestoreSociety[]>([]);
  const [allWashers, setAllWashers] = useState<DirectoryWasher[]>([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingWashers, setLoadingWashers] = useState(true);

  const [manageWashersSociety, setManageWashersSociety] = useState<FirestoreSociety | null>(null);
  const [editingSociety, setEditingSociety] = useState<FirestoreSociety | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const loadSocieties = useCallback(async () => {
    setLoadingSocieties(true);
    const data = await fetchAllSocieties();
    setSocieties(data);
    setLoadingSocieties(false);
  }, []);

  const loadWashers = useCallback(async () => {
    setLoadingWashers(true);
    const data = await fetchAllDirectoryWashers();
    setAllWashers(data);
    setLoadingWashers(false);
  }, []);

  useEffect(() => {
    loadSocieties();
    loadWashers();
  }, [loadSocieties, loadWashers]);

  async function handleToggleStatus(society: FirestoreSociety) {
    setTogglingStatus(society.societyId);
    const newStatus = society.status === 'active' ? 'inactive' : 'active';
    const result = await updateSociety(society.societyId, { status: newStatus });
    if (result.success) {
      setSocieties((prev) =>
        prev.map((s) => (s.societyId === society.societyId ? { ...s, status: newStatus } : s))
      );
    }
    setTogglingStatus(null);
  }

  /** Count of washers assigned to a specific societyId */
  function getWasherCount(societyId: string): number {
    return allWashers.filter((w) => w.societies.includes(societyId)).length;
  }

  const activeSocieties = societies.filter((s) => s.status === 'active').length;
  const totalAssignedWashers = allWashers.filter((w) => w.societies.length > 0).length;

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Firestore-Driven Society Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight mt-0.5">
              Society Operations
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { loadSocieties(); loadWashers(); }}
              disabled={loadingSocieties}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSocieties ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Societies', value: societies.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Societies', value: activeSocieties, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Washers', value: allWashers.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Assigned Washers', value: totalAssignedWashers, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black text-[#0B132B]">
                {loadingSocieties || loadingWashers ? '—' : stat.value}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Societies List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0B132B]">All Societies</h2>
            {!loadingSocieties && (
              <span className="text-xs text-slate-400 font-mono">{societies.length} record(s)</span>
            )}
          </div>

          {/* Loading */}
          {loadingSocieties && (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading societies from Firestore…</span>
            </div>
          )}

          {/* Empty State */}
          {!loadingSocieties && societies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-[#0B132B] mb-1">No societies active yet.</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Societies appear here dynamically as residents and washers choose common residential complexes across districts.
              </p>
            </div>
          )}

          {/* Society Cards */}
          {!loadingSocieties && societies.length > 0 && (
            <div className="divide-y divide-slate-100">
              {societies.map((society) => {
                const washerCount = getWasherCount(society.societyId);
                const isActive = society.status === 'active';
                const isTogglingThis = togglingStatus === society.societyId;

                return (
                  <div key={society.societyId} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Left: Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="font-extrabold text-sm text-[#0B132B] truncate">
                              {society.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {society.district ? `${society.district}, ` : ''}{society.city}, {society.state}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 font-medium">
                              <Users className="w-3 h-3" />
                              {loadingWashers ? '…' : washerCount} washer{washerCount !== 1 ? 's' : ''} assigned
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                        {/* Edit Society */}
                        <button
                          onClick={() => setEditingSociety(society)}
                          title="Edit society"
                          className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => handleToggleStatus(society)}
                          disabled={isTogglingThis}
                          title={isActive ? 'Deactivate society' : 'Activate society'}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer ${
                            isActive
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {isTogglingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        {/* Manage Washers */}
                        <button
                          onClick={() => setManageWashersSociety(society)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#0B132B] text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Manage Washers
                        </button>
                      </div>
                    </div>

                    {/* Assigned washer chips */}
                    {!loadingWashers && washerCount > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pl-13">
                        {allWashers
                          .filter((w) => w.societies.includes(society.societyId))
                          .map((w) => (
                            <span
                              key={w.id}
                              className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {w.name}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>



      {manageWashersSociety && (
        <ManageWashersModal
          society={manageWashersSociety}
          allWashers={allWashers}
          onClose={() => setManageWashersSociety(null)}
          onUpdated={() => {
            // Refresh washer list to update assignment counts
            loadWashers();
          }}
        />
      )}

      {editingSociety && (
        <EditSocietyModal
          society={editingSociety}
          onClose={() => setEditingSociety(null)}
          onUpdated={(updated) => {
            setSocieties((prev) =>
              prev.map((s) => (s.societyId === updated.societyId ? updated : s))
            );
            setEditingSociety(null);
          }}
        />
      )}
    </div>
  );
}
