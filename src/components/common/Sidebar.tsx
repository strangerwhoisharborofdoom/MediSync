import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Pill,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  FileBarChart,
  RefreshCw,
  Settings,
  ShieldCheck,
  LogOut,
  Activity,
  Heart,
  Stethoscope,
  Building2,
  User,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { activeRole, currentUser, t, alerts, pharmacyAlerts, messages, logout } = useApp();

  const unreadAlerts =
    activeRole === 'pharmacy'
      ? pharmacyAlerts.filter((a) => !a.read).length
      : alerts.filter((a) => !a.acknowledged).length;
  const unreadMessages = messages.filter((m) => !m.isRead && m.receiverRole === activeRole).length;

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'medications', label: t.medications, icon: Pill },
    { id: 'prescriptions', label: t.prescriptions, icon: FileText },
    ...(activeRole !== 'pharmacy'
      ? [{ id: 'appointments', label: t.appointments, icon: Calendar }]
      : []),
    { id: 'messages', label: t.messages, icon: MessageSquare, badge: unreadMessages },
    {
      id: 'alerts',
      label: activeRole === 'pharmacy' ? (t.pharmacyAlerts || 'Pharmacy Alerts') : t.alerts,
      icon: Bell,
      badge: unreadAlerts,
      badgeColor: 'bg-rose-500',
    },
    { id: 'reports', label: t.reports, icon: FileBarChart },
    { id: 'refills', label: t.refills, icon: RefreshCw },
    { id: 'audit', label: t.auditLog, icon: ShieldCheck },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const roleMeta = {
    patient: {
      badge: t.patientPortal || 'PATIENT PORTAL',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: User,
    },
    caregiver: {
      badge: t.caregiverPortal || 'CAREGIVER PORTAL',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: Heart,
    },
    doctor: {
      badge: t.doctorPortal || 'CLINICAL DOCTOR',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Stethoscope,
    },
    pharmacy: {
      badge: t.pharmacyPortal || 'PHARMACY DISPATCH',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Building2,
    },
  };

  const currentRoleMeta = roleMeta[activeRole] || roleMeta.patient;
  const RoleIcon = currentRoleMeta.icon;

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="medisync-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto w-64 sm:w-72 shrink-0 h-full bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black text-xl tracking-wider shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl text-white tracking-tight">
                  MediSync
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">Care Journey Ecosystem</p>
            </div>
          </div>

          {/* Current Role Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span
              className={`text-[10px] font-bold px-2 py-0.8 rounded-md uppercase tracking-wider flex items-center gap-1.5 ${currentRoleMeta.badgeColor}`}
            >
              <RoleIcon className="w-3 h-3 shrink-0" />
              <span className="truncate">{currentRoleMeta.badge}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">
              {currentUser.identifier}
            </span>
          </div>
        </div>

        {/* Navigation Links - Scrollable Flex Center */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-500 text-white font-semibold shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white shrink-0 ml-1.5 ${
                      item.badgeColor || 'bg-teal-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile & Actions */}
        <div className="shrink-0 p-3.5 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/70 mb-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-teal-400/30"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser.title}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5 text-teal-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synced State Active</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors p-1"
              title="Logout to landing page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
