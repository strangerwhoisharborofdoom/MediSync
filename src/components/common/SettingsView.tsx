import React from 'react';
import { useApp } from '../../context/AppContext';
import { LanguageCode } from '../../types';
import { Settings, Globe, Eye, ShieldCheck, Bell, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    language,
    changeLanguage,
    highContrastMode,
    setHighContrastMode,
    largeTextMode,
    setLargeTextMode,
    activeRole,
    addToast,
    t,
  } = useApp();

  const languages: { code: LanguageCode; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'zh', name: '中文 (Mandarin)' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl text-white flex items-center justify-between shadow-md">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            {t.settings} & Accessibility
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Language preferences, high-contrast vision modes, and privacy sharing controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900">
            <Globe className="w-5 h-5 text-teal-600" />
            <h3>Language Selection</h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time interface translation across all four dashboards.
          </p>

          <div className="space-y-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  changeLanguage(l.code);
                  addToast(`Language updated to ${l.name}`, 'info');
                }}
                className={`w-full p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  language === l.code
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{l.name}</span>
                {language === l.code && <Check className="w-4 h-4 text-teal-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility & Visual Modes */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-slate-900">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3>Vision & Accessibility</h3>
          </div>
          <p className="text-xs text-slate-500">
            Adapted for seniors, low-vision patients and clinical ergonomics.
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">High Contrast Mode</div>
                <div className="text-[11px] text-slate-500">Increases border contrast & darkens text</div>
              </div>
              <input
                type="checkbox"
                checked={highContrastMode}
                onChange={(e) => setHighContrastMode(e.target.checked)}
                className="w-5 h-5 accent-teal-600 rounded-md cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Large Font Size</div>
                <div className="text-[11px] text-slate-500">Enlarges headings and button text</div>
              </div>
              <input
                type="checkbox"
                checked={largeTextMode}
                onChange={(e) => setLargeTextMode(e.target.checked)}
                className="w-5 h-5 accent-teal-600 rounded-md cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy & Sharing Controls */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Patient-Controlled Visibility</span>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
              <div>• <strong>Daniel Vance (Caregiver):</strong> Granted live dose alerts & biometrics.</div>
              <div>• <strong>Dr. Maya Rao (Doctor):</strong> Granted longitudinal adherence logs.</div>
              <div>• <strong>MediCare Central:</strong> Granted real-time auto-refill triggers.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
