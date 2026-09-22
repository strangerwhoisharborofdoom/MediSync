import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, LanguageCode } from '../../types';
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
} from 'lucide-react';
import { NotificationCenterModal } from './NotificationCenterModal';
import { GlobalSearchModal } from './GlobalSearchModal';

interface HeaderProps {
  currentTab?: string;
  onOpenSearchModal?: () => void;
  onSelectTab?: (tab: string) => void;
  onOpenMobileSidebar?: () => void;
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
    clearAllNotifications,
    largeTextMode,
    setLargeTextMode,
    highContrastMode,
    setHighContrastMode,
    reducedMotion,
    setReducedMotion,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const accessMenuRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
      if (accessMenuRef.current && !accessMenuRef.current.contains(e.target as Node)) {
        setAccessMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Role-relevant notifications (current user's role + ecosystem-wide broadcasts)
  const relevantNotifications = notifications.filter(
    (n) => n.role === 'all' || n.role === activeRole
  );
  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

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

  const languages: { code: LanguageCode; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English (US)' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी (Hindi)' },
    { code: 'es', label: 'Spanish', nativeName: 'Español' },
    { code: 'fr', label: 'French', nativeName: 'Français' },
    { code: 'zh', label: 'Mandarin', nativeName: '中文 (简体)' },
  ];

  const currentRoleConfig = roleConfigs.find((r) => r.role === activeRole) || roleConfigs[0];
  const CurrentRoleIcon = currentRoleConfig.icon;

  return (
    <header
      id="medisync-global-header"
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors"
    >
      {/* Left: View title & mobile indicator */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 capitalize tracking-tight">
              {currentTab}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden md:block">
            Connected Care Ecosystem • {currentUser.name} ({currentUser.identifier})
          </p>
        </div>
      </div>

      {/* Middle/Right: Actions, Global Search, Role Switcher, Lang, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Quick Search Button (Android & compact devices) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Search medications, patients, prescriptions (Ctrl+K)"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Desktop Global Quick Search Bar */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative hidden lg:flex items-center justify-between w-52 xl:w-72 px-3 py-1.5 text-xs rounded-xl bg-slate-100/90 hover:bg-white border border-slate-200/80 hover:border-teal-400 hover:shadow-xs text-slate-400 hover:text-slate-600 transition-all text-left group"
          title="Search medications, patients, prescriptions (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
            <span className="truncate">Search meds, patients, rx...</span>
          </div>
          <kbd className="text-[10px] font-mono font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* DEMO ROLE SWITCHER (Core hackathon showcase) */}
        <div className="relative" ref={roleMenuRef}>
          <button
            id="demo-role-switcher-button"
            onClick={() => setRoleMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold shadow-xs transition-all ${currentRoleConfig.color} hover:shadow-md active:scale-95`}
            title="Switch demo role (Preserves all shared state)"
          >
            <CurrentRoleIcon className="w-4 h-4 shrink-0" />
            <span className="capitalize">{activeRole}</span>
            <span className="hidden md:inline text-[10px] px-1.5 py-0.2 rounded-md bg-white/60 font-mono">
              DEMO
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>

          {roleMenuOpen && (
            <div
              id="demo-role-dropdown-menu"
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t.switchRole}
                  </span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
                    Shared State
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  All 4 roles observe the same live data in real time.
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
                          <div className="text-xs sm:text-sm font-semibold">{item.label}</div>
                          {isCurrent && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
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
        <div className="relative" ref={langMenuRef}>
          <button
            id="global-language-selector-button"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            title="Select Language"
            aria-label="Language Selector"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">{language}</span>
          </button>

          {langMenuOpen && (
            <div
              id="global-language-dropdown"
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Language
              </div>
              <div className="space-y-0.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      language === lang.code
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accessibility Menu */}
        <div className="relative" ref={accessMenuRef}>
          <button
            id="accessibility-options-button"
            onClick={() => setAccessMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors ${
              largeTextMode || highContrastMode || reducedMotion
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
            }`}
            title="Accessibility Settings (High contrast, Large text, Reduced motion)"
            aria-label="Accessibility options"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {accessMenuOpen && (
            <div
              id="accessibility-dropdown-menu"
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Accessibility Controls
              </div>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Eye className="w-4 h-4 text-teal-600" />
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
                    <Zap className="w-4 h-4 text-indigo-600" />
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
                    <Sliders className="w-4 h-4 text-sky-600" />
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

        {/* Centralized Notification Center Button */}
        <div className="relative">
          <button
            id="global-notifications-button"
            onClick={() => setIsNotifCenterOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={`Centralized Notification Center (${unreadCount} unread for ${activeRole})`}
            aria-label="Centralized Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User avatar snapshot */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-teal-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* Centralized Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifCenterOpen}
        onClose={() => setIsNotifCenterOpen(false)}
        onSelectTab={onSelectTab}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={onSelectTab}
      />
    </header>
  );
};
