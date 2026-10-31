import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Machine, MachineStatus, RiskCategory } from '../types';
import { EmptyStateIllustration } from '../components/common/ArcticBackground';

export const MachineMonitoring: React.FC = () => {
  const {
    machines,
    addMachine,
    updateMachine,
    deleteMachine,
    simulateMachineReading,
  } = useSystem();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MachineStatus>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskCategory>('All');
  const [sortBy, setSortBy] = useState<'riskDesc' | 'riskAsc' | 'tempDesc' | 'hoursDesc'>('riskDesc');

  // Add / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);

  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Heavy Forming');
  const [formLocation, setFormLocation] = useState('Bay A · Line 01');
  const [formTemp, setFormTemp] = useState(68);
  const [formVib, setFormVib] = useState(2.8);
  const [formPress, setFormPress] = useState(115);
  const [formHours, setFormHours] = useState(1450);
  const [formLastMaint, setFormLastMaint] = useState('2026-09-10');
  const [formNextMaint, setFormNextMaint] = useState('2026-12-10');

  const filteredMachines = useMemo(() => {
    return machines
      .filter((m) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
        const matchesRisk = riskFilter === 'All' || m.riskCategory === riskFilter;
        return matchesSearch && matchesStatus && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'riskDesc') return b.riskScore - a.riskScore;
        if (sortBy === 'riskAsc') return a.riskScore - b.riskScore;
        if (sortBy === 'tempDesc') return b.temperature - a.temperature;
        return b.runningHours - a.runningHours;
      });
  }, [machines, search, statusFilter, riskFilter, sortBy]);

  const openAddModal = () => {
    setEditingMachine(null);
    setFormId(`M-${Math.floor(300 + Math.random() * 699)}`);
    setFormName('');
    setFormCategory('Precision Machining');
    setFormLocation('Bay C · Cell 08');
    setFormTemp(64);
    setFormVib(2.4);
    setFormPress(112);
    setFormHours(1200);
    setFormLastMaint('2026-09-15');
    setFormNextMaint('2026-12-15');
    setModalOpen(true);
  };

  const openEditModal = (m: Machine) => {
    setEditingMachine(m);
    setFormId(m.id);
    setFormName(m.name);
    setFormCategory(m.category);
    setFormLocation(m.location);
    setFormTemp(m.temperature);
    setFormVib(m.vibration);
    setFormPress(m.pressure);
    setFormHours(m.runningHours);
    setFormLastMaint(m.lastMaintenanceDate);
    setFormNextMaint(m.nextScheduledMaintenance);
    setModalOpen(true);
  };

  const handleSaveMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim()) return;

    if (editingMachine) {
      updateMachine(editingMachine.id, {
        name: formName.trim(),
        category: formCategory.trim(),
        location: formLocation.trim(),
        temperature: Number(formTemp),
        vibration: Number(formVib),
        pressure: Number(formPress),
        runningHours: Number(formHours),
        lastMaintenanceDate: formLastMaint,
        nextScheduledMaintenance: formNextMaint,
      });
    } else {
      addMachine({
        id: formId.trim().toUpperCase(),
        name: formName.trim(),
        category: formCategory.trim(),
        location: formLocation.trim(),
        temperature: Number(formTemp),
        vibration: Number(formVib),
        pressure: Number(formPress),
        runningHours: Number(formHours),
        lastMaintenanceDate: formLastMaint,
        nextScheduledMaintenance: formNextMaint,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Industrial Machine Fleet Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Inspect live temperature, vibration, hydraulic pressure, operating hours, and calculated failure risk.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3457c9] transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Industrial Machine</span>
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7C8495]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Machine ID (H-101), name, or bay..."
            className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] pl-9 pr-3 py-2 text-xs text-[#252A36] focus:border-[#4169E1] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 flex items-center gap-1 bg-[#F8F7F3] p-1 rounded-xl">
          {(['All', 'Healthy', 'Warning', 'Critical'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-[#4169E1] font-semibold shadow-2xs'
                  : 'text-[#7C8495] hover:text-[#252A36]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Risk Category Filter */}
        <div className="md:col-span-3">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as 'All' | RiskCategory)}
            className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs text-[#252A36] focus:border-[#4169E1] focus:outline-none"
            aria-label="Filter by Risk Level"
          >
            <option value="All">All Risk Categories</option>
            <option value="Critical">Critical Risk (80–100)</option>
            <option value="High">High Risk (60–79)</option>
            <option value="Medium">Medium Risk (30–59)</option>
            <option value="Low">Low Risk (0–29)</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="md:col-span-2">
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7C8495]" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'riskDesc' | 'riskAsc' | 'tempDesc' | 'hoursDesc'
                )
              }
              className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] pl-8 pr-2 py-2 text-xs text-[#252A36] focus:border-[#4169E1] focus:outline-none"
              aria-label="Sort Machines"
            >
              <option value="riskDesc">Sort: Highest Risk</option>
              <option value="riskAsc">Sort: Lowest Risk</option>
              <option value="tempDesc">Sort: Highest Temp</option>
              <option value="hoursDesc">Sort: Running Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Machines Data Table */}
      {filteredMachines.length === 0 ? (
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-12 text-center space-y-3">
          <EmptyStateIllustration />
          <h3 className="text-base font-bold text-[#252A36] font-display">
            No Matching Industrial Machines
          </h3>
          <p className="text-xs text-[#7C8495] max-w-md mx-auto">
            No equipment matches your active search or risk filter criteria. Try resetting filters or registering a new machine.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setRiskFilter('All');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] px-4 py-2 text-xs font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E9EAF0] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9EAF0] bg-[#F8F7F3]/70 text-[11px] font-semibold text-[#7C8495] uppercase">
                  <th className="py-3.5 px-4">Machine ID &amp; Name</th>
                  <th className="py-3.5 px-4">Category &amp; Location</th>
                  <th className="py-3.5 px-4">Operational Status</th>
                  <th className="py-3.5 px-4 text-right">Temp (°C)</th>
                  <th className="py-3.5 px-4 text-right">Vibration</th>
                  <th className="py-3.5 px-4 text-right">Pressure</th>
                  <th className="py-3.5 px-4 text-right">Running Hrs</th>
                  <th className="py-3.5 px-4 text-right">Risk Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF0] text-xs">
                {filteredMachines.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-[#F8F7F3]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => navigate(`/machines/${m.id}`)}
                        className="text-left group"
                      >
                        <div className="font-bold text-[#252A36] group-hover:text-[#4169E1] transition-colors">
                          {m.name}
                        </div>
                        <div className="font-mono text-[11px] text-[#7C8495]">
                          ID: {m.id} · Next Service: {m.nextScheduledMaintenance}
                        </div>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#252A36] font-medium">{m.category}</div>
                      <div className="text-[11px] text-[#7C8495]">{m.location}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          m.status === 'Critical'
                            ? 'text-[#FF806D]'
                            : m.status === 'Warning'
                            ? 'text-[#8B78DB]'
                            : 'text-[#4169E1]'
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-[#7C8495]"> · {m.riskCategory}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#252A36]">
                      {m.temperature.toFixed(1)} °C
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#252A36]">
                      {m.vibration.toFixed(2)} mm/s
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#252A36]">
                      {m.pressure} PSI
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#7C8495]">
                      {m.runningHours.toLocaleString()} h
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-mono text-sm font-bold tabular-nums ${
                          m.riskScore >= 80
                            ? 'text-[#FF806D]'
                            : m.riskScore >= 60
                            ? 'text-[#8B78DB]'
                            : 'text-[#4169E1]'
                        }`}
                      >
                        {m.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => simulateMachineReading(m.id)}
                          title="Simulate New Sensor Reading"
                          className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#4169E1] hover:bg-[#E9E4FF] transition-colors"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/machines/${m.id}`)}
                          title="Open Detailed Profile"
                          className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#252A36] hover:bg-[#F8F7F3] transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit Machine"
                          className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#7C8495] hover:text-[#252A36] transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          title="Remove Machine"
                          className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#FF806D] hover:bg-[#FFE4D8] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Machine Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#252A36]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#E9EAF0] bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-4">
              <h2 className="text-lg font-bold text-[#252A36] font-display">
                {editingMachine
                  ? `Edit Machine · ${editingMachine.id}`
                  : 'Register New Industrial Machine'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[#7C8495] hover:bg-[#F8F7F3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Machine ID
                  </label>
                  <input
                    type="text"
                    value={formId}
                    disabled={!!editingMachine}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs font-mono text-[#252A36] disabled:opacity-60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Machine Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Laser Cutter LC-308"
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs text-[#252A36]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs text-[#252A36]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Plant Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs text-[#252A36]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formTemp}
                    onChange={(e) => setFormTemp(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Vibration (mm/s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formVib}
                    onChange={(e) => setFormVib(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Pressure (PSI)
                  </label>
                  <input
                    type="number"
                    value={formPress}
                    onChange={(e) => setFormPress(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Running Hours
                  </label>
                  <input
                    type="number"
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Last Maintenance Date
                  </label>
                  <input
                    type="date"
                    value={formLastMaint}
                    onChange={(e) => setFormLastMaint(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252A36] mb-1">
                    Next Scheduled Maintenance
                  </label>
                  <input
                    type="date"
                    value={formNextMaint}
                    onChange={(e) => setFormNextMaint(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9EAF0]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#E9EAF0] px-4 py-2 text-xs font-semibold text-[#7C8495]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4169E1] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3457c9]"
                >
                  {editingMachine ? 'Save Changes & Recalculate' : 'Add Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#252A36]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E9EAF0] bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#252A36] font-display">
              Decommission {deleteTarget.name}?
            </h3>
            <p className="text-xs text-[#7C8495] leading-relaxed">
              Are you sure you want to remove machine <span className="font-mono font-semibold text-[#252A36]">{deleteTarget.id}</span> from active monitoring? Associated active alerts will also be cleared.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#E9EAF0] px-4 py-2 text-xs font-semibold text-[#7C8495]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMachine(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-xl bg-[#FF806D] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
