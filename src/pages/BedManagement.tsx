import React, { useState, useMemo } from 'react';
import {
  BedDouble,
  Plus,
  Sparkles,
  Wind,
  Activity,
  Shield,
  X,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { BedStatus, HospitalBed } from '../types/hospital';

export const BedManagement: React.FC = () => {
  const {
    wards,
    beds,
    waitingQueue,
    updateBedStatus,
    allocateBedToPatient,
    addNewBed,
  } = useHospital();
  const { hasPermission } = useAuth();

  const [selectedWardId, setSelectedWardId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BedStatus>('ALL');
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [newBedNum, setNewBedNum] = useState('ICU-09');
  const [newBedWardId, setNewBedWardId] = useState(wards[0]?.id || 'WRD-ICU');
  const [newHasVent, setNewHasVent] = useState(true);
  const [newHasTele, setNewHasTele] = useState(true);
  const [newHasIso, setNewHasIso] = useState(false);

  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchesWard =
        selectedWardId === 'ALL' || b.wardId === selectedWardId;
      const matchesStatus =
        statusFilter === 'ALL' || b.status === statusFilter;
      return matchesWard && matchesStatus;
    });
  }, [beds, selectedWardId, statusFilter]);

  const handleCreateBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedNum.trim()) return;
    addNewBed({
      bedNumber: newBedNum.trim(),
      wardId: newBedWardId,
      hasVentilator: newHasVent,
      hasTelemetryMonitor: newHasTele,
      isolationCapable: newHasIso,
    });
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#111A35] text-white p-6 shadow-md">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">
            Interactive Hospital Bed Grid
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE6FA] mt-1 font-medium">
            Monitor real-time bed occupancy, ventilator readiness, sanitization turnover, and direct patient assignment.
          </p>
        </div>

        {hasPermission('manage_wards') && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] hover:bg-[#3256C9] px-4 py-2.5 text-xs font-bold text-white self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Commission New Bed</span>
          </button>
        )}
      </div>

      {/* Ward Tabs & Status Filters */}
      <div className="rounded-2xl border border-[#D5E0F2] bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedWardId('ALL')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              selectedWardId === 'ALL'
                ? 'bg-[#111A35] text-white'
                : 'bg-[#E9EFF8] text-[#252D43] hover:bg-[#E8E4FF]'
            }`}
          >
            All Wards ({beds.length})
          </button>
          {wards.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWardId(w.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                selectedWardId === w.id
                  ? 'bg-[#4169E1] text-white'
                  : 'bg-[#E9EFF8] text-[#252D43] hover:bg-[#E8E4FF]'
              }`}
            >
              {w.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'Available', 'Occupied', 'Cleaning', 'Maintenance'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#8975D5] text-white'
                    : 'bg-[#E9EFF8] text-[#252D43] hover:bg-[#E8E4FF]'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Visual Floorplan Bed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const cardStyle =
            bed.status === 'Available'
              ? 'border-2 border-[#4169E1]/60 bg-white text-[#252D43] hover:shadow-md'
              : bed.status === 'Occupied'
              ? 'border-2 border-[#4169E1] bg-[#E9EFF8]/75 text-[#252D43] shadow-xs hover:shadow-md'
              : bed.status === 'Cleaning'
              ? 'border-2 border-[#8975D5] bg-[#E8E4FF] text-[#252D43]'
              : 'border-2 border-[#C4382B]/70 bg-[#FFE3D9] text-[#252D43]';

          return (
            <div
              key={bed.id}
              onClick={() => setSelectedBed(bed)}
              className={`cursor-pointer rounded-3xl p-5 flex flex-col justify-between transition-all ${cardStyle}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                        bed.status === 'Occupied'
                          ? 'bg-[#202B52] text-white'
                          : 'bg-[#E9EFF8] text-[#4169E1] border border-[#D5E0F2]'
                      }`}
                    >
                      <BedDouble className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-base font-extrabold tracking-tight text-[#252D43]">
                      {bed.bedNumber}
                    </span>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-wider ${
                      bed.status === 'Available'
                        ? 'bg-[#E9EFF8] text-[#2850C8] border border-[#D5E0F2]'
                        : bed.status === 'Occupied'
                        ? 'bg-[#202B52] text-white'
                        : bed.status === 'Cleaning'
                        ? 'bg-[#5641A6] text-white'
                        : 'bg-[#C4382B] text-white'
                    }`}
                  >
                    {bed.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs font-semibold mt-2 text-[#414C66]">
                  {bed.wardName}
                </div>

                {/* Patient Info or Readiness */}
                <div className="my-3.5 min-h-[44px] flex items-center">
                  {bed.status === 'Occupied' && bed.patientName ? (
                    <div className="w-full rounded-xl bg-white border border-[#D5E0F2] px-3 py-2 shadow-2xs">
                      <div className="text-xs font-bold text-[#252D43]">
                        {bed.patientName}
                      </div>
                      <div className="text-[11px] text-[#5A6582] font-mono font-medium mt-0.5">
                        Admitted {bed.admittedAt}
                      </div>
                    </div>
                  ) : bed.status === 'Available' ? (
                    <div className="text-xs font-bold text-[#2850C8]">
                      Sanitized &amp; Ready for Placement
                    </div>
                  ) : bed.status === 'Cleaning' ? (
                    <div className="text-xs font-bold text-[#523B9E]">
                      UV Sanitization &amp; Linen Turnover
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-[#B83227]">
                      Biomedical Calibration Hold
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Capability Icons & Clean Date */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#D5E0F2] text-[11px] font-mono font-bold text-[#252D43]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {bed.hasVentilator && (
                    <span
                      title="Ventilator Equipped"
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 bg-white text-[#252D43] border border-[#D5E0F2]"
                    >
                      <Wind className="h-3 w-3 text-[#4169E1]" /> Vent
                    </span>
                  )}
                  {bed.hasTelemetryMonitor && (
                    <span
                      title="Telemetry Monitor"
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 bg-white text-[#252D43] border border-[#D5E0F2]"
                    >
                      <Activity className="h-3 w-3 text-[#8975D5]" /> ECG
                    </span>
                  )}
                  {bed.isolationCapable && (
                    <span
                      title="Isolation Capable"
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 bg-white text-[#252D43] border border-[#D5E0F2]"
                    >
                      <Shield className="h-3 w-3 text-[#4169E1]" /> Iso
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-[#414C66]">
                  Clean: {bed.lastSanitized.slice(5)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Control & Quick Assignment Modal */}
      {selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#D5E0F2] bg-white p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <div>
                <div className="font-mono font-bold text-[#4169E1]">
                  {selectedBed.id} · {selectedBed.wardType}
                </div>
                <h3 className="text-lg font-bold text-[#252D43] font-display">
                  Bed {selectedBed.bedNumber} — {selectedBed.wardName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBed(null)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#E9EFF8] p-4 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5A6582]">Current Status:</span>
                <span className="font-bold text-[#4169E1]">
                  {selectedBed.status}
                </span>
              </div>
              {selectedBed.patientName && (
                <div className="flex justify-between">
                  <span className="text-[#5A6582]">Assigned Patient:</span>
                  <span className="font-bold text-[#252D43]">
                    {selectedBed.patientName}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#5A6582]">Capabilities:</span>
                <span className="font-mono text-[#252D43]">
                  {selectedBed.hasVentilator ? 'Ventilator · ' : ''}
                  {selectedBed.hasTelemetryMonitor ? 'Telemetry · ' : ''}
                  {selectedBed.isolationCapable ? 'Isolation' : 'Standard'}
                </span>
              </div>
            </div>

            {/* Quick Assign Waiting Patient if Bed is Available */}
            {selectedBed.status === 'Available' &&
              hasPermission('allocate_beds') &&
              waitingQueue.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="font-bold text-[#252D43] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#4169E1]" />
                    <span>Assign Queued Patient to {selectedBed.bedNumber}:</span>
                  </div>
                  <div className="space-y-1.5">
                    {waitingQueue.slice(0, 3).map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          allocateBedToPatient(w.patientId, selectedBed.id);
                          setSelectedBed(null);
                        }}
                        className="group w-full flex items-center justify-between rounded-xl border border-[#B8C7E0] bg-[#E8E4FF]/65 hover:bg-[#2E56D6] text-[#1A2130] hover:text-white px-3 py-2 text-left transition-colors cursor-pointer"
                      >
                        <span className="font-bold group-hover:text-white">
                          {w.patientName} ({w.acuity})
                        </span>
                        <span className="font-mono text-[11px] font-bold group-hover:text-white">
                          Assign Bed →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Update Bed Status Controls */}
            {hasPermission('update_bed_status') && (
              <div className="space-y-2 pt-2 border-t border-[#E2E9F5]">
                <div className="font-bold text-[#252D43]">
                  Change Operational Bed Status:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      updateBedStatus(selectedBed.id, 'Available');
                      setSelectedBed(null);
                    }}
                    className="rounded-xl bg-[#2E56D6] hover:bg-[#2344B5] py-2 font-bold text-white cursor-pointer"
                  >
                    Mark Available
                  </button>
                  <button
                    onClick={() => {
                      updateBedStatus(selectedBed.id, 'Cleaning');
                      setSelectedBed(null);
                    }}
                    className="rounded-xl bg-[#E8E4FF] hover:bg-[#d5ceff] py-2 font-bold text-[#202B52] cursor-pointer"
                  >
                    Set Cleaning
                  </button>
                  <button
                    onClick={() => {
                      updateBedStatus(selectedBed.id, 'Maintenance');
                      setSelectedBed(null);
                    }}
                    className="rounded-xl bg-[#FFE3D9] hover:bg-[#C4382B] py-2 font-bold text-[#B83227] hover:text-white transition-colors cursor-pointer"
                  >
                    Maintenance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commission New Bed Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#D5E0F2] bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2E9F5] pb-3">
              <h3 className="text-base font-bold text-[#252D43] font-display">
                Commission New Hospital Bed
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-[#5A6582]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBed} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Bed Identifier
                </label>
                <input
                  type="text"
                  value={newBedNum}
                  onChange={(e) => setNewBedNum(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#252D43] mb-1">
                  Assigned Ward
                </label>
                <select
                  value={newBedWardId}
                  onChange={(e) => setNewBedWardId(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#E9EFF8]/60 px-3 py-2"
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newHasVent}
                    onChange={(e) => setNewHasVent(e.target.checked)}
                    className="accent-[#4169E1]"
                  />
                  <span>Equipped with ICU Mechanical Ventilator</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newHasTele}
                    onChange={(e) => setNewHasTele(e.target.checked)}
                    className="accent-[#4169E1]"
                  />
                  <span>Continuous Multi-Lead Telemetry Monitor</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newHasIso}
                    onChange={(e) => setNewHasIso(e.target.checked)}
                    className="accent-[#8975D5]"
                  />
                  <span>Negative-Pressure Isolation Capable</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-4 py-2 font-bold text-white"
                >
                  Add Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
