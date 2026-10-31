import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Users,
  Gauge,
  ArrowRight,
  X,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { WardType } from '../types/hospital';

export const WardManagement: React.FC = () => {
  const { wards, beds, addWard } = useHospital();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<WardType>('General');
  const [floor, setFloor] = useState('Level 3');
  const [wing, setWing] = useState('North Wing');
  const [headNurse, setHeadNurse] = useState('Elena Rostova, RN');
  const [capacity, setCapacity] = useState(8);

  const handleAddWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addWard({
      name: name.trim(),
      type,
      floor,
      wing,
      headNurse,
      totalCapacity: Number(capacity),
      oxygenLinePsi: 52,
      nurseRatio: type === 'ICU' ? '1:1' : '1:3',
    });
    setName('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#111A35] to-[#202B52] text-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
            Hospital Ward &amp; Clinical Wing Management
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE6FA] font-medium mt-0.5">
            Monitor ward occupancy ratios, nursing leadership, medical gas line pressure, and bed availability.
          </p>
        </div>

        {hasPermission('manage_wards') && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] hover:bg-[#3256C9] px-4 py-2.5 text-xs font-bold text-white self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Clinical Ward</span>
          </button>
        )}
      </div>

      {/* Ward Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wards.map((ward) => {
          const wardBeds = beds.filter((b) => b.wardId === ward.id);
          const total = Math.max(ward.totalCapacity, wardBeds.length);
          const occupied = wardBeds.filter((b) => b.status === 'Occupied').length;
          const available = wardBeds.filter(
            (b) => b.status === 'Available'
          ).length;
          const turnover = wardBeds.filter(
            (b) => b.status === 'Cleaning' || b.status === 'Maintenance'
          ).length;
          const occPct = Math.round((occupied / Math.max(1, wardBeds.length)) * 100);

          return (
            <div
              key={ward.id}
              className="rounded-3xl border border-[#D5E0F2] bg-white text-[#252D43] p-6 flex flex-col justify-between space-y-5 shadow-xs transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#4169E1]">
                    {ward.floor} · {ward.wing}
                  </span>
                  <Building2 className="h-5 w-5 text-[#8975D5]" />
                </div>

                <h2 className="text-lg font-bold font-display text-[#252D43]">
                  {ward.name}
                </h2>

                <div className="flex items-center gap-4 text-xs font-medium text-[#5A6582]">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-[#4169E1]" /> {ward.headNurse}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Gauge className="h-3.5 w-3.5 text-[#8975D5]" /> O2 {ward.oxygenLinePsi} PSI
                  </span>
                </div>

                {/* Occupancy Bar */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#252D43]">
                    <span>Occupancy Rate</span>
                    <span className="font-mono">{occPct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden bg-[#E9EFF8]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4169E1] to-[#8975D5]"
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 rounded-2xl p-3 text-center text-xs bg-[#E9EFF8]/85">
                  <div>
                    <div className="font-mono text-base font-bold text-[#2850C8]">
                      {available}
                    </div>
                    <div className="text-[11px] font-semibold text-[#414C66]">
                      Available
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-bold text-[#1A2130]">
                      {occupied}/{total}
                    </div>
                    <div className="text-[11px] font-semibold text-[#414C66]">
                      Occupied
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-bold text-[#B83227]">
                      {turnover}
                    </div>
                    <div className="text-[11px] font-semibold text-[#414C66]">
                      Turnover
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/beds')}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-colors bg-[#E8E4FF] text-[#202B52] hover:bg-[#4169E1] hover:text-white cursor-pointer"
                >
                  <span>Inspect Ward Beds</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Ward Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#D5E0F2] bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <h3 className="text-base font-bold text-[#252D43] font-display">
                Create Clinical Ward
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddWard} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Ward Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Neurology Step-Down Unit"
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Specialty Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WardType)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
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
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Bed Capacity
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Floor Level
                  </label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Building Wing
                  </label>
                  <input
                    type="text"
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Charge / Head Nurse
                </label>
                <input
                  type="text"
                  value={headNurse}
                  onChange={(e) => setHeadNurse(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-4 py-2 font-bold text-white"
                >
                  Create Ward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
