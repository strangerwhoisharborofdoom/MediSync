import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  AlertTriangle,
  Phone,
  MessageSquare,
  Activity,
  Plus,
  ShieldAlert,
  User,
  Clock,
  CheckCircle2,
  X,
  Send,
  MapPin,
  Pill,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface CaregiverDashboardProps {
  onSelectTab?: (tab: string) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ onSelectTab }) => {
  const {
    patient,
    otherPatients,
    todaySchedule,
    medications,
    vitals,
    alerts,
    addVital,
    triggerEmergencySos,
    sendMessage,
    acknowledgeAlert,
    t,
  } = useApp();

  // Dependent selector
  const [selectedDependent, setSelectedDependent] = useState('eleanor');
  const [addVitalOpen, setAddVitalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<'doctor' | 'pharmacy'>('doctor');
  const [messageText, setMessageText] = useState('');

  // Active dependent resolved data
  const activeDependent = useMemo(() => {
    if (selectedDependent === 'arthur') {
      const arthur = otherPatients?.find((p) => p.name.includes('Arthur') || p.id === 'p-arthur') || {
        ...patient,
        id: 'p-arthur',
        name: 'Arthur Vance',
        age: 74,
        gender: 'Male',
        conditions: ['Type 2 Diabetes', 'Osteoarthritis'],
        allergies: ['Sulfa drugs'],
        adherenceRate: 78,
        streakDays: 4,
        primaryDoctor: 'Dr. Maya Rao, MD',
        emergencyAddress: '104 Oak Ridge Way, Apt 12',
      };
      return arthur;
    }
    return patient;
  }, [selectedDependent, otherPatients, patient]);

  // New vital form state
  const [vitalForm, setVitalForm] = useState({
    systolicBP: 126,
    diastolicBP: 80,
    heartRate: 72,
    weightKg: 68.1,
    mood: 'Good' as 'Excellent' | 'Good' | 'Fair' | 'Poor',
    notes: 'Resting seated reading',
  });

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    addVital({
      patientId: activeDependent.id,
      systolicBP: Number(vitalForm.systolicBP),
      diastolicBP: Number(vitalForm.diastolicBP),
      heartRate: Number(vitalForm.heartRate),
      weightKg: Number(vitalForm.weightKg),
      mood: vitalForm.mood,
      notes: vitalForm.notes,
    });
    setAddVitalOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageTarget, messageText);
    setMessageText('');
    setMessageModalOpen(false);
  };

  const missedDoseAlerts = alerts.filter(
    (a) => a.type === 'missed_dose' || a.severity === 'high' || a.severity === 'critical'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header: Care Overview & Dependent Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
              Caregiver Console
            </span>
            <span className="text-xs text-slate-400">Authorized Family Access</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            {t.careOverview}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Live Peace of Mind • Connected with {activeDependent.name}'s daily adherence & biometrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dependent Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium pl-2">Viewing:</span>
            <select
              value={selectedDependent}
              onChange={(e) => setSelectedDependent(e.target.value)}
              className="bg-slate-900 text-white font-bold text-xs p-2 rounded-xl border border-slate-700 outline-none focus:border-sky-500"
            >
              <option value="eleanor">Eleanor Vance — Mom (Age 67)</option>
              <option value="arthur">Arthur Vance — Uncle (Age 74)</option>
            </select>
          </div>

          {/* EMERGENCY SOS BUTTON */}
          <button
            id="caregiver-sos-trigger"
            onClick={() => setSosModalOpen(true)}
            className="px-5 py-3 rounded-2xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 animate-pulse active:scale-95 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.emergencySos}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live Adherence + Missed Dose Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Live Adherence & Vitals */}
        <div className="lg:col-span-2 space-y-6">
          {/* LIVE ADHERENCE STATUS CARD */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  Live Adherence Stream
                </span>
                <h3 className="font-display font-bold text-xl text-slate-900 mt-2">
                  Today's Care Plan Adherence
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold font-display text-sky-600">
                  {activeDependent.adherenceRate}%
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Continuous adherence</div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <div className="text-[11px] text-emerald-700 font-bold uppercase">Taken Today</div>
                <div className="text-lg font-bold text-emerald-900 mt-0.5">
                  {todaySchedule.filter((d) => d.status === 'taken').length} of {todaySchedule.length}
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                <div className="text-[11px] text-amber-700 font-bold uppercase">Upcoming/Due</div>
                <div className="text-lg font-bold text-amber-900 mt-0.5">
                  {todaySchedule.filter((d) => d.status === 'upcoming' || d.status === 'due').length} doses
                </div>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                <div className="text-[11px] text-rose-700 font-bold uppercase">Missed</div>
                <div className="text-lg font-bold text-rose-900 mt-0.5">
                  {todaySchedule.filter((d) => d.status === 'missed').length} doses
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                {t.recentActivity}
              </h4>
              <div className="space-y-2.5">
                {todaySchedule.map((dose) => (
                  <div
                    key={dose.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          dose.status === 'taken'
                            ? 'bg-emerald-100 text-emerald-700'
                            : dose.status === 'missed'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {dose.medicationName} {dose.dosage}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Scheduled: {dose.scheduledTime} ({dose.foodRule.replace('_', ' ')})
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                        dose.status === 'taken'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dose.status === 'missed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {dose.status === 'taken' ? `Taken at ${dose.takenAt || '8:03 AM'}` : dose.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VITALS & BIOMETRICS CHARTS */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">{t.vitals}</h3>
                <p className="text-xs text-slate-500">
                  Longitudinal blood pressure & resting heart rate trends
                </p>
              </div>
              <button
                onClick={() => setAddVitalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Vitals</span>
              </button>
            </div>

            {/* Current Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Blood Pressure</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {vitals[vitals.length - 1]?.systolicBP}/{vitals[vitals.length - 1]?.diastolicBP} mmHg
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Optimal Range</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Heart Rate</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {vitals[vitals.length - 1]?.heartRate} BPM
                </div>
                <div className="text-[10px] text-sky-600 font-semibold mt-0.5">Sinus Rhythm</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Body Weight</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {vitals[vitals.length - 1]?.weightKg} kg
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Stable</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Reported Mood</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {vitals[vitals.length - 1]?.mood}
                </div>
                <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Positive</div>
              </div>
            </div>

            {/* Blood Pressure & HR Chart */}
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[60, 160]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="systolicBP"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    name="Systolic BP (mmHg)"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolicBP"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Diastolic BP (mmHg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#e11d48"
                    strokeWidth={2}
                    name="Heart Rate (BPM)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Missed Dose Alert Feed & Care Communication */}
        <div className="space-y-6">
          {/* MISSED DOSE ALERT FEED */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Care Alert Center
                </h3>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {missedDoseAlerts.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50 border-rose-300'
                      : alert.severity === 'high'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-xs">{alert.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{alert.message}</p>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => {
                        setMessageTarget('doctor');
                        setMessageModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-sky-700 hover:text-sky-900"
                    >
                      Contact Care Team
                    </button>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-sky-50 rounded-2xl border border-sky-200 text-[11px] text-sky-900">
              <strong>Patient-Controlled Visibility:</strong> Eleanor has authorized full real-time notification sharing for all cardiac & diabetes medications.
            </div>
          </div>

          {/* CLINICAL COMMUNICATION CHANNELS */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-900 mb-3">
              Direct Care Contacts
            </h3>

            <div className="space-y-2.5">
              {/* Doctor */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Dr. Maya Rao, MD</div>
                  <div className="text-[11px] text-slate-500">Attending Cardiologist</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href="tel:+15559124422"
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title="Call Doctor"
                  >
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  </a>
                  <button
                    onClick={() => {
                      setMessageTarget('doctor');
                      setMessageModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                    title="Message Doctor"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Pharmacy */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">MediCare Central Pharmacy</div>
                  <div className="text-[11px] text-slate-500">PharmD Marcus Chen</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href="tel:+15557203300"
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title="Call Pharmacy"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                  <button
                    onClick={() => {
                      setMessageTarget('pharmacy');
                      setMessageModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    title="Message Pharmacy"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOG VITALS MODAL */}
      {addVitalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-sky-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-sky-400" />
                <h3 className="font-display font-bold text-lg text-white">Record Vitals Entry</h3>
              </div>
              <button
                onClick={() => setAddVitalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vitalForm.systolicBP}
                    onChange={(e) => setVitalForm({ ...vitalForm, systolicBP: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vitalForm.diastolicBP}
                    onChange={(e) => setVitalForm({ ...vitalForm, diastolicBP: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={vitalForm.heartRate}
                    onChange={(e) => setVitalForm({ ...vitalForm, heartRate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalForm.weightKg}
                    onChange={(e) => setVitalForm({ ...vitalForm, weightKg: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-bold mb-1">Patient Mood</label>
                <select
                  value={vitalForm.mood}
                  onChange={(e) => setVitalForm({ ...vitalForm, mood: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value="Excellent">Excellent - Feeling energized</option>
                  <option value="Good">Good - Stable, no complaints</option>
                  <option value="Fair">Fair - Mild fatigue</option>
                  <option value="Poor">Poor - Lethargy or distress</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-bold mb-1">Observation Note</label>
                <input
                  type="text"
                  value={vitalForm.notes}
                  onChange={(e) => setVitalForm({ ...vitalForm, notes: e.target.value })}
                  placeholder="e.g. Measured after morning walk"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddVitalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md"
                >
                  Save to Shared State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMERGENCY SOS CONFIRMATION MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-300 overflow-hidden">
            <div className="p-5 bg-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
                <h3 className="font-display font-extrabold text-lg">EMERGENCY SOS DISPATCH</h3>
              </div>
              <button
                onClick={() => setSosModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Demo GPS Location: 37.7749° N, 122.4194° W</span>
                </div>
                <p className="text-[11px] text-rose-800">
                  {patient.emergencyAddress} (Simulated coordinates broadcasted)
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">Target Dependent:</div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {patient.name} ({patient.age} y/o) • Medical ID: {patient.medicalId}
                </p>

                <div className="font-bold text-slate-800 pt-1">Active Medication Chart Transmitted:</div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-700">
                  {medications.map((m) => (
                    <div key={m.id}>• {m.name} {m.dosage} ({m.frequency})</div>
                  ))}
                </div>

                <div className="font-bold text-slate-800 pt-1">Emergency Contacts:</div>
                <p className="text-[11px] text-slate-600">
                  Primary: Daniel Vance ({patient.caregiverPhone}) • Secondary: St. Jude 24/7 ER Dispatch
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <strong>Simulation Notice:</strong> This is a prototype hackathon demo. No real emergency response or 911 calls are placed.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  id="confirm-dispatch-sos-button"
                  onClick={() => {
                    triggerEmergencySos();
                    setSosModalOpen(false);
                  }}
                  className="px-6 py-3 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
                >
                  Dispatch SOS Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGING MODAL */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Message {messageTarget === 'doctor' ? 'Dr. Maya Rao' : 'MediCare Pharmacy'}
                </h3>
              </div>
              <button
                onClick={() => setMessageModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-600 font-bold mb-1">Your Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Send secure update regarding Eleanor Vance...`}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
