import React from 'react';
import { Medication } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Pill, AlertTriangle, Clock, RefreshCw, ShieldAlert, Check, FileCheck } from 'lucide-react';

interface MedicationDetailsModalProps {
  medication: Medication | null;
  onClose: () => void;
  onOpenDigitalRx?: (medication: Medication) => void;
}

export const MedicationDetailsModal: React.FC<MedicationDetailsModalProps> = ({
  medication,
  onClose,
  onOpenDigitalRx,
}) => {
  const { createRefillOrder } = useApp();

  if (!medication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="medication-details-modal"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {medication.name} ({medication.dosage})
              </h3>
              <p className="text-xs text-slate-300">{medication.genericName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Key Posology Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Schedule</div>
              <div className="font-bold text-slate-800 mt-0.5">{medication.timing}</div>
              <div className="text-[11px] text-slate-500">{medication.frequency}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Food Rule</div>
              <div className="font-bold text-slate-800 mt-0.5">{medication.foodInstruction}</div>
            </div>
          </div>

          {/* Supply & Remaining */}
          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-teal-950">Medication Supply Status</div>
              <div className="text-sm font-extrabold text-teal-700 mt-0.5">
                {medication.remainingDays} days remaining ({medication.pillsRemaining} / {medication.pillsTotal} pills)
              </div>
            </div>
            <button
              onClick={() => {
                createRefillOrder(medication.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Order Refill</span>
            </button>
          </div>

          {/* Pill Visual Profile */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Physical Identification
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {medication.pillDetails.description}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-600">
              <span>Imprint: <strong className="text-slate-900">{medication.pillDetails.imprint}</strong></span>
              <span>•</span>
              <span>Shape: <strong className="text-slate-900">{medication.pillDetails.shape}</strong></span>
              <span>•</span>
              <span>Size: <strong className="text-slate-900">{medication.pillDetails.size}</strong></span>
            </div>
          </div>

          {/* Warnings */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Care Warnings & Instructions</span>
            </div>
            {medication.warnings.map((w, idx) => (
              <p key={idx} className="text-[11px] leading-relaxed text-amber-800/90">
                • {w}
              </p>
            ))}
          </div>

          {/* Digital Prescription Link */}
          {onOpenDigitalRx && (
            <button
              onClick={() => onOpenDigitalRx(medication)}
              className="w-full py-2.5 px-4 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-teal-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Open Official Digital Prescription (e-Rx)</span>
            </button>
          )}

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Prescribed by: {medication.prescribedBy}</span>
            <span>Therapy Start: {medication.startDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
