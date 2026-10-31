import React, { useState, useMemo, useEffect } from 'react';
import {
  Bed,
  CheckCircle2,
  Wind,
  Shield,
  Activity,
  Sparkles,
  UserCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedPanel } from '../components/common/LuxeMedicalArtwork';

export const BedAllocation: React.FC = () => {
  const {
    waitingQueue,
    patients,
    beds,
    allocateBedToPatient,
    getRecommendedBedsForPatient,
  } = useHospital();
  const { hasPermission } = useAuth();
  const [searchParams] = useSearchParams();

  const canAllocate = hasPermission('allocate_beds');

  const waitingPatients = useMemo(() => {
    const queueMap = new Map(waitingQueue.map((q) => [q.patientId, q]));
    return patients
      .filter((p) => p.status === 'Waiting')
      .sort((a, b) => {
        const scoreA = queueMap.get(a.id)?.priorityScore ?? 50;
        const scoreB = queueMap.get(b.id)?.priorityScore ?? 50;
        return scoreB - scoreA;
      });
  }, [patients, waitingQueue]);

  const paramPatientId = searchParams.get('patientId');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    paramPatientId || waitingPatients[0]?.id || ''
  );
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [lastAllocatedBanner, setLastAllocatedBanner] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (
      paramPatientId &&
      waitingPatients.some((p) => p.id === paramPatientId)
    ) {
      setSelectedPatientId(paramPatientId);
    } else if (
      waitingPatients.length > 0 &&
      !waitingPatients.some((p) => p.id === selectedPatientId)
    ) {
      setSelectedPatientId(waitingPatients[0].id);
    }
  }, [paramPatientId, waitingPatients, selectedPatientId]);

  const activePatient = useMemo(
    () => waitingPatients.find((p) => p.id === selectedPatientId) || null,
    [waitingPatients, selectedPatientId]
  );

  const recommendedBeds = useMemo(() => {
    if (!activePatient) {
      return beds.filter((b) => b.status === 'Available');
    }
    return getRecommendedBedsForPatient({
      requiredWardType: activePatient.requiredWardType,
      needsVentilator: activePatient.needsVentilator,
      needsIsolation: activePatient.needsIsolation,
    });
  }, [activePatient, beds, getRecommendedBedsForPatient]);

  useEffect(() => {
    if (recommendedBeds.length > 0) {
      setSelectedBedId(recommendedBeds[0].id);
    } else {
      setSelectedBedId('');
    }
  }, [recommendedBeds, activePatient?.id]);

  if (!canAllocate) {
    return (
      <AccessDeniedPanel requiredRoleLabel="Administrator or Admission Staff" />
    );
  }

  const handleConfirmAllocation = () => {
    if (!activePatient || !selectedBedId) return;
    const chosenBed = beds.find((b) => b.id === selectedBedId);
    const ok = allocateBedToPatient(activePatient.id, selectedBedId);
    if (ok && chosenBed) {
      setLastAllocatedBanner(
        `Assigned ${activePatient.name} (${activePatient.mrn}) to Bed ${chosenBed.bedNumber} in ${chosenBed.wardName}.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#2B3B70] p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[11px] font-bold text-white mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#619BFF]" />
            <span>INTELLIGENT CLINICAL BED MATCHING</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Smart Bed Allocation Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE6FA] font-medium mt-1">
            Pair triaged patients with compatible ICU and specialty ward beds based on acuity, ventilator support, and isolation criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-black/20 border border-white/25 px-4 py-2.5 text-right min-w-[130px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#DCE6FA]">
              Available Beds
            </div>
            <div className="text-2xl font-extrabold font-display text-[#619BFF] mt-0.5">
              {beds.filter((b) => b.status === 'Available').length}
            </div>
          </div>
          <div className="rounded-2xl bg-black/20 border border-white/25 px-4 py-2.5 text-right min-w-[140px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#DCE6FA]">
              Awaiting Placement
            </div>
            <div className="text-2xl font-extrabold font-display text-[#FF8278] mt-0.5">
              {waitingPatients.length}
            </div>
          </div>
        </div>
      </div>

      {lastAllocatedBanner && (
        <div className="rounded-2xl bg-[#E8E4FF] border border-[#8975D5]/50 px-5 py-3.5 flex items-center justify-between text-xs text-[#202B52] shadow-sm">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#4169E1] shrink-0" />
            <span>{lastAllocatedBanner}</span>
          </div>
          <button
            onClick={() => setLastAllocatedBanner(null)}
            className="text-[11px] font-bold text-[#4169E1] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Allocation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queued Patients */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#D5E0F2] p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#252D43] font-display">
                1. Select Waiting Patient
              </h2>
              <p className="text-[11px] font-medium text-[#5A6582]">
                Ordered by clinical priority score &amp; acuity
              </p>
            </div>
            <span className="rounded-xl bg-[#E9EFF8] border border-[#D5E0F2] px-2.5 py-1 text-xs font-bold text-[#4169E1]">
              {waitingPatients.length} Queued
            </span>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {waitingPatients.length === 0 ? (
              <div className="rounded-2xl bg-[#F4F7FC] p-8 text-center">
                <UserCheck className="h-8 w-8 text-[#4169E1] mx-auto mb-2" />
                <div className="text-sm font-bold text-[#252D43]">
                  All Waiting Patients Placed
                </div>
                <p className="text-xs text-[#5A6582] mt-1">
                  Register a new patient in Patient Directory or Waiting List to allocate a bed.
                </p>
              </div>
            ) : (
              waitingPatients.map((patient) => {
                const isSelected = patient.id === activePatient?.id;
                const qItem = waitingQueue.find((q) => q.patientId === patient.id);
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full text-left rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8E4FF] text-[#252D43] border-[#4169E1] shadow-sm'
                        : 'bg-[#F8FAFE] hover:bg-[#E9EFF8]/75 text-[#252D43] border-[#D5E0F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-display text-[#252D43]">
                          {patient.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-[#4169E1] border border-[#D5E0F2]">
                          {patient.mrn}
                        </span>
                      </div>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
                          patient.acuity === 'Critical'
                            ? 'bg-[#C4382B] text-white'
                            : patient.acuity === 'High'
                            ? 'bg-[#5641A6] text-white'
                            : 'bg-white text-[#2850C8] border border-[#D5E0F2]'
                        }`}
                      >
                        {patient.acuity} · {qItem?.priorityScore ?? 70}
                      </span>
                    </div>

                    <div className="text-xs font-medium mt-1.5 text-[#5A6582]">
                      {patient.diagnosis}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px]">
                      <span
                        className={`rounded-md px-2 py-0.5 font-bold ${
                          isSelected
                            ? 'bg-[#4169E1] text-white'
                            : 'bg-[#202B52] text-white'
                        }`}
                      >
                        Needs: {patient.requiredWardType}
                      </span>
                      {patient.needsVentilator && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FFE3D9] text-[#B83227] border border-[#C4382B]/30 px-2 py-0.5 font-bold">
                          <Wind className="h-3 w-3" /> Ventilator
                        </span>
                      )}
                      {patient.needsIsolation && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-white text-[#523B9E] border border-[#8975D5]/40 px-2 py-0.5 font-bold">
                          <Shield className="h-3 w-3" /> Isolation
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recommended Compatible Beds */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#D5E0F2] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#252D43] font-display">
                  2. Compatible Available Hospital Beds
                </h2>
                <p className="text-[11px] font-medium text-[#5A6582]">
                  {activePatient
                    ? `Ranked for ${activePatient.name} (${activePatient.requiredWardType} requirement)`
                    : 'Select a waiting patient on the left to compute compatibility'}
                </p>
              </div>
              {activePatient && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#4169E1]">
                  <Activity className="h-4 w-4" />
                  <span>
                    HR {activePatient.vitals.heartRate} bpm · SpO₂{' '}
                    {activePatient.vitals.spo2}%
                  </span>
                </div>
              )}
            </div>

            {!activePatient ? (
              <div className="rounded-2xl bg-[#F4F7FC] p-12 text-center text-xs font-medium text-[#5A6582]">
                No waiting patient selected.
              </div>
            ) : recommendedBeds.length === 0 ? (
              <div className="rounded-2xl bg-[#FFE3D9]/50 border border-[#FF8278]/40 p-8 text-center">
                <AlertCircle className="h-8 w-8 text-[#D94E43] mx-auto mb-2" />
                <div className="text-sm font-bold text-[#252D43]">
                  Zero Available Beds Ready
                </div>
                <p className="text-xs text-[#5A6582] mt-1">
                  Release a bed in Discharges or transition a Cleaning bed to Available in Bed Floorplan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {recommendedBeds.map((bed, index) => {
                  const isChosen = bed.id === selectedBedId;
                  const wardMatch =
                    bed.wardType === activePatient.requiredWardType;
                  const ventMatch =
                    !activePatient.needsVentilator || bed.hasVentilator;
                  const isoMatch =
                    !activePatient.needsIsolation || bed.isolationCapable;

                  return (
                    <button
                      key={bed.id}
                      type="button"
                      onClick={() => setSelectedBedId(bed.id)}
                      className={`text-left rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                        isChosen
                          ? 'bg-[#E9EFF8] border-[#4169E1] shadow-sm'
                          : 'bg-[#F8FAFE] hover:bg-[#E9EFF8]/60 border-[#D5E0F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-9 w-12 items-center justify-center rounded-xl bg-[#202B52] text-white font-mono text-xs font-extrabold">
                            {bed.bedNumber}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-[#252D43]">
                              {bed.wardName}
                            </div>
                            <div className="text-[11px] font-semibold text-[#5A6582]">
                              {bed.wardType} Unit
                            </div>
                          </div>
                        </div>

                        {index === 0 && (
                          <span className="rounded-lg bg-[#4169E1] px-2.5 py-0.5 text-[10px] font-bold text-white">
                            Best Match
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            wardMatch
                              ? 'bg-[#E8E4FF] text-[#2850C8] border border-[#D5E0F2]'
                              : 'bg-[#FFE3D9] text-[#B83227] border border-[#C4382B]/30'
                          }`}
                        >
                          {wardMatch ? 'Exact Ward Match' : 'Overflow Ward'}
                        </span>
                        {bed.hasVentilator && (
                          <span
                            className={`rounded-md px-2 py-0.5 font-bold ${
                              ventMatch
                                ? 'bg-[#E8E4FF] text-[#523B9E] border border-[#8975D5]/40'
                                : 'bg-[#F4F7FC] text-[#5A6582] border border-[#D5E0F2]'
                            }`}
                          >
                            Ventilator
                          </span>
                        )}
                        {bed.isolationCapable && (
                          <span
                            className={`rounded-md px-2 py-0.5 font-bold ${
                              isoMatch
                                ? 'bg-[#E8E4FF] text-[#523B9E] border border-[#8975D5]/40'
                                : 'bg-[#F4F7FC] text-[#5A6582] border border-[#D5E0F2]'
                            }`}
                          >
                            Isolation
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Confirmation Bar */}
          {activePatient && selectedBedId && (
            <div className="mt-5 pt-4 border-t border-[#E9EFF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-[#252D43]">
                <span className="text-[#6E7A99]">Ready to assign:</span>{' '}
                <strong>{activePatient.name}</strong> →{' '}
                <strong className="text-[#4169E1]">{selectedBedId}</strong>
              </div>
              <button
                type="button"
                onClick={handleConfirmAllocation}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#619BFF] hover:from-[#3358D4] hover:to-[#4B89FF] px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <Bed className="h-4 w-4" />
                <span>Confirm Bed Allocation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
