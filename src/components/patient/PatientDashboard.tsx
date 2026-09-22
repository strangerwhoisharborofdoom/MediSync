import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Medication, DoseSchedule, RefillOrder } from '../../types';
import { PrescriptionScannerModal } from './PrescriptionScannerModal';
import { PillVerificationModal } from './PillVerificationModal';
import { MedicationDetailsModal } from './MedicationDetailsModal';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  AlertCircle,
  Truck,
  PackageCheck,
  Check,
  Info,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface PatientDashboardProps {
  onSelectTab?: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onSelectTab }) => {
  const {
    patient,
    todaySchedule,
    medications,
    refillOrders,
    markDoseTaken,
    markDoseMissed,
    applyAdaptiveDelay,
    createRefillOrder,
    t,
  } = useApp();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [pillVerifyOpen, setPillVerifyOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  // Countdown timer for next dose
  const [countdownMinutes, setCountdownMinutes] = useState(14);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownMinutes((prev) => (prev > 1 ? prev - 1 : 45));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const nextDose = todaySchedule.find((d) => d.status === 'due') || todaySchedule.find((d) => d.status === 'upcoming') || todaySchedule[0];
  const amlodipineMed = medications.find((m) => m.name.toLowerCase().includes('amlodipine')) || medications[0];
  const activeOrder = refillOrders[0];

  // Adherence chart weekly data
  const adherenceWeeklyData = [
    { day: 'Mon', adherence: 100 },
    { day: 'Tue', adherence: 100 },
    { day: 'Wed', adherence: 100 },
    { day: 'Thu', adherence: 67 },
    { day: 'Fri', adherence: 100 },
    { day: 'Sat', adherence: 100 },
    { day: 'Sun (Today)', adherence: patient.adherenceRate },
  ];

  const orderStages = [
    { key: 'pending_preparation', label: 'Request Sent' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'pending_preparation':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = activeOrder ? getStageIndex(activeOrder.status) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Medical ID: {patient.medicalId}
            </span>
            <span className="text-xs text-slate-400">Age: {patient.age}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            Good morning, {patient.name.split(' ')[0]}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            You have maintained a <strong className="text-teal-300">{patient.streakDays}-day streak</strong>! Your care team is synchronized.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all flex items-center gap-2 shadow-md"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Prescription</span>
          </button>
          <button
            onClick={() => setPillVerifyOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Verify My Pill</span>
          </button>
        </div>
      </div>

      {/* Adaptive Schedule Notification Banner */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-900">{t.adaptiveActive}</span>
              <span className="text-[10px] bg-teal-200 text-teal-900 font-bold px-1.5 py-0.2 rounded-md">
                Safety Shield
              </span>
            </div>
            <p className="text-xs text-teal-800/90 mt-0.5">{t.adaptiveNotice}</p>
          </div>
        </div>
        <div className="text-[11px] text-teal-700 bg-teal-100/60 px-2.5 py-1 rounded-lg shrink-0 font-medium">
          Simulated AI posology model
        </div>
      </div>

      {/* Main Grid: Hero Next Dose + Refill Engine & Adherence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Hero Next Medication & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* HERO CARD: NEXT MEDICATION */}
          <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {t.nextMedication}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    nextDose.status === 'taken'
                      ? 'bg-emerald-100 text-emerald-800'
                      : nextDose.status === 'due'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {nextDose.status === 'taken' ? 'Completed' : nextDose.status === 'due' ? 'Due Now' : 'Upcoming'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {nextDose.status === 'taken'
                    ? 'Taken at ' + (nextDose.takenAt || '8:03 AM')
                    : `In approx ${countdownMinutes} mins`}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                  {nextDose.medicationName} {nextDose.dosage}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <span>Scheduled for: <strong className="text-slate-800">{nextDose.scheduledTime}</strong></span>
                  <span>•</span>
                  <span className="capitalize">{nextDose.foodRule.replace('_', ' ')}</span>
                </p>
                {nextDose.notes && (
                  <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                    "{nextDose.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {nextDose.status !== 'taken' ? (
                  <>
                    <button
                      id="mark-dose-taken-button"
                      onClick={() => markDoseTaken(nextDose.id)}
                      className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.markAsTaken}</span>
                    </button>

                    <button
                      onClick={() => markDoseMissed(nextDose.id)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Simulate recording a missed dose"
                    >
                      {t.markAsMissed}
                    </button>
                  </>
                ) : (
                  <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Dose Completed for Today</span>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary details link */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedMed(amlodipineMed)}
                className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 group"
              >
                <span>{t.details}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => applyAdaptiveDelay(nextDose.id, 2)}
                className="text-slate-500 hover:text-slate-800 font-medium text-[11px]"
              >
                Took 2 hours late? Adapt Next Doses
              </button>
            </div>
          </div>

          {/* TODAY'S MEDICATION TIMELINE */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Today's Medication Timeline
                </h3>
                <p className="text-xs text-slate-500">
                  Daily posology sequence synchronized with care plan
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                3 Doses Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {todaySchedule.map((dose) => {
                const isTaken = dose.status === 'taken';
                const isDue = dose.status === 'due';
                const isMissed = dose.status === 'missed';

                return (
                  <div
                    key={dose.id}
                    id={`schedule-item-${dose.id}`}
                    onClick={() => {
                      const matchMed = medications.find((m) =>
                        m.name.toLowerCase().includes(dose.medicationName.toLowerCase())
                      );
                      if (matchMed) setSelectedMed(matchMed);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isTaken
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isDue
                        ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20'
                        : isMissed
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs ${
                          isTaken
                            ? 'bg-emerald-600 text-white'
                            : isDue
                            ? 'bg-amber-500 text-white'
                            : isMissed
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Pill className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-slate-900 text-sm sm:text-base">
                            {dose.medicationName} {dose.dosage}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              isTaken
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDue
                                ? 'bg-amber-100 text-amber-800'
                                : isMissed
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {dose.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{dose.scheduledTime}</span>
                          <span>•</span>
                          <span className="capitalize">{dose.foodRule.replace('_', ' ')}</span>
                          {dose.takenAt && (
                            <span className="text-emerald-600 font-mono text-[11px]">
                              (Taken at {dose.takenAt})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isTaken && !isMissed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markDoseTaken(dose.id);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                        >
                          Take
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {onSelectTab && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Need full prescription posology or drug safety details?</span>
                <button
                  onClick={() => onSelectTab('medications')}
                  className="font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <span>All Medications</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* FOOD & DRUG WARNING PANEL */}
          <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm text-amber-900">
                    {t.foodWarning}
                  </h4>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                    Grapefruit Warning
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {t.foodWarningDesc} Amlodipine metabolism can be influenced by cytochrome enzymes.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMed(amlodipineMed)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-200/80 hover:bg-amber-300 text-amber-900 transition-colors shrink-0"
            >
              View Interaction Details
            </button>
          </div>
        </div>

        {/* Right Column: Adherence Indicator & Smart Refill Engine */}
        <div className="space-y-6">
          {/* ADHERENCE PROGRESS CARD */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-slate-900">
                Adherence Continuity
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{patient.streakDays}-Day Streak</span>
              </div>
            </div>

            {/* Circular Adherence Display */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#0d9488"
                    strokeWidth="12"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * patient.adherenceRate) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-display text-slate-900">
                    {patient.adherenceRate}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Past 30 Days
                  </span>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center text-xs">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">Taken</div>
                  <div className="font-bold text-emerald-900 mt-0.5">88 doses</div>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-[10px] text-amber-700 font-bold uppercase">Late</div>
                  <div className="font-bold text-amber-900 mt-0.5">5 doses</div>
                </div>
                <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="text-[10px] text-rose-700 font-bold uppercase">Missed</div>
                  <div className="font-bold text-rose-900 mt-0.5">2 doses</div>
                </div>
              </div>
            </div>

            {/* Weekly adherence mini-bar chart */}
            <div className="mt-2 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Weekly Adherence Pattern
              </div>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceWeeklyData}>
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Adherence']}
                      contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Bar dataKey="adherence" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* REFILL & SUPPLY CARD */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-teal-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Medication Supply
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {amlodipineMed.remainingDays} Days Left
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">{amlodipineMed.name}</span>
                <span className="text-slate-500 font-medium">
                  {amlodipineMed.pillsRemaining} / {amlodipineMed.pillsTotal} pills
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${(amlodipineMed.pillsRemaining / amlodipineMed.pillsTotal) * 100}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-amber-800 font-semibold mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Refill threshold reached. Order now to prevent therapy gap.</span>
              </div>
            </div>

            <button
              id="patient-order-refill-button"
              onClick={() => createRefillOrder(amlodipineMed.id, 'routine', 'home_delivery')}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.orderRefill} (1-Click Supply)</span>
            </button>

            {/* Live Shared Order Tracker */}
            {activeOrder && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-slate-800">Active Order #{activeOrder.id}</span>
                  <span className="text-teal-700 font-bold capitalize">
                    {activeOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Animated Order Stages Timeline */}
                <div className="relative flex items-center justify-between my-4 px-1">
                  <div className="absolute left-2 right-2 top-3 h-0.5 bg-slate-200 -z-0" />
                  <div
                    className="absolute left-2 top-3 h-0.5 bg-teal-600 -z-0 transition-all duration-500"
                    style={{
                      width: `${(currentStageIndex / (orderStages.length - 1)) * 95}%`,
                    }}
                  />

                  {orderStages.map((stg, i) => {
                    const isDone = i <= currentStageIndex;
                    return (
                      <div key={stg.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isDone ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className="text-[9px] font-medium text-slate-500 mt-1">
                          {stg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Fulfilled by MediCare Central</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700">
                    {activeOrder.trackingCoordinates?.etaMinutes || 20}m ETA
                  </span>
                </div>
              </div>
            )}

            {onSelectTab && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => onSelectTab('refills')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
                >
                  <span>Track All Refill Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrescriptionScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
      <PillVerificationModal isOpen={pillVerifyOpen} onClose={() => setPillVerifyOpen(false)} />
      <MedicationDetailsModal medication={selectedMed} onClose={() => setSelectedMed(null)} />
    </div>
  );
};
