import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  Database,
  Trash2,
  CheckCircle2,
  Shield,
  Sliders,
  LogOut,
  Palette,
  Sparkles,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StaffRole } from '../types/hospital';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    loadDemoData,
    resetDemoData,
    clearAllData,
  } = useSystem();
  const { resetHospitalDemoData, addAuditLog } = useHospital();
  const { currentUser, loginWithDemoRole, logout, hasPermission } = useAuth();
  const { theme, setTheme } = useTheme();

  const canManageSettings = hasPermission('manage_settings');

  const [operatorName, setOperatorName] = useState(
    currentUser?.name || settings.operatorName
  );
  const [operatorRole, setOperatorRole] = useState(
    currentUser?.title || settings.operatorRole
  );
  const [facilityName, setFacilityName] = useState(
    'Blossom Care Central Sanctuary'
  );

  const [tempNominal, setTempNominal] = useState(
    settings.thresholds.tempNominal
  );
  const [tempMax, setTempMax] = useState(settings.thresholds.tempMax);
  const [vibNominal, setVibNominal] = useState(
    settings.thresholds.vibrationNominal
  );
  const [vibMax, setVibMax] = useState(settings.thresholds.vibrationMax);
  const [pressNominal, setPressNominal] = useState(
    settings.thresholds.pressureNominal
  );
  const [pressMax, setPressMax] = useState(settings.thresholds.pressureMax);
  const [maxHours, setMaxHours] = useState(
    settings.thresholds.maxRunningHours
  );

  const [simInterval, setSimInterval] = useState(settings.simulationIntervalMs);
  const [bufferSize, setBufferSize] = useState(settings.defaultBufferSize);
  const [timeQuantum, setTimeQuantum] = useState(settings.defaultTimeQuantum);
  const [memoryFrames, setMemoryFrames] = useState(
    settings.defaultMemoryFrames
  );

  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    null | 'hospital_reset' | 'load' | 'reset' | 'clear'
  >(null);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      operatorName: operatorName.trim() || 'Dr. Elena Vance',
      operatorRole: operatorRole.trim() || 'Chief Medical Operations Officer',
      facilityName: facilityName.trim() || 'Blossom Care Central Sanctuary',
      simulationIntervalMs: Math.max(2000, Number(simInterval) || 6000),
      defaultBufferSize: Math.max(4, Math.min(12, Number(bufferSize) || 8)),
      defaultTimeQuantum: Math.max(1, Number(timeQuantum) || 3),
      defaultMemoryFrames: Math.max(2, Math.min(6, Number(memoryFrames) || 4)),
      thresholds: {
        tempNominal: Number(tempNominal),
        tempMax: Number(tempMax),
        vibrationNominal: Number(vibNominal),
        vibrationMax: Number(vibMax),
        pressureNominal: Number(pressNominal),
        pressureMax: Number(pressMax),
        maxRunningHours: Number(maxHours),
      },
    });
    addAuditLog(
      'Settings',
      `Updated hospital telemetry & predictive threshold configuration.`,
      'Info'
    );
    setSavedBanner(
      'Configuration saved. Hospital telemetry and predictive maintenance bounds updated.'
    );
    setTimeout(() => setSavedBanner(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#263566] p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[11px] font-semibold text-white mb-2">
            <Sliders className="h-3.5 w-3.5" />
            <span>HOSPITAL PLATFORM &amp; TELEMETRY CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            System Settings, Themes &amp; Demo Controls
          </h1>
          <p className="text-xs text-white/85 mt-0.5">
            Switch between Blossom Care and Initial Theme, test RBAC staff roles, and manage hospital datasets.
          </p>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out to Login Portal</span>
        </button>
      </div>

      {savedBanner && (
        <div className="rounded-2xl border border-[#8975D5]/50 bg-[#E8E4FF] p-4 flex items-center gap-3 text-xs font-semibold text-[#202B52]">
          <CheckCircle2 className="h-4 w-4 text-[#4169E1] shrink-0" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Visual Identity Theme Selector (2 Theme Options) */}
      <div className="rounded-3xl bg-white border border-[#D5E0F2] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#4169E1]" />
          <h2 className="text-lg font-bold text-[#252D43]">
            Platform Visual Identity (Two Theme Options)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Arctic Bloom (Approved Default) */}
          <button
            type="button"
            onClick={() => setTheme('luxe')}
            className={`text-left rounded-2xl p-5 border-2 transition-all cursor-pointer ${
              theme === 'luxe'
                ? 'border-[#2E56D6] bg-[#E9EFF8] shadow-md'
                : 'border-[#B8C7E0] bg-white hover:border-[#2E56D6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#2850C8]" />
                <span className="text-base font-bold text-[#1A2130]">
                  Theme 1: Arctic Bloom (Approved Clinical &amp; OS Suite)
                </span>
              </div>
              {theme === 'luxe' && (
                <span className="rounded-full bg-[#202B52] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#414C66] mb-3">
              High-contrast Arctic blue-grey, midnight navy, deep indigo, royal blue, lavender violet, and warm coral-peach clinical &amp; OS control suite.
            </p>
            <div className="flex items-center gap-2">
              {[
                '#E9EFF8',
                '#111A35',
                '#202B52',
                '#4169E1',
                '#619BFF',
                '#E8E4FF',
                '#8975D5',
                '#FF8278',
                '#FFE3D9',
              ].map((hex) => (
                <span
                  key={hex}
                  className="h-5 w-5 rounded-full border border-black/20"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </button>

          {/* Option 2: Blossom Care */}
          <button
            type="button"
            onClick={() => setTheme('blossom')}
            className={`text-left rounded-2xl p-5 border-2 transition-all cursor-pointer ${
              theme === 'blossom'
                ? 'border-[#754C68] bg-[#FAF1E8] shadow-md'
                : 'border-[#C9A9B8] bg-[#FAF1E8]/60 hover:border-[#754C68]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#754C68]" />
                <span className="text-base font-bold text-[#2E2532]">
                  Theme 2: Blossom Care (Boutique Editorial)
                </span>
              </div>
              {theme === 'blossom' && (
                <span className="rounded-full bg-[#754C68] px-2.5 py-0.5 text-[10px] font-bold text-[#FAF1E8]">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#564552] mb-3">
              Warm vanilla, blush pink, dusty rose, muted mauve, lavender mist, warm peach, and berry plum with editorial typography and botanical hospital line-art.
            </p>
            <div className="flex items-center gap-2">
              {[
                '#FAF1E8',
                '#F5E9E8',
                '#D9B9C8',
                '#B98CA7',
                '#B9A5D5',
                '#EAE2F3',
                '#E9B9A7',
                '#754C68',
                '#3D3440',
              ].map((hex) => (
                <span
                  key={hex}
                  className="h-5 w-5 rounded-full border border-black/20"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Active Session & Quick Demo Role Switcher */}
      <div className="rounded-3xl bg-white border border-[#D5E0F2] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#4169E1]" />
              <h2 className="text-base font-bold text-[#252D43]">
                Active Staff Role &amp; Presentation Switcher
              </h2>
            </div>
            <p className="text-xs text-[#6E7A99] mt-0.5">
              Signed in as <strong>{currentUser?.name}</strong> (
              <span className="text-[#4169E1] font-semibold">
                {currentUser?.role}
              </span>
              ). Switch roles below to test Role-Based Access Control across hospital modules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                'Administrator',
                'Admission Staff',
                'Ward Staff',
              ] as StaffRole[]
            ).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => loginWithDemoRole(role)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  currentUser?.role === role
                    ? 'bg-[#202B52] text-white shadow-xs'
                    : 'bg-[#F4F7FC] text-[#5A6582] hover:bg-[#E9EFF8]'
                }`}
              >
                Switch: {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Facility & Telemetry Cadence */}
          <div className="lg:col-span-6 rounded-3xl border border-[#D5E0F2] bg-white p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-[#252D43]">
              Hospital Facility &amp; Telemetry Polling
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Primary Operator Name
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 text-[#252D43]"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Clinical / Engineering Title
                </label>
                <input
                  type="text"
                  value={operatorRole}
                  onChange={(e) => setOperatorRole(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 text-[#252D43]"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Hospital Facility Name
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 text-[#252D43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    Telemetry Poll (ms)
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={20000}
                    step={500}
                    value={simInterval}
                    onChange={(e) => setSimInterval(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    IPC Buffer Slots (4–12)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={bufferSize}
                    onChange={(e) => setBufferSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    RR Quantum (ms)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={timeQuantum}
                    onChange={(e) => setTimeQuantum(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    Page Frames (2–6)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={memoryFrames}
                    onChange={(e) => setMemoryFrames(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Biomedical & Predictive Risk Thresholds */}
          <div className="lg:col-span-6 rounded-3xl border border-[#D5E0F2] bg-white p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-[#252D43]">
              Biomedical Predictive Thresholds
            </h2>
            <p className="text-xs text-[#6E7A99]">
              Threshold parameters used to compute real-time equipment anomaly risk scores.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Nominal Temp (°C)
                </label>
                <input
                  type="number"
                  value={tempNominal}
                  onChange={(e) => setTempNominal(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Critical Max Temp (°C)
                </label>
                <input
                  type="number"
                  value={tempMax}
                  onChange={(e) => setTempMax(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Nominal Vibration (mm/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vibNominal}
                  onChange={(e) => setVibNominal(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Critical Max Vibration
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vibMax}
                  onChange={(e) => setVibMax(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Nominal Pressure (PSI)
                </label>
                <input
                  type="number"
                  value={pressNominal}
                  onChange={(e) => setPressNominal(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Critical Max Pressure
                </label>
                <input
                  type="number"
                  value={pressMax}
                  onChange={(e) => setPressMax(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Service Cycle Max Running Hours
                </label>
                <input
                  type="number"
                  value={maxHours}
                  onChange={(e) => setMaxHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!canManageSettings}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#619BFF] py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>
                  {canManageSettings
                    ? 'Save Settings & Recalculate Telemetry'
                    : 'Administrator Role Required to Save'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Dataset Reset Controls */}
      <div className="rounded-3xl border border-[#D5E0F2] bg-white p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#252D43]">
            Hospital &amp; Telemetry Demo Dataset Management
          </h2>
          <p className="text-xs text-[#6E7A99]">
            Restore factory sample hospital beds, wards, patients, waiting queue, and biomedical telemetry records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmAction('hospital_reset')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#202B52] hover:bg-[#111A35] px-4 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Hospital Beds &amp; Patient Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction('load')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] px-4 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Merge Predictive Telemetry Data</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction('reset')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-4 py-2.5 text-xs font-semibold text-[#252D43] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Equipment Fleet Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction('clear')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFE3D9] px-4 py-2.5 text-xs font-semibold text-[#C03C32] cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Equipment Fleet</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#D5E0F2] bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-[#252D43]">
              {confirmAction === 'hospital_reset' &&
                'Restore Default Hospital Bed & Patient Dataset?'}
              {confirmAction === 'load' && 'Load Missing Sample Telemetry Data?'}
              {confirmAction === 'reset' &&
                'Reset Equipment Fleet to Factory Demo Data?'}
              {confirmAction === 'clear' &&
                'Clear All Monitored Equipment & Alerts?'}
            </h3>
            <p className="text-[#5A6582] leading-relaxed">
              {confirmAction === 'hospital_reset' &&
                'This restores all 36 hospital beds across 6 wards, 15 patients, priority waiting queue items, admissions, and discharges.'}
              {confirmAction === 'load' &&
                'This restores any deleted sample machines and alerts while preserving custom entries.'}
              {confirmAction === 'reset' &&
                'This restores the original 14 monitored machines, alerts, and processes.'}
              {confirmAction === 'clear' &&
                'This clears all equipment telemetry so you can test empty states.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction === 'hospital_reset') {
                    resetHospitalDemoData();
                    setSavedBanner(
                      'Hospital beds, wards, patients, and priority waiting list restored to defaults.'
                    );
                  }
                  if (confirmAction === 'load') loadDemoData();
                  if (confirmAction === 'reset') resetDemoData();
                  if (confirmAction === 'clear') clearAllData();
                  setConfirmAction(null);
                }}
                className="rounded-xl bg-[#4169E1] px-4 py-2 font-semibold text-white cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
