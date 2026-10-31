import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppSettings,
  MaintenanceAlert,
  MaintenanceRecord,
  Machine,
  OSProcess,
  OSProcessState,
  SchedulingProcessInput,
  SensorReading,
  SystemEventLog,
} from '../types';
import {
  INITIAL_ALERTS,
  INITIAL_EVENT_LOGS,
  INITIAL_MACHINES,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_OS_PROCESSES,
  INITIAL_SCHEDULING_PROCESSES,
  INITIAL_SENSOR_READINGS,
  INITIAL_SETTINGS,
} from '../services/demoData';
import { evaluateMachineRisk, recalculateAllMachines } from '../services/riskEngine';

const STORAGE_KEY = 'arctic_bloom_pmas_state_v1';

interface SystemContextType {
  machines: Machine[];
  sensorReadings: SensorReading[];
  alerts: MaintenanceAlert[];
  maintenanceRecords: MaintenanceRecord[];
  osProcesses: OSProcess[];
  schedulingProcesses: SchedulingProcessInput[];
  eventLogs: SystemEventLog[];
  settings: AppSettings;
  showOperatorGate: boolean;
  setShowOperatorGate: (show: boolean) => void;
  // Machine actions
  addMachine: (machine: Omit<Machine, 'riskScore' | 'riskCategory' | 'status'>) => void;
  updateMachine: (machineId: string, updates: Partial<Machine>) => void;
  deleteMachine: (machineId: string) => void;
  simulateMachineReading: (machineId: string, customValues?: { temperature?: number; vibration?: number; pressure?: number }) => SensorReading | null;
  // Alert actions
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  createManualAlert: (alert: Omit<MaintenanceAlert, 'id' | 'timestamp'>) => void;
  // Process actions
  setProcessState: (pid: number, newState: OSProcessState) => void;
  restartAllProcesses: () => void;
  // Scheduling process list
  setSchedulingProcesses: React.Dispatch<React.SetStateAction<SchedulingProcessInput[]>>;
  // Event log actions
  addEventLog: (
    sourceProcess: string,
    category: SystemEventLog['category'],
    description: string,
    severity?: SystemEventLog['severity']
  ) => void;
  clearEventLogs: () => void;
  // Settings & Demo Data actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loadDemoData: () => void;
  resetDemoData: () => void;
  clearAllData: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

interface StoredState {
  machines: Machine[];
  sensorReadings: SensorReading[];
  alerts: MaintenanceAlert[];
  maintenanceRecords: MaintenanceRecord[];
  osProcesses: OSProcess[];
  schedulingProcesses: SchedulingProcessInput[];
  eventLogs: SystemEventLog[];
  settings: AppSettings;
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.machines)) {
        return {
          machines: parsed.machines,
          sensorReadings: parsed.sensorReadings || INITIAL_SENSOR_READINGS,
          alerts: parsed.alerts || INITIAL_ALERTS,
          maintenanceRecords: parsed.maintenanceRecords || INITIAL_MAINTENANCE_RECORDS,
          osProcesses: parsed.osProcesses || INITIAL_OS_PROCESSES,
          schedulingProcesses: parsed.schedulingProcesses || INITIAL_SCHEDULING_PROCESSES,
          eventLogs: parsed.eventLogs || INITIAL_EVENT_LOGS,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse persisted PMAS state, seeding initial demo data.', e);
  }

  return {
    machines: INITIAL_MACHINES,
    sensorReadings: INITIAL_SENSOR_READINGS,
    alerts: INITIAL_ALERTS,
    maintenanceRecords: INITIAL_MAINTENANCE_RECORDS,
    osProcesses: INITIAL_OS_PROCESSES,
    schedulingProcesses: INITIAL_SCHEDULING_PROCESSES,
    eventLogs: INITIAL_EVENT_LOGS,
    settings: INITIAL_SETTINGS,
  };
}

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initial] = useState<StoredState>(loadInitialState);
  const [machines, setMachines] = useState<Machine[]>(initial.machines);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>(initial.sensorReadings);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(initial.alerts);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(
    initial.maintenanceRecords
  );
  const [osProcesses, setOsProcesses] = useState<OSProcess[]>(initial.osProcesses);
  const [schedulingProcesses, setSchedulingProcesses] = useState<SchedulingProcessInput[]>(
    initial.schedulingProcesses
  );
  const [eventLogs, setEventLogs] = useState<SystemEventLog[]>(initial.eventLogs);
  const [settings, setSettings] = useState<AppSettings>(initial.settings);
  const [showOperatorGate, setShowOperatorGate] = useState<boolean>(false);

  // Persist to localStorage whenever state updates
  useEffect(() => {
    try {
      const stateToSave: StoredState = {
        machines,
        sensorReadings: sensorReadings.slice(-120),
        alerts,
        maintenanceRecords,
        osProcesses,
        schedulingProcesses,
        eventLogs: eventLogs.slice(0, 150),
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Unable to save state to localStorage', e);
    }
  }, [
    machines,
    sensorReadings,
    alerts,
    maintenanceRecords,
    osProcesses,
    schedulingProcesses,
    eventLogs,
    settings,
  ]);

  const addEventLog = useCallback(
    (
      sourceProcess: string,
      category: SystemEventLog['category'],
      description: string,
      severity: SystemEventLog['severity'] = 'Info'
    ) => {
      const newLog: SystemEventLog = {
        id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        sourceProcess,
        category,
        description,
        severity,
      };
      setEventLogs((prev) => [newLog, ...prev.slice(0, 149)]);
    },
    []
  );

  const clearEventLogs = useCallback(() => {
    setEventLogs([]);
  }, []);

  const addMachine = useCallback(
    (machineInput: Omit<Machine, 'riskScore' | 'riskCategory' | 'status'>) => {
      const evaluation = evaluateMachineRisk(machineInput, settings.thresholds);
      const newMachine: Machine = {
        ...machineInput,
        riskScore: evaluation.riskScore,
        riskCategory: evaluation.riskCategory,
        status: evaluation.machineStatus,
        isDemo: false,
      };
      setMachines((prev) => [newMachine, ...prev]);

      const initialReading: SensorReading = {
        id: `SR-${Date.now().toString().slice(-4)}`,
        machineId: newMachine.id,
        timestamp: new Date().toISOString(),
        temperature: newMachine.temperature,
        vibration: newMachine.vibration,
        pressure: newMachine.pressure,
        runningHours: newMachine.runningHours,
        riskScore: newMachine.riskScore,
      };
      setSensorReadings((prev) => [...prev, initialReading]);

      addEventLog(
        'Sensor Collector (PID 101)',
        'Sensor',
        `Registered industrial machine ${newMachine.id} (${newMachine.name}) with initial risk score ${newMachine.riskScore}/100.`,
        newMachine.riskScore >= 60 ? 'Warning' : 'Info'
      );

      if (settings.autoAlertGeneration && newMachine.riskScore >= 60) {
        const priority = newMachine.riskScore >= 80 ? 'Critical' : 'High';
        const newAlert: MaintenanceAlert = {
          id: `ALT-${Math.floor(100 + Math.random() * 899)}`,
          machineId: newMachine.id,
          machineName: newMachine.name,
          title: `${priority} Risk Threshold Crossed on Registration`,
          description: evaluation.explanation,
          riskScore: newMachine.riskScore,
          timestamp: new Date().toISOString(),
          priority,
          suggestedAction: evaluation.recommendedAction,
          status: 'Active',
          isDemo: false,
        };
        setAlerts((prev) => [newAlert, ...prev]);
      }
    },
    [settings.thresholds, settings.autoAlertGeneration, addEventLog]
  );

  const updateMachine = useCallback(
    (machineId: string, updates: Partial<Machine>) => {
      setMachines((prev) =>
        prev.map((m) => {
          if (m.id !== machineId) return m;
          const merged = { ...m, ...updates };
          const evaluation = evaluateMachineRisk(merged, settings.thresholds);
          return {
            ...merged,
            riskScore: evaluation.riskScore,
            riskCategory: evaluation.riskCategory,
            status:
              updates.status === 'Maintenance'
                ? 'Maintenance'
                : evaluation.machineStatus,
          };
        })
      );
      addEventLog(
        'Risk Calculator (PID 104)',
        'RiskEngine',
        `Updated configuration and recalculated risk telemetry for machine ${machineId}.`,
        'Info'
      );
    },
    [settings.thresholds, addEventLog]
  );

  const deleteMachine = useCallback(
    (machineId: string) => {
      setMachines((prev) => prev.filter((m) => m.id !== machineId));
      setAlerts((prev) => prev.filter((a) => a.machineId !== machineId));
      addEventLog(
        'Process Scheduler',
        'Process',
        `Decommissioned machine ${machineId} and released associated telemetry buffers.`,
        'Notice'
      );
    },
    [addEventLog]
  );

  const simulateMachineReading = useCallback(
    (
      machineId: string,
      customValues?: { temperature?: number; vibration?: number; pressure?: number }
    ): SensorReading | null => {
      const target = machines.find((m) => m.id === machineId);
      if (!target) return null;

      const tempDelta = (Math.random() - 0.42) * 5.2;
      const vibDelta = (Math.random() - 0.42) * 0.65;
      const pressDelta = (Math.random() - 0.42) * 7.5;

      const nextTemp =
        customValues?.temperature !== undefined
          ? customValues.temperature
          : Number(Math.max(38, Math.min(125, target.temperature + tempDelta)).toFixed(1));
      const nextVib =
        customValues?.vibration !== undefined
          ? customValues.vibration
          : Number(Math.max(0.8, Math.min(12.5, target.vibration + vibDelta)).toFixed(2));
      const nextPress =
        customValues?.pressure !== undefined
          ? customValues.pressure
          : Math.round(Math.max(75, Math.min(210, target.pressure + pressDelta)));
      const nextHours = target.runningHours + 1;

      const evalResult = evaluateMachineRisk(
        {
          ...target,
          temperature: nextTemp,
          vibration: nextVib,
          pressure: nextPress,
          runningHours: nextHours,
        },
        settings.thresholds
      );

      const newReading: SensorReading = {
        id: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
        machineId: target.id,
        timestamp: new Date().toISOString(),
        temperature: nextTemp,
        vibration: nextVib,
        pressure: nextPress,
        runningHours: nextHours,
        riskScore: evalResult.riskScore,
      };

      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId
            ? {
                ...m,
                temperature: nextTemp,
                vibration: nextVib,
                pressure: nextPress,
                runningHours: nextHours,
                riskScore: evalResult.riskScore,
                riskCategory: evalResult.riskCategory,
                status: evalResult.machineStatus,
              }
            : m
        )
      );

      setSensorReadings((prev) => [...prev, newReading]);

      addEventLog(
        'Sensor Collector (PID 101)',
        'Sensor',
        `New reading from ${target.id}: Temp ${nextTemp}°C, Vib ${nextVib} mm/s, Press ${nextPress} PSI → Risk Score ${evalResult.riskScore}/100.`,
        evalResult.riskScore >= 80
          ? 'Critical'
          : evalResult.riskScore >= 60
          ? 'Warning'
          : 'Info'
      );

      // Generate alert if high/critical risk and no identical active alert recently
      if (settings.autoAlertGeneration && evalResult.riskScore >= 60) {
        setAlerts((prev) => {
          const hasActive = prev.some(
            (a) => a.machineId === target.id && a.status === 'Active'
          );
          if (hasActive) return prev;

          const priority = evalResult.riskScore >= 80 ? 'Critical' : 'High';
          const createdAlert: MaintenanceAlert = {
            id: `ALT-${Math.floor(100 + Math.random() * 899)}`,
            machineId: target.id,
            machineName: target.name,
            title: `${priority} Telemetry Threshold Breach (${evalResult.riskScore}/100)`,
            description: evalResult.explanation,
            riskScore: evalResult.riskScore,
            timestamp: new Date().toISOString(),
            priority,
            suggestedAction: evalResult.recommendedAction,
            status: 'Active',
            isDemo: false,
          };

          addEventLog(
            'Alert Generator (PID 105)',
            'Alert',
            `Dispatched ${priority} maintenance alert ${createdAlert.id} for ${target.name}.`,
            priority === 'Critical' ? 'Critical' : 'Warning'
          );

          return [createdAlert, ...prev];
        });
      }

      return newReading;
    },
    [machines, settings.thresholds, settings.autoAlertGeneration, addEventLog]
  );

  // Periodic background live simulation ticker
  useEffect(() => {
    if (!settings.liveSimulationEnabled || machines.length === 0) return;

    const timer = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * machines.length);
      const picked = machines[randomIdx];
      if (picked) {
        simulateMachineReading(picked.id);
      }
      // Subtle CPU/Execution time update on Running OS processes
      setOsProcesses((prev) =>
        prev.map((proc) => {
          if (proc.state !== 'Running') return proc;
          const jitter = (Math.random() - 0.48) * 2.4;
          return {
            ...proc,
            cpuUsage: Number(Math.max(2.5, Math.min(45, proc.cpuUsage + jitter)).toFixed(1)),
            executionTime: proc.executionTime + Math.round(settings.simulationIntervalMs / 1000),
          };
        })
      );
    }, settings.simulationIntervalMs);

    return () => clearInterval(timer);
  }, [
    settings.liveSimulationEnabled,
    settings.simulationIntervalMs,
    machines,
    simulateMachineReading,
  ]);

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'Acknowledged' } : a))
      );
      addEventLog(
        'Alert Generator (PID 105)',
        'Alert',
        `Operator acknowledged maintenance alert ${alertId}.`,
        'Info'
      );
    },
    [addEventLog]
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      const targetAlert = alerts.find((a) => a.id === alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'Resolved' } : a))
      );
      if (targetAlert) {
        const newRecord: MaintenanceRecord = {
          id: `MNT-${Math.floor(500 + Math.random() * 499)}`,
          machineId: targetAlert.machineId,
          machineName: targetAlert.machineName,
          date: new Date().toISOString().slice(0, 10),
          technician: settings.operatorName,
          type: 'Corrective',
          notes: `Resolved alert ${targetAlert.id}: ${targetAlert.suggestedAction}`,
          costEstimate: 950,
        };
        setMaintenanceRecords((prev) => [newRecord, ...prev]);
      }
      addEventLog(
        'Alert Generator (PID 105)',
        'Alert',
        `Resolved maintenance alert ${alertId} and logged service record.`,
        'Notice'
      );
    },
    [alerts, settings.operatorName, addEventLog]
  );

  const createManualAlert = useCallback(
    (alertInput: Omit<MaintenanceAlert, 'id' | 'timestamp'>) => {
      const newAlert: MaintenanceAlert = {
        ...alertInput,
        id: `ALT-${Math.floor(100 + Math.random() * 899)}`,
        timestamp: new Date().toISOString(),
      };
      setAlerts((prev) => [newAlert, ...prev]);
      addEventLog(
        'Alert Generator (PID 105)',
        'Alert',
        `Created maintenance alert ${newAlert.id} for ${newAlert.machineName}.`,
        newAlert.priority === 'Critical' ? 'Critical' : 'Warning'
      );
    },
    [addEventLog]
  );

  const setProcessState = useCallback(
    (pid: number, newState: OSProcessState) => {
      setOsProcesses((prev) =>
        prev.map((p) => {
          if (p.pid !== pid) return p;
          const cpuUsage =
            newState === 'Running'
              ? Number((12 + Math.random() * 14).toFixed(1))
              : newState === 'Ready' || newState === 'Waiting'
              ? 1.2
              : 0;
          return { ...p, state: newState, cpuUsage };
        })
      );
      const proc = osProcesses.find((p) => p.pid === pid);
      addEventLog(
        `Process Scheduler`,
        'Process',
        `Process ${proc?.name || pid} (PID ${pid}) transitioned to [${newState}] state.`,
        newState === 'Terminated' ? 'Warning' : 'Info'
      );
    },
    [osProcesses, addEventLog]
  );

  const restartAllProcesses = useCallback(() => {
    setOsProcesses(INITIAL_OS_PROCESSES);
    addEventLog(
      'Process Scheduler',
      'Process',
      'Restarted all predictive maintenance OS pipeline processes (PIDs 101–106).',
      'Notice'
    );
  }, [addEventLog]);

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => {
        const updated = {
          ...prev,
          ...newSettings,
          thresholds: {
            ...prev.thresholds,
            ...(newSettings.thresholds || {}),
          },
        };
        if (newSettings.thresholds) {
          setMachines((currentMachines) =>
            recalculateAllMachines(currentMachines, updated.thresholds)
          );
        }
        return updated;
      });
      addEventLog(
        'Risk Calculator (PID 104)',
        'RiskEngine',
        'Updated system configuration and recalculated fleet risk thresholds.',
        'Info'
      );
    },
    [addEventLog]
  );

  const loadDemoData = useCallback(() => {
    setMachines((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const missingDemo = INITIAL_MACHINES.filter((m) => !existingIds.has(m.id));
      return recalculateAllMachines([...prev, ...missingDemo], settings.thresholds);
    });
    setAlerts((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const missingAlerts = INITIAL_ALERTS.filter((a) => !existingIds.has(a.id));
      return [...prev, ...missingAlerts];
    });
    addEventLog(
      'System Kernel',
      'Process',
      'Merged fictional sample industrial machines and alerts without overwriting user records.',
      'Notice'
    );
  }, [settings.thresholds, addEventLog]);

  const resetDemoData = useCallback(() => {
    setMachines(recalculateAllMachines(INITIAL_MACHINES, INITIAL_SETTINGS.thresholds));
    setSensorReadings(INITIAL_SENSOR_READINGS);
    setAlerts(INITIAL_ALERTS);
    setMaintenanceRecords(INITIAL_MAINTENANCE_RECORDS);
    setOsProcesses(INITIAL_OS_PROCESSES);
    setSchedulingProcesses(INITIAL_SCHEDULING_PROCESSES);
    setEventLogs(INITIAL_EVENT_LOGS);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearAllData = useCallback(() => {
    setMachines([]);
    setSensorReadings([]);
    setAlerts([]);
    setMaintenanceRecords([]);
    setEventLogs([
      {
        id: 'EVT-1000',
        timestamp: new Date().toISOString(),
        sourceProcess: 'System Kernel',
        category: 'Process',
        description: 'Cleared all demo machines, sensor readings, and maintenance alerts.',
        severity: 'Notice',
      },
    ]);
  }, []);

  return (
    <SystemContext.Provider
      value={{
        machines,
        sensorReadings,
        alerts,
        maintenanceRecords,
        osProcesses,
        schedulingProcesses,
        eventLogs,
        settings,
        showOperatorGate,
        setShowOperatorGate,
        addMachine,
        updateMachine,
        deleteMachine,
        simulateMachineReading,
        acknowledgeAlert,
        resolveAlert,
        createManualAlert,
        setProcessState,
        restartAllProcesses,
        setSchedulingProcesses,
        addEventLog,
        clearEventLogs,
        updateSettings,
        loadDemoData,
        resetDemoData,
        clearAllData,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) {
    throw new Error('useSystem must be used inside a SystemProvider');
  }
  return ctx;
}

export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const cell = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          return `"${cell.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
