import React, { useState, useMemo } from 'react';
import {
  LogOut,
  CheckCircle2,
  Bed,
  Sparkles,
  FileText,
  Clock,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { DischargeRecord } from '../types/hospital';

export const Discharges: React.FC = () => {
  const { patients, discharges, dischargePatient } = useHospital();
  const { hasPermission } = useAuth();

  const canDischarge = hasPermission('manage_discharges');

  const admittedPatients = useMemo(
    () => patients.filter((p) => p.status === 'Admitted'),
    [patients]
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    admittedPatients[0]?.id || ''
  );
  const [outcome, setOutcome] = useState<DischargeRecord['outcome']>(
    'Recovered · Home'
  );
  const [postBedStatus, setPostBedStatus] = useState<'Cleaning' | 'Available'>(
    'Cleaning'
  );
  const [summaryNotes, setSummaryNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const activePatient =
    admittedPatients.find((p) => p.id === selectedPatientId) ||
    admittedPatients[0] ||
    null;

  const handleReleaseBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    dischargePatient(
      activePatient.id,
      outcome,
      summaryNotes,
      postBedStatus
    );

    setFeedback(
      `Discharged ${activePatient.name} and transitioned bed ${
        activePatient.assignedBedId || ''
      } to [${postBedStatus}].`
    );
    setSummaryNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#263566] p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#8975D5]/25 border border-[#8975D5]/40 px-3 py-1 text-[11px] font-semibold text-[#E8E4FF] mb-2">
            <LogOut className="h-3.5 w-3.5 text-[#E8E4FF]" />
            <span>INPATIENT DISCHARGE & BED TURNOVER</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Discharges & Bed Release
          </h1>
          <p className="text-xs text-[#A5B4D4] mt-0.5">
            Process clinical discharge clearance and automatically transition vacated hospital beds to sanitization or immediate availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-2.5 text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#A5B4D4]">
              Currently Admitted
            </div>
            <div className="text-xl font-bold font-display text-[#619BFF]">
              {admittedPatients.length}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-2.5 text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#A5B4D4]">
              Discharged Today
            </div>
            <div className="text-xl font-bold font-display text-[#E8E4FF]">
              {discharges.length}
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl bg-[#E8E4FF] border border-[#8975D5]/50 px-5 py-3.5 flex items-center justify-between text-xs text-[#202B52]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#4169E1]" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-bold text-[#4169E1] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Discharge Action Panel */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#D5E0F2] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#252D43] font-display mb-1">
            Execute Patient Discharge
          </h2>
          <p className="text-xs text-[#6E7A99] mb-4">
            Select an occupied bed / inpatient to authorize discharge and release bed capacity.
          </p>

          {!canDischarge ? (
            <div className="rounded-2xl bg-[#FFE3D9]/50 border border-[#FF8278]/40 p-4 text-xs text-[#252D43]">
              Your role does not have discharge execution privileges.
            </div>
          ) : admittedPatients.length === 0 ? (
            <div className="rounded-2xl bg-[#F4F7FC] p-6 text-center text-xs text-[#6E7A99]">
              No currently admitted patients available for discharge.
            </div>
          ) : (
            <form onSubmit={handleReleaseBed} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Admitted Patient & Assigned Bed
                </label>
                <select
                  value={activePatient?.id || ''}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3.5 py-2.5 text-xs font-semibold text-[#252D43]"
                >
                  {admittedPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) — {p.assignedBedId} ({p.assignedWardName})
                    </option>
                  ))}
                </select>
              </div>

              {activePatient && (
                <div className="rounded-2xl bg-[#E9EFF8]/70 border border-[#D5E0F2] p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202B52]">
                      {activePatient.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#4169E1]">
                      {activePatient.assignedBedId}
                    </span>
                  </div>
                  <div className="text-[#5A6582]">
                    Diagnosis: {activePatient.diagnosis}
                  </div>
                  <div className="text-[11px] text-[#6E7A99]">
                    Attending: {activePatient.attendingPhysician}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Clinical Discharge Outcome
                </label>
                <select
                  value={outcome}
                  onChange={(e) =>
                    setOutcome(e.target.value as DischargeRecord['outcome'])
                  }
                  className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] px-3.5 py-2 text-xs text-[#252D43]"
                >
                  <option value="Recovered · Home">Recovered · Home</option>
                  <option value="Outpatient Follow-up">
                    Outpatient Follow-up
                  </option>
                  <option value="Transferred · Rehab">
                    Transferred · Rehab
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Post-Discharge Bed State
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPostBedStatus('Cleaning')}
                    className={`rounded-xl py-2.5 px-3 text-xs font-semibold border transition-all cursor-pointer ${
                      postBedStatus === 'Cleaning'
                        ? 'bg-[#E8E4FF] border-[#8975D5] text-[#202B52]'
                        : 'bg-[#F4F7FC] border-[#D5E0F2] text-[#5A6582]'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 inline mr-1 text-[#8975D5]" />
                    Sanitize (Cleaning)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostBedStatus('Available')}
                    className={`rounded-xl py-2.5 px-3 text-xs font-semibold border transition-all cursor-pointer ${
                      postBedStatus === 'Available'
                        ? 'bg-[#E9EFF8] border-[#4169E1] text-[#202B52]'
                        : 'bg-[#F4F7FC] border-[#D5E0F2] text-[#5A6582]'
                    }`}
                  >
                    <Bed className="h-3.5 w-3.5 inline mr-1 text-[#4169E1]" />
                    Mark Available Now
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5A6582] mb-1">
                  Discharge Summary Notes
                </label>
                <textarea
                  rows={3}
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  placeholder="Vitals stable on room air; follow-up scheduled in 14 days..."
                  className="w-full rounded-xl bg-[#F4F7FC] border border-[#D5E0F2] p-3 text-xs text-[#252D43] focus:outline-none focus:border-[#4169E1]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#4169E1] to-[#619BFF] hover:from-[#3358D4] hover:to-[#4B89FF] py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                Authorize Discharge & Release Bed
              </button>
            </form>
          )}
        </div>

        {/* Right: Historical Discharges Log */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#D5E0F2] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#252D43] font-display">
                Recent Discharges & Bed Releases
              </h2>
              <p className="text-xs text-[#6E7A99]">
                Audit trail of completed patient discharges and released ward beds
              </p>
            </div>
            <FileText className="h-5 w-5 text-[#8975D5]" />
          </div>

          <div className="space-y-3">
            {discharges.map((dsc) => (
              <div
                key={dsc.id}
                className="rounded-2xl bg-[#F8FAFE] border border-[#D5E0F2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#252D43]">
                      {dsc.patientName}
                    </span>
                    <span className="text-[11px] font-mono text-[#6E7A99]">
                      ({dsc.mrn})
                    </span>
                    <span className="rounded-lg bg-[#E8E4FF] px-2.5 py-0.5 text-[10px] font-bold text-[#5B45B0]">
                      {dsc.outcome}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6582] mt-1">
                    {dsc.summaryNotes}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#7F8CA8]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {dsc.dischargedAt}
                    </span>
                    <span>•</span>
                    <span>Cleared by {dsc.dischargedBy}</span>
                  </div>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-[#202B52] px-3 py-1.5 text-xs font-mono font-bold text-white">
                    <Bed className="h-3.5 w-3.5 text-[#619BFF]" />
                    Released {dsc.releasedBedId}
                  </span>
                  <div className="text-[10px] text-[#6E7A99] mt-1">
                    {dsc.wardName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
