export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export type MachineStatus = 'Healthy' | 'Warning' | 'Critical' | 'Maintenance';

export interface SensorReading {
  id: string;
  machineId: string;
  timestamp: string;
  temperature: number; // °C
  vibration: number; // mm/s
  pressure: number; // PSI
  runningHours: number;
  riskScore: number;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  machineName: string;
  date: string;
  technician: string;
  type: 'Preventive' | 'Corrective' | 'Predictive Calibration' | 'Component Replacement';
  notes: string;
  costEstimate: number;
}

export interface Machine {
  id: string;
  name: string;
  category: string;
  location: string;
  status: MachineStatus;
  temperature: number;
  vibration: number;
  pressure: number;
  runningHours: number;
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  riskScore: number;
  riskCategory: RiskCategory;
  isDemo?: boolean;
}

export type AlertPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface MaintenanceAlert {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  description: string;
  riskScore: number;
  timestamp: string;
  priority: AlertPriority;
  suggestedAction: string;
  status: AlertStatus;
  isDemo?: boolean;
}

export type OSProcessState = 'New' | 'Ready' | 'Running' | 'Waiting' | 'Terminated';

export interface OSProcess {
  pid: number;
  name: string;
  role: string;
  state: OSProcessState;
  priority: number; // 1 (highest) to 5 (lowest)
  cpuUsage: number; // %
  memoryUsage: number; // MB
  executionTime: number; // seconds
  creationTime: string;
  threads: number;
}

export interface SchedulingProcessInput {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

export interface SchedulingProcessMetric extends SchedulingProcessInput {
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface GanttSegment {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  isIdle?: boolean;
}

export interface SchedulingResult {
  algorithm: 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin';
  metrics: SchedulingProcessMetric[];
  gantt: GanttSegment[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
}

export interface SystemEventLog {
  id: string;
  timestamp: string;
  sourceProcess: string;
  category: 'Sensor' | 'RiskEngine' | 'Process' | 'Synchronization' | 'IPC' | 'Deadlock' | 'Memory' | 'Alert';
  description: string;
  severity: 'Info' | 'Notice' | 'Warning' | 'Critical';
}

export interface RiskThresholds {
  tempNominal: number;
  tempMax: number;
  vibrationNominal: number;
  vibrationMax: number;
  pressureNominal: number;
  pressureMax: number;
  maxRunningHours: number;
}

export interface RiskFactorDetail {
  label: string;
  value: string;
  normalizedContribution: number; // 0 to 100
  weight: number; // e.g., 0.30
  weightedPoints: number;
  status: 'Nominal' | 'Elevated' | 'Critical';
}

export interface RiskEvaluation {
  riskScore: number;
  riskCategory: RiskCategory;
  machineStatus: MachineStatus;
  explanation: string;
  recommendedAction: string;
  factors: RiskFactorDetail[];
}

export interface AppSettings {
  operatorName: string;
  operatorRole: string;
  facilityName: string;
  notificationsEnabled: boolean;
  autoAlertGeneration: boolean;
  liveSimulationEnabled: boolean;
  simulationIntervalMs: number;
  defaultBufferSize: number;
  defaultTimeQuantum: number;
  defaultMemoryFrames: number;
  thresholds: RiskThresholds;
}
