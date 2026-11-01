export type StaffRole = 'Administrator' | 'Admission Staff' | 'Ward Staff';

export type PermissionKey =
  | 'manage_staff'
  | 'manage_wards'
  | 'manage_settings'
  | 'view_audit_logs'
  | 'manage_patients'
  | 'create_admissions'
  | 'allocate_beds'
  | 'manage_discharges'
  | 'update_bed_status'
  | 'view_analytics';

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  department: string;
  title: string;
  active: boolean;
  isDemoAccount?: boolean;
  passwordDigest: string; // Salted hash digest, never plaintext
  permissions: PermissionKey[];
  lastLogin: string;
}

export type WardType =
  | 'ICU'
  | 'Cardiac'
  | 'Surgical'
  | 'General'
  | 'Pediatrics'
  | 'Maternity';

export interface HospitalWard {
  id: string;
  name: string;
  type: WardType;
  floor: string;
  wing: string;
  headNurse: string;
  totalCapacity: number;
  oxygenLinePsi: number;
  nurseRatio: string;
}

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';

export interface HospitalBed {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  wardType: WardType;
  status: BedStatus;
  isICU: boolean;
  hasVentilator: boolean;
  hasTelemetryMonitor: boolean;
  isolationCapable: boolean;
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
  lastSanitized: string;
}

export type AcuityLevel = 'Critical' | 'High' | 'Moderate' | 'Stable';
export type PatientStatus = 'Admitted' | 'Waiting' | 'Discharged';

export interface PatientRecord {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup: string;
  diagnosis: string;
  acuity: AcuityLevel;
  requiredWardType: WardType;
  needsVentilator: boolean;
  needsIsolation: boolean;
  status: PatientStatus;
  assignedBedId?: string;
  assignedWardName?: string;
  attendingPhysician: string;
  admissionDate: string;
  contactPhone: string;
  vitals: {
    heartRate: number;
    spo2: number;
    bp: string;
    tempC: number;
  };
}

export interface WaitingQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  diagnosis: string;
  acuity: AcuityLevel;
  priorityScore: number; // 1–100
  requiredWardType: WardType;
  needsVentilator: boolean;
  needsIsolation: boolean;
  requestedAt: string;
  requestingDoctor: string;
  notes: string;
}

export interface AdmissionRecord {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  bedId: string;
  wardName: string;
  attendingPhysician: string;
  diagnosis: string;
  acuity: AcuityLevel;
  admittedAt: string;
  admittedBy: string;
  status: 'Active' | 'Completed';
}

export interface DischargeRecord {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  releasedBedId: string;
  wardName: string;
  dischargedAt: string;
  dischargedBy: string;
  outcome: 'Recovered · Home' | 'Transferred · Rehab' | 'Outpatient Follow-up';
  summaryNotes: string;
}

export interface HospitalAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: StaffRole;
  category:
    | 'Authentication'
    | 'Allocation'
    | 'Admission'
    | 'Discharge'
    | 'BedStatus'
    | 'StaffAdmin'
    | 'Settings'
    | 'Appointment'
    | 'Billing'
    | 'Equipment';
  action: string;
  severity: 'Info' | 'Elevated' | 'Urgent';
}

// ============================================================================
// EXTENDED OOTS HOSPITAL MANAGEMENT DOMAIN ENTITIES
// ============================================================================

export type DoctorAvailability =
  | 'Available'
  | 'In Consultation'
  | 'On Call'
  | 'Off Duty';

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  availability: DoctorAvailability;
  scheduleDays: string;
  shiftHours: string;
  roomNumber: string;
  email: string;
  phone: string;
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export type AppointmentType =
  | 'Consultation'
  | 'Follow-up'
  | 'Emergency'
  | 'Pre-Surgical';

export interface HospitalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '09:30 AM'
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface HospitalDepartment {
  id: string;
  name: string;
  code: string;
  floor: string;
  wing: string;
  headDoctor: string;
  totalBeds: number;
  outpatientRooms: number;
  contactExtension: string;
  description: string;
  specialties: string[];
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

export interface HospitalInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  issuedDate: string;
  dueDate: string;
  consultationCharge: number;
  bedAndNursingCharge: number;
  medicationAndLabCharge: number;
  totalAmount: number;
  status: PaymentStatus;
  paymentMethod: 'Insurance' | 'Card' | 'Hospital Credit' | 'Pending';
}

export type EquipmentAvailability = 'Available' | 'In Use' | 'Under Maintenance';
export type EquipmentCondition = 'Excellent' | 'Good' | 'Needs Calibration';

export interface MedicalEquipment {
  id: string;
  assetTag: string;
  name: string;
  category:
    | 'Life Support'
    | 'Diagnostic Imaging'
    | 'Patient Monitoring'
    | 'Surgical & Anesthesia'
    | 'Laboratory';
  department: string;
  assignedWard: string;
  availability: EquipmentAvailability;
  condition: EquipmentCondition;
  lastServicedDate: string;
  nextCalibrationDate: string;
  serialNumber: string;
}

export interface HospitalFacilitySettings {
  facilityName: string;
  campusAddress: string;
  emergencyHotline: string;
  accreditationCode: string;
  chiefMedicalOfficer: string;
  defaultConsultationMinutes: number;
  criticalOccupancyThresholdPct: number;
  autoQueueSanitizationOnDischarge: boolean;
}
