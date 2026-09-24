import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PharmacyAlert, PharmacyAlertType } from '../../types';
import {
  AlertTriangle,
  Package,
  FileCheck,
  CheckCircle2,
  Search,
  Check,
  Trash2,
  RefreshCw,
  Bell,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const PharmacyAlertsView: React.FC = () => {
  const {
    pharmacyAlerts,
    markPharmacyAlertRead,
    deletePharmacyAlert,
    reorderInventoryStock,
    updateOrderStatus,
    refillOrders,
    inventory,
    addToast,
    t,
  } = useApp();

  const [activeTypeFilter, setActiveTypeFilter] = useState<'ALL' | PharmacyAlertType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = pharmacyAlerts.filter((item) => {
    const matchesType = activeTypeFilter === 'ALL' || item.type === activeTypeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const unreadCount = pharmacyAlerts.filter((a) => !a.read).length;
  const stockCount = pharmacyAlerts.filter((a) => a.type === 'STOCK').length;
  const orderCount = pharmacyAlerts.filter((a) => a.type === 'ORDER').length;
  const prescriptionCount = pharmacyAlerts.filter((a) => a.type === 'PRESCRIPTION').length;

  const handleAction = (alert: PharmacyAlert) => {
    markPharmacyAlertRead(alert.id);

    if (alert.type === 'STOCK') {
      if (alert.relatedMedicineId) {
        reorderInventoryStock(alert.relatedMedicineId, 100);
      } else {
        addToast(`Wholesale inventory replenishment order initiated for alert: ${alert.title}`, 'success');
      }
    } else if (alert.type === 'ORDER') {
      if (alert.relatedOrderId) {
        const order = refillOrders.find((o) => o.id === alert.relatedOrderId);
        if (order) {
          const nextStatus = order.status === 'pending_preparation' ? 'preparing' : 'ready';
          updateOrderStatus(order.id, nextStatus);
          addToast(`Order #${order.id} updated to ${nextStatus.replace('_', ' ').toUpperCase()}`, 'success');
        } else {
          addToast(`Order #${alert.relatedOrderId} marked for processing.`, 'success');
        }
      } else {
        addToast(`Refill order queue updated.`, 'success');
      }
    } else if (alert.type === 'PRESCRIPTION') {
      addToast(`Prescription clinical verification signed off by Pharmacist.`, 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              MediCare Central Pharmacy Ops
            </span>
            <span className="text-xs text-slate-400">Marcus Chen, PharmD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-400" />
            <span>{t.pharmacyAlerts || 'Pharmacy Operations Alerts'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time stock refill alerts, pending patient refill orders, and electronic prescription verifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs font-mono text-emerald-200 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span>{unreadCount} Unread Alerts ({pharmacyAlerts.length} Total)</span>
          </div>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTypeFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTypeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Pharmacy Alerts ({pharmacyAlerts.length})
          </button>

          <button
            onClick={() => setActiveTypeFilter('STOCK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTypeFilter === 'STOCK'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stock Refill Alerts ({stockCount})</span>
          </button>

          <button
            onClick={() => setActiveTypeFilter('ORDER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTypeFilter === 'ORDER'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Order Alerts ({orderCount})</span>
          </button>

          <button
            onClick={() => setActiveTypeFilter('PRESCRIPTION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTypeFilter === 'PRESCRIPTION'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Prescription Alerts ({prescriptionCount})</span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pharmacy alerts..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Alert Stream */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-slate-800">
              No Alerts in this Category
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All pharmacy operations, stock levels, orders, and prescription verifications are currently up to date.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isRead = alert.read;
            const priorityBadge =
              alert.priority === 'critical'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : alert.priority === 'high'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : alert.priority === 'medium'
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'bg-slate-100 text-slate-700 border-slate-300';

            const typeColor =
              alert.type === 'STOCK'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : alert.type === 'ORDER'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-purple-50 border-purple-200 text-purple-700';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isRead
                    ? 'bg-white border-slate-200/90 shadow-2xs opacity-85'
                    : 'bg-white border-slate-300 shadow-xs hover:border-emerald-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 border ${typeColor}`}>
                      {alert.type === 'STOCK' ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      ) : alert.type === 'ORDER' ? (
                        <Package className="w-5 h-5 text-amber-600" />
                      ) : (
                        <FileCheck className="w-5 h-5 text-purple-600" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityBadge}`}
                        >
                          {alert.priority} priority
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {alert.type} ALERT
                        </span>
                        <span className="text-xs text-slate-400">• {alert.timestamp}</span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Unread" />
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{alert.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleAction(alert)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                        alert.type === 'STOCK'
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : alert.type === 'ORDER'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {alert.type === 'STOCK' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reorder Stock</span>
                        </>
                      ) : alert.type === 'ORDER' ? (
                        <>
                          <Package className="w-3.5 h-3.5" />
                          <span>Process Order</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Verify Rx</span>
                        </>
                      )}
                    </button>

                    {!isRead && (
                      <button
                        onClick={() => markPharmacyAlertRead(alert.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deletePharmacyAlert(alert.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Dismiss alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
