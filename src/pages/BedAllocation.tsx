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
  Code2,
  ShieldCheck,
  Layers,
  Zap,
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

  const selectedBedObj = useMemo(
    () => beds.find((b) => b.id === selectedBedId) || recommendedBeds[0] || null,
    [beds, selectedBedId, recommendedBeds]
  );

  // Compute Polymorphic Java Suitability Score matching com.blossom.model.Bed subclasses
  const oopSuitabilityAnalysis = useMemo(() => {
    if (!activePatient || !selectedBedObj) return null;
    const isIcuSubclass = selectedBedObj.wardType === 'ICU' || selectedBedObj.isICU;
    const subclassName = isIcuSubclass
      ? 'com.blossom.model.ICUBed'
      : 'com.blossom.model.GeneralBed';

    const wardMatchPoints =
      selectedBedObj.wardType === activePatient.requiredWardType ? 50 : 0;
    const ventPoints =
      activePatient.needsVentilator && selectedBedObj.hasVentilator ? 25 : 0;
    const isoPoints =
      activePatient.needsIsolation && selectedBedObj.isolationCapable ? 20 : 0;
    const icuBonusPoints =
      isIcuSubclass && activePatient.acuity === 'Critical' ? 5 : 0;

    let penalty = 0;
    if (
      !isIcuSubclass &&
      (activePatient.acuity === 'Critical' || activePatient.needsVentilator)
    ) {
      penalty = 50;
    } else if (
      isIcuSubclass &&
      activePatient.needsVentilator &&
      !selectedBedObj.hasVentilator
    ) {
      penalty = 60;
    }

    const totalScore = Math.max(
      0,
      wardMatchPoints + ventPoints + isoPoints + icuBonusPoints - penalty
    );

    const isSuitable = isIcuSubclass
      ? (!activePatient.needsVentilator || selectedBedObj.hasVentilator) &&
        (!activePatient.needsIsolation || selectedBedObj.isolationCapable) &&
        (activePatient.acuity === 'Critical' ||
          activePatient.acuity === 'High' ||
          activePatient.requiredWardType === 'ICU')
      : activePatient.acuity !== 'Critical' &&
        !activePatient.needsVentilator &&
        (!activePatient.needsIsolation || selectedBedObj.isolationCapable) &&
        selectedBedObj.wardType === activePatient.requiredWardType;

    return {
      subclassName,
      isIcuSubclass,
      wardMatchPoints,
      ventPoints,
      isoPoints,
      icuBonusPoints,
      penalty,
      totalScore,
      isSuitable,
    };
  }, [activePatient, selectedBedObj]);

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

  const handleAutoAssignTopPriority = () => {
    if (waitingPatients.length === 0) return;
    const topPatient = waitingPatients[0];
    const recs = getRecommendedBedsForPatient({
      requiredWardType: topPatient.requiredWardType,
      needsVentilator: topPatient.needsVentilator,
      needsIsolation: topPatient.needsIsolation,
    });
    if (recs.length === 0) return;
    const bestBed = recs[0];
    const ok = allocateBedToPatient(topPatient.id, bestBed.id);
    if (ok) {
      setLastAllocatedBanner(
        `Auto-Allocated Priority #1 Patient ${topPatient.name} (${topPatient.mrn}) to Optimal Match ${bestBed.bedNumber} (${bestBed.wardName}).`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#111A35] via-[#202B52] to-[#2B3B70] p-5 sm:p-6 text-white shadow-lg border border-[#4169E1]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[11px] font-bold text-white mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#619BFF] shrink-0" />
            <span className="truncate">INTELLIGENT CLINICAL BED MATCHING</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
            Smart Bed Allocation Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE6FA] font-medium mt-1">
            Pair triaged patients with compatible ICU and specialty ward beds based on acuity, ventilator support, and isolation criteria.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="rounded-2xl bg-black/20 border border-white/25 px-3.5 py-2.5 text-right sm:min-w-[125px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#DCE6FA]">
                Available Beds
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-display text-[#619BFF] mt-0.5">
                {beds.filter((b) => b.status === 'Available').length}
              </div>
            </div>
            <div className="rounded-2xl bg-black/20 border border-white/25 px-3.5 py-2.5 text-right sm:min-w-[135px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#DCE6FA]">
                Awaiting Placement
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-display text-[#FF8278] mt-0.5">
                {waitingPatients.length}
              </div>
            </div>
          </div>

          {waitingPatients.length > 0 && recommendedBeds.length > 0 && (
            <button
              type="button"
              onClick={handleAutoAssignTopPriority}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#4169E1] hover:bg-[#3256C9] px-4 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Zap className="h-4 w-4" />
              <span>Auto-Allocate #1 Priority</span>
            </button>
          )}
        </div>
      </div>

      {lastAllocatedBanner && (
        <div className="rounded-2xl bg-[#E8E4FF] border border-[#8975D5]/50 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#202B52] shadow-sm">
          <div className="flex items-center gap-2.5 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#4169E1] shrink-0" />
            <span>{lastAllocatedBanner}</span>
          </div>
          <button
            onClick={() => setLastAllocatedBanner(null)}
            className="text-[11px] font-bold text-[#4169E1] hover:underline self-end sm:self-auto cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Allocation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queued Patients */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#D5E0F2] p-4 sm:p-5 shadow-sm flex flex-col">
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

          <div className="space-y-2.5 max-h-[460px] sm:max-h-[540px] overflow-y-auto pr-1">
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
                const qItem = waitingQueue.find(
                  (q) => q.patientId === patient.id
                );
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full text-left rounded-2xl p-3.5 sm:p-4 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8E4FF] text-[#252D43] border-[#4169E1] shadow-sm'
                        : 'bg-[#F8FAFE] hover:bg-[#E9EFF8]/75 text-[#252D43] border-[#D5E0F2]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold font-display text-[#252D43] truncate">
                          {patient.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-[#4169E1] border border-[#D5E0F2] shrink-0">
                          {patient.mrn}
                        </span>
                      </div>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold shrink-0 ${
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
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#D5E0F2] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
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
                  <Activity className="h-4 w-4 shrink-0" />
                  <span>
                    HR {activePatient.vitals.heartRate} bpm · SpO₂{' '}
                    {activePatient.vitals.spo2}%
                  </span>
                </div>
              )}
            </div>

            {!activePatient ? (
              <div className="rounded-2xl bg-[#F4F7FC] p-10 text-center text-xs font-medium text-[#5A6582]">
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
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="inline-flex h-9 w-12 shrink-0 items-center justify-center rounded-xl bg-[#202B52] text-white font-mono text-xs font-extrabold">
                            {bed.bedNumber}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#252D43] truncate">
                              {bed.wardName}
                            </div>
                            <div className="text-[11px] font-semibold text-[#5A6582]">
                              {bed.wardType} Unit
                            </div>
                          </div>
                        </div>

                        {index === 0 && (
                          <span className="rounded-lg bg-[#4169E1] px-2.5 py-0.5 text-[10px] font-bold text-white shrink-0">
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#619BFF] hover:from-[#3358D4] hover:to-[#4B89FF] px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                <Bed className="h-4 w-4" />
                <span>Confirm Bed Allocation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live OOTS Java Domain & Polymorphic Suitability Inspector (CCSE0355) */}
      {activePatient && selectedBedObj && oopSuitabilityAnalysis && (
        <section className="rounded-3xl bg-white border border-[#D5E0F2] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E9F5] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8E4FF] text-[#4169E1]">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#252D43] font-display">
                  OOTS Java Domain Evaluation Trace (CCSE0355 · Team G-66)
                </h2>
                <p className="text-[11px] text-[#5A6582]">
                  Live inspection of Inheritance, Polymorphism, Encapsulation, and Custom Exception Guards for the selected pair
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto rounded-xl bg-[#E9EFF8] border border-[#D5E0F2] px-3 py-1 font-mono text-xs font-bold text-[#2850C8]">
              Suitability Score: {oopSuitabilityAnalysis.totalScore} / 100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* 1. Inheritance & Subclass Resolution */}
            <div className="rounded-2xl bg-[#F4F7FC] border border-[#D5E0F2] p-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-[#252D43]">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#4169E1]" />
                  <span>1. Inheritance Hierarchy</span>
                </span>
                <span className="font-mono text-[10px] text-[#4169E1]">
                  extends Bed
                </span>
              </div>
              <div className="font-mono text-[11px] font-bold text-[#2850C8] break-all">
                {oopSuitabilityAnalysis.subclassName}
              </div>
              <div className="text-[11px] text-[#5A6582] space-y-1 pt-1">
                <div>
                  • Encapsulated ID: <strong className="font-mono text-[#252D43]">{selectedBedObj.id}</strong>
                </div>
                <div>
                  • Ward ID: <strong className="font-mono text-[#252D43]">{selectedBedObj.wardId}</strong>
                </div>
                <div>
                  • State: <strong className="font-mono text-[#252D43]">isOccupied = false</strong>
                </div>
              </div>
            </div>

            {/* 2. Polymorphic Score Computation */}
            <div className="rounded-2xl bg-[#E8E4FF]/45 border border-[#D5E0F2] p-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-[#252D43]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#523B9E]" />
                  <span>2. Polymorphic Scoring</span>
                </span>
                <span className="font-mono text-[10px] text-[#523B9E]">
                  @Override
                </span>
              </div>
              <div className="font-mono text-[11px] font-bold text-[#252D43]">
                calculateSuitabilityScore(patient)
              </div>
              <div className="text-[11px] text-[#5A6582] space-y-1 pt-1 font-mono">
                <div className="flex justify-between">
                  <span>Ward Match ({selectedBedObj.wardType}):</span>
                  <strong className="text-[#252D43]">+{oopSuitabilityAnalysis.wardMatchPoints}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ventilator Compatibility:</span>
                  <strong className="text-[#252D43]">+{oopSuitabilityAnalysis.ventPoints}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Isolation / ICU Bonus:</span>
                  <strong className="text-[#252D43]">
                    +{oopSuitabilityAnalysis.isoPoints + oopSuitabilityAnalysis.icuBonusPoints}
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. Custom Exception Guards */}
            <div className="rounded-2xl bg-[#F4F7FC] border border-[#D5E0F2] p-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-[#252D43]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#4169E1]" />
                  <span>3. Exception Guards</span>
                </span>
                <span className="font-mono text-[10px] text-[#2850C8]">
                  com.blossom.exception
                </span>
              </div>
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between rounded-xl bg-white border border-[#D5E0F2] px-2.5 py-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#252D43]">
                    BedUnavailableException
                  </span>
                  <span className="font-bold text-[#2850C8]">PASS (Available)</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white border border-[#D5E0F2] px-2.5 py-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#252D43]">
                    InvalidAllocationRequest
                  </span>
                  <span className="font-bold text-[#2850C8]">
                    {oopSuitabilityAnalysis.isSuitable ? 'PASS (Clinical Match)' : 'OVERRIDE READY'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
