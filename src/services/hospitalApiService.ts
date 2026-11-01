import {
  AdmissionRecord,
  DischargeRecord,
  HospitalBed,
  HospitalWard,
  MedicalEquipment,
  PatientRecord,
  WaitingQueueItem,
} from '../types/hospital';

/**
 * Optional HTTP REST API Client for connecting the Blossom Care React Frontend
 * to the Java 17 Spring Boot Backend (`java-backend/`).
 *
 * Uses environment-based configuration (`VITE_HOSPITAL_API_URL`).
 * When the Java backend is offline or not configured (e.g. static Netlify preview),
 * all callers safely fall back to the local demonstration dataset without breaking the UI.
 */
const API_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_HOSPITAL_API_URL || '';

export const isJavaBackendConfigured = (): boolean => {
  return Boolean(API_BASE_URL && API_BASE_URL.trim().length > 0);
};

async function safeFetchJson<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  if (!isJavaBackendConfigured()) {
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    // Safe fallback to local demo state when Java backend is offline
    return null;
  }
}

export const hospitalApiService = {
  getPatients: () => safeFetchJson<PatientRecord[]>('/patients'),
  getBeds: () => safeFetchJson<HospitalBed[]>('/beds'),
  getWards: () => safeFetchJson<HospitalWard[]>('/wards'),
  getWaitingList: () => safeFetchJson<WaitingQueueItem[]>('/waiting-list'),
  getAdmissions: () => safeFetchJson<AdmissionRecord[]>('/admissions'),
  getDischarges: () => safeFetchJson<DischargeRecord[]>('/discharges'),
  getEquipment: () => safeFetchJson<MedicalEquipment[]>('/equipment'),
  allocateBed: (patientId: string, bedId: string, staffOverride = false) =>
    safeFetchJson<AdmissionRecord>('/allocations', {
      method: 'POST',
      body: JSON.stringify({ patientId, bedId, staffOverride }),
    }),
  dischargePatient: (
    patientId: string,
    outcome: string,
    summaryNotes: string
  ) =>
    safeFetchJson<DischargeRecord>('/discharges', {
      method: 'POST',
      body: JSON.stringify({ patientId, outcome, summaryNotes }),
    }),
};
