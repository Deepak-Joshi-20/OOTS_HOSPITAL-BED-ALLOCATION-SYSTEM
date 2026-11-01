import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  BedDouble,
  Phone,
  Plus,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const DepartmentManagement: React.FC = () => {
  const { departments, doctors, appointments, addDepartment } = useHospital();
  const { hasPermission } = useAuth();
  const { isBlossom } = useTheme();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [floor, setFloor] = useState('Level 3');
  const [wing, setWing] = useState('North Wing');
  const [headDoctor, setHeadDoctor] = useState(
    doctors[0]?.name || 'Dr. Elena Vance'
  );
  const [totalBeds, setTotalBeds] = useState(6);
  const [outpatientRooms, setOutpatientRooms] = useState(4);
  const [contactExtension, setContactExtension] = useState('Ext. 4700');
  const [description, setDescription] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState(
    'Diagnostic Consultation, Inpatient Observation'
  );

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    addDepartment({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      floor,
      wing,
      headDoctor,
      totalBeds: Number(totalBeds) || 4,
      outpatientRooms: Number(outpatientRooms) || 4,
      contactExtension: contactExtension.trim() || 'Ext. 4700',
      description:
        description.trim() ||
        'Specialized inpatient and outpatient clinical department.',
      specialties: specialtiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setName('');
    setCode('');
    setDescription('');
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
            Hospital Clinical Departments &amp; Specialties
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
            Emergency &amp; Critical Care, General Medicine, Cardiology, Orthopedics, Pediatrics, and Maternity units.
          </p>
        </div>

        {hasPermission('manage_wards') && (
          <button
            onClick={() => setModalOpen(true)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm self-start sm:self-auto cursor-pointer ${
              isBlossom
                ? 'bg-[#B98CA7] hover:bg-[#a67893]'
                : 'bg-[#4169E1] hover:bg-[#3256C9]'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Add Clinical Department</span>
          </button>
        )}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dep) => {
          const deptDoctors = doctors.filter((d) =>
            d.department.toLowerCase().includes(dep.name.split(' ')[0].toLowerCase())
          );
          const deptAppointments = appointments.filter((a) =>
            a.department.toLowerCase().includes(dep.name.split(' ')[0].toLowerCase())
          );

          return (
            <div
              key={dep.id}
              className="rounded-3xl border border-[#D5E0F2] bg-white p-6 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[#4169E1]">
                      {dep.code} · {dep.floor}
                    </span>
                    <h3 className="text-lg font-bold text-[#252D43] mt-0.5">
                      {dep.name}
                    </h3>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white ${
                      isBlossom ? 'bg-[#754C68]' : 'bg-[#202B52]'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>

                <p className="text-xs text-[#5A6582] leading-relaxed">
                  {dep.description}
                </p>

                <div className="text-xs text-[#252D43] space-y-1 pt-2 border-t border-[#E9EFF8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A6582]">Department Head:</span>
                    <span className="font-bold">{dep.headDoctor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A6582]">Wing Location:</span>
                    <span className="font-semibold">{dep.wing}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A6582]">Station Extension:</span>
                    <span className="font-mono font-semibold inline-flex items-center gap-1">
                      <Phone className="h-3 w-3 text-[#4169E1]" />
                      {dep.contactExtension}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-[11px] font-bold text-[#5A6582] mb-1">
                    Core Clinical Services:
                  </div>
                  <div className="text-xs text-[#252D43]">
                    {dep.specialties.join(' · ')}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E9EFF8] space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-[#F4F7FC] p-2">
                    <div className="text-[10px] text-[#5A6582]">Beds</div>
                    <div className="font-mono font-bold text-[#252D43] tabular-nums">
                      {dep.totalBeds}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F4F7FC] p-2">
                    <div className="text-[10px] text-[#5A6582]">Doctors</div>
                    <div className="font-mono font-bold text-[#2850C8] tabular-nums">
                      {Math.max(1, deptDoctors.length)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F4F7FC] p-2">
                    <div className="text-[10px] text-[#5A6582]">Visits</div>
                    <div className="font-mono font-bold text-[#754C68] tabular-nums">
                      {deptAppointments.length}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => navigate('/doctors')}
                    className="inline-flex items-center gap-1 font-bold text-[#4169E1] hover:underline cursor-pointer"
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>View Doctors</span>
                  </button>
                  <button
                    onClick={() => navigate('/wards')}
                    className="inline-flex items-center gap-1 font-bold text-[#754C68] hover:underline cursor-pointer"
                  >
                    <BedDouble className="h-3.5 w-3.5" />
                    <span>Inpatient Wards</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <h3 className="text-base font-bold text-[#252D43]">
                Register Clinical Department
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Neurology & Neurosurgery"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Dept Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="NEURO-01"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Head Physician
                  </label>
                  <input
                    type="text"
                    value={headDoctor}
                    onChange={(e) => setHeadDoctor(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Floor &amp; Wing
                  </label>
                  <input
                    type="text"
                    value={`${floor} · ${wing}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('·');
                      setFloor(parts[0]?.trim() || 'Level 3');
                      setWing(parts[1]?.trim() || 'North Wing');
                    }}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Inpatient Beds
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Consult Rooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={outpatientRooms}
                    onChange={(e) => setOutpatientRooms(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Extension
                  </label>
                  <input
                    type="text"
                    value={contactExtension}
                    onChange={(e) => setContactExtension(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Department Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe clinical scope and inpatient capabilities..."
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Specialties (comma-separated)
                </label>
                <input
                  type="text"
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                />
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
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
