import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Camera, CheckCircle2, AlertTriangle, X, Sparkles, RefreshCw } from 'lucide-react';

interface PillVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PillVerificationModal: React.FC<PillVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { medications, addToast } = useApp();

  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || 'med-1');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'match' | 'mismatch'>('idle');

  if (!isOpen) return null;

  const currentMed = medications.find((m) => m.id === selectedMedId) || medications[0];

  const handleVerify = () => {
    setIsVerifying(true);
    setResult('idle');

    setTimeout(() => {
      setIsVerifying(false);
      setResult('match');
      addToast(`Visual check passed: Pill matches prescribed ${currentMed.name} specifications.`, 'success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="pill-verification-modal"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Visual Pill Verification
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                  Demo AI
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Confirm shape, color & imprint before swallowing
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target Medication Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Select Medication to Verify
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => {
                setSelectedMedId(e.target.value);
                setResult('idle');
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
            >
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.dosage}) — Scheduled {m.timing}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Viewfinder Simulation */}
          <div className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center p-4 text-center">
            {/* Target reticle */}
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-teal-400/80 flex items-center justify-center relative">
              <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-teal-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-teal-400" />
              <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-teal-400" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-teal-400" />

              {/* Pill representation icon */}
              <div className="w-16 h-10 rounded-full bg-slate-100 shadow-lg border border-slate-300 flex items-center justify-center text-[10px] font-mono font-bold text-slate-700">
                {currentMed.pillDetails.imprint}
              </div>
            </div>

            <p className="text-[11px] text-teal-300 mt-2 font-mono">
              Align tablet within viewfinder circle
            </p>
          </div>

          {/* Prescription Reference Attributes */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Prescribed Specifications:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Shape</div>
                <div className="font-bold text-slate-800">{currentMed.pillDetails.shape}</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Color</div>
                <div className="font-bold text-slate-800">{currentMed.pillDetails.color}</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Imprint</div>
                <div className="font-bold text-slate-800">{currentMed.pillDetails.imprint}</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase">Size</div>
                <div className="font-bold text-slate-800">{currentMed.pillDetails.size}</div>
              </div>
            </div>
          </div>

          {/* Verification Result */}
          {result === 'match' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 animate-in fade-in flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span>Match Detected (98.4% visual confidence)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800 text-[10px]">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Tablet matches prescribed {currentMed.name} {currentMed.dosage} (Imprint: {currentMed.pillDetails.imprint}). Safe to take as scheduled.
                </p>
              </div>
            </div>
          )}

          {/* Clinical Disclaimer Mandate */}
          <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Demo AI Verification:</strong> Visual pill verification is an informational assistive aid in this prototype and does not replace medical supervision or professional pharmacist review.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Computer Vision Feature Matching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify Pill Against Prescription</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
