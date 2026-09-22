import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  UploadCloud,
  Camera,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowRight,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface PrescriptionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionScannerModal: React.FC<PrescriptionScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addPrescriptionFromScan, addToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extracted fields (editable in Step 4)
  const [extractedData, setExtractedData] = useState({
    medicationName: 'Amlodipine Besylate',
    dosage: '5 mg',
    frequency: 'Once daily',
    timing: 'Morning (08:00 AM)',
    foodInstruction: 'With or without food. Avoid grapefruit juice.',
    durationDays: 30,
    confidence: 96,
  });

  if (!isOpen) return null;

  const handleStartScan = () => {
    setStep(2); // processing
    setIsProcessing(true);

    setTimeout(() => {
      setStep(3); // AI extraction
      setTimeout(() => {
        setIsProcessing(false);
        setStep(4); // Review
      }, 1200);
    }, 1400);
  };

  const handleConfirm = () => {
    addPrescriptionFromScan({
      medicationName: extractedData.medicationName,
      dosage: extractedData.dosage,
      frequency: extractedData.frequency,
      timing: extractedData.timing,
      foodInstruction: extractedData.foodInstruction,
      durationDays: Number(extractedData.durationDays),
    });

    setStep(5); // Confirmed
    setTimeout(() => {
      onClose();
      setStep(1);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="prescription-scanner-modal"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Prescription Scanner (Snap & OCR)
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500 text-slate-950">
                  AI Vision
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Turn paper prescriptions into smart schedule & pharmacy records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className={step >= 1 ? 'text-teal-700 font-bold' : ''}>1. Upload</span>
            <span className={step >= 2 ? 'text-teal-700 font-bold' : ''}>2. Process</span>
            <span className={step >= 3 ? 'text-teal-700 font-bold' : ''}>3. Extract</span>
            <span className={step >= 4 ? 'text-teal-700 font-bold' : ''}>4. Review</span>
            <span className={step >= 5 ? 'text-teal-700 font-bold' : ''}>5. Confirm</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body based on step */}
        <div className="p-6">
          {step === 1 && (
            <div className="text-center space-y-4">
              <div
                onClick={handleStartScan}
                className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/80 p-8 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Click to capture or drag & drop prescription image
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, PDF receipts from clinics or hospitals
                  </p>
                </div>
              </div>

              {/* Sample prescription preview card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Sample Paper Rx: St. Jude Cardiology
                    </div>
                    <div className="text-[11px] text-slate-500">Dr. Maya Rao • Eleanor Vance</div>
                  </div>
                </div>
                <button
                  onClick={handleStartScan}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  Simulate Scan
                </button>
              </div>
            </div>
          )}

          {(step === 2 || step === 3) && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
              <h4 className="font-display font-bold text-lg text-slate-900">
                {step === 2 ? 'Analyzing Paper Document...' : 'Extracting Clinical Data with AI...'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Running optical character recognition, NLP posology extraction, and drug database cross-referencing.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI OCR Match Succeeded
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 rounded-md font-mono font-bold text-[11px]">
                  Confidence: {extractedData.confidence}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Medication Name</label>
                  <input
                    type="text"
                    value={extractedData.medicationName}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, medicationName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Dosage</label>
                  <input
                    type="text"
                    value={extractedData.dosage}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, dosage: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Frequency</label>
                  <input
                    type="text"
                    value={extractedData.frequency}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, frequency: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Timing</label>
                  <input
                    type="text"
                    value={extractedData.timing}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, timing: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Food Instructions</label>
                  <input
                    type="text"
                    value={extractedData.foodInstruction}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, foodInstruction: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Rescan
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span>Confirm & Add to Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-lg text-slate-900">
                Prescription Synchronized!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Updated patient daily schedule, informed MediCare Central Pharmacy, and synced care team logs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
