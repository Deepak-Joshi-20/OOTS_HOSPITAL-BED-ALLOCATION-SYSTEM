import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Plus,
  Bed,
  Wind,
  Shield,
  ArrowRight,
  UserPlus,
  X,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { AcuityLevel, WardType } from '../types/hospital';

export const WaitingList: React.FC = () => {
  const { waitingQueue, registerPatient, getRecommendedBedsForPatient } = useHospital();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canAllocate = hasPermission('allocate_beds');
  const canCreate = hasPermission('manage_patients') || hasPermission('create_admissions');

  const [search, setSearch] = useState('');
  const [acuityFilter, setAcuityFilter] = useState<'ALL' | AcuityLevel>('ALL');
  const [wardFilter, setWardFilter] = useState<'ALL' | WardType>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick Add Queue Patient Form
  const [name, setName] = useState('');
  const [age, setAge] = useState(58);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [diagnosis, setDiagnosis] = useState('');
  const [acuity, setAcuity] = useState<AcuityLevel>('Critical');
  const [requiredWardType, setRequiredWardType] = useState<WardType>('ICU');
  const [needsVentilator, setNeedsVentilator] = useState(true);
  const [needsIsolation, setNeedsIsolation] = useState(false);
  const [attendingPhysician, setAttendingPhysician] = useState('Dr. Helena Vance');
  const [contactPhone, setContactPhone] = useState('+1 (555) 790-2210');

  const filteredQueue = useMemo(() => {
    return waitingQueue
      .filter((item) => {
        if (acuityFilter !== 'ALL' && item.acuity !== acuityFilter) return false;
        if (wardFilter !== 'ALL' && item.requiredWardType !== wardFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            item.patientName.toLowerCase().includes(q) ||
            item.diagnosis.toLowerCase().includes(q) ||
            item.requestingDoctor.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [waitingQueue, acuityFilter, wardFilter, search]);

  const criticalCount = waitingQueue.filter((w) => w.acuity === 'Critical').length;
  const highCount = waitingQueue.filter((w) => w.acuity === 'High').length;
  const ventRequiredCount = waitingQueue.filter((w) => w.needsVentilator).length;

  const handleQuickEnqueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !diagnosis.trim()) return;

    registerPatient({
      name: name.trim(),
      age,
      gender,
      bloodGroup,
      diagnosis: diagnosis.trim(),
      acuity,
      requiredWardType,
      needsVentilator,
      needsIsolation,
      attendingPhysician,
      contactPhone,
      vitals: {
        heartRate: acuity === 'Critical' ? 122 : 88,
        spo2: acuity === 'Critical' ? 90 : 97,
        bp: acuity === 'Critical' ? '164/98' : '124/80',
        tempC: 37.4,
      },
      addToWaitingList: true,
    });

    setName('');
    setDiagnosis('');
    setShowAddModal(false);
  };

  const acuityBadge = (level: AcuityLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-[#FFE3D9] text-[#D94E43] border-[#FF8278]/40';
      case 'High':
        return 'bg-[#E8E4FF] text-[#6B54C4] border-[#8975D5]/40';
      case 'Moderate':
        return 'bg-[#E9EFF8] text-[#4169E1] border-[#619BFF]/40';
      default:
        return 'bg-[#F4F7FC] text-[#5A6582] border-[#D5E0F2]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#263566] p-6 text-white shadow-lg border border-[#4169E1]/30">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FF8278]/20 border border-[#FF8278]/40 px-3 py-1 text-[11px] font-semibold text-[#FFE3D9] mb-2">
            <Clock className="h-3.5 w-3.5 text-[#FF8278]" />
            <span>PRIORITY BED TRIAGE QUEUE</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Priority Waiting List
          </h1>
          <p className="text-xs text-[#A5B4D4] mt-0.5">
            Acuity-ranked inpatient admissions awaiting compatible ward and life-support bed allocation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#619BFF]" />
              <span>Enqueue Patient</span>
            </button>
          )}
          {canAllocate && (
            <button
              onClick={() => navigate('/allocation')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#619BFF] hover:from-[#355CE0] hover:to-[#4B89FF] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
            >
              <Bed className="h-4 w-4" />
              <span>Open Smart Bed Matcher</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E7A99]">
            Total Queued
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-[#252D43]">
              {waitingQueue.length}
            </span>
            <span className="text-[11px] font-semibold text-[#4169E1]">
              Ranked by Priority
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#FFE3D9]/55 border border-[#FF8278]/40 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C03C32]">
            Critical Acuity
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-[#252D43]">
              {criticalCount}
            </span>
            <span className="text-[11px] font-semibold text-[#D94E43]">
              Immediate ICU Need
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#E8E4FF]/65 border border-[#8975D5]/35 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5B45B0]">
            High Acuity
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-[#252D43]">
              {highCount}
            </span>
            <span className="text-[11px] font-semibold text-[#6B54C4]">
              Expedited Placement
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#E9EFF8] border border-[#619BFF]/35 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#3358D4]">
            Ventilator Required
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-[#252D43]">
              {ventRequiredCount}
            </span>
            <span className="text-[11px] font-semibold text-[#4169E1]">
              Mechanical Support
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white border border-[#D5E0F2] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#7F8CA8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search waiting queue by patient name, diagnosis, or physician..."
            className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] pl-10 pr-4 py-2 text-xs text-[#252D43] placeholder-[#7F8CA8] focus:outline-none focus:border-[#4169E1]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'Critical', 'High', 'Moderate', 'Stable'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setAcuityFilter(level)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                acuityFilter === level
                  ? 'bg-[#202B52] text-white shadow-sm'
                  : 'bg-[#F4F7FC] text-[#5A6582] hover:bg-[#E9EFF8]'
              }`}
            >
              {level === 'ALL' ? 'All Acuity' : level}
            </button>
          ))}

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value as 'ALL' | WardType)}
            className="rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-1.5 text-xs font-semibold text-[#252D43] focus:outline-none focus:border-[#4169E1]"
          >
            <option value="ALL">All Ward Types</option>
            <option value="ICU">ICU</option>
            <option value="Cardiac">Cardiac</option>
            <option value="Surgical">Surgical</option>
            <option value="General">General</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Maternity">Maternity</option>
          </select>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#D5E0F2] p-12 text-center">
            <Activity className="h-9 w-9 text-[#8975D5] mx-auto mb-3 opacity-75" />
            <h3 className="text-base font-bold text-[#252D43] font-display">
              No Patients in Waiting Queue
            </h3>
            <p className="text-xs text-[#6E7A99] mt-1">
              All triaged patients matching your current filter have been assigned to hospital beds.
            </p>
          </div>
        ) : (
          filteredQueue.map((item, idx) => {
            const matchingBeds = getRecommendedBedsForPatient({
              requiredWardType: item.requiredWardType,
              needsVentilator: item.needsVentilator,
              needsIsolation: item.needsIsolation,
            });
            const exactWardBeds = matchingBeds.filter(
              (b) => b.wardType === item.requiredWardType
            );

            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-white border p-5 shadow-sm transition-all hover:shadow-md ${
                  item.acuity === 'Critical'
                    ? 'border-l-4 border-l-[#FF8278] border-[#D5E0F2]'
                    : item.acuity === 'High'
                    ? 'border-l-4 border-l-[#8975D5] border-[#D5E0F2]'
                    : 'border-[#D5E0F2]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl font-mono ${
                        item.acuity === 'Critical'
                          ? 'bg-[#FFE3D9] text-[#C03C32]'
                          : 'bg-[#E9EFF8] text-[#202B52]'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold opacity-75">
                        SCORE
                      </span>
                      <span className="text-base font-extrabold leading-none">
                        {item.priorityScore}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#6E7A99]">
                          #{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-[#252D43] font-display">
                          {item.patientName}
                        </h3>
                        <span className="text-xs text-[#6E7A99]">({item.age} yrs)</span>
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${acuityBadge(
                            item.acuity
                          )}`}
                        >
                          {item.acuity} Acuity
                        </span>
                        <span className="inline-flex items-center rounded-lg bg-[#202B52] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          Target: {item.requiredWardType}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-[#252D43] mt-1.5">
                        {item.diagnosis}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#6E7A99]">
                        <span>Requested: {item.requestedAt}</span>
                        <span>•</span>
                        <span>Attending: {item.requestingDoctor}</span>
                        {item.needsVentilator && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#FFE3D9]/70 px-2 py-0.5 font-semibold text-[#C03C32]">
                            <Wind className="h-3 w-3" />
                            Ventilator Required
                          </span>
                        )}
                        {item.needsIsolation && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#E8E4FF] px-2 py-0.5 font-semibold text-[#5B45B0]">
                            <Shield className="h-3 w-3" />
                            Isolation Room
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Compatibility & Action */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E9EFF8]">
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] font-semibold text-[#252D43]">
                        {exactWardBeds.length > 0 ? (
                          <span className="text-[#4169E1]">
                            {exactWardBeds.length} {item.requiredWardType} bed(s) ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#D94E43]">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            0 exact {item.requiredWardType} beds ({matchingBeds.length} overflow)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#7F8CA8]">
                        Best Match: {matchingBeds[0]?.bedNumber || 'None Available'}
                      </div>
                    </div>

                    {canAllocate && (
                      <button
                        onClick={() =>
                          navigate(`/allocation?patientId=${item.patientId}`)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#4169E1] hover:bg-[#3358D4] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
                      >
                        <span>Allocate Bed</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add to Waiting Queue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#D5E0F2] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#111A35] to-[#202B52] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <UserPlus className="h-5 w-5 text-[#619BFF]" />
                <h3 className="text-base font-bold font-display">
                  Enqueue Patient for Bed Assignment
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-[#A5B4D4] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuickEnqueue} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Arthur Pendelton"
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
                      min={1}
                      max={115}
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
                      className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-2.5 py-2 text-xs text-[#252D43]"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g., Acute Decompensated Heart Failure"
                  className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Triage Acuity
                  </label>
                  <select
                    value={acuity}
                    onChange={(e) => setAcuity(e.target.value as AcuityLevel)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs font-semibold text-[#252D43]"
                  >
                    <option value="Critical">Critical (Score 95)</option>
                    <option value="High">High (Score 82)</option>
                    <option value="Moderate">Moderate (Score 60)</option>
                    <option value="Stable">Stable (Score 35)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Required Ward
                  </label>
                  <select
                    value={requiredWardType}
                    onChange={(e) => setRequiredWardType(e.target.value as WardType)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs font-semibold text-[#252D43]"
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
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as 'Female' | 'Male' | 'Other')
                    }
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                    Requesting Physician
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
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3 py-2 text-xs text-[#252D43]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#252D43] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsVentilator}
                    onChange={(e) => setNeedsVentilator(e.target.checked)}
                    className="rounded border-[#D5E0F2] text-[#4169E1]"
                  />
                  <span>Requires Mechanical Ventilator</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#252D43] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsIsolation}
                    onChange={(e) => setNeedsIsolation(e.target.checked)}
                    className="rounded border-[#D5E0F2] text-[#4169E1]"
                  />
                  <span>Requires Negative-Pressure Isolation</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E9EFF8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#5A6582] hover:bg-[#F4F7FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] hover:bg-[#3358D4] px-5 py-2 text-xs font-semibold text-white shadow-sm cursor-pointer"
                >
                  Add to Priority Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
