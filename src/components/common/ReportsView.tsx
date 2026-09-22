import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileBarChart, Download, CheckCircle2, TrendingUp, ShieldCheck, Printer } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ReportsView: React.FC = () => {
  const { patient, medications, vitals, addToast } = useApp();

  const adherenceMonthly = [
    { week: 'Week 1', adherence: 96 },
    { week: 'Week 2', adherence: 91 },
    { week: 'Week 3', adherence: 94 },
    { week: 'Week 4 (Current)', adherence: patient.adherenceRate },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Clinical Quality Measures
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Medication Adherence & Outcomes Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Longitudinal summary for clinical reviews, insurers, and care continuity.
          </p>
        </div>

        <button
          onClick={() => addToast('Exporting HIPAA compliant PDF Summary...', 'success')}
          className="px-5 py-3 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Clinical PDF</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase">Medication Possession Ratio</div>
          <div className="text-3xl font-extrabold font-display text-teal-600 mt-1">0.94</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Compliant with CMS Star Rating Threshold
          </div>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase">30-Day Mean Adherence</div>
          <div className="text-3xl font-extrabold font-display text-indigo-600 mt-1">
            {patient.adherenceRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">14-Day Perfect Streak</div>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase">Blood Pressure Control</div>
          <div className="text-3xl font-extrabold font-display text-slate-900 mt-1">124/79</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Target Systolic &lt; 130 achieved</div>
        </div>
      </div>

      {/* Adherence Chart */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="font-display font-bold text-base text-slate-900 mb-2">
          Monthly Adherence Trend by Week
        </h3>
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adherenceMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(val: any) => [`${val}%`, 'Adherence']} />
              <Bar dataKey="adherence" fill="#4338ca" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
