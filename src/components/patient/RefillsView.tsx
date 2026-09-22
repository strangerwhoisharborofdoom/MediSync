import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  PackageCheck,
  Clock,
  RefreshCw,
  Building2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  MapPin,
} from 'lucide-react';

export const RefillsView: React.FC = () => {
  const { refillOrders, medications, createRefillOrder, patient, addToast } = useApp();
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || '');
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrderRefill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId) return;
    createRefillOrder(selectedMedId);
    setIsOrdering(false);
  };

  const getStepNumber = (status: string) => {
    switch (status) {
      case 'requested':
      case 'pending':
        return 1;
      case 'approved':
      case 'processing':
        return 2;
      case 'filled':
      case 'ready':
        return 3;
      case 'out_for_delivery':
      case 'in_transit':
        return 4;
      case 'delivered':
      case 'completed':
        return 5;
      default:
        return 2;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Supply Logistics Pipeline
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Patient: {patient.name}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            Refill Tracking & Pharmacy Orders
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time dispensing status, courier tracking, and cold-chain temperature verification.
          </p>
        </div>

        <button
          onClick={() => setIsOrdering(true)}
          className="px-5 py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Request New Refill</span>
        </button>
      </div>

      {/* Quick Refill Modal */}
      {isOrdering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleOrderRefill}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Order Medication Refill
              </h3>
              <button
                type="button"
                onClick={() => setIsOrdering(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select which maintenance therapy medication you would like to refill.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Select Regimen</label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none focus:border-emerald-500"
                >
                  {medications.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.dosage}) — {m.remainingDays} days supply left
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-2 text-emerald-800 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  MediSync automated insurance copay verification ($0 copay active) and 30-day bottle fulfillment.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsOrdering(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
              >
                Submit Order to Pharmacy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Refill Orders List */}
      <div className="space-y-6">
        {refillOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            <PackageCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">No active refill orders</div>
            <p className="text-xs text-slate-400 mt-1">Click "Request New Refill" to dispatch a prescription order.</p>
          </div>
        ) : (
          refillOrders.map((order) => {
            const step = getStepNumber(order.status);
            return (
              <div
                key={order.id}
                className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-slate-900">
                        {order.medicationName} ({order.quantity || 30} units)
                      </h3>
                      <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        Order #{order.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Requested on {order.requestedAt} • Fulfillment Partner: <strong>{order.pharmacyName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl capitalize">
                      Status: {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative pt-2 pb-1">
                  <div className="flex items-center justify-between relative z-10">
                    {[
                      { label: 'Order Placed', num: 1 },
                      { label: 'Pharmacist Review', num: 2 },
                      { label: 'Bottle Dispensed', num: 3 },
                      { label: 'Courier Dispatch', num: 4 },
                      { label: 'Delivered', num: 5 },
                    ].map((s) => {
                      const isComplete = step >= s.num;
                      const isCurrent = step === s.num;
                      return (
                        <div key={s.num} className="flex flex-col items-center flex-1 text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isComplete
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                          </div>
                          <span className={`text-[10px] sm:text-xs font-bold mt-1.5 ${isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                </div>

                {/* Tracking & Metadata Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      Courier: <strong>FedEx Rx Express</strong> (Tracking #FX-{order.id.slice(-5)})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Destination: {patient.emergencyAddress || 'Patient Residence'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToast(`Shipment for order #${order.id} is on schedule. Current location: Local Distribution Hub.`, 'info')}
                      className="px-3.5 py-1.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      Track Package
                    </button>
                    <button
                      onClick={() => addToast(`Connecting to ${order.pharmacyName} pharmacy desk...`, 'info')}
                      className="px-3.5 py-1.5 rounded-xl font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200"
                    >
                      Call Pharmacy
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
