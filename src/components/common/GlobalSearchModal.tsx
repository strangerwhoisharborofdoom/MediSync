import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  Pill,
  Users,
  FileText,
  Calendar,
  Package,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: string) => void;
  initialQuery?: string;
}

type SearchCategory = 'all' | 'medications' | 'patients' | 'prescriptions' | 'appointments' | 'refills';

interface SearchResultItem {
  id: string;
  category: 'medications' | 'patients' | 'prescriptions' | 'appointments' | 'refills';
  title: string;
  subtitle: string;
  details: string;
  badge?: string;
  badgeColor?: string;
  targetTab: string;
  metadata?: Record<string, string | number>;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  initialQuery = '',
}) => {
  const {
    patient,
    otherPatients,
    medications,
    prescriptions,
    appointments,
    refillOrders,
    switchRole,
    activeRole,
  } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Combine patient lists
  const allPatients = useMemo(() => [patient, ...otherPatients], [patient, otherPatients]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build searchable index and execute case-insensitive partial query
  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const queryTokens = trimmed.split(/\s+/).filter(Boolean);

    const matchesTokens = (fields: (string | undefined | null | number)[]) => {
      const combined = fields
        .filter((f) => f !== undefined && f !== null)
        .join(' ')
        .toLowerCase();

      return queryTokens.every((token) => combined.includes(token));
    };

    const items: SearchResultItem[] = [];

    // 1. Search Medications
    medications.forEach((med) => {
      if (
        matchesTokens([
          med.name,
          med.genericName,
          med.dosage,
          med.frequency,
          med.timing,
          med.foodInstruction,
          med.prescribedBy,
          ...(med.warnings || []),
          med.pillDetails?.shape,
          med.pillDetails?.color,
          med.pillDetails?.imprint,
        ])
      ) {
        items.push({
          id: `search-med-${med.id}`,
          category: 'medications',
          title: `${med.name} (${med.dosage})`,
          subtitle: `${med.genericName} • ${med.frequency}`,
          details: `${med.timing} • ${med.pillsRemaining} pills remaining (${med.remainingDays}d supply)`,
          badge: `${med.remainingDays} days left`,
          badgeColor:
            med.remainingDays <= 7
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800',
          targetTab: 'medications',
        });
      }
    });

    // 2. Search Patients
    allPatients.forEach((p) => {
      if (
        matchesTokens([
          p.name,
          p.medicalId,
          p.age,
          p.gender,
          p.primaryDoctor,
          p.caregiverName,
          p.emergencyAddress,
          p.riskLevel,
          ...(p.conditions || []),
          ...(p.allergies || []),
        ])
      ) {
        items.push({
          id: `search-patient-${p.id}`,
          category: 'patients',
          title: `${p.name}, ${p.age}y (${p.gender})`,
          subtitle: `ID: ${p.medicalId} • Doctor: ${p.primaryDoctor}`,
          details: `Conditions: ${p.conditions?.join(', ') || 'None'} • Risk: ${p.riskLevel} (${p.adherenceRate}% adherence)`,
          badge: `${p.riskLevel} Risk`,
          badgeColor:
            p.riskLevel === 'High'
              ? 'bg-rose-100 text-rose-800'
              : p.riskLevel === 'Moderate'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800',
          targetTab: activeRole === 'doctor' ? 'dashboard' : 'dashboard',
          metadata: { patientId: p.id },
        });
      }
    });

    // 3. Search Prescriptions
    prescriptions.forEach((rx) => {
      if (
        matchesTokens([
          rx.id,
          rx.medicationName,
          rx.dosage,
          rx.patientName,
          rx.doctorName,
          rx.doctorLicense,
          rx.instructions,
          rx.foodInstruction,
          rx.status,
          rx.pharmacyStatus,
        ])
      ) {
        items.push({
          id: `search-rx-${rx.id}`,
          category: 'prescriptions',
          title: `Rx #${rx.id}: ${rx.medicationName} ${rx.dosage}`,
          subtitle: `Prescribed by ${rx.doctorName} for ${rx.patientName}`,
          details: `${rx.instructions} • ${rx.refillsRemaining} refills remaining`,
          badge: rx.status.toUpperCase(),
          badgeColor:
            rx.status === 'active'
              ? 'bg-teal-100 text-teal-800'
              : 'bg-slate-100 text-slate-800',
          targetTab: 'prescriptions',
        });
      }
    });

    // 4. Search Appointments
    appointments.forEach((apt) => {
      if (
        matchesTokens([
          apt.id,
          apt.department,
          apt.doctorName,
          apt.patientName,
          apt.type,
          apt.location,
          apt.dateTime,
          apt.status,
        ])
      ) {
        items.push({
          id: `search-apt-${apt.id}`,
          category: 'appointments',
          title: `${apt.department} • ${apt.type}`,
          subtitle: `${apt.doctorName} with ${apt.patientName}`,
          details: `${apt.dateTime} • Location: ${apt.location}`,
          badge: apt.type,
          badgeColor: 'bg-indigo-100 text-indigo-800',
          targetTab: 'appointments',
        });
      }
    });

    // 5. Search Refill Orders
    refillOrders.forEach((order) => {
      if (
        matchesTokens([
          order.id,
          order.medicationName,
          order.dosage,
          order.patientName,
          order.status,
          order.priority,
          order.deliveryMethod,
          order.pharmacyName,
          order.deliveryAddress,
        ])
      ) {
        items.push({
          id: `search-ord-${order.id}`,
          category: 'refills',
          title: `Refill #${order.id}: ${order.medicationName}`,
          subtitle: `Patient: ${order.patientName} • Priority: ${order.priority.toUpperCase()}`,
          details: `Status: ${order.status.replace('_', ' ')} • Pharmacy: ${order.pharmacyName}`,
          badge: order.status.replace('_', ' ').toUpperCase(),
          badgeColor:
            order.status === 'delivered'
              ? 'bg-emerald-100 text-emerald-800'
              : order.status === 'out_for_delivery'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-amber-100 text-amber-800',
          targetTab: 'refills',
        });
      }
    });

    return items;
  }, [query, medications, allPatients, prescriptions, appointments, refillOrders, activeRole]);

  // Filter results by selected category
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'all') return results;
    return results.filter((r) => r.category === selectedCategory);
  }, [results, selectedCategory]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts = {
      all: results.length,
      medications: 0,
      patients: 0,
      prescriptions: 0,
      appointments: 0,
      refills: 0,
    };
    results.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [results]);

  const handleSelectResult = (item: SearchResultItem) => {
    if (onSelectTab) {
      onSelectTab(item.targetTab);
    }
    onClose();
  };

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'medications':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'patients':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'prescriptions':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'appointments':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'refills':
        return <Package className="w-4 h-4 text-amber-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medications, patients, prescriptions, appointments..."
            className="w-full text-sm sm:text-base font-medium bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-200/60 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
          >
            Esc
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({categoryCounts.all})
          </button>
          <button
            onClick={() => setSelectedCategory('medications')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedCategory === 'medications'
                ? 'bg-teal-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-3 h-3" />
            Medications ({categoryCounts.medications})
          </button>
          <button
            onClick={() => setSelectedCategory('patients')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedCategory === 'patients'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            Patients ({categoryCounts.patients})
          </button>
          <button
            onClick={() => setSelectedCategory('prescriptions')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedCategory === 'prescriptions'
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            Prescriptions ({categoryCounts.prescriptions})
          </button>
          <button
            onClick={() => setSelectedCategory('appointments')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedCategory === 'appointments'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3 h-3" />
            Appointments ({categoryCounts.appointments})
          </button>
          <button
            onClick={() => setSelectedCategory('refills')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedCategory === 'refills'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-3 h-3" />
            Refills ({categoryCounts.refills})
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {!query.trim() ? (
            /* Suggested Queries State */
            <div className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 border border-teal-200 shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Unified Global Health Index</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Instant real-time search across medications, multi-patient cohorts, e-prescriptions, clinical appointments, and active refill orders.
              </p>

              <div className="mt-5 text-left max-w-lg mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Popular Queries:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Amlodipine',
                    'Eleanor Vance',
                    'Cardiology',
                    'High Risk',
                    'Refill #ord-8812',
                    'Atorvastatin',
                    'Dr. Maya Rao',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-medium border border-transparent hover:border-teal-200 transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            /* Empty Results */
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No matching records found</h3>
              <p className="text-xs text-slate-500 mt-1">
                No items matched "{query}". Try checking for typos or searching by medication name, patient ID, or department.
              </p>
            </div>
          ) : (
            /* Results List */
            filteredResults.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className="group p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-teal-50/40 hover:border-teal-300 transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-white group-hover:shadow-2xs transition-colors shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-900 truncate">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      {item.subtitle}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-semibold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                    View
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            {results.length > 0 ? (
              <>Found <strong className="text-slate-800">{results.length}</strong> matches across ecosystem entities</>
            ) : (
              'Query across medications, patients, prescriptions, appointments & refills'
            )}
          </span>
          <span className="hidden sm:inline text-slate-400 font-mono">
            Press [Esc] to exit
          </span>
        </div>
      </div>
    </div>
  );
};
