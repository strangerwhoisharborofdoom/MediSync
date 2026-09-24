import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RefillOrder, InventoryItem, Prescription } from '../../types';
import { PharmacyAlertsView } from './PharmacyAlertsView';
import {
  Building2,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Check,
  MapPin,
  FileCheck,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Bell,
} from 'lucide-react';

interface PharmacyDashboardProps {
  initialSubTab?: 'refills' | 'prescriptions' | 'inventory' | 'delivery' | 'alerts';
}

export const PharmacyDashboard: React.FC<PharmacyDashboardProps> = ({ initialSubTab }) => {
  const {
    refillOrders,
    prescriptions,
    inventory,
    updateRefillOrderStatus,
    reorderInventoryStock,
    t,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'refills' | 'prescriptions' | 'inventory' | 'delivery' | 'alerts'>(
    initialSubTab || 'refills'
  );

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const pharmacyAlertCount =
    inventory.filter((i) => i.status === 'critical' || i.status === 'low_stock').length +
    refillOrders.filter((o) => o.status === 'pending_preparation' || o.status === 'preparing').length;
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<RefillOrder | null>(refillOrders[0] || null);

  const filteredOrders = refillOrders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header: Pharmacy Operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              MediCare Central • PHARM-LIC-5521
            </span>
            <span className="text-xs text-slate-400">Marcus Chen, PharmD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            {t.pharmacyOps}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-Time Refill Fulfillment Dispatch • Automated Supply Pipeline
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveSubTab('refills')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSubTab === 'refills'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Refill Queue ({refillOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('prescriptions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSubTab === 'prescriptions'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            e-Rx Inflow ({prescriptions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSubTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory Stock
          </button>
          <button
            onClick={() => setActiveSubTab('delivery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeSubTab === 'delivery'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Courier Dispatch
          </button>
          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeSubTab === 'alerts'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-rose-300 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span>Pharmacy Alerts ({pharmacyAlertCount})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: REFILL DISPATCH QUEUE */}
      {activeSubTab === 'refills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order List (2 spans) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Live Refill Orders Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Propagates immediate status feedback to Eleanor Vance's patient portal
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_preparation">Pending Prep</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      id={`pharmacy-order-item-${order.id}`}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {order.medicationName} ({order.dosage})
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                #{order.id}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Patient: <strong className="text-slate-700">{order.patientName}</strong> • {order.quantity} tablets
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                              order.priority === 'urgent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {order.priority}
                          </span>

                          <span
                            className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                              order.status === 'pending_preparation'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'preparing'
                                ? 'bg-sky-100 text-sky-800 animate-pulse'
                                : order.status === 'ready'
                                ? 'bg-indigo-100 text-indigo-800'
                                : order.status === 'out_for_delivery'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Immediate action buttons in queue */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500">
                          Requested: {order.requestedAt} • Delivery: {order.deliveryMethod.replace('_', ' ')}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {order.status === 'pending_preparation' && (
                            <button
                              id={`start-prep-btn-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateRefillOrderStatus(order.id, 'preparing');
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                            >
                              Start Preparing
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              id={`mark-ready-btn-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateRefillOrderStatus(order.id, 'ready');
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                            >
                              Mark Ready
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <button
                              id={`dispatch-delivery-btn-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateRefillOrderStatus(order.id, 'out_for_delivery');
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch Courier</span>
                            </button>
                          )}

                          {order.status === 'out_for_delivery' && (
                            <button
                              id={`mark-delivered-btn-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateRefillOrderStatus(order.id, 'delivered');
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirm Delivery</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Details & Real-Time Sync Monitor */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-display font-bold text-base text-slate-900 mb-3">
                Order Processing Terminal
              </h3>

              {selectedOrder ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Order</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      #{selectedOrder.id} • {selectedOrder.medicationName}
                    </div>
                    <div className="text-slate-600 mt-1">
                      Patient: <strong>{selectedOrder.patientName}</strong>
                    </div>
                  </div>

                  {/* Visual Verification Checklist */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-700">Safety & Posology Checks:</div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Electronic Doctor Rx Active & Verified</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>No Acute Drug-Drug Interactions Detected</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Stock Deducted from Central Dispensary</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Fulfillment State Progression:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateRefillOrderStatus(selectedOrder.id, 'preparing')}
                        className="p-2 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-center"
                      >
                        1. Preparing
                      </button>
                      <button
                        onClick={() => updateRefillOrderStatus(selectedOrder.id, 'ready')}
                        className="p-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-center"
                      >
                        2. Ready
                      </button>
                      <button
                        onClick={() => updateRefillOrderStatus(selectedOrder.id, 'out_for_delivery')}
                        className="p-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 text-center"
                      >
                        3. Dispatched
                      </button>
                      <button
                        onClick={() => updateRefillOrderStatus(selectedOrder.id, 'delivered')}
                        className="p-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-center"
                      >
                        4. Delivered
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Select an order to review details.</p>
              )}
            </div>

            <div className="p-5 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Shared State Sync</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                When you click any status button above, Eleanor Vance's patient portal updates its animated timeline instantly without page reloads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DOCTOR e-PRESCRIPTION INFLOW */}
      {activeSubTab === 'prescriptions' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Inflow e-Prescriptions (Direct from Physicians)
              </h3>
              <p className="text-xs text-slate-500">
                Authorized digital prescriptions ready for fulfillment & patient dispensation
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              NCPDP SCRIPT Certified
            </span>
          </div>

          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {rx.medicationName} {rx.dosage}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({rx.id})</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Patient: <strong className="text-slate-700">{rx.patientName}</strong> • Prescriber: {rx.doctorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{rx.durationDays} Days Supply</div>
                    <div className="text-slate-500">{rx.refillsRemaining} refills left</div>
                  </div>

                  <button
                    onClick={() => {
                      updateRefillOrderStatus('order-1', 'preparing');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    Accept & Prepare
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: INVENTORY STATUS & DEMAND PREDICTION */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Central Inventory & Zero-Stockout Forecaster
                </h3>
                <p className="text-xs text-slate-500">
                  Predictive supply modeling preventing critical therapy disruptions
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Central Warehouse: Hub A
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Medication</th>
                    <th className="p-3">In-Stock Units</th>
                    <th className="p-3">Runway (Days)</th>
                    <th className="p-3">Health Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900">
                        {item.medicationName} {item.dosage}
                        <div className="text-[10px] text-slate-400 font-mono">ID: {item.id}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="p-3 text-slate-700">
                        {item.daysRemaining} days
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'healthy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'low_stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => reorderInventoryStock(item.id, 200)}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Trigger Reorder</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: COURIER TRACKING (SIMULATED GPS) */}
      {activeSubTab === 'delivery' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Active Courier Dispatch Route
              </h3>
              <p className="text-xs text-slate-500">
                Cold-chain pharmaceutical delivery in progress for Eleanor Vance
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
              ETA: 18 Minutes
            </span>
          </div>

          {/* Map Simulation Canvas */}
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-700 relative overflow-hidden flex items-center justify-center p-6 text-center">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Courier pin simulation */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300 shadow-xl shadow-teal-500/30 animate-pulse">
                <Truck className="w-7 h-7" />
              </div>
              <div className="mt-3 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-white">
                Courier #402 • En Route to 742 Evergreen Terrace
              </div>
              <div className="text-[11px] text-teal-400 mt-1">
                Temperature sensor: 4.2°C (Compliant Cold Chain)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: DEDICATED PHARMACY ALERTS */}
      {activeSubTab === 'alerts' && <PharmacyAlertsView />}
    </div>
  );
};
