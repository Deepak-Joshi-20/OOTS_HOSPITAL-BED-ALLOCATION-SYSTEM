import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AcuityLevel,
  AdmissionRecord,
  BedStatus,
  DischargeRecord,
  HospitalAuditLog,
  HospitalBed,
  HospitalWard,
  PatientRecord,
  WaitingQueueItem,
  WardType,
} from '../types/hospital';
import {
  INITIAL_ADMISSIONS,
  INITIAL_BEDS,
  INITIAL_DISCHARGES,
  INITIAL_HOSPITAL_AUDIT_LOGS,
  INITIAL_PATIENTS,
  INITIAL_WAITING_QUEUE,
  INITIAL_WARDS,
} from '../services/hospitalDemoData';
import { useAuth } from './AuthContext';

const HOSPITAL_STORAGE_KEY = 'luxe_medical_hospital_state_v1';

interface HospitalContextType {
  wards: HospitalWard[];
  beds: HospitalBed[];
  patients: PatientRecord[];
  waitingQueue: WaitingQueueItem[];
  admissions: AdmissionRecord[];
  discharges: DischargeRecord[];
  auditLogs: HospitalAuditLog[];
  // Operations
  registerPatient: (
    patientInput: Omit<PatientRecord, 'id' | 'mrn' | 'status' | 'admissionDate'> & {
      addToWaitingList?: boolean;
    }
  ) => PatientRecord;
  allocateBedToPatient: (patientId: string, bedId: string) => boolean;
  updateBedStatus: (bedId: string, newStatus: BedStatus) => void;
  addNewBed: (input: {
    bedNumber: string;
    wardId: string;
    hasVentilator: boolean;
    hasTelemetryMonitor: boolean;
    isolationCapable: boolean;
  }) => void;
  addWard: (wardInput: Omit<HospitalWard, 'id'>) => void;
  dischargePatient: (
    patientId: string,
    outcome: DischargeRecord['outcome'],
    summaryNotes: string,
    postBedStatus?: 'Cleaning' | 'Available'
  ) => void;
  addAuditLog: (
    category: HospitalAuditLog['category'],
    action: string,
    severity?: HospitalAuditLog['severity']
  ) => void;
  resetHospitalDemoData: () => void;
  getRecommendedBedsForPatient: (patient: {
    requiredWardType: WardType;
    needsVentilator: boolean;
    needsIsolation: boolean;
  }) => HospitalBed[];
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

interface StoredHospitalState {
  wards: HospitalWard[];
  beds: HospitalBed[];
  patients: PatientRecord[];
  waitingQueue: WaitingQueueItem[];
  admissions: AdmissionRecord[];
  discharges: DischargeRecord[];
  auditLogs: HospitalAuditLog[];
}

function loadHospitalState(): StoredHospitalState {
  try {
    const raw = localStorage.getItem(HOSPITAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.beds) && Array.isArray(parsed.patients)) {
        return {
          wards: parsed.wards || INITIAL_WARDS,
          beds: parsed.beds,
          patients: parsed.patients,
          waitingQueue: parsed.waitingQueue || INITIAL_WAITING_QUEUE,
          admissions: parsed.admissions || INITIAL_ADMISSIONS,
          discharges: parsed.discharges || INITIAL_DISCHARGES,
          auditLogs: parsed.auditLogs || INITIAL_HOSPITAL_AUDIT_LOGS,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse hospital state, seeding defaults.', e);
  }
  return {
    wards: INITIAL_WARDS,
    beds: INITIAL_BEDS,
    patients: INITIAL_PATIENTS,
    waitingQueue: INITIAL_WAITING_QUEUE,
    admissions: INITIAL_ADMISSIONS,
    discharges: INITIAL_DISCHARGES,
    auditLogs: INITIAL_HOSPITAL_AUDIT_LOGS,
  };
}

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [initial] = useState<StoredHospitalState>(loadHospitalState);

  const [wards, setWards] = useState<HospitalWard[]>(initial.wards);
  const [beds, setBeds] = useState<HospitalBed[]>(initial.beds);
  const [patients, setPatients] = useState<PatientRecord[]>(initial.patients);
  const [waitingQueue, setWaitingQueue] = useState<WaitingQueueItem[]>(
    initial.waitingQueue
  );
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>(
    initial.admissions
  );
  const [discharges, setDischarges] = useState<DischargeRecord[]>(
    initial.discharges
  );
  const [auditLogs, setAuditLogs] = useState<HospitalAuditLog[]>(
    initial.auditLogs
  );

  useEffect(() => {
    try {
      const state: StoredHospitalState = {
        wards,
        beds,
        patients,
        waitingQueue,
        admissions,
        discharges,
        auditLogs: auditLogs.slice(0, 150),
      };
      localStorage.setItem(HOSPITAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Unable to persist hospital state', e);
    }
  }, [wards, beds, patients, waitingQueue, admissions, discharges, auditLogs]);

  const addAuditLog = useCallback(
    (
      category: HospitalAuditLog['category'],
      action: string,
      severity: HospitalAuditLog['severity'] = 'Info'
    ) => {
      const entry: HospitalAuditLog = {
        id: `AUD-${Math.floor(1000 + Math.random() * 8999)}`,
        timestamp: new Date().toISOString(),
        actorName: currentUser?.name || 'System Operator',
        actorRole: currentUser?.role || 'Administrator',
        category,
        action,
        severity,
      };
      setAuditLogs((prev) => [entry, ...prev.slice(0, 149)]);
    },
    [currentUser]
  );

  const registerPatient = useCallback(
    (
      input: Omit<PatientRecord, 'id' | 'mrn' | 'status' | 'admissionDate'> & {
        addToWaitingList?: boolean;
      }
    ): PatientRecord => {
      const id = `PAT-${Math.floor(1020 + Math.random() * 8900)}`;
      const mrn = `MRN-${Math.floor(88500 + Math.random() * 9999)}`;
      const today = new Date().toISOString().slice(0, 10);

      const newPatient: PatientRecord = {
        id,
        mrn,
        name: input.name,
        age: input.age,
        gender: input.gender,
        bloodGroup: input.bloodGroup,
        diagnosis: input.diagnosis,
        acuity: input.acuity,
        requiredWardType: input.requiredWardType,
        needsVentilator: input.needsVentilator,
        needsIsolation: input.needsIsolation,
        status: 'Waiting',
        attendingPhysician: input.attendingPhysician,
        admissionDate: today,
        contactPhone: input.contactPhone,
        vitals: input.vitals,
      };

      setPatients((prev) => [newPatient, ...prev]);

      if (input.addToWaitingList !== false) {
        const scoreMap: Record<AcuityLevel, number> = {
          Critical: 95,
          High: 82,
          Moderate: 60,
          Stable: 35,
        };
        const queueItem: WaitingQueueItem = {
          id: `WL-${Math.floor(310 + Math.random() * 689)}`,
          patientId: newPatient.id,
          patientName: newPatient.name,
          age: newPatient.age,
          diagnosis: newPatient.diagnosis,
          acuity: newPatient.acuity,
          priorityScore: scoreMap[newPatient.acuity],
          requiredWardType: newPatient.requiredWardType,
          needsVentilator: newPatient.needsVentilator,
          needsIsolation: newPatient.needsIsolation,
          requestedAt: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          requestingDoctor: newPatient.attendingPhysician,
          notes: `Awaiting ${newPatient.requiredWardType} bed assignment.`,
        };
        setWaitingQueue((prev) =>
          [queueItem, ...prev].sort((a, b) => b.priorityScore - a.priorityScore)
        );
      }

      addAuditLog(
        'Admission',
        `Registered patient ${newPatient.name} (${newPatient.mrn}) with ${newPatient.acuity} acuity.`,
        newPatient.acuity === 'Critical' ? 'Urgent' : 'Info'
      );

      return newPatient;
    },
    [addAuditLog]
  );

  const getRecommendedBedsForPatient = useCallback(
    (patient: {
      requiredWardType: WardType;
      needsVentilator: boolean;
      needsIsolation: boolean;
    }): HospitalBed[] => {
      const availableBeds = beds.filter((b) => b.status === 'Available');
      return [...availableBeds].sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.wardType === patient.requiredWardType) scoreA += 50;
        if (b.wardType === patient.requiredWardType) scoreB += 50;
        if (patient.needsVentilator && a.hasVentilator) scoreA += 25;
        if (patient.needsVentilator && b.hasVentilator) scoreB += 25;
        if (patient.needsIsolation && a.isolationCapable) scoreA += 20;
        if (patient.needsIsolation && b.isolationCapable) scoreB += 20;
        return scoreB - scoreA;
      });
    },
    [beds]
  );

  const allocateBedToPatient = useCallback(
    (patientId: string, bedId: string): boolean => {
      const targetPatient = patients.find((p) => p.id === patientId);
      const targetBed = beds.find((b) => b.id === bedId);
      if (!targetPatient || !targetBed || targetBed.status !== 'Available') {
        return false;
      }

      const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

      // Update Bed
      setBeds((prev) =>
        prev.map((b) =>
          b.id === bedId
            ? {
                ...b,
                status: 'Occupied',
                patientId: targetPatient.id,
                patientName: targetPatient.name,
                admittedAt: timestamp,
              }
            : b
        )
      );

      // Update Patient
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                status: 'Admitted',
                assignedBedId: targetBed.id,
                assignedWardName: targetBed.wardName,
              }
            : p
        )
      );

      // Remove from Waiting Queue
      setWaitingQueue((prev) =>
        prev.filter((w) => w.patientId !== patientId)
      );

      // Create Admission Record
      const newAdm: AdmissionRecord = {
        id: `ADM-${Math.floor(710 + Math.random() * 289)}`,
        patientId: targetPatient.id,
        patientName: targetPatient.name,
        mrn: targetPatient.mrn,
        bedId: targetBed.id,
        wardName: targetBed.wardName,
        attendingPhysician: targetPatient.attendingPhysician,
        diagnosis: targetPatient.diagnosis,
        acuity: targetPatient.acuity,
        admittedAt: timestamp,
        admittedBy: currentUser?.name || 'Admissions Desk',
        status: 'Active',
      };
      setAdmissions((prev) => [newAdm, ...prev]);

      addAuditLog(
        'Allocation',
        `Allocated bed ${targetBed.bedNumber} (${targetBed.wardName}) to ${targetPatient.name} (${targetPatient.mrn}).`,
        targetPatient.acuity === 'Critical' ? 'Urgent' : 'Elevated'
      );

      return true;
    },
    [patients, beds, currentUser, addAuditLog]
  );

  const updateBedStatus = useCallback(
    (bedId: string, newStatus: BedStatus) => {
      setBeds((prev) =>
        prev.map((b) => {
          if (b.id !== bedId) return b;
          const cleared =
            newStatus !== 'Occupied'
              ? { patientId: undefined, patientName: undefined, admittedAt: undefined }
              : {};
          return {
            ...b,
            status: newStatus,
            ...cleared,
            lastSanitized:
              newStatus === 'Available'
                ? new Date().toISOString().slice(0, 10)
                : b.lastSanitized,
          };
        })
      );

      addAuditLog(
        'BedStatus',
        `Updated bed ${bedId} operational status to [${newStatus}].`,
        'Info'
      );
    },
    [addAuditLog]
  );

  const addNewBed = useCallback(
    (input: {
      bedNumber: string;
      wardId: string;
      hasVentilator: boolean;
      hasTelemetryMonitor: boolean;
      isolationCapable: boolean;
    }) => {
      const targetWard = wards.find((w) => w.id === input.wardId) || wards[0];
      if (!targetWard) return;

      const newBed: HospitalBed = {
        id: `BED-${input.bedNumber.toUpperCase()}`,
        bedNumber: input.bedNumber.toUpperCase(),
        wardId: targetWard.id,
        wardName: targetWard.name,
        wardType: targetWard.type,
        status: 'Available',
        isICU: targetWard.type === 'ICU',
        hasVentilator: input.hasVentilator,
        hasTelemetryMonitor: input.hasTelemetryMonitor,
        isolationCapable: input.isolationCapable,
        lastSanitized: new Date().toISOString().slice(0, 10),
      };

      setBeds((prev) => [...prev, newBed]);
      addAuditLog(
        'BedStatus',
        `Commissioned new hospital bed ${newBed.bedNumber} in ${targetWard.name}.`,
        'Info'
      );
    },
    [wards, addAuditLog]
  );

  const addWard = useCallback(
    (wardInput: Omit<HospitalWard, 'id'>) => {
      const newWard: HospitalWard = {
        ...wardInput,
        id: `WRD-${Date.now().toString().slice(-3)}`,
      };
      setWards((prev) => [...prev, newWard]);
      addAuditLog(
        'Settings',
        `Created hospital ward ${newWard.name} (${newWard.floor} · ${newWard.wing}).`,
        'Elevated'
      );
    },
    [addAuditLog]
  );

  const dischargePatient = useCallback(
    (
      patientId: string,
      outcome: DischargeRecord['outcome'],
      summaryNotes: string,
      postBedStatus: 'Cleaning' | 'Available' = 'Cleaning'
    ) => {
      const targetPatient = patients.find((p) => p.id === patientId);
      if (!targetPatient) return;

      const releasedBedId = targetPatient.assignedBedId || 'UNASSIGNED';
      const wardName = targetPatient.assignedWardName || 'General Suite';
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

      // Update Patient
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                status: 'Discharged',
                assignedBedId: undefined,
              }
            : p
        )
      );

      // Release Bed
      if (targetPatient.assignedBedId) {
        setBeds((prev) =>
          prev.map((b) =>
            b.id === targetPatient.assignedBedId
              ? {
                  ...b,
                  status: postBedStatus,
                  patientId: undefined,
                  patientName: undefined,
                  admittedAt: undefined,
                }
              : b
          )
        );
      }

      // Mark admission completed
      setAdmissions((prev) =>
        prev.map((adm) =>
          adm.patientId === patientId ? { ...adm, status: 'Completed' } : adm
        )
      );

      const newDischarge: DischargeRecord = {
        id: `DSC-${Math.floor(510 + Math.random() * 489)}`,
        patientId: targetPatient.id,
        patientName: targetPatient.name,
        mrn: targetPatient.mrn,
        releasedBedId,
        wardName,
        dischargedAt: nowStr,
        dischargedBy: currentUser?.name || 'Ward Charge Nurse',
        outcome,
        summaryNotes:
          summaryNotes.trim() ||
          'Patient clinically cleared for discharge; bed transitioned to turnover.',
      };

      setDischarges((prev) => [newDischarge, ...prev]);

      addAuditLog(
        'Discharge',
        `Discharged ${targetPatient.name} (${targetPatient.mrn}) from ${releasedBedId}; bed set to [${postBedStatus}].`,
        'Elevated'
      );
    },
    [patients, currentUser, addAuditLog]
  );

  const resetHospitalDemoData = useCallback(() => {
    setWards(INITIAL_WARDS);
    setBeds(INITIAL_BEDS);
    setPatients(INITIAL_PATIENTS);
    setWaitingQueue(INITIAL_WAITING_QUEUE);
    setAdmissions(INITIAL_ADMISSIONS);
    setDischarges(INITIAL_DISCHARGES);
    setAuditLogs(INITIAL_HOSPITAL_AUDIT_LOGS);
    localStorage.removeItem(HOSPITAL_STORAGE_KEY);
  }, []);

  return (
    <HospitalContext.Provider
      value={{
        wards,
        beds,
        patients,
        waitingQueue,
        admissions,
        discharges,
        auditLogs,
        registerPatient,
        allocateBedToPatient,
        updateBedStatus,
        addNewBed,
        addWard,
        dischargePatient,
        addAuditLog,
        resetHospitalDemoData,
        getRecommendedBedsForPatient,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export function useHospital() {
  const ctx = useContext(HospitalContext);
  if (!ctx) {
    throw new Error('useHospital must be used inside a HospitalProvider');
  }
  return ctx;
}
