import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Search,
  UserPlus,
  Calendar,
  Clock,
  Phone,
  Mail,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DoctorAvailability } from '../types/hospital';

export const DoctorManagement: React.FC = () => {
  const { doctors, departments, patients, addDoctor, updateDoctorAvailability } =
    useHospital();
  const { hasPermission } = useAuth();
  const { isBlossom } = useTheme();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState<'All' | DoctorAvailability>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Add Doctor Form State
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState(
    departments[0]?.name || 'General Medicine'
  );
  const [qualification, setQualification] = useState('MD, FACP');
  const [experienceYears, setExperienceYears] = useState(10);
  const [consultationFee, setConsultationFee] = useState(200);
  const [scheduleDays, setScheduleDays] = useState('Mon – Fri');
  const [shiftHours, setShiftHours] = useState('08:30 AM – 05:00 PM');
  const [roomNumber, setRoomNumber] = useState('Suite 210 · South Wing');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) 210-4490');

  const departmentOptions = useMemo(() => {
    const names = new Set(departments.map((d) => d.name));
    doctors.forEach((doc) => names.add(doc.department));
    return Array.from(names);
  }, [departments, doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        doc.qualification.toLowerCase().includes(q);
      const matchesDept =
        deptFilter === 'All' || doc.department === deptFilter;
      const matchesAvail =
        availFilter === 'All' || doc.availability === availFilter;
      return matchesSearch && matchesDept && matchesAvail;
    });
  }, [doctors, search, deptFilter, availFilter]);

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialization.trim()) return;
    addDoctor({
      name: name.trim().startsWith('Dr.')
        ? name.trim()
        : `Dr. ${name.trim()}`,
      specialization: specialization.trim(),
      department,
      qualification: qualification.trim() || 'MD',
      experienceYears: Number(experienceYears) || 5,
      consultationFee: Number(consultationFee) || 180,
      availability: 'Available',
      scheduleDays: scheduleDays.trim() || 'Mon – Fri',
      shiftHours: shiftHours.trim() || '09:00 AM – 05:00 PM',
      roomNumber: roomNumber.trim() || 'Suite 200',
      email:
        email.trim() ||
        `${name.toLowerCase().replace(/[^a-z]/g, '.')}@blossomcare-hospital.org`,
      phone: phone.trim() || '+1 (555) 210-4400',
    });
    setName('');
    setSpecialization('');
    setEmail('');
    setModalOpen(false);
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
            Doctor Directory &amp; Clinical Schedules
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
            Attending physicians, medical specializations, duty rosters, and outpatient consultation availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/appointments')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
          {hasPermission('manage_staff') && (
            <button
              onClick={() => setModalOpen(true)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer ${
                isBlossom
                  ? 'bg-[#B98CA7] hover:bg-[#a67893]'
                  : 'bg-[#4169E1] hover:bg-[#3256C9]'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Attending Doctor</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Registered Doctors
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#252D43]">
            {doctors.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Available for Consult
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#2850C8]">
            {doctors.filter((d) => d.availability === 'Available').length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            In Consultation / On Call
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#754C68]">
            {
              doctors.filter(
                (d) =>
                  d.availability === 'In Consultation' ||
                  d.availability === 'On Call'
              ).length
            }
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Clinical Departments
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#252D43]">
            {departmentOptions.length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-2xs">
        <div className="md:col-span-5 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6582]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name, specialization, qualification, or department..."
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 pl-9 pr-4 py-2 text-xs text-[#252D43] focus:border-[#4169E1] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 px-3 py-2 text-xs font-bold text-[#252D43]"
          >
            <option value="All">All Hospital Departments</option>
            {departmentOptions.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={availFilter}
            onChange={(e) =>
              setAvailFilter(e.target.value as 'All' | DoctorAvailability)
            }
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 px-3 py-2 text-xs font-bold text-[#252D43]"
          >
            <option value="All">All Availability States</option>
            <option value="Available">Available</option>
            <option value="In Consultation">In Consultation</option>
            <option value="On Call">On Call</option>
            <option value="Off Duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="rounded-3xl border border-[#D5E0F2] bg-white p-10 text-center text-xs text-[#5A6582]">
          No doctors match the current search or department filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => {
            const assignedCount = patients.filter(
              (p) =>
                p.attendingPhysician.toLowerCase() === doc.name.toLowerCase() &&
                p.status !== 'Discharged'
            ).length;

            return (
              <div
                key={doc.id}
                className="rounded-3xl border border-[#D5E0F2] bg-white p-6 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold ${
                          isBlossom ? 'bg-[#754C68]' : 'bg-[#202B52]'
                        }`}
                      >
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-[#252D43] truncate">
                          {doc.name}
                        </h3>
                        <div className="text-xs font-semibold text-[#4169E1] truncate">
                          {doc.specialization}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        doc.availability === 'Available'
                          ? 'bg-[#E8E4FF] text-[#2850C8]'
                          : doc.availability === 'In Consultation'
                          ? 'bg-[#FFE3D9] text-[#B83227]'
                          : doc.availability === 'On Call'
                          ? 'bg-[#F5E9E8] text-[#754C68]'
                          : 'bg-[#E9EFF8] text-[#5A6582]'
                      }`}
                    >
                      {doc.availability}
                    </span>
                  </div>

                  <div className="text-xs text-[#5A6582] space-y-1 pt-1 border-t border-[#E9EFF8]">
                    <div>
                      <strong className="text-[#252D43]">Department:</strong>{' '}
                      {doc.department} · {doc.roomNumber}
                    </div>
                    <div>
                      <strong className="text-[#252D43]">Credentials:</strong>{' '}
                      {doc.qualification} · {doc.experienceYears} yrs exp.
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#4169E1] shrink-0" />
                      <span>
                        {doc.scheduleDays} · {doc.shiftHours}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3 text-[#5A6582]" />
                        {doc.phone}
                      </span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 text-[#5A6582]" />
                        {doc.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E9EFF8] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5A6582]">
                      Active Inpatients:{' '}
                      <strong className="font-mono text-[#252D43]">
                        {assignedCount}
                      </strong>
                    </span>
                    <span className="font-mono font-bold text-[#252D43] tabular-nums">
                      ${doc.consultationFee} / consult
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={doc.availability}
                      onChange={(e) =>
                        updateDoctorAvailability(
                          doc.id,
                          e.target.value as DoctorAvailability
                        )
                      }
                      aria-label={`Update availability for ${doc.name}`}
                      className="flex-1 rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-2.5 py-1.5 text-xs font-semibold text-[#252D43]"
                    >
                      <option value="Available">Status: Available</option>
                      <option value="In Consultation">
                        Status: In Consultation
                      </option>
                      <option value="On Call">Status: On Call</option>
                      <option value="Off Duty">Status: Off Duty</option>
                    </select>

                    <button
                      onClick={() => navigate('/appointments')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold text-white cursor-pointer whitespace-nowrap ${
                        isBlossom
                          ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                          : 'bg-[#4169E1] hover:bg-[#3256C9]'
                      }`}
                    >
                      Schedule Visit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-[#4169E1]" />
                <h3 className="text-base font-bold text-[#252D43]">
                  Register New Attending Physician
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Physician Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Dr. Sophia Al-Mansoor"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Clinical Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g., Neurology & Stroke Care"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Hospital Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  >
                    {departmentOptions.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Medical Qualification
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Experience (Yrs)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={55}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Consult Fee ($)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Suite / Room
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Duty Days
                  </label>
                  <input
                    type="text"
                    value={scheduleDays}
                    onChange={(e) => setScheduleDays(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Shift Hours
                  </label>
                  <input
                    type="text"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Hospital Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@blossomcare-hospital.org"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E9F5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-5 py-2 font-bold text-white cursor-pointer"
                >
                  Save Physician Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
