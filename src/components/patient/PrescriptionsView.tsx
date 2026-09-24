import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Prescription } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Camera,
  CheckCircle2,
  Clock,
  Building2,
  User,
  ShieldCheck,
  Download,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { PrescriptionScannerModal } from './PrescriptionScannerModal';
import { DigitalPrescriptionModal } from './DigitalPrescriptionModal';

export const PrescriptionsView: React.FC = () => {
  const { prescriptions, medications, createRefillOrder, patient, addToast, activeRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'review_required' | 'dispensed'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedRxForModal, setSelectedRxForModal] = useState<Prescription | null>(null);
  const [isDigitalRxOpen, setIsDigitalRxOpen] = useState(false);

  const openDigitalRx = (rx: Prescription) => {
    setSelectedRxForModal(rx);
    setIsDigitalRxOpen(true);
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesSearch =
      rx.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : rx.pharmacyStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
              Electronic Health Records
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Patient: {patient.name}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            Digital e-Prescriptions (e-Rx)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Legally signed digital prescriptions synced between doctor & dispensing pharmacy.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-5 py-3 rounded-2xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Paper Rx (OCR AI)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prescriptions by drug, doctor or diagnosis..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-sky-500 bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Status:
          </span>
          {(['all', 'approved', 'review_required', 'dispensed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">No prescriptions match your filter</div>
            <p className="text-xs text-slate-400 mt-1">Try changing the search terms or filter above.</p>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {rx.medicationName} {rx.dosage}
                    </h3>
                    <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Rx #{rx.id}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      rx.pharmacyStatus === 'dispensed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rx.pharmacyStatus === 'approved'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      Pharmacy: {rx.pharmacyStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    Posology: <strong className="text-slate-800">{rx.instructions}</strong> • Schedule: <span>{rx.frequency} ({rx.timing})</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5" />
                      {rx.doctorName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Issued: {rx.issuedDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      MediCare Central
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700">
                      {rx.refillsRemaining} refills left
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0">
                <button
                  onClick={() => openDigitalRx(rx)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center gap-1.5 transition-all"
                >
                  <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Open Digital Rx</span>
                </button>
                <button
                  onClick={() => addToast(`Prescription #${rx.id} exported as clinical PDF.`, 'info')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download e-Rx</span>
                </button>
                <button
                  onClick={() => {
                    const match = medications.find((m) => m.name.toLowerCase().includes(rx.medicationName.toLowerCase())) || medications[0];
                    if (match) {
                      createRefillOrder(match.id);
                      addToast(`Fulfillment request for ${rx.medicationName} transmitted to MediCare Central.`, 'success');
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Refill</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <PrescriptionScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <DigitalPrescriptionModal
        isOpen={isDigitalRxOpen}
        onClose={() => setIsDigitalRxOpen(false)}
        prescription={selectedRxForModal}
      />
    </div>
  );
};
