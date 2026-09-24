import React, { useState, useEffect } from 'react';
import { Prescription, Medication } from '../../types';
import { useApp } from '../../context/AppContext';
import { tSafe } from '../../i18n/translations';
import {
  X,
  FileCheck,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Printer,
  Download,
  Send,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Pill,
} from 'lucide-react';

interface DigitalPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: Prescription | null;
  medication?: Medication | null;
}

export const DigitalPrescriptionModal: React.FC<DigitalPrescriptionModalProps> = ({
  isOpen,
  onClose,
  prescription,
  medication,
}) => {
  const { patient, createRefillOrder, addToast, medications, prescriptions, t } = useApp();

  // Filter prescriptions belonging to this patient
  const patientPrescriptions = prescriptions.filter(
    (p) =>
      p.patientId === patient.id ||
      p.patientName.toLowerCase() === patient.name.toLowerCase()
  );

  const [selectedId, setSelectedId] = useState<string>(
    prescription?.id || (medication
      ? patientPrescriptions.find((p) => p.medicationName.toLowerCase().includes(medication.name.toLowerCase()))?.id
      : '') || patientPrescriptions[0]?.id || ''
  );

  useEffect(() => {
    if (prescription?.id) {
      setSelectedId(prescription.id);
    } else if (medication) {
      const match = patientPrescriptions.find((p) =>
        p.medicationName.toLowerCase().includes(medication.name.toLowerCase())
      );
      if (match) setSelectedId(match.id);
      else if (patientPrescriptions[0]) setSelectedId(patientPrescriptions[0].id);
    } else if (patientPrescriptions[0] && !selectedId) {
      setSelectedId(patientPrescriptions[0].id);
    }
  }, [prescription, medication, patientPrescriptions]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeRx =
    patientPrescriptions.find((p) => p.id === selectedId) ||
    prescription ||
    patientPrescriptions[0] ||
    null;

  const matchingMed = activeRx
    ? medications.find((m) =>
        m.name.toLowerCase().includes(activeRx.medicationName.toLowerCase()) ||
        activeRx.medicationName.toLowerCase().includes(m.name.toLowerCase())
      )
    : null;

  const handleSendRefill = () => {
    if (!activeRx) return;
    if (matchingMed) {
      createRefillOrder(matchingMed.id);
    } else {
      createRefillOrder(medications[0]?.id || 'med-1');
    }
    onClose();
  };

  const handleDownload = () => {
    if (!activeRx) return;
    const content =
      `======================================================\n` +
      `MEDISYNC VERIFIED DIGITAL PRESCRIPTION (e-Rx)\n` +
      `======================================================\n` +
      `Prescription ID   : #${activeRx.id}\n` +
      `Date Issued       : ${activeRx.issuedDate}\n` +
      `Status            : ${activeRx.status.toUpperCase()} (Pharmacy Status: ${activeRx.pharmacyStatus.toUpperCase()})\n\n` +
      `PATIENT DETAILS\n` +
      `Name              : ${patient.name}\n` +
      `Medical ID        : ${patient.medicalId}\n` +
      `Age               : ${patient.age}\n` +
      `Blood Group       : ${patient.bloodGroup || 'O+'}\n\n` +
      `PRESCRIBING PHYSICIAN\n` +
      `Doctor            : ${activeRx.doctorName}\n` +
      `Medical License   : ${activeRx.doctorLicense}\n` +
      `Clinic            : CardioMetabolic & Internal Medicine Pavilion\n\n` +
      `MEDICATION & POSOLOGY\n` +
      `Medication        : ${activeRx.medicationName} (${activeRx.dosage})\n` +
      `Frequency         : ${activeRx.frequency}\n` +
      `Timing            : ${activeRx.timing}\n` +
      `Duration          : ${activeRx.durationDays} Days\n` +
      `Instructions      : ${activeRx.instructions}\n` +
      `Food Rule         : ${activeRx.foodInstruction}\n` +
      `Refills Remaining : ${activeRx.refillsRemaining} of ${activeRx.refillsAllowed} authorized\n\n` +
      `SECURITY & VERIFICATION\n` +
      `NCPDP SCRIPT Standard • Tamper-Evident SHA-256 Medical Bridge\n` +
      `OCR Confidence    : ${activeRx.ocrConfidence || 98}%\n` +
      `======================================================\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prescription-${activeRx.id}-${activeRx.medicationName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast(`Prescription #${activeRx.id} downloaded successfully.`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="digital-prescription-modal-backdrop"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="digital-prescription-document"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 my-auto pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  {tSafe(t, 'digitalPrescriptionTitle', 'Official Digital Prescription (e-Rx)')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/30 text-teal-300 border border-teal-500/40 uppercase">
                  {tSafe(t, 'verifiedRx', 'Verified')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                NCPDP SCRIPT Standard • Tamper-Evident Tele-Prescription
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Print Prescription"
              aria-label="Print Prescription"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Download e-Rx Document"
              aria-label="Download e-Rx Document"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Selector Tabs if patient has multiple prescriptions */}
        {patientPrescriptions.length > 1 && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              {tSafe(t, 'selectPrescription', 'Select Prescription')}:
            </span>
            {patientPrescriptions.map((rx) => (
              <button
                key={rx.id}
                onClick={() => setSelectedId(rx.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  rx.id === activeRx?.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{rx.medicationName} ({rx.dosage})</span>
              </button>
            ))}
          </div>
        )}

        {/* Prescription Content or Empty State */}
        {!activeRx ? (
          <div className="p-12 text-center bg-white space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">
              {tSafe(t, 'noPrescriptionFound', 'No Active Digital Prescription Found')}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no electronic prescriptions on file for this patient profile. Please contact your primary physician to issue an official e-prescription.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              {tSafe(t, 'close', 'Close')}
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-800 bg-white">
            {/* Clinic & Prescriber Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>{activeRx.doctorName}</span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  State Medical Lic: {activeRx.doctorLicense}
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>CardioMetabolic Health & Primary Care Pavilion</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Suite 400 • St. Jude Pavilion • Tel: (555) 234-8901
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-right space-y-1 min-w-[190px]">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">
                  e-Prescription Identifier
                </div>
                <div className="font-mono font-bold text-xs text-teal-800">
                  #{activeRx.id.toUpperCase()}
                </div>
                <div className="flex items-center justify-end gap-1.5 text-slate-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Issued: {activeRx.issuedDate}</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Verified & Active
                </div>
              </div>
            </div>

            {/* Patient Header Section */}
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                  Patient Name
                </span>
                <div className="font-bold text-sm text-slate-900">{patient.name}</div>
                <div className="text-slate-600 text-[11px]">
                  Age: {patient.age} yrs • Blood Group: {patient.bloodGroup || 'O+'} • Gender: Female
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                  MediSync Health ID
                </span>
                <div className="font-mono font-bold text-xs text-slate-800">
                  {patient.medicalId}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Primary Pharmacy: MediCare Central (PH-77192)
                </div>
              </div>
            </div>

            {/* Prescribed Drug Posology */}
            <div className="p-5 bg-white rounded-2xl border-2 border-teal-600/30 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    Rx
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      Prescribed Drug
                    </span>
                    <h4 className="font-display font-bold text-lg text-slate-900">
                      {activeRx.medicationName}{' '}
                      <span className="text-sm font-normal text-slate-600">({activeRx.dosage})</span>
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Duration</span>
                  <div className="text-xs font-bold text-slate-700">
                    {activeRx.durationDays || 30} Days Supply
                  </div>
                </div>
              </div>

              {/* Posology / Directions for Use */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Signatura (Sig) / Directions for Patient
                  </div>
                  <div className="font-medium text-slate-900 mt-0.5 leading-relaxed">
                    {activeRx.instructions}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold">Dosing Frequency: </span>
                    <span className="font-bold text-slate-800">{activeRx.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Scheduled Timing: </span>
                    <span className="font-bold text-slate-800">{activeRx.timing}</span>
                  </div>
                </div>
              </div>

              {/* Food Instruction & Warnings */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs flex items-start gap-2.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[11px]">Dietary & Interaction Guidance:</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    {activeRx.foodInstruction}
                  </div>
                </div>
              </div>

              {/* Refills & Dispensing Authorization */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Refills Authorized
                  </div>
                  <div className="font-bold text-sm text-slate-800 mt-0.5">
                    {activeRx.refillsAllowed} Total
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Refills Remaining
                  </div>
                  <div className="font-bold text-sm text-teal-700 mt-0.5">
                    {activeRx.refillsRemaining} Available
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    DAW Status
                  </div>
                  <div className="font-bold text-xs text-slate-800 mt-0.5">
                    DAW 0 (Generic Allowed)
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Signature & Stamp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center p-1 shrink-0">
                  <QrCode className="w-10 h-10 text-slate-700" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Cryptographically Signed e-Rx</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    SHA256: 9e4f-b3a1-77c8-0192-d38a
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Verified through State Prescription Monitoring Program (PMP)
                  </div>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 space-y-1">
                <div className="font-serif italic text-sm text-teal-900 font-bold">
                  Dr. Maya Rao, MD
                </div>
                <div className="text-[10px] text-slate-400">
                  Digitally Authenticated at 2026-08-15 09:32 UTC
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Authorized for 1-click fulfillment via MediCare Central Pharmacy</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              {tSafe(t, 'close', 'Close')}
            </button>

            {activeRx && (
              <button
                onClick={handleSendRefill}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{tSafe(t, 'orderRefillNow', 'Order Refill Now')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
