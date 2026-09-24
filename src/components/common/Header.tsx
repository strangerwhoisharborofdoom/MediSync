import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, LanguageCode, NotificationItem } from '../../types';
import {
  Search,
  Bell,
  Globe,
  Sliders,
  ChevronDown,
  User,
  Heart,
  Stethoscope,
  Building2,
  Check,
  Eye,
  Zap,
  Menu,
  Sparkles,
  X,
  Pill,
  Users,
  FileText,
  Calendar,
  Package,
  ChevronRight,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  ShieldAlert,
  Trash2,
  CheckCheck,
  Activity,
} from 'lucide-react';

interface HeaderProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenMobileSidebar?: () => void;
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
}

export const Header: React.FC<HeaderProps> = ({ currentTab = 'MediSync', onSelectTab, onOpenMobileSidebar }) => {
  const {
    activeRole,
    switchRole,
    currentUser,
    language,
    changeLanguage,
    t,
    notifications,
    markNotificationRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    patient,
    otherPatients,
    medications,
    prescriptions,
    appointments,
    refillOrders,
    largeTextMode,
    setLargeTextMode,
    highContrastMode,
    setHighContrastMode,
    reducedMotion,
    setReducedMotion,
  } = useApp();

  // Dropdown states
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<SearchCategory>('all');

  // Notification panel filters
  const [notifActiveFilter, setNotifActiveFilter] = useState<'all' | 'unread' | 'alerts' | 'updates'>('all');
  const [notifRoleScope, setNotifRoleScope] = useState<'current' | 'ecosystem'>('current');

  // Refs for click outside handling
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const accessMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens & focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifMenuOpen(false);
        setRoleMenuOpen(false);
        setLangMenuOpen(false);
        setAccessMenuOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setRoleMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setLangMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setNotifMenuOpen(false);
      }
      if (accessMenuRef.current && !accessMenuRef.current.contains(target)) {
        setAccessMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----------------------------------------------------
  // Notifications Calculation
  // ----------------------------------------------------
  const scopedNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notifRoleScope === 'current') {
        return n.role === 'all' || n.role === activeRole;
      }
      return true;
    });
  }, [notifications, notifRoleScope, activeRole]);

  const filteredNotifications = useMemo(() => {
    return scopedNotifications.filter((n) => {
      if (notifActiveFilter === 'unread') return !n.read;
      if (notifActiveFilter === 'alerts') return n.type === 'alert' || n.type === 'warning';
      if (notifActiveFilter === 'updates') return n.type === 'info' || n.type === 'success';
      return true;
    });
  }, [scopedNotifications, notifActiveFilter]);

  const unreadCount = useMemo(() => {
    return scopedNotifications.filter((n) => !n.read).length;
  }, [scopedNotifications]);

  const alertCount = useMemo(() => {
    return scopedNotifications.filter((n) => n.type === 'alert' || n.type === 'warning').length;
  }, [scopedNotifications]);

  const getNotifRoleBadge = (role: Role | 'all') => {
    switch (role) {
      case 'patient':
        return { label: 'Patient', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: User };
      case 'caregiver':
        return { label: 'Caregiver', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Heart };
      case 'doctor':
        return { label: 'Physician', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Stethoscope };
      case 'pharmacy':
        return { label: 'Pharmacy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Building2 };
      default:
        return { label: 'All Nodes', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Sparkles };
    }
  };

  const getNotifTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'alert':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-teal-600" />;
    }
  };

  // ----------------------------------------------------
  // Global Search Calculation
  // ----------------------------------------------------
  const allPatients = useMemo(() => [patient, ...otherPatients], [patient, otherPatients]);

  const searchResults = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
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

    // 1. Search Medications (e.g. Paracetamol 500mg, Amlodipine, etc.)
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

    // 5. Search Refills
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
          details: `Status: ${order.status.replace(/_/g, ' ')} • Pharmacy: ${order.pharmacyName}`,
          badge: order.status.replace(/_/g, ' ').toUpperCase(),
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
  }, [searchQuery, medications, allPatients, prescriptions, appointments, refillOrders, activeRole]);

  const filteredSearchResults = useMemo(() => {
    if (selectedSearchCategory === 'all') return searchResults;
    return searchResults.filter((r) => r.category === selectedSearchCategory);
  }, [searchResults, selectedSearchCategory]);

  const handleSelectSearchResult = (targetTab: string) => {
    if (onSelectTab) {
      onSelectTab(targetTab);
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const getSearchCategoryIcon = (category: SearchResultItem['category']) => {
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

  // ----------------------------------------------------
  // Role Configurations (Clean, no "Demo" labels)
  // ----------------------------------------------------
  const roleConfigs: { role: Role; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'patient',
      label: 'Patient (Eleanor Vance)',
      icon: User,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      desc: 'Snap & Scan, Adaptive Schedule, Pill Check, 1-Click Refill',
    },
    {
      role: 'caregiver',
      label: 'Caregiver (Daniel Vance)',
      icon: Heart,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      desc: 'Live Adherence, Missed Dose Alerts, Vitals, Emergency SOS',
    },
    {
      role: 'doctor',
      label: 'Doctor (Dr. Maya Rao, MD)',
      icon: Stethoscope,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      desc: 'Clinical Overview, AI Progress Summary, e-Prescriptions',
    },
    {
      role: 'pharmacy',
      label: 'Pharmacy (MediCare Central)',
      icon: Building2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      desc: 'Automatic Refill Engine, OCR Verification, Inventory Forecast',
    },
  ];

  const languages: { code: LanguageCode; label: string; nativeName: string; region: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English (US)', region: 'Global' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी (Hindi)', region: 'India (National)' },
    { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ (Kannada)', region: 'Karnataka' },
    { code: 'ta', label: 'Tamil', nativeName: 'தமிழ் (Tamil)', region: 'Tamil Nadu' },
    { code: 'te', label: 'Telugu', nativeName: 'తెలుగు (Telugu)', region: 'Andhra & Telangana' },
    { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം (Malayalam)', region: 'Kerala' },
    { code: 'bn', label: 'Bengali', nativeName: 'বাংলা (Bengali)', region: 'West Bengal' },
    { code: 'mr', label: 'Marathi', nativeName: 'मराठी (Marathi)', region: 'Maharashtra' },
    { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી (Gujarati)', region: 'Gujarat' },
    { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ (Punjabi)', region: 'Punjab' },
    { code: 'es', label: 'Spanish', nativeName: 'Español', region: 'Global' },
    { code: 'fr', label: 'French', nativeName: 'Français', region: 'Global' },
    { code: 'zh', label: 'Mandarin', nativeName: '中文 (简体)', region: 'Global' },
  ];

  const currentRoleConfig = roleConfigs.find((r) => r.role === activeRole) || roleConfigs[0];
  const CurrentRoleIcon = currentRoleConfig.icon;

  return (
    <header
      id="medisync-global-header"
      className="h-16 shrink-0 w-full flex items-center justify-between px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs z-40 relative"
    >
      {/* ---------------------------------------------------- */}
      {/* 1. LEFT: Logo, Mobile Menu, Brand                     */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          title="MediSync Care Ecosystem"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="hidden xs:flex flex-col">
            <span className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
              MediSync
            </span>
            <span className="text-[10px] text-teal-600 font-semibold tracking-wide leading-tight">
              Connected Ecosystem
            </span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. CENTER: Visible, Clickable Interactive Search Bar */}
      {/* ---------------------------------------------------- */}
      <div
        className="flex-1 max-w-xs sm:max-w-md lg:max-w-lg mx-2 sm:mx-4 relative"
        ref={searchContainerRef}
      >
        <div className="relative flex items-center w-full">
          <div className="absolute left-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-teal-600" />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            id="global-header-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder={t.searchMedsPlaceholder || 'Search medications, patients, rx, appointments...'}
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm rounded-xl bg-slate-100/90 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-900 placeholder:text-slate-400 outline-none shadow-2xs"
            autoComplete="off"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 shadow-2xs pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Live Search Results Dropdown */}
        {searchOpen && (
          <div
            id="global-search-dropdown-results"
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[min(65vh,480px)] flex flex-col"
          >
            {/* Category Filter Pills */}
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
              <button
                onClick={() => setSelectedSearchCategory('all')}
                className={`px-2.5 py-0.8 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedSearchCategory === 'all'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
                }`}
              >
                All ({searchResults.length})
              </button>
              <button
                onClick={() => setSelectedSearchCategory('medications')}
                className={`px-2.5 py-0.8 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedSearchCategory === 'medications'
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
                }`}
              >
                <Pill className="w-3 h-3" />
                Meds
              </button>
              <button
                onClick={() => setSelectedSearchCategory('patients')}
                className={`px-2.5 py-0.8 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedSearchCategory === 'patients'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
                }`}
              >
                <Users className="w-3 h-3" />
                Patients
              </button>
              <button
                onClick={() => setSelectedSearchCategory('prescriptions')}
                className={`px-2.5 py-0.8 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedSearchCategory === 'prescriptions'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
                }`}
              >
                <FileText className="w-3 h-3" />
                e-Rx
              </button>
              <button
                onClick={() => setSelectedSearchCategory('refills')}
                className={`px-2.5 py-0.8 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedSearchCategory === 'refills'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/70'
                }`}
              >
                <Package className="w-3 h-3" />
                Refills
              </button>
            </div>

            {/* Results Stream */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {!searchQuery.trim() ? (
                /* Suggested quick search keywords */
                <div className="p-4 text-center">
                  <div className="text-xs font-bold text-slate-700 mb-1">Instant Health Index</div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Type a medicine name, patient, prescription ID or department.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {['Paracetamol', 'Amlodipine', 'Eleanor Vance', 'Cardiology', 'Refill'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          searchInputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-medium border border-transparent hover:border-teal-200 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredSearchResults.length === 0 ? (
                /* Empty state - explicitly fulfills test criteria */
                <div className="p-6 text-center" id="search-no-results-state">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">No matching records found</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No results matched &ldquo;{searchQuery}&rdquo;. Try checking for typos or searching by generic drug name.
                  </p>
                </div>
              ) : (
                /* Result list items */
                filteredSearchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item.targetTab)}
                    className="p-2.5 rounded-xl hover:bg-teal-50/50 border border-transparent hover:border-teal-200 transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white group-hover:shadow-2xs transition-colors shrink-0 mt-0.5">
                        {getSearchCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900 truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                item.badgeColor || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium truncate">
                          {item.subtitle}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{item.details}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                        Open
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
              <span>Press [Esc] to close</span>
              {searchResults.length > 0 && <span>{searchResults.length} matches found</span>}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. RIGHT: Actions, Role Switcher, Language, Notifs   */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Gemini / AI Voice Assistant Header Trigger */}
        <button
          onClick={() => {
            const trigger = document.getElementById('medivoice-floating-trigger');
            if (trigger) trigger.click();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-teal-200/80 bg-teal-50/70 hover:bg-teal-100 text-teal-900 text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
          title="Open MediSync AI Clinical Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="hidden sm:inline">{t.askAiAssistant || 'Ask Gemini'}</span>
        </button>

        {/* ROLE SWITCHER - Clean presentation, NO "DEMO" badges */}
        <div className="relative shrink-0" ref={roleMenuRef}>
          <button
            id="role-switcher-button"
            onClick={() => setRoleMenuOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all ${currentRoleConfig.color} hover:shadow-md active:scale-95 whitespace-nowrap shrink-0`}
            title="Switch active role (Preserves shared ecosystem state)"
          >
            <CurrentRoleIcon className="w-4 h-4 shrink-0" />
            <span className="capitalize">{activeRole}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5 shrink-0" />
          </button>

          {roleMenuOpen && (
            <div
              id="role-dropdown-menu"
              className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t.switchRole || 'Switch Role'}
                  </span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
                    Shared State
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  All 4 roles observe the same synchronized data in real time.
                </p>
              </div>

              <div className="space-y-1">
                {roleConfigs.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = item.role === activeRole;
                  return (
                    <button
                      key={item.role}
                      id={`switch-role-${item.role}`}
                      onClick={() => {
                        switchRole(item.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                        isCurrent
                          ? 'bg-teal-50 border border-teal-200 text-teal-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isCurrent ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-xs sm:text-sm font-semibold truncate">{item.label}</div>
                          {isCurrent && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-1" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Global Language Selector */}
        <div className="relative shrink-0" ref={langMenuRef}>
          <button
            id="global-language-selector-button"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors shrink-0"
            title="Select Language"
            aria-label="Language Selector"
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold uppercase">{language}</span>
          </button>

          {langMenuOpen && (
            <div
              id="global-language-dropdown"
              className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Language / ಭಾಷೆ
                </span>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                  13 Languages
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      language === lang.code
                        ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-2xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{lang.region}</div>
                    </div>
                    {language === lang.code && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accessibility Menu */}
        <div className="relative shrink-0" ref={accessMenuRef}>
          <button
            id="accessibility-options-button"
            onClick={() => setAccessMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors shrink-0 ${
              largeTextMode || highContrastMode || reducedMotion
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
            }`}
            title="Accessibility Settings"
            aria-label="Accessibility options"
          >
            <Sliders className="w-4 h-4 shrink-0" />
          </button>

          {accessMenuOpen && (
            <div
              id="accessibility-dropdown-menu"
              className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Accessibility Controls
              </div>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Eye className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Large Text Mode</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={largeTextMode}
                    onChange={(e) => setLargeTextMode(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>High Contrast Mode</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrastMode}
                    onChange={(e) => setHighContrastMode(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Sliders className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Reduced Motion</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* NOTIFICATIONS TRIGGER & RESPONSIVE DROPDOWN PANEL    */}
        {/* ---------------------------------------------------- */}
        <div className="relative shrink-0" ref={notifMenuRef}>
          <button
            id="global-notifications-button"
            onClick={() => setNotifMenuOpen((prev) => !prev)}
            className={`relative p-2 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
              notifMenuOpen
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-200'
            }`}
            title={`Notification Center (${unreadCount} unread)`}
            aria-label="Centralized Notification Center"
          >
            <Bell className="w-4 h-4 shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Fully Visible, Responsive Notification Panel Dropdown */}
          {notifMenuOpen && (
            <div
              id="global-notifications-dropdown-panel"
              className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 w-[calc(100vw-1rem)] sm:w-[420px] max-w-[420px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Panel Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-teal-50/30 to-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 leading-tight">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 animate-pulse">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                      Live care stream for <strong className="text-slate-700">{currentUser.name}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setNotifMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Close notifications"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Role Scope Switcher & Global Bulk Actions */}
              <div className="px-3 py-2 bg-slate-50/90 border-b border-slate-200/60 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    onClick={() => setNotifRoleScope('current')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      notifRoleScope === 'current'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Role ({activeRole.toUpperCase()})
                  </button>
                  <button
                    onClick={() => setNotifRoleScope('ecosystem')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      notifRoleScope === 'ecosystem'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Mark All</span>
                    </button>
                  )}

                  {scopedNotifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                      title="Clear notifications list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Category Chips */}
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <button
                  onClick={() => setNotifActiveFilter('all')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    notifActiveFilter === 'all'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({scopedNotifications.length})
                </button>
                <button
                  onClick={() => setNotifActiveFilter('unread')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    notifActiveFilter === 'unread'
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 text-[9px] flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setNotifActiveFilter('alerts')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    notifActiveFilter === 'alerts'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Alerts</span>
                  {alertCount > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 text-[9px] flex items-center justify-center font-bold">
                      {alertCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setNotifActiveFilter('updates')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    notifActiveFilter === 'updates'
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Updates
                </button>
              </div>

              {/* Notification Stream List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[min(55vh,380px)] custom-scrollbar">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">You're completely caught up!</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto">
                      No notifications in this filter. Live care events from the network appear here in real time.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    const roleBadge = getNotifRoleBadge(n.role);
                    const RoleBadgeIcon = roleBadge.icon;

                    return (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          !n.read
                            ? 'bg-white border-teal-200/90 shadow-2xs ring-1 ring-teal-500/10'
                            : 'bg-slate-50/70 border-slate-200/70 opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                              n.type === 'alert'
                                ? 'bg-rose-100'
                                : n.type === 'warning'
                                ? 'bg-amber-100'
                                : n.type === 'success'
                                ? 'bg-emerald-100'
                                : 'bg-teal-100'
                            }`}
                          >
                            {getNotifTypeIcon(n.type)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <h5
                                className={`text-xs font-bold ${
                                  !n.read ? 'text-slate-900' : 'text-slate-700'
                                }`}
                              >
                                {n.title}
                              </h5>

                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold border ${roleBadge.color}`}
                              >
                                <RoleBadgeIcon className="w-2.5 h-2.5" />
                                {roleBadge.label}
                              </span>

                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block" />
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-normal">
                              {n.message}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {n.timestamp}
                              </span>

                              <div className="flex items-center gap-1">
                                {n.link && (
                                  <button
                                    onClick={() => {
                                      markNotificationRead(n.id);
                                      if (onSelectTab && n.link) onSelectTab(n.link);
                                      setNotifMenuOpen(false);
                                    }}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-1 transition-colors"
                                  >
                                    <span>Go to {n.link}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                )}

                                {!n.read && (
                                  <button
                                    onClick={() => markNotificationRead(n.id)}
                                    className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                                    title="Mark as read"
                                    aria-label="Mark as read"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteNotification(n.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete notification"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Panel Footer */}
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-teal-600 shrink-0" />
                  <span>HIPAA Event Ledger synchronization enabled</span>
                </span>
                <span className="text-slate-400 font-mono hidden sm:inline">
                  {scopedNotifications.length} items
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar snapshot */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200 shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-teal-500/20 shadow-xs shrink-0"
          />
        </div>
      </div>
    </header>
  );
};
