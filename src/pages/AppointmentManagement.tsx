import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useTheme } from '../context/ThemeContext';
import {
  AppointmentStatus,
  AppointmentType,
  HospitalAppointment,
} from '../types/hospital';

const TIME_SLOTS = [
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
];

export const AppointmentManagement: React.FC = () => {
  const {
    appointments,
    patients,
    doctors,
    bookAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
  } = useHospital();
  const { isBlossom } = useTheme();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<HospitalAppointment | null>(null);

  // Booking form state
  const [selectedPatientId, setSelectedPatientId] = useState(
    patients[0]?.id || ''
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    doctors[0]?.id || ''
  );
  const [date, setDate] = useState('2026-11-01');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [aptType, setAptType] = useState<AppointmentType>('Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Reschedule state
  const [reschedDate, setReschedDate] = useState('2026-11-02');
  const [reschedTime, setReschedTime] = useState('10:00 AM');
  const [reschedError, setReschedError] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.mrn.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'All' || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    const patient = patients.find((p) => p.id === selectedPatientId);
    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!patient || !doctor || !reason.trim()) {
      setBookingError('Please select a patient, doctor, and consultation reason.');
      return;
    }

    const result = bookAppointment({
      patientId: patient.id,
      patientName: patient.name,
      mrn: patient.mrn,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      date,
      timeSlot,
      type: aptType,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    });

    if (!result.ok) {
      setBookingError(result.error || 'Unable to book appointment.');
      return;
    }

    setReason('');
    setNotes('');
    setBookModalOpen(false);
    setBookingSuccess(
      `Booked ${aptType} for ${patient.name} with ${doctor.name} on ${date} at ${timeSlot}.`
    );
    setTimeout(() => setBookingSuccess(null), 4000);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    setReschedError(null);
    const res = rescheduleAppointment(
      rescheduleTarget.id,
      reschedDate,
      reschedTime
    );
    if (!res.ok) {
      setReschedError(res.error || 'Conflict detected.');
      return;
    }
    setRescheduleTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl p-6 shadow-md border ${
          isBlossom
            ? 'bg-gradient-to-r from-[#754C68] via-[#67415B] to-[#4E3145] text-[#FAF1E8] border-[#D9B9C8]/40'
            : 'bg-gradient-to-r from-[#111A35] to-[#202B52] text-white border-[#4169E1]/30'
        }`}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            Appointment Scheduling &amp; Outpatient Consultations
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
            Schedule patient consultations, prevent physician double-booking conflicts, and track completed visits.
          </p>
        </div>

        <button
          onClick={() => {
            setBookingError(null);
            setBookModalOpen(true);
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm self-start sm:self-auto cursor-pointer ${
            isBlossom
              ? 'bg-[#B98CA7] hover:bg-[#a67893]'
              : 'bg-[#4169E1] hover:bg-[#3256C9]'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {bookingSuccess && (
        <div className="rounded-2xl border border-[#8975D5]/50 bg-[#E8E4FF] p-4 flex items-center gap-3 text-xs font-semibold text-[#202B52]">
          <CheckCircle2 className="h-4 w-4 text-[#4169E1] shrink-0" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Total Appointments
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#252D43]">
            {appointments.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Scheduled (Upcoming)
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#2850C8]">
            {appointments.filter((a) => a.status === 'Scheduled').length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Completed Consultations
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#754C68]">
            {appointments.filter((a) => a.status === 'Completed').length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">Cancelled</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#B83227]">
            {appointments.filter((a) => a.status === 'Cancelled').length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-2xs">
        <div className="md:col-span-7 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6582]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, MRN, attending doctor, department, or reason..."
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 pl-9 pr-4 py-2 text-xs text-[#252D43] focus:border-[#4169E1] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-5 flex items-center gap-1 bg-[#E9EFF8] p-1 rounded-xl">
          {(['All', 'Scheduled', 'Completed', 'Cancelled'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#111A35] text-white'
                    : 'text-[#252D43] hover:bg-white/70'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="rounded-3xl border border-[#D5E0F2] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5E0F2] bg-[#111A35] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">ID &amp; Schedule</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Doctor &amp; Department</th>
                <th className="py-3.5 px-4">Visit Type &amp; Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E9F5]">
              {filteredAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="hover:bg-[#E9EFF8]/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-[#252D43]">{apt.id}</div>
                    <div className="text-[11px] text-[#4169E1] font-semibold mt-0.5">
                      {apt.date} · {apt.timeSlot}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#252D43]">
                      {apt.patientName}
                    </div>
                    <div className="font-mono text-[11px] text-[#5A6582]">
                      {apt.mrn}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#252D43]">
                      {apt.doctorName}
                    </div>
                    <div className="text-[11px] text-[#5A6582]">
                      {apt.department}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-[#252D43]">
                      {apt.type} · {apt.reason}
                    </div>
                    {apt.notes && (
                      <div className="text-[11px] text-[#5A6582] truncate mt-0.5">
                        Note: {apt.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        apt.status === 'Scheduled'
                          ? 'bg-[#E8E4FF] text-[#2850C8]'
                          : apt.status === 'Completed'
                          ? 'bg-[#F5E9E8] text-[#754C68]'
                          : 'bg-[#FFE3D9] text-[#B83227]'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {apt.status === 'Scheduled' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            updateAppointmentStatus(apt.id, 'Completed')
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-[#4169E1] hover:bg-[#3256C9] px-2.5 py-1.5 font-bold text-white cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => {
                            setRescheduleTarget(apt);
                            setReschedDate(apt.date);
                            setReschedTime(apt.timeSlot);
                            setReschedError(null);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-[#D5E0F2] bg-white hover:bg-[#E9EFF8] px-2.5 py-1.5 font-bold text-[#252D43] cursor-pointer"
                        >
                          <Clock className="h-3.5 w-3.5 text-[#4169E1]" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          onClick={() =>
                            updateAppointmentStatus(apt.id, 'Cancelled')
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-[#FFE3D9] hover:bg-[#C4382B] px-2.5 py-1.5 font-bold text-[#B83227] hover:text-white transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-[#5A6582]">
                        Archived ({apt.status})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#4169E1]" />
                <h3 className="text-base font-bold text-[#252D43]">
                  Schedule Patient Appointment
                </h3>
              </div>
              <button
                onClick={() => setBookModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookingError && (
              <div className="rounded-2xl border border-[#F0A79E] bg-[#FFE3D9] p-3.5 flex items-start gap-2.5 text-[#B83227] font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Select Patient
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-semibold"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.mrn})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Attending Doctor
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-semibold"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Appointment Type
                  </label>
                  <select
                    value={aptType}
                    onChange={(e) =>
                      setAptType(e.target.value as AppointmentType)
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-semibold"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Pre-Surgical">Pre-Surgical</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Clinical Reason for Visit
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Post-Discharge Cardiac Telemetry & Medication Review"
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Preparation / Clinical Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Bring recent lab panel or imaging report"
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E9F5]">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-5 py-2 font-bold text-white cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#D5E0F2] bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <h3 className="text-base font-bold text-[#252D43]">
                Reschedule {rescheduleTarget.id} ({rescheduleTarget.patientName})
              </h3>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reschedError && (
              <div className="rounded-2xl border border-[#F0A79E] bg-[#FFE3D9] p-3 text-[#B83227] font-semibold">
                {reschedError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  New Time Slot
                </label>
                <select
                  value={reschedTime}
                  onChange={(e) => setReschedTime(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-4 py-2 font-bold text-white cursor-pointer"
                >
                  Save New Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
