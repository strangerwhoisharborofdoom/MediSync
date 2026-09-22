import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, NotificationItem } from '../../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Check,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Filter,
  User,
  Heart,
  Stethoscope,
  Building2,
  Sparkles,
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const {
    activeRole,
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'unread' | 'alerts' | 'updates'>('all');
  const [roleScope, setRoleScope] = useState<'current' | 'ecosystem'>('current');

  if (!isOpen) return null;

  // Filter based on scope: current role vs full ecosystem
  const scopedNotifications = notifications.filter((n) => {
    if (roleScope === 'current') {
      return n.role === 'all' || n.role === activeRole;
    }
    return true;
  });

  // Filter based on active tab
  const filteredNotifications = scopedNotifications.filter((n) => {
    if (activeTabFilter === 'unread') return !n.read;
    if (activeTabFilter === 'alerts') return n.type === 'alert' || n.type === 'warning';
    if (activeTabFilter === 'updates') return n.type === 'info' || n.type === 'success';
    return true;
  });

  const unreadCount = scopedNotifications.filter((n) => !n.read).length;
  const alertCount = scopedNotifications.filter((n) => n.type === 'alert' || n.type === 'warning').length;

  const getRoleBadge = (role: Role | 'all') => {
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
        return { label: 'All Care Nodes', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Sparkles };
    }
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
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

  const handleNotificationClick = (n: NotificationItem) => {
    markNotificationRead(n.id);
    if (n.link && onSelectTab) {
      onSelectTab(n.link);
      onClose();
    }
  };

  const handleCreateSampleAlert = () => {
    addNotification({
      role: activeRole,
      title: `${currentUser.title} Live Care Ping`,
      message: `System audit verified active bi-directional syncing for ${currentUser.name}.`,
      type: 'info',
      link: 'audit',
    });
  };

  return (
    <div
      id="centralized-notification-center-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-teal-50/30 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                  Notification Center
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700 animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Connected care broadcast stream for{' '}
                <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.title})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Notification Center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Scope Selector & Global Bulk Actions */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setRoleScope('current')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                roleScope === 'current'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              My Role ({activeRole.toUpperCase()})
            </button>
            <button
              onClick={() => setRoleScope('ecosystem')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                roleScope === 'ecosystem'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Full Ecosystem ({notifications.length})
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}

            {scopedNotifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors"
                title="Clear notifications for current view"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear List</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({scopedNotifications.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('unread')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTabFilter === 'unread'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTabFilter('alerts')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTabFilter === 'alerts'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Alerts & Warnings</span>
            {alertCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-bold">
                {alertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTabFilter('updates')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTabFilter === 'updates'
                ? 'bg-teal-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Updates & Success
          </button>
        </div>

        {/* Notification Stream List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">You're completely caught up!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active notifications in this category. Live system alerts from the shared care network will appear here in real time.
              </p>
              <button
                onClick={handleCreateSampleAlert}
                className="mt-4 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Test Live Ping
              </button>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const roleBadge = getRoleBadge(n.role);
              const RoleBadgeIcon = roleBadge.icon;

              return (
                <div
                  key={n.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    !n.read
                      ? 'bg-white border-teal-200/90 shadow-sm ring-1 ring-teal-500/10 hover:border-teal-300'
                      : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    {/* Icon & Title block */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          n.type === 'alert'
                            ? 'bg-rose-100'
                            : n.type === 'warning'
                            ? 'bg-amber-100'
                            : n.type === 'success'
                            ? 'bg-emerald-100'
                            : 'bg-teal-100'
                        }`}
                      >
                        {getTypeIcon(n.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              !n.read ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {n.title}
                          </h4>

                          {/* Role tag */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleBadge.color}`}
                          >
                            <RoleBadgeIcon className="w-2.5 h-2.5" />
                            {roleBadge.label}
                          </span>

                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed break-words">
                          {n.message}
                        </p>

                        {/* Action buttons & timestamp */}
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {n.timestamp}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {n.link && (
                              <button
                                onClick={() => handleNotificationClick(n)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-1 transition-colors"
                              >
                                <span>Go to {n.link}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}

                            {!n.read ? (
                              <button
                                onClick={() => markNotificationRead(n.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                                title="Mark as read"
                                aria-label="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete notification"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
            <span>HIPAA Event Ledger synchronization enabled</span>
          </span>
          <span className="text-slate-400 hidden sm:inline font-mono">
            {scopedNotifications.length} items logged
          </span>
        </div>
      </div>
    </div>
  );
};
