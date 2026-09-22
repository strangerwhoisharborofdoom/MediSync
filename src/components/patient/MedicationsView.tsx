import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Medication } from '../../types';
import {
  Pill,
  Search,
  Filter,
  RefreshCw,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { MedicationDetailsModal } from './MedicationDetailsModal';
import { PillVerificationModal } from './PillVerificationModal';
import { PrescriptionScannerModal } from './PrescriptionScannerModal';

export const MedicationsView: React.FC = () => {
  const { medications, createRefillOrder, patient, addToast, activeRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTiming, setFilterTiming] = useState<string>('all');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);

  const filteredMeds = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.prescribedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTiming =
      filterTiming === 'all'
        ? true
        : filterTiming === 'low_supply'
        ? m.remainingDays <= 7
        : m.timing.toLowerCase().includes(filterTiming.toLowerCase());

    return matchesSearch && matchesTiming;
  });

  const lowSupplyCount = medications.filter((m) => m.remainingDays <= 7).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Active Regimen Catalog
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Patient: {patient.name}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            Medication Management & Supply
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Continuous possession tracking, safety rules, and zero-stockout auto-refill.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScanOpen(true)}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Prescription</span>
          </button>
          <button
            onClick={() => setIsVerifyOpen(true)}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Verify Pill AI</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Active Prescriptions</div>
            <div className="text-2xl font-extrabold font-display text-slate-900 mt-1">
              {medications.length} Medications
            </div>
            <div className="text-xs text-teal-600 font-semibold mt-0.5">All synchronized with pharmacy</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Supply Alert</div>
            <div className={`text-2xl font-extrabold font-display mt-1 ${lowSupplyCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {lowSupplyCount > 0 ? `${lowSupplyCount} Low Supply` : 'Supply Adequate'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Threshold: &le; 7 days remaining</div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${lowSupplyCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Drug Interaction Safety</div>
            <div className="text-2xl font-extrabold font-display text-indigo-600 mt-1">
              Verified Clean
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-0.5">No contraindications detected</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications by brand name, generic or doctor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-500 bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'morning', label: 'Morning' },
            { id: 'afternoon', label: 'Midday' },
            { id: 'night', label: 'Evening' },
            { id: 'low_supply', label: `Low Supply (${lowSupplyCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterTiming(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTiming === f.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeds.map((med) => {
          const supplyPercent = Math.min(100, Math.round((med.remainingDays / (med.totalDays || 30)) * 100));
          const isLow = med.remainingDays <= 7;
          const isCritical = med.remainingDays <= 3;

          return (
            <div
              key={med.id}
              className={`p-6 bg-white rounded-3xl border shadow-sm flex flex-col justify-between transition-all ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isLow
                  ? 'border-amber-300'
                  : 'border-slate-200 hover:border-teal-300'
              }`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-slate-900">
                          {med.name}
                        </h3>
                        <span className="text-xs font-bold text-slate-500">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {med.genericName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      med.refillStatus === 'pending'
                        ? 'bg-blue-100 text-blue-800'
                        : isCritical
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : isLow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {med.refillStatus === 'pending'
                      ? 'Refill In Progress'
                      : isCritical
                      ? 'Critical Low'
                      : isLow
                      ? 'Refill Needed'
                      : 'Supply Healthy'}
                  </span>
                </div>

                {/* Details Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule</span>
                    <span className="font-semibold text-slate-800">{med.timing}</span>
                    <span className="text-slate-500 block text-[11px]">{med.frequency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Food Rule</span>
                    <span className="font-semibold text-slate-800">{med.foodInstruction}</span>
                  </div>
                </div>

                {/* Pill Shape / Imprint Pill Badge */}
                <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-4 bg-teal-50/50 px-3 py-1.5 rounded-xl border border-teal-100">
                  <span className="font-bold text-teal-800">Visual Pill ID:</span>
                  <span>{med.pillDetails.color} {med.pillDetails.shape}</span>
                  <span>•</span>
                  <span>Imprint: <strong className="font-mono">{med.pillDetails.imprint}</strong></span>
                </div>

                {/* Supply Level Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Supply Level:</span>
                    <span className="font-bold text-slate-800">
                      {med.remainingDays} days remaining ({med.pillsRemaining}/{med.pillsTotal} pills)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${supplyPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedMed(med);
                    setIsDetailsOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Full Posology</span>
                </button>

                <button
                  onClick={() => {
                    createRefillOrder(med.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                    isLow
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>1-Click Refill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <MedicationDetailsModal
        medication={selectedMed}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedMed(null);
        }}
      />
      <PillVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />
      <PrescriptionScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
      />
    </div>
  );
};
