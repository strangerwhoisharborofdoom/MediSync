import React from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  Activity,
  Camera,
  Clock,
  CheckCircle,
  BellRing,
  RefreshCw,
  User,
  Heart,
  Stethoscope,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginAs, t } = useApp();

  const journeySteps = [
    {
      step: '01',
      title: 'SNAP',
      subtitle: 'Prescription Scanning',
      desc: 'AI computer vision extracts medicine, dosage, frequency, and food rules instantly.',
      icon: Camera,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      step: '02',
      title: 'SCHEDULE',
      subtitle: 'Smart Timers & Adaptation',
      desc: 'Adaptive schedule recalculates subsequent doses if a dose is delayed, preventing overdoses.',
      icon: Clock,
      color: 'from-sky-500 to-blue-500',
    },
    {
      step: '03',
      title: 'VERIFY',
      subtitle: 'Visual Pill Check',
      desc: 'Visual shape, color, and imprint matching confirms the right pill before swallowing.',
      icon: CheckCircle,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      step: '04',
      title: 'ALERT',
      subtitle: 'Care-Team Notifications',
      desc: 'Patient-controlled visibility alerts caregivers and physicians when critical doses are missed.',
      icon: BellRing,
      color: 'from-amber-500 to-rose-500',
    },
    {
      step: '05',
      title: 'REFILL',
      subtitle: 'Continuous Supply Engine',
      desc: 'Zero-stockout predictor transmits 1-click refill orders directly to partner pharmacies.',
      icon: RefreshCw,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const roles: {
    role: Role;
    name: string;
    roleLabel: string;
    identifierLabel: string;
    identifier: string;
    desc: string;
    icon: any;
    badgeColor: string;
    buttonColor: string;
  }[] = [
    {
      role: 'patient',
      name: 'Eleanor Vance (Age 67)',
      roleLabel: 'Patient Experience',
      identifierLabel: 'Medical ID',
      identifier: 'MED-20481',
      desc: 'Next medication hero card, adaptive schedule, OCR prescription scan, pill verification & 1-click refill order.',
      icon: User,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      buttonColor: 'bg-teal-600 hover:bg-teal-700 text-white',
    },
    {
      role: 'caregiver',
      name: 'Daniel Vance (Son)',
      roleLabel: 'Caregiver Portal',
      identifierLabel: 'Dependent ID',
      identifier: 'DEP-REL-20481',
      desc: 'Live 92% adherence feed, missed dose alerts, blood pressure / heart rate charts, and simulated Emergency SOS.',
      icon: Heart,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      buttonColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
    {
      role: 'doctor',
      name: 'Dr. Maya Rao, MD (Cardiology)',
      roleLabel: 'Clinical Console',
      identifierLabel: 'Medical License',
      identifier: 'MED-LIC-89410',
      desc: 'Monitored patient cohort, AI progress summary generator, readmission risk gauge & e-Prescriptions with drug interaction checks.',
      icon: Stethoscope,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
      role: 'pharmacy',
      name: 'MediCare Central Community Pharmacy',
      roleLabel: 'Pharmacy Operations',
      identifierLabel: 'Pharmacy License',
      identifier: 'PHARM-LIC-5521',
      desc: 'Live refill dispatch queue, OCR verification workstation, inventory demand forecasting & simulated courier map.',
      icon: Building2,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl text-white tracking-tight">
                  MediSync
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  CONNECTED HEALTHCARE
                </span>
              </div>
              <p className="text-xs text-slate-400">One Simple Care Journey</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loginAs('patient')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
            >
              <span>Launch MediSync</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Intelligent Healthcare Ecosystem • Live Synchronized Care</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            From Prescription to Refill —{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              One Simple Care Journey.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
            Connect patients, caregivers, doctors, and pharmacies through one synchronized,
            intelligent medication care platform.
          </p>

          {/* Direct 1-Click Role Access Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => loginAs('patient')}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2 active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Patient Dashboard</span>
            </button>
            <button
              onClick={() => loginAs('caregiver')}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2 active:scale-95"
            >
              <Heart className="w-4 h-4" />
              <span>Caregiver Portal</span>
            </button>
            <button
              onClick={() => loginAs('doctor')}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Clinical Console</span>
            </button>
            <button
              onClick={() => loginAs('pharmacy')}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Pharmacy Dispatch</span>
            </button>
          </div>
        </div>

        {/* 5-Stage Care Journey Cards */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              The 5-Stage Medication Care Journey
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Transforming fragmented alarms into proactive, synchronized care coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {journeySteps.map((j) => {
              const Icon = j.icon;
              return (
                <div
                  key={j.step}
                  className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                        {j.step}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${j.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="font-display font-bold text-lg text-white mb-1">{j.title}</div>
                    <div className="text-xs font-semibold text-teal-300 mb-2">{j.subtitle}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{j.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Cards for Instant Direct Access */}
        <div>
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Select Your Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              All 4 dashboards share the <strong className="text-teal-300 font-semibold">exact same live application state</strong>. An action in one dashboard immediately propagates to the others.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.role}
                  id={`role-card-${r.role}`}
                  className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 hover:border-teal-500/60 transition-all duration-200 flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-slate-600 flex items-center justify-center text-teal-400">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}
                      >
                        {r.roleLabel}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-white mb-1">{r.name}</h3>

                    {/* Verified credentials indicator */}
                    <div className="my-3 p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-mono">
                      <div className="text-[10px] text-slate-500 uppercase">{r.identifierLabel}</div>
                      <div className="text-teal-400 font-bold">{r.identifier}</div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-6">{r.desc}</p>
                  </div>

                  <button
                    onClick={() => loginAs(r.role)}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${r.buttonColor}`}
                  >
                    <span>Launch {r.roleLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>Encrypted Shared State Architecture • Role-Based Access Control</span>
          </div>
          <p>MediSync © 2026. Connected Healthcare Ecosystem.</p>
        </div>
      </footer>
    </div>
  );
};
