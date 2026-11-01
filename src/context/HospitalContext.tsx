import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AcuityLevel,
  AdmissionRecord,
  AppointmentStatus,
  BedStatus,
  DischargeRecord,
  DoctorAvailability,
  DoctorProfile,
  EquipmentAvailability,
  EquipmentCondition,
  HospitalAppointment,
  HospitalAuditLog,
  HospitalBed,
  HospitalDepartment,
  HospitalFacilitySettings,
  HospitalInvoice,
  HospitalWard,
  MedicalEquipment,
  PatientRecord,
  PaymentStatus,
  WaitingQueueItem,
  WardType,
} from '../types/hospital';
import {
  INITIAL_ADMISSIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_BEDS,
  INITIAL_DEPARTMENTS,
  INITIAL_DISCHARGES,
  INITIAL_DOCTORS,
  INITIAL_EQUIPMENT,
  INITIAL_FACILITY_SETTINGS,
  INITIAL_HOSPITAL_AUDIT_LOGS,
  INITIAL_INVOICES,
  INITIAL_PATIENTS,
  INITIAL_WAITING_QUEUE,
  INITIAL_WARDS,
} from '../services/hospitalDemoData';
import { useAuth } from './AuthContext';

const HOSPITAL_STORAGE_KEY = 'blossom_care_hospital_hms_state_v2';

interface HospitalContextType {
  wards: HospitalWard[];
  beds: HospitalBed[];
  patients: PatientRecord[];
  waitingQueue: WaitingQueueItem[];
  admissions: AdmissionRecord[];
  discharges: DischargeRecord[];
  auditLogs: HospitalAuditLog[];
  doctors: DoctorProfile[];
  appointments: HospitalAppointment[];
  departments: HospitalDepartment[];
  invoices: HospitalInvoice[];
  equipment: MedicalEquipment[];
  facilitySettings: HospitalFacilitySettings;
  // Patient & Bed Operations
  registerPatient: (
    patientInput: Omit<PatientRecord, 'id' | 'mrn' | 'status' | 'admissionDate'> & {
      addToWaitingList?: boolean;
    }
  ) => PatientRecord;
  updatePatient: (
    patientId: string,
    updates: Partial<
      Pick<
        PatientRecord,
        | 'name'
        | 'age'
        | 'gender'
        | 'bloodGroup'
        | 'diagnosis'
        | 'acuity'
        | 'requiredWardType'
        | 'needsVentilator'
        | 'needsIsolation'
        | 'attendingPhysician'
        | 'contactPhone'
        | 'vitals'
      >
    >
  ) => void;
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
  // Doctor Operations
  addDoctor: (input: Omit<DoctorProfile, 'id'>) => DoctorProfile;
  updateDoctorAvailability: (doctorId: string, availability: DoctorAvailability) => void;
  // Appointment Operations (with Conflict Prevention)
  bookAppointment: (
    input: Omit<HospitalAppointment, 'id' | 'status'>
  ) => { ok: boolean; error?: string; appointment?: HospitalAppointment };
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (
    appointmentId: string,
    newDate: string,
    newTimeSlot: string
  ) => { ok: boolean; error?: string };
  // Department Operations
  addDepartment: (input: Omit<HospitalDepartment, 'id'>) => void;
  // Billing & Invoice Operations
  createInvoice: (
    input: Omit<HospitalInvoice, 'id' | 'invoiceNumber' | 'totalAmount'>
  ) => HospitalInvoice;
  updateInvoiceStatus: (
    invoiceId: string,
    status: PaymentStatus,
    paymentMethod?: HospitalInvoice['paymentMethod']
  ) => void;
  // Medical Equipment Operations
  addEquipment: (input: Omit<MedicalEquipment, 'id'>) => void;
  updateEquipmentStatus: (
    equipmentId: string,
    availability: EquipmentAvailability,
    condition?: EquipmentCondition
  ) => void;
  // Facility Settings & Audit
  updateFacilitySettings: (updates: Partial<HospitalFacilitySettings>) => void;
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
  doctors: DoctorProfile[];
  appointments: HospitalAppointment[];
  departments: HospitalDepartment[];
  invoices: HospitalInvoice[];
  equipment: MedicalEquipment[];
  facilitySettings: HospitalFacilitySettings;
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
          doctors: parsed.doctors || INITIAL_DOCTORS,
          appointments: parsed.appointments || INITIAL_APPOINTMENTS,
          departments: parsed.departments || INITIAL_DEPARTMENTS,
          invoices: parsed.invoices || INITIAL_INVOICES,
          equipment: parsed.equipment || INITIAL_EQUIPMENT,
          facilitySettings: parsed.facilitySettings || INITIAL_FACILITY_SETTINGS,
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
    doctors: INITIAL_DOCTORS,
    appointments: INITIAL_APPOINTMENTS,
    departments: INITIAL_DEPARTMENTS,
    invoices: INITIAL_INVOICES,
    equipment: INITIAL_EQUIPMENT,
    facilitySettings: INITIAL_FACILITY_SETTINGS,
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
  const [doctors, setDoctors] = useState<DoctorProfile[]>(initial.doctors);
  const [appointments, setAppointments] = useState<HospitalAppointment[]>(
    initial.appointments
  );
  const [departments, setDepartments] = useState<HospitalDepartment[]>(
    initial.departments
  );
  const [invoices, setInvoices] = useState<HospitalInvoice[]>(initial.invoices);
  const [equipment, setEquipment] = useState<MedicalEquipment[]>(
    initial.equipment
  );
  const [facilitySettings, setFacilitySettings] =
    useState<HospitalFacilitySettings>(initial.facilitySettings);

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
        doctors,
        appointments,
        departments,
        invoices,
        equipment,
        facilitySettings,
      };
      localStorage.setItem(HOSPITAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Unable to persist hospital state', e);
    }
  }, [
    wards,
    beds,
    patients,
    waitingQueue,
    admissions,
    discharges,
    auditLogs,
    doctors,
    appointments,
    departments,
    invoices,
    equipment,
    facilitySettings,
  ]);

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

  const updatePatient = useCallback(
    (
      patientId: string,
      updates: Partial<
        Pick<
          PatientRecord,
          | 'name'
          | 'age'
          | 'gender'
          | 'bloodGroup'
          | 'diagnosis'
          | 'acuity'
          | 'requiredWardType'
          | 'needsVentilator'
          | 'needsIsolation'
          | 'attendingPhysician'
          | 'contactPhone'
          | 'vitals'
        >
      >
    ) => {
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, ...updates } : p))
      );
      setWaitingQueue((prev) =>
        prev.map((w) => {
          if (w.patientId !== patientId) return w;
          const scoreMap: Record<AcuityLevel, number> = {
            Critical: 95,
            High: 82,
            Moderate: 60,
            Stable: 35,
          };
          const newAcuity = updates.acuity || w.acuity;
          return {
            ...w,
            patientName: updates.name ?? w.patientName,
            age: updates.age ?? w.age,
            diagnosis: updates.diagnosis ?? w.diagnosis,
            acuity: newAcuity,
            priorityScore: scoreMap[newAcuity],
            requiredWardType: updates.requiredWardType ?? w.requiredWardType,
            needsVentilator: updates.needsVentilator ?? w.needsVentilator,
            needsIsolation: updates.needsIsolation ?? w.needsIsolation,
            requestingDoctor: updates.attendingPhysician ?? w.requestingDoctor,
          };
        })
      );
      addAuditLog(
        'Admission',
        `Updated clinical profile for patient ${updates.name || patientId}.`,
        'Info'
      );
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

      setWaitingQueue((prev) =>
        prev.filter((w) => w.patientId !== patientId)
      );

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

  // ==========================================================================
  // DOCTORS, APPOINTMENTS, DEPARTMENTS, BILLING & MEDICAL EQUIPMENT OPERATIONS
  // ==========================================================================

  const addDoctor = useCallback(
    (input: Omit<DoctorProfile, 'id'>): DoctorProfile => {
      const newDoc: DoctorProfile = {
        ...input,
        id: `DOC-${Math.floor(210 + Math.random() * 780)}`,
      };
      setDoctors((prev) => [newDoc, ...prev]);
      addAuditLog(
        'StaffAdmin',
        `Registered attending physician ${newDoc.name} (${newDoc.specialization} · ${newDoc.department}).`,
        'Info'
      );
      return newDoc;
    },
    [addAuditLog]
  );

  const updateDoctorAvailability = useCallback(
    (doctorId: string, availability: DoctorAvailability) => {
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorId ? { ...d, availability } : d))
      );
      const doc = doctors.find((d) => d.id === doctorId);
      addAuditLog(
        'StaffAdmin',
        `Updated availability for ${doc?.name || doctorId} to [${availability}].`,
        'Info'
      );
    },
    [doctors, addAuditLog]
  );

  const bookAppointment = useCallback(
    (
      input: Omit<HospitalAppointment, 'id' | 'status'>
    ): { ok: boolean; error?: string; appointment?: HospitalAppointment } => {
      // Conflict check: prevent booking same doctor on same date + timeSlot if already Scheduled
      const conflict = appointments.find(
        (a) =>
          a.status === 'Scheduled' &&
          a.doctorId === input.doctorId &&
          a.date === input.date &&
          a.timeSlot.toLowerCase() === input.timeSlot.toLowerCase()
      );
      if (conflict) {
        return {
          ok: false,
          error: `Scheduling conflict: ${input.doctorName} is already booked on ${input.date} at ${input.timeSlot} with patient ${conflict.patientName}. Please select another time slot or physician.`,
        };
      }

      const newApt: HospitalAppointment = {
        ...input,
        id: `APT-${Math.floor(410 + Math.random() * 580)}`,
        status: 'Scheduled',
      };
      setAppointments((prev) => [newApt, ...prev]);
      addAuditLog(
        'Appointment',
        `Scheduled ${newApt.type} appointment for ${newApt.patientName} with ${newApt.doctorName} on ${newApt.date} at ${newApt.timeSlot}.`,
        newApt.type === 'Emergency' ? 'Urgent' : 'Info'
      );
      return { ok: true, appointment: newApt };
    },
    [appointments, addAuditLog]
  );

  const updateAppointmentStatus = useCallback(
    (appointmentId: string, status: AppointmentStatus) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
      );
      const apt = appointments.find((a) => a.id === appointmentId);
      addAuditLog(
        'Appointment',
        `Marked appointment ${appointmentId} (${apt?.patientName || 'Patient'}) as [${status}].`,
        'Info'
      );
    },
    [appointments, addAuditLog]
  );

  const rescheduleAppointment = useCallback(
    (
      appointmentId: string,
      newDate: string,
      newTimeSlot: string
    ): { ok: boolean; error?: string } => {
      const target = appointments.find((a) => a.id === appointmentId);
      if (!target) {
        return { ok: false, error: 'Appointment not found.' };
      }
      const conflict = appointments.find(
        (a) =>
          a.id !== appointmentId &&
          a.status === 'Scheduled' &&
          a.doctorId === target.doctorId &&
          a.date === newDate &&
          a.timeSlot.toLowerCase() === newTimeSlot.toLowerCase()
      );
      if (conflict) {
        return {
          ok: false,
          error: `Scheduling conflict: ${target.doctorName} already has an appointment on ${newDate} at ${newTimeSlot}.`,
        };
      }
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, date: newDate, timeSlot: newTimeSlot, status: 'Scheduled' }
            : a
        )
      );
      addAuditLog(
        'Appointment',
        `Rescheduled appointment ${appointmentId} (${target.patientName}) to ${newDate} at ${newTimeSlot}.`,
        'Info'
      );
      return { ok: true };
    },
    [appointments, addAuditLog]
  );

  const addDepartment = useCallback(
    (input: Omit<HospitalDepartment, 'id'>) => {
      const newDep: HospitalDepartment = {
        ...input,
        id: `DEP-${Date.now().toString().slice(-3)}`,
      };
      setDepartments((prev) => [...prev, newDep]);
      addAuditLog(
        'Settings',
        `Added clinical department ${newDep.name} (${newDep.code}).`,
        'Info'
      );
    },
    [addAuditLog]
  );

  const createInvoice = useCallback(
    (
      input: Omit<HospitalInvoice, 'id' | 'invoiceNumber' | 'totalAmount'>
    ): HospitalInvoice => {
      const seq = Math.floor(810 + Math.random() * 189);
      const totalAmount =
        Number(input.consultationCharge) +
        Number(input.bedAndNursingCharge) +
        Number(input.medicationAndLabCharge);
      const newInv: HospitalInvoice = {
        ...input,
        id: `INV-${seq}`,
        invoiceNumber: `BLC-2026-0${seq}`,
        totalAmount,
      };
      setInvoices((prev) => [newInv, ...prev]);
      addAuditLog(
        'Billing',
        `Generated invoice ${newInv.invoiceNumber} ($${totalAmount.toLocaleString()}) for ${newInv.patientName}.`,
        'Info'
      );
      return newInv;
    },
    [addAuditLog]
  );

  const updateInvoiceStatus = useCallback(
    (
      invoiceId: string,
      status: PaymentStatus,
      paymentMethod?: HospitalInvoice['paymentMethod']
    ) => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status,
                paymentMethod: paymentMethod || inv.paymentMethod,
              }
            : inv
        )
      );
      const inv = invoices.find((i) => i.id === invoiceId);
      addAuditLog(
        'Billing',
        `Updated invoice ${inv?.invoiceNumber || invoiceId} payment status to [${status}].`,
        'Info'
      );
    },
    [invoices, addAuditLog]
  );

  const addEquipment = useCallback(
    (input: Omit<MedicalEquipment, 'id'>) => {
      const newEq: MedicalEquipment = {
        ...input,
        id: `EQP-${Math.floor(110 + Math.random() * 880)}`,
      };
      setEquipment((prev) => [newEq, ...prev]);
      addAuditLog(
        'Equipment',
        `Registered medical equipment ${newEq.name} (${newEq.assetTag}) in ${newEq.department}.`,
        'Info'
      );
    },
    [addAuditLog]
  );

  const updateEquipmentStatus = useCallback(
    (
      equipmentId: string,
      availability: EquipmentAvailability,
      condition?: EquipmentCondition
    ) => {
      setEquipment((prev) =>
        prev.map((eq) =>
          eq.id === equipmentId
            ? {
                ...eq,
                availability,
                condition: condition || eq.condition,
                lastServicedDate:
                  availability === 'Available' && condition === 'Excellent'
                    ? new Date().toISOString().slice(0, 10)
                    : eq.lastServicedDate,
              }
            : eq
        )
      );
      const eq = equipment.find((e) => e.id === equipmentId);
      addAuditLog(
        'Equipment',
        `Updated equipment ${eq?.name || equipmentId} status to [${availability}]${
          condition ? ` · Condition: ${condition}` : ''
        }.`,
        availability === 'Under Maintenance' ? 'Elevated' : 'Info'
      );
    },
    [equipment, addAuditLog]
  );

  const updateFacilitySettings = useCallback(
    (updates: Partial<HospitalFacilitySettings>) => {
      setFacilitySettings((prev) => ({ ...prev, ...updates }));
      addAuditLog(
        'Settings',
        `Updated hospital administration & facility configuration.`,
        'Info'
      );
    },
    [addAuditLog]
  );

  const resetHospitalDemoData = useCallback(() => {
    setWards(INITIAL_WARDS);
    setBeds(INITIAL_BEDS);
    setPatients(INITIAL_PATIENTS);
    setWaitingQueue(INITIAL_WAITING_QUEUE);
    setAdmissions(INITIAL_ADMISSIONS);
    setDischarges(INITIAL_DISCHARGES);
    setAuditLogs(INITIAL_HOSPITAL_AUDIT_LOGS);
    setDoctors(INITIAL_DOCTORS);
    setAppointments(INITIAL_APPOINTMENTS);
    setDepartments(INITIAL_DEPARTMENTS);
    setInvoices(INITIAL_INVOICES);
    setEquipment(INITIAL_EQUIPMENT);
    setFacilitySettings(INITIAL_FACILITY_SETTINGS);
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
        doctors,
        appointments,
        departments,
        invoices,
        equipment,
        facilitySettings,
        registerPatient,
        updatePatient,
        allocateBedToPatient,
        updateBedStatus,
        addNewBed,
        addWard,
        dischargePatient,
        addDoctor,
        updateDoctorAvailability,
        bookAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        addDepartment,
        createInvoice,
        updateInvoiceStatus,
        addEquipment,
        updateEquipmentStatus,
        updateFacilitySettings,
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
