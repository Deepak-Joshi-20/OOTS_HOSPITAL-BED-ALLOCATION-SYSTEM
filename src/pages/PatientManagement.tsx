import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Eye,
  BedDouble,
  HeartPulse,
  X,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import {
  AcuityLevel,
  PatientRecord,
  PatientStatus,
  WardType,
} from '../types/hospital';

export const PatientManagement: React.FC = () => {
  const { patients, registerPatient, dischargePatient } = useHospital();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientStatus>('All');
  const [acuityFilter, setAcuityFilter] = useState<'All' | AcuityLevel>('All');

  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    null
  );
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Registration form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(52);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [diagnosis, setDiagnosis] = useState('');
  const [acuity, setAcuity] = useState<AcuityLevel>('High');
  const [requiredWardType, setRequiredWardType] = useState<WardType>('Cardiac');
  const [needsVentilator, setNeedsVentilator] = useState(false);
  const [needsIsolation, setNeedsIsolation] = useState(false);
  const [physician, setPhysician] = useState('Dr. Julian Sterling');
  const [phone, setPhone] = useState('+1 (555) 482-9910');

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.attendingPhysician.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesAcuity = acuityFilter === 'All' || p.acuity === acuityFilter;
      return matchesSearch && matchesStatus && matchesAcuity;
    });
  }, [patients, search, statusFilter, acuityFilter]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !diagnosis.trim()) return;

    registerPatient({
      name: name.trim(),
      age: Number(age),
      gender,
      bloodGroup,
      diagnosis: diagnosis.trim(),
      acuity,
      requiredWardType,
      needsVentilator,
      needsIsolation,
      attendingPhysician: physician,
      contactPhone: phone,
      vitals: {
        heartRate: acuity === 'Critical' ? 112 : 82,
        spo2: acuity === 'Critical' ? 92 : 98,
        bp: '128/82',
        tempC: 37.1,
      },
      addToWaitingList: true,
    });

    setName('');
    setDiagnosis('');
    setRegisterModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#111A35] to-[#202B52] text-white p-6 shadow-md">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">
            Patient Directory &amp; Clinical Profiles
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE6FA] mt-1 font-medium">
            Manage admitted inpatients, waiting placements, and clinical acuity records.
          </p>
        </div>

        {hasPermission('manage_patients') && (
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] hover:bg-[#3256C9] px-4 py-2.5 text-xs font-bold text-white shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register Patient</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-2xs">
        <div className="md:col-span-5 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6582]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, MRN, diagnosis, or physician..."
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 pl-9 pr-4 py-2 text-xs text-[#252D43] focus:border-[#4169E1] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-1 bg-[#E9EFF8] p-1 rounded-xl">
          {(['All', 'Admitted', 'Waiting', 'Discharged'] as const).map((st) => (
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
          ))}
        </div>

        <div className="md:col-span-3">
          <select
            value={acuityFilter}
            onChange={(e) =>
              setAcuityFilter(e.target.value as 'All' | AcuityLevel)
            }
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 px-3 py-2 text-xs font-bold text-[#252D43]"
          >
            <option value="All">All Acuity Levels</option>
            <option value="Critical">Critical Acuity</option>
            <option value="High">High Acuity</option>
            <option value="Moderate">Moderate Acuity</option>
            <option value="Stable">Stable</option>
          </select>
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="rounded-3xl border border-[#D5E0F2] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5E0F2] bg-[#111A35] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Patient &amp; MRN</th>
                <th className="py-3.5 px-4">Primary Diagnosis</th>
                <th className="py-3.5 px-4">Acuity &amp; Care Needs</th>
                <th className="py-3.5 px-4">Status &amp; Bed</th>
                <th className="py-3.5 px-4">Attending Physician</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E9F5]">
              {filteredPatients.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#E9EFF8]/60 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-sm text-[#252D43]">
                      {p.name}
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-[#5A6582] mt-0.5">
                      {p.mrn} · {p.age}y · {p.gender} · Blood {p.bloodGroup}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-[#252D43] line-clamp-1">
                      {p.diagnosis}
                    </div>
                    <div className="text-[11px] text-[#5A6582] font-mono font-medium mt-0.5">
                      HR {p.vitals.heartRate} bpm · SpO2 {p.vitals.spo2}% · BP{' '}
                      {p.vitals.bp}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          p.acuity === 'Critical'
                            ? 'bg-[#C4382B] text-white'
                            : p.acuity === 'High'
                            ? 'bg-[#5641A6] text-white'
                            : 'bg-[#E9EFF8] text-[#2850C8] border border-[#D5E0F2]'
                        }`}
                      >
                        {p.acuity}
                      </span>
                      <span className="font-semibold text-[#252D43]">
                        {p.requiredWardType}
                      </span>
                      {p.needsVentilator && (
                        <span className="rounded-md bg-[#FFE3D9] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#B83227]">
                          Vent
                        </span>
                      )}
                      {p.needsIsolation && (
                        <span className="rounded-md bg-[#E8E4FF] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#523B9E]">
                          Iso
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#252D43]">{p.status}</div>
                    <div className="text-[11px] font-mono font-bold text-[#4169E1] mt-0.5">
                      {p.assignedBedId
                        ? `${p.assignedBedId} (${p.assignedWardName})`
                        : p.status === 'Waiting'
                        ? 'In Waiting Queue'
                        : 'Released'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#252D43] font-semibold">
                    {p.attendingPhysician}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#D5E0F2] bg-white px-2.5 py-1.5 font-bold text-[#252D43] hover:bg-[#E8E4FF] cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#4169E1]" />
                        <span>Profile</span>
                      </button>

                      {p.status === 'Waiting' &&
                        hasPermission('allocate_beds') && (
                          <button
                            onClick={() => navigate('/allocation')}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#4169E1] px-2.5 py-1.5 font-bold text-white hover:bg-[#3256C9] cursor-pointer"
                          >
                            <BedDouble className="h-3.5 w-3.5" />
                            <span>Assign Bed</span>
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-4">
              <div>
                <div className="font-mono text-[#4169E1] font-bold">
                  {selectedPatient.mrn} · {selectedPatient.acuity} Acuity
                </div>
                <h3 className="text-lg font-bold text-[#252D43] font-display">
                  {selectedPatient.name} ({selectedPatient.age}y ·{' '}
                  {selectedPatient.gender})
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-lg text-[#5A6582] hover:bg-[#E9EFF8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="rounded-2xl bg-[#E9EFF8] p-3">
                <div className="text-[#5A6582]">Heart Rate</div>
                <div className="mt-1 text-base font-bold font-mono text-[#252D43]">
                  {selectedPatient.vitals.heartRate} bpm
                </div>
              </div>
              <div className="rounded-2xl bg-[#E9EFF8] p-3">
                <div className="text-[#5A6582]">SpO2</div>
                <div className="mt-1 text-base font-bold font-mono text-[#4169E1]">
                  {selectedPatient.vitals.spo2}%
                </div>
              </div>
              <div className="rounded-2xl bg-[#E9EFF8] p-3">
                <div className="text-[#5A6582]">Blood Pressure</div>
                <div className="mt-1 text-base font-bold font-mono text-[#8975D5]">
                  {selectedPatient.vitals.bp}
                </div>
              </div>
              <div className="rounded-2xl bg-[#E9EFF8] p-3">
                <div className="text-[#414C66] font-semibold">Temp</div>
                <div className="mt-1 text-base font-bold font-mono text-[#B83227]">
                  {selectedPatient.vitals.tempC} °C
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#E8E4FF]/55 p-4 space-y-2">
              <div>
                <span className="font-bold text-[#252D43]">Diagnosis: </span>
                <span>{selectedPatient.diagnosis}</span>
              </div>
              <div>
                <span className="font-bold text-[#252D43]">
                  Assigned Location:{' '}
                </span>
                <span className="font-mono text-[#2850C8] font-bold">
                  {selectedPatient.assignedBedId
                    ? `${selectedPatient.assignedBedId} (${selectedPatient.assignedWardName})`
                    : 'Unassigned (Waiting List)'}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#252D43]">
                  Attending Physician:{' '}
                </span>
                <span>{selectedPatient.attendingPhysician}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedPatient.status === 'Admitted' &&
                hasPermission('manage_discharges') && (
                  <button
                    onClick={() => {
                      dischargePatient(
                        selectedPatient.id,
                        'Recovered · Home',
                        'Discharged from Patient Profile view.'
                      );
                      setSelectedPatient(null);
                    }}
                    className="rounded-xl bg-[#FFE3D9] hover:bg-[#C4382B] px-4 py-2 font-bold text-[#B83227] hover:text-white transition-colors cursor-pointer"
                  >
                    Process Discharge &amp; Release Bed
                  </button>
                )}
              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-xl bg-[#111A35] px-4 py-2 font-semibold text-white"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Patient Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-[#4169E1]" />
                <h3 className="text-base font-bold text-[#252D43] font-display">
                  Register Patient &amp; Queue for Bed Allocation
                </h3>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jonas Lindholm"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={115}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as 'Female' | 'Male' | 'Other')
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Clinical Acuity
                  </label>
                  <select
                    value={acuity}
                    onChange={(e) => setAcuity(e.target.value as AcuityLevel)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-bold"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Stable">Stable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Primary Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g., Acute Pulmonary Edema requiring BiPAP"
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Required Ward Type
                  </label>
                  <select
                    value={requiredWardType}
                    onChange={(e) =>
                      setRequiredWardType(e.target.value as WardType)
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  >
                    <option value="ICU">ICU (Critical Care)</option>
                    <option value="Cardiac">Cardiac &amp; Telemetry</option>
                    <option value="Surgical">Surgical Recovery</option>
                    <option value="General">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Maternity">Maternity</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    value={physician}
                    onChange={(e) => setPhysician(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsVentilator}
                    onChange={(e) => setNeedsVentilator(e.target.checked)}
                    className="accent-[#4169E1]"
                  />
                  <span className="font-semibold text-[#252D43]">
                    Requires Ventilator Support
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsIsolation}
                    onChange={(e) => setNeedsIsolation(e.target.checked)}
                    className="accent-[#8975D5]"
                  />
                  <span className="font-semibold text-[#252D43]">
                    Requires Isolation Room
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E9F5]">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-5 py-2 font-bold text-white"
                >
                  Register &amp; Add to Waiting List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
