import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, Clock, User, CheckCircle2 } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
              HIPAA & Compliance Audit Trail
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Immutable Care Event Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time audit log tracking every dose logged, prescription issued, and refill dispatched.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs font-mono text-teal-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Cryptographically Verifiable</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action or ID..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patient Only</option>
            <option value="caregiver">Caregiver Only</option>
            <option value="doctor">Doctor Only</option>
            <option value="pharmacy">Pharmacy Only</option>
            <option value="system">System Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Event Details</th>
                <th className="p-3">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{log.actor}</div>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md ${
                        log.actorRole === 'patient'
                          ? 'bg-teal-100 text-teal-800'
                          : log.actorRole === 'caregiver'
                          ? 'bg-sky-100 text-sky-800'
                          : log.actorRole === 'doctor'
                          ? 'bg-indigo-100 text-indigo-800'
                          : log.actorRole === 'pharmacy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{log.action}</td>
                  <td className="p-3 text-slate-600 max-w-md">{log.details}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
