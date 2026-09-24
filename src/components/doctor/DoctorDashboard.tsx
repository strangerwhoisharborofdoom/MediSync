import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientInfo, Prescription } from '../../types';
import {
  Stethoscope,
  Search,
  AlertTriangle,
  Plus,
  FileText,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  User,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const DoctorDashboard: React.FC = () => {
  const {
    patient,
    otherPatients,
    medications,
    prescriptions,
    vitals,
    generateAiSummary,
    createPrescription,
    addToast,
    t,
  } = useApp();

  const cohortPatients: PatientInfo[] = [patient, ...otherPatients];

  const [selectedPatientId, setSelectedPatientId] = useState(patient.id);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // New Prescription Modal State
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [rxForm, setRxForm] = useState({
    medicationName: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily',
    timing: 'Morning (08:00 AM)',
    durationDays: 30,
    foodInstruction: 'With or without food. Drink plenty of water.',
    instructions: 'Monitor blood pressure weekly. Report persistent dry cough.',
  });

  // Filter cohort
  const filteredPatients = cohortPatients.filter((p: PatientInfo) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.medicalId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk =
      riskFilter === 'all'
        ? true
        : riskFilter === 'high'
        ? p.riskLevel === 'High' || p.riskLevel === 'Moderate'
        : p.riskLevel === 'Low';
    return matchesSearch && matchesRisk;
  });

  const activePatient = cohortPatients.find((p: PatientInfo) => p.id === selectedPatientId) || patient;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 17) return t.goodAfternoon;
    return t.goodEvening;
  };

  const handleGenerateSummary = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const summary = generateAiSummary();
      setAiSummary(summary);
      setIsGeneratingAi(false);
    }, 1000);
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    createPrescription({
      patientId: activePatient.id,
      patientName: activePatient.name,
      medicationName: rxForm.medicationName,
      dosage: rxForm.dosage,
      frequency: rxForm.frequency,
      timing: rxForm.timing,
      durationDays: Number(rxForm.durationDays),
      foodInstruction: rxForm.foodInstruction,
      instructions: rxForm.instructions,
    });
    setIsRxModalOpen(false);
    addToast(`e-Prescription for ${rxForm.medicationName} transmitted to Patient & Pharmacy.`, 'success');
  };

  // Drug interaction check preview
  const isPotentialInteraction =
    rxForm.medicationName.toLowerCase().includes('lisinopril') &&
    medications.some((m) => m.name.toLowerCase().includes('amlodipine'));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header: Clinical Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Dr. Maya Rao, MD • MED-LIC-89410
            </span>
            <span className="text-xs text-slate-400">Cardiology Clinic</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            {getGreeting()}, Dr. Rao
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Cohort Risk Stratification • Tele-Adherence Monitoring & e-Prescriptions
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="doctor-new-prescription-button"
            onClick={() => setIsRxModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{t.newPrescription}</span>
          </button>
        </div>
      </div>

      {/* Cohort Search & Patient Cards Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-slate-900">
              Active Monitored Cohort
            </h3>
            <span className="text-xs text-slate-500">({filteredPatients.length} patients)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or ID..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Risk filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High & Medium Risk</option>
              <option value="low">Low Risk Only</option>
            </select>
          </div>
        </div>

        {/* Patient cohort chips/cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPatients.map((p: PatientInfo) => {
            const isSelected = p.id === activePatient.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {p.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({p.medicalId})</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {p.conditions?.join(', ') || 'Hypertension'} • {p.age} y/o
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-900">
                      {p.adherenceRate}% Adherence
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        p.riskLevel === 'Low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.riskLevel === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-300'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Patient Longitudinal View & AI Clinical Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Longitudinal Charts & Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* BP & Clinical Vitals Trend */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  {activePatient.name} — 30-Day Hemodynamic Response
                </h3>
                <p className="text-xs text-slate-500">
                  Correlation of medication compliance with systolic & diastolic control
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                Current BP: 124/79 mmHg
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[60, 160]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="systolicBP"
                    stroke="#4338ca"
                    strokeWidth={2.5}
                    name="Systolic BP"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolicBP"
                    stroke="#818cf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Diastolic BP"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Medication Regimen Table */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-slate-900">
                Active Regimen & e-Prescription History
              </h3>
              <span className="text-xs text-slate-500">
                {prescriptions.length} issued prescriptions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Medication</th>
                    <th className="p-3">Dosage & Frequency</th>
                    <th className="p-3">Food Guidance</th>
                    <th className="p-3">Refill Status</th>
                    <th className="p-3">Rx Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900">
                        {rx.medicationName}
                        <div className="text-[10px] text-slate-400 font-mono">{rx.id}</div>
                      </td>
                      <td className="p-3 text-slate-700">
                        {rx.dosage} • {rx.frequency}
                        <div className="text-[10px] text-slate-400">{rx.timing}</div>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">
                        {rx.foodInstruction}
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {rx.refillsRemaining} refills left
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {rx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Progress Summary & Risk Score Gauge */}
        <div className="space-y-6">
          {/* READMISSION RISK SCORE GAUGE */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                {t.readmissionRisk}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  activePatient.riskLevel === 'Low'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activePatient.riskLevel === 'Moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {activePatient.riskLevel} Risk
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center my-2">
              <div className="text-4xl font-extrabold font-display text-slate-900">
                {activePatient.readmissionRiskPercent}%
              </div>
              <p className="text-xs text-slate-500 mt-1">30-Day Hospital Readmission Probability</p>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    activePatient.readmissionRiskPercent > 40
                      ? 'bg-rose-500'
                      : activePatient.readmissionRiskPercent > 20
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${activePatient.readmissionRiskPercent}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-600 leading-relaxed mt-3 space-y-1">
              <div>• <strong>Adherence driver:</strong> 92% adherence dampens BP spike variance.</div>
              <div>• <strong>Caregiver co-presence:</strong> Daniel Vance actively acknowledged.</div>
            </div>
          </div>

          {/* AI PROGRESS SUMMARY GENERATOR */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  AI Clinical Summarizer
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Synthesizes 30 days of patient adherence, telemetry vitals & pharmacy refill records into physician notes.
            </p>

            <button
              id="generate-ai-summary-button"
              onClick={handleGenerateSummary}
              disabled={isGeneratingAi}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? 'Synthesizing...' : t.generateAiSummary}</span>
            </button>

            {aiSummary && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-2 animate-in fade-in">
                <div className="font-bold text-indigo-900 flex items-center justify-between">
                  <span>AI Progress Note</span>
                  <span className="text-[10px] text-indigo-700 font-mono">Today, 09:30 AM</span>
                </div>
                <div className="whitespace-pre-line text-indigo-900/90 leading-relaxed font-normal">
                  {aiSummary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW PRESCRIPTION MODAL */}
      {isRxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Issue e-Prescription
                  </h3>
                  <p className="text-xs text-slate-300">
                    Direct transmission to Patient Portal & MediCare Pharmacy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRxModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssuePrescription} className="p-6 space-y-4 overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Target Patient:</span>{' '}
                <strong className="text-slate-900">{activePatient.name}</strong> ({activePatient.medicalId})
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Medication Name</label>
                  <input
                    type="text"
                    value={rxForm.medicationName}
                    onChange={(e) => setRxForm({ ...rxForm, medicationName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Dosage</label>
                  <input
                    type="text"
                    value={rxForm.dosage}
                    onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Frequency</label>
                  <select
                    value={rxForm.frequency}
                    onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Timing Window</label>
                  <input
                    type="text"
                    value={rxForm.timing}
                    onChange={(e) => setRxForm({ ...rxForm, timing: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Supply Duration (Days)</label>
                  <input
                    type="number"
                    value={rxForm.durationDays}
                    onChange={(e) => setRxForm({ ...rxForm, durationDays: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Food Rule</label>
                  <input
                    type="text"
                    value={rxForm.foodInstruction}
                    onChange={(e) => setRxForm({ ...rxForm, foodInstruction: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">
                  Clinical Care Instructions
                </label>
                <textarea
                  value={rxForm.instructions}
                  onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none"
                />
              </div>

              {/* Drug interaction automated check */}
              {isPotentialInteraction && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Drug Interaction Advisory:</span> Lisinopril combined with active Amlodipine may produce additive hypotensive effects. Titrate carefully.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  id="confirm-issue-prescription"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transmit e-Prescription</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
