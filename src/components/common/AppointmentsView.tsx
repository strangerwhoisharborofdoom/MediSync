import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  X,
  Sparkles,
  CalendarCheck,
  Ban,
  Filter,
} from 'lucide-react';
import { Appointment } from '../../types';

export const AppointmentsView: React.FC = () => {
  const { appointments, addAppointment, cancelAppointment, patient, addToast, activeRole } = useApp();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Form states for booking
  const [provider, setProvider] = useState('Dr. Maya Rao, MD (Cardiology)');
  const [date, setDate] = useState('2026-10-28');
  const [time, setTime] = useState('10:00 AM');
  const [visitType, setVisitType] = useState<Appointment['type']>('Telehealth Video');
  const [notes, setNotes] = useState('Routine review of blood pressure log and medication tolerance.');

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const isPharmacy = provider.includes('Marcus');
    addAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: isPharmacy ? 'ph-77192' : 'd-48201',
      doctorName: provider,
      department: isPharmacy ? 'Pharmacy Therapy Management' : 'Cardiology & Internal Medicine',
      dateTime: `${date} at ${time}`,
      type: visitType,
      status: 'upcoming',
      location: visitType === 'Telehealth Video' ? 'MediSync Encrypted Video Portal' : 'Suite 400, St. Jude Medical Pavilion',
    });
    setIsBookModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Care Coordination
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Patient: {patient.name}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Clinical Appointments & Follow-ups
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Synchronized clinical encounters across doctor, patient & caregiver.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-5 py-3 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Encounter</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter Status:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {status} ({status === 'all' ? appointments.length : appointments.filter(a => a.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">No encounters match filter</div>
            <p className="text-xs text-slate-400 mt-1">Click "Schedule Encounter" above to book a new appointment.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className={`p-6 bg-white rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                apt.status === 'cancelled' ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  apt.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : apt.status === 'cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-slate-900">{apt.department}</h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      apt.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5" />
                      {apt.doctorName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.dateTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {apt.type === 'Telehealth Video' ? (
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      )}
                      <span>{apt.type}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Location: <strong className="text-slate-800">{apt.location}</strong> • Patient: <span className="font-medium text-slate-700">{apt.patientName}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0">
                {apt.status === 'upcoming' && apt.type === 'Telehealth Video' && (
                  <button
                    onClick={() => addToast('Joining simulated HIPAA Telehealth Room...', 'info')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video Call</span>
                  </button>
                )}
                <button
                  onClick={() => addToast('Appointment synced with your calendar device.', 'success')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Add to Calendar
                </button>
                {apt.status === 'upcoming' && (
                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1"
                  >
                    <Ban className="w-3 h-3" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Encounter Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleConfirmBooking}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Book Follow-Up Visit
              </h3>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select date, care provider, and format for {patient.name}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none focus:border-indigo-500"
                >
                  <option value="Dr. Maya Rao, MD (Cardiology)">Dr. Maya Rao, MD (Cardiology)</option>
                  <option value="PharmD Marcus Chen (Medication Therapy Management)">PharmD Marcus Chen (Medication Therapy Management)</option>
                  <option value="Dr. James Wilson, MD (Internal Medicine)">Dr. James Wilson, MD (Internal Medicine)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Visit Type</label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500"
                >
                  <option value="Telehealth Video">Telehealth Video</option>
                  <option value="In-person Clinic">In-person Clinic</option>
                  <option value="Routine Follow-up">Routine Follow-up</option>
                  <option value="Lab Work">Lab Work</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Clinical Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for consultation..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
