import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Shield,
  Sliders,
  LogOut,
  Palette,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StaffRole } from '../types/hospital';

export const Settings: React.FC = () => {
  const {
    facilitySettings,
    updateFacilitySettings,
    resetHospitalDemoData,
    addAuditLog,
  } = useHospital();
  const { currentUser, loginWithDemoRole, logout, hasPermission } = useAuth();
  const { theme, setTheme } = useTheme();

  const canManageSettings = hasPermission('manage_settings');

  const [facilityName, setFacilityName] = useState(
    facilitySettings.facilityName
  );
  const [campusAddress, setCampusAddress] = useState(
    facilitySettings.campusAddress
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    facilitySettings.emergencyHotline
  );
  const [accreditationCode, setAccreditationCode] = useState(
    facilitySettings.accreditationCode
  );
  const [chiefMedicalOfficer, setChiefMedicalOfficer] = useState(
    facilitySettings.chiefMedicalOfficer
  );
  const [defaultConsultationMinutes, setDefaultConsultationMinutes] = useState(
    facilitySettings.defaultConsultationMinutes
  );
  const [criticalOccupancyThresholdPct, setCriticalOccupancyThresholdPct] =
    useState(facilitySettings.criticalOccupancyThresholdPct);
  const [autoSanitizationOnDischarge, setAutoSanitizationOnDischarge] =
    useState(facilitySettings.autoQueueSanitizationOnDischarge);

  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateFacilitySettings({
      facilityName:
        facilityName.trim() || 'Blossom Care Sanctuary Medical Center',
      campusAddress: campusAddress.trim(),
      emergencyHotline: emergencyPhone.trim(),
      accreditationCode: accreditationCode.trim(),
      chiefMedicalOfficer: chiefMedicalOfficer.trim(),
      defaultConsultationMinutes: Math.max(
        10,
        Math.min(90, Number(defaultConsultationMinutes) || 30)
      ),
      criticalOccupancyThresholdPct: Math.max(
        50,
        Math.min(100, Number(criticalOccupancyThresholdPct) || 85)
      ),
      autoQueueSanitizationOnDischarge: autoSanitizationOnDischarge,
    });
    addAuditLog(
      'Settings',
      `Updated hospital facility configuration for ${facilityName}.`,
      'Info'
    );
    setSavedBanner(
      'Hospital facility settings and clinical governance thresholds saved.'
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
            <span>HOSPITAL ADMINISTRATION &amp; FACILITY CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hospital Settings, Themes &amp; Demo Controls
          </h1>
          <p className="text-xs text-white/85 mt-0.5">
            Configure hospital campus parameters, switch between Blossom Care and Arctic Bloom themes, test RBAC staff roles, and reset demo data.
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
            Platform Visual Identity (Two Approved Hospital Themes)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Arctic Bloom */}
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
                  Theme 1: Arctic Bloom (Clinical Luxe Medical)
                </span>
              </div>
              {theme === 'luxe' && (
                <span className="rounded-full bg-[#202B52] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#414C66] mb-3">
              High-contrast Arctic blue-grey, midnight navy, deep indigo, royal blue, lavender violet, and warm coral-peach clinical hospital suite.
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

      {/* Hospital Facility & Clinical Operations Form */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Facility Directory Info */}
          <div className="lg:col-span-6 rounded-3xl border border-[#D5E0F2] bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#4169E1]" />
              <h2 className="text-base font-bold text-[#252D43]">
                Hospital Facility &amp; Campus Profile
              </h2>
            </div>

            <div className="space-y-3 text-xs">
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
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Campus Address
                </label>
                <input
                  type="text"
                  value={campusAddress}
                  onChange={(e) => setCampusAddress(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 text-[#252D43]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    24/7 Emergency Hotline
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    Clinical Accreditation ID
                  </label>
                  <input
                    type="text"
                    value={accreditationCode}
                    onChange={(e) => setAccreditationCode(e.target.value)}
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                  Chief Medical Officer
                </label>
                <input
                  type="text"
                  value={chiefMedicalOfficer}
                  onChange={(e) => setChiefMedicalOfficer(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 text-[#252D43]"
                />
              </div>
            </div>
          </div>

          {/* Clinical Workflow & Bed Turnover Governance */}
          <div className="lg:col-span-6 rounded-3xl border border-[#D5E0F2] bg-white p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#252D43]">
                  Clinical Operations &amp; Bed Governance
                </h2>
                <p className="text-xs text-[#6E7A99]">
                  Configure outpatient appointment slot durations, ward capacity alerts, and automated sanitization workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    Default Consultation Slot (Min)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    step={5}
                    value={defaultConsultationMinutes}
                    onChange={(e) =>
                      setDefaultConsultationMinutes(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[11px] text-[#5A6582] mb-1">
                    High Occupancy Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={criticalOccupancyThresholdPct}
                    onChange={(e) =>
                      setCriticalOccupancyThresholdPct(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-[#D5E0F2] bg-[#F4F7FC] px-3 py-2 font-mono text-[#252D43]"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-[#F4F7FC] border border-[#D5E0F2] p-4">
                <label className="flex items-start gap-3 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={autoSanitizationOnDischarge}
                    onChange={(e) =>
                      setAutoSanitizationOnDischarge(e.target.checked)
                    }
                    className="mt-0.5 accent-[#4169E1]"
                  />
                  <div>
                    <div className="font-bold text-[#252D43]">
                      Automatic Bed Sanitization Queue on Patient Discharge
                    </div>
                    <div className="text-[#5A6582] mt-0.5">
                      When enabled, discharging an inpatient automatically transitions their assigned bed to &ldquo;Cleaning&rdquo; before returning to available inventory.
                    </div>
                  </div>
                </label>
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
                    ? 'Save Hospital Facility Configuration'
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
            Hospital Demo Dataset Management
          </h2>
          <p className="text-xs text-[#6E7A99]">
            Restore factory sample hospital beds, wards, patients, specialist doctors, appointments, billing invoices, and medical equipment inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#202B52] hover:bg-[#111A35] px-4 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Complete Hospital Demo Dataset</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111A35]/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#D5E0F2] bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-[#252D43]">
              Restore Default Hospital Management Dataset?
            </h3>
            <p className="text-[#5A6582] leading-relaxed">
              This restores all 36 hospital beds across 6 wards, 15 patients, 8 specialist doctors, sample appointments, departments, billing invoices, and medical equipment to their initial demonstration state.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-xl border border-[#D5E0F2] px-4 py-2 font-semibold text-[#5A6582]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetHospitalDemoData();
                  setSavedBanner(
                    'All hospital modules (patients, doctors, appointments, beds, wards, billing, and equipment) restored to defaults.'
                  );
                  setConfirmReset(false);
                }}
                className="rounded-xl bg-[#4169E1] px-4 py-2 font-semibold text-white cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
