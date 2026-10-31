import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  Bed,
  UserCheck,
  X,
  Calendar,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { AcuityLevel, WardType } from '../types/hospital';

export const Admissions: React.FC = () => {
  const { admissions, beds, registerPatient, allocateBedToPatient } =
    useHospital();
  const { hasPermission } = useAuth();

  const canAdmit = hasPermission('create_admissions');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Completed'>(
    'ALL'
  );
  const [showDirectModal, setShowDirectModal] = useState(false);

  // Direct Admission Form
  const [name, setName] = useState('');
  const [age, setAge] = useState(52);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [diagnosis, setDiagnosis] = useState('');
  const [acuity, setAcuity] = useState<AcuityLevel>('High');
  const [requiredWardType, setRequiredWardType] = useState<WardType>('Cardiac');
  const [attendingPhysician, setAttendingPhysician] = useState('Dr. Marcus Vance');
  const [selectedBedId, setSelectedBedId] = useState('');

  const availableBeds = useMemo(
    () => beds.filter((b) => b.status === 'Available'),
    [beds]
  );

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      if (statusFilter !== 'ALL' && adm.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          adm.patientName.toLowerCase().includes(q) ||
          adm.mrn.toLowerCase().includes(q) ||
          adm.bedId.toLowerCase().includes(q) ||
          adm.wardName.toLowerCase().includes(q) ||
          adm.diagnosis.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [admissions, statusFilter, search]);

  const handleDirectAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !diagnosis.trim()) return;

    const targetBed =
      selectedBedId || availableBeds[0]?.id || '';

    const createdPatient = registerPatient({
      name: name.trim(),
      age,
      gender,
      bloodGroup,
      diagnosis: diagnosis.trim(),
      acuity,
      requiredWardType,
      needsVentilator: acuity === 'Critical',
      needsIsolation: false,
      attendingPhysician,
      contactPhone: '+1 (555) 602-8841',
      vitals: {
        heartRate: 92,
        spo2: 96,
        bp: '132/84',
        tempC: 37.2,
      },
      addToWaitingList: !targetBed,
    });

    if (targetBed) {
      allocateBedToPatient(createdPatient.id, targetBed);
    }

    setName('');
    setDiagnosis('');
    setShowDirectModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#263566] p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4169E1]/25 border border-[#619BFF]/40 px-3 py-1 text-[11px] font-semibold text-[#E8E4FF] mb-2">
            <ClipboardCheck className="h-3.5 w-3.5 text-[#619BFF]" />
            <span>INPATIENT ADMISSIONS REGISTRY</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Patient Admissions Log
          </h1>
          <p className="text-xs text-[#A5B4D4] mt-0.5">
            Complete record of active and completed hospital bed admissions, attending physicians, and assigned units.
          </p>
        </div>

        {canAdmit && (
          <button
            onClick={() => {
              setSelectedBedId(availableBeds[0]?.id || '');
              setShowDirectModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#619BFF] hover:from-[#3358D4] hover:to-[#4B89FF] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Direct Admission</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#7F8CA8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admissions by patient, MRN, bed number, or ward..."
            className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] pl-10 pr-4 py-2 text-xs text-[#252D43] focus:outline-none focus:border-[#4169E1]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'Active', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#202B52] text-white'
                  : 'bg-[#F4F7FC] text-[#5A6582] hover:bg-[#E9EFF8]'
              }`}
            >
              {st === 'ALL' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Admissions Table */}
      <div className="rounded-3xl bg-white border border-[#D5E0F2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111A35] text-white text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Admission ID</th>
                <th className="py-3.5 px-4 font-semibold">Patient</th>
                <th className="py-3.5 px-4 font-semibold">Bed & Ward</th>
                <th className="py-3.5 px-4 font-semibold">Clinical Diagnosis</th>
                <th className="py-3.5 px-4 font-semibold">Acuity</th>
                <th className="py-3.5 px-4 font-semibold">Attending Physician</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EFF8] text-xs">
              {filteredAdmissions.map((adm) => (
                <tr
                  key={adm.id}
                  className="hover:bg-[#F4F7FC] transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#4169E1]">
                    {adm.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#252D43]">
                      {adm.patientName}
                    </div>
                    <div className="text-[11px] font-mono text-[#6E7A99]">
                      {adm.mrn}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#202B52] px-2.5 py-1 text-[11px] font-mono font-bold text-white">
                      <Bed className="h-3 w-3 text-[#619BFF]" />
                      {adm.bedId}
                    </span>
                    <div className="text-[11px] text-[#5A6582] mt-0.5">
                      {adm.wardName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#252D43]">
                    {adm.diagnosis}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                        adm.acuity === 'Critical'
                          ? 'bg-[#FFE3D9] text-[#C03C32]'
                          : adm.acuity === 'High'
                          ? 'bg-[#E8E4FF] text-[#5B45B0]'
                          : 'bg-[#E9EFF8] text-[#4169E1]'
                      }`}
                    >
                      {adm.acuity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#252D43]">
                    <div>{adm.attendingPhysician}</div>
                    <div className="text-[10px] text-[#7F8CA8]">
                      By: {adm.admittedBy}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#5A6582]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#8975D5]" />
                      {adm.admittedAt}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        adm.status === 'Active'
                          ? 'bg-[#E9EFF8] text-[#4169E1]'
                          : 'bg-[#E8E4FF] text-[#6B54C4]'
                      }`}
                    >
                      <UserCheck className="h-3 w-3" />
                      {adm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Admission Modal */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#D5E0F2] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#111A35] to-[#202B52] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-base font-bold font-display">
                New Direct Patient Admission
              </h3>
              <button
                onClick={() => setShowDirectModal(false)}
                className="rounded-lg p-1 text-[#A5B4D4] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDirectAdmission} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Clara Oswald"
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                      Blood
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-2 py-2 text-xs text-[#252D43]"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(
                        (bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Clinical Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g., Post-Operative Thoracic Observation"
                  className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Acuity
                  </label>
                  <select
                    value={acuity}
                    onChange={(e) => setAcuity(e.target.value as AcuityLevel)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Stable">Stable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Specialty Ward
                  </label>
                  <select
                    value={requiredWardType}
                    onChange={(e) =>
                      setRequiredWardType(e.target.value as WardType)
                    }
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  >
                    <option value="ICU">ICU</option>
                    <option value="Cardiac">Cardiac</option>
                    <option value="Surgical">Surgical</option>
                    <option value="General">General</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Maternity">Maternity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Assign Available Bed
                  </label>
                  <select
                    value={selectedBedId}
                    onChange={(e) => setSelectedBedId(e.target.value)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs font-semibold text-[#4169E1]"
                  >
                    {availableBeds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bedNumber} ({b.wardName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    value={attendingPhysician}
                    onChange={(e) => setAttendingPhysician(e.target.value)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as 'Female' | 'Male' | 'Other')
                    }
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E9EFF8]">
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] hover:bg-[#3358D4] px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Complete Direct Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
