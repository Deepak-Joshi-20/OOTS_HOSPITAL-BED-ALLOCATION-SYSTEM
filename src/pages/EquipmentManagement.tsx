import React, { useState, useMemo } from 'react';
import {
  Activity,
  Plus,
  Search,
  Wrench,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useTheme } from '../context/ThemeContext';
import {
  EquipmentAvailability,
  EquipmentCondition,
  MedicalEquipment,
} from '../types/hospital';

export const EquipmentManagement: React.FC = () => {
  const { equipment, wards, addEquipment, updateEquipmentStatus } =
    useHospital();
  const { isBlossom } = useTheme();

  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState<'All' | EquipmentAvailability>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Add equipment form state
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [category, setCategory] =
    useState<MedicalEquipment['category']>('Life Support');
  const [department, setDepartment] = useState('Emergency & Critical Care');
  const [assignedWard, setAssignedWard] = useState(
    wards[0]?.name || 'Intensive Care Unit (ICU)'
  );
  const [serialNumber, setSerialNumber] = useState('');
  const [nextCalibrationDate, setNextCalibrationDate] = useState('2027-02-15');

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        eq.name.toLowerCase().includes(q) ||
        eq.assetTag.toLowerCase().includes(q) ||
        eq.category.toLowerCase().includes(q) ||
        eq.assignedWard.toLowerCase().includes(q) ||
        eq.department.toLowerCase().includes(q);
      const matchesAvail =
        availFilter === 'All' || eq.availability === availFilter;
      return matchesSearch && matchesAvail;
    });
  }, [equipment, search, availFilter]);

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assetTag.trim()) return;
    addEquipment({
      name: name.trim(),
      assetTag: assetTag.trim().toUpperCase(),
      category,
      department,
      assignedWard,
      availability: 'Available',
      condition: 'Excellent',
      lastServicedDate: new Date().toISOString().slice(0, 10),
      nextCalibrationDate,
      serialNumber:
        serialNumber.trim().toUpperCase() ||
        `SN-${Math.floor(10000 + Math.random() * 89999)}`,
    });
    setName('');
    setAssetTag('');
    setSerialNumber('');
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
            Hospital Medical Equipment &amp; Biomedical Inventory
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
            Monitor ICU ventilators, multiparameter bedside monitors, defibrillators, diagnostic imaging, and calibration schedules.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm self-start sm:self-auto cursor-pointer ${
            isBlossom
              ? 'bg-[#B98CA7] hover:bg-[#a67893]'
              : 'bg-[#4169E1] hover:bg-[#3256C9]'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Register Medical Equipment</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Total Clinical Devices
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#252D43]">
            {equipment.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Available for Deployment
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#2850C8]">
            {equipment.filter((e) => e.availability === 'Available').length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Active In Clinical Use
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#754C68]">
            {equipment.filter((e) => e.availability === 'In Use').length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4">
          <div className="text-xs font-bold text-[#5A6582]">
            Under Maintenance / Calibration
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#B83227]">
            {
              equipment.filter(
                (e) =>
                  e.availability === 'Under Maintenance' ||
                  e.condition === 'Needs Calibration'
              ).length
            }
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
            placeholder="Search by device name, asset tag, category, or assigned ward..."
            className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/65 pl-9 pr-4 py-2 text-xs text-[#252D43] focus:border-[#4169E1] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="md:col-span-5 flex items-center gap-1 bg-[#E9EFF8] p-1 rounded-xl">
          {(
            ['All', 'Available', 'In Use', 'Under Maintenance'] as const
          ).map((st) => (
            <button
              key={st}
              onClick={() => setAvailFilter(st)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                availFilter === st
                  ? 'bg-[#111A35] text-white'
                  : 'text-[#252D43] hover:bg-white/70'
              }`}
            >
              {st === 'Under Maintenance' ? 'Maintenance' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Table */}
      <div className="rounded-3xl border border-[#D5E0F2] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5E0F2] bg-[#111A35] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Asset &amp; Device</th>
                <th className="py-3.5 px-4">Category &amp; Ward</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Condition</th>
                <th className="py-3.5 px-4">Calibration Schedule</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E9F5]">
              {filteredEquipment.map((eq) => (
                <tr
                  key={eq.id}
                  className="hover:bg-[#E9EFF8]/60 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#252D43]">{eq.name}</div>
                    <div className="font-mono text-[11px] text-[#5A6582] mt-0.5">
                      {eq.assetTag} · S/N {eq.serialNumber}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#252D43]">
                      {eq.category}
                    </div>
                    <div className="text-[11px] text-[#5A6582]">
                      {eq.assignedWard} ({eq.department})
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        eq.availability === 'Available'
                          ? 'bg-[#E8E4FF] text-[#2850C8]'
                          : eq.availability === 'In Use'
                          ? 'bg-[#F5E9E8] text-[#754C68]'
                          : 'bg-[#FFE3D9] text-[#B83227]'
                      }`}
                    >
                      {eq.availability}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold ${
                        eq.condition === 'Needs Calibration'
                          ? 'text-[#B83227] font-bold'
                          : 'text-[#252D43]'
                      }`}
                    >
                      {eq.condition}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#5A6582]">
                    <div>Last: {eq.lastServicedDate}</div>
                    <div>Next: {eq.nextCalibrationDate}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <select
                        value={eq.availability}
                        onChange={(e) =>
                          updateEquipmentStatus(
                            eq.id,
                            e.target.value as EquipmentAvailability
                          )
                        }
                        aria-label={`Update availability for ${eq.name}`}
                        className="rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-2.5 py-1.5 font-semibold text-[#252D43]"
                      >
                        <option value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Under Maintenance">
                          Under Maintenance
                        </option>
                      </select>

                      {eq.condition === 'Needs Calibration' ||
                      eq.availability === 'Under Maintenance' ? (
                        <button
                          onClick={() =>
                            updateEquipmentStatus(
                              eq.id,
                              'Available',
                              'Excellent'
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-[#4169E1] hover:bg-[#3256C9] px-2.5 py-1.5 font-bold text-white cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Complete Service</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            updateEquipmentStatus(
                              eq.id,
                              'Under Maintenance',
                              'Needs Calibration'
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-[#D5E0F2] bg-white hover:bg-[#FFE3D9] px-2.5 py-1.5 font-semibold text-[#5A6582] hover:text-[#B83227] cursor-pointer"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          <span>Flag Service</span>
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

      {/* Add Equipment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#4169E1]" />
                <h3 className="text-base font-bold text-[#252D43]">
                  Register Medical Equipment
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Equipment Name &amp; Model
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alaris Infusion Pump Array"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Asset Tag
                  </label>
                  <input
                    type="text"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    placeholder="BLC-INF-04"
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Equipment Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value as MedicalEquipment['category']
                      )
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  >
                    <option value="Life Support">Life Support</option>
                    <option value="Patient Monitoring">
                      Patient Monitoring
                    </option>
                    <option value="Diagnostic Imaging">
                      Diagnostic Imaging
                    </option>
                    <option value="Surgical & Anesthesia">
                      Surgical &amp; Anesthesia
                    </option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Assigned Ward
                  </label>
                  <select
                    value={assignedWard}
                    onChange={(e) => setAssignedWard(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252D43] mb-1">
                    Next Calibration Date
                  </label>
                  <input
                    type="date"
                    value={nextCalibrationDate}
                    onChange={(e) => setNextCalibrationDate(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
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
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
