import {
  Machine,
  MachineStatus,
  RiskCategory,
  RiskEvaluation,
  RiskFactorDetail,
  RiskThresholds,
} from '../types';

export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = {
  tempNominal: 65,
  tempMax: 105,
  vibrationNominal: 2.5,
  vibrationMax: 8.5,
  pressureNominal: 110,
  pressureMax: 175,
  maxRunningHours: 3500,
};

export function getRiskCategory(score: number): RiskCategory {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

export function getMachineStatusFromRisk(
  score: number,
  currentStatus?: MachineStatus
): MachineStatus {
  if (currentStatus === 'Maintenance') return 'Maintenance';
  if (score >= 80) return 'Critical';
  if (score >= 45) return 'Warning';
  return 'Healthy';
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function evaluateMachineRisk(
  input: {
    id: string;
    name: string;
    temperature: number;
    vibration: number;
    pressure: number;
    runningHours: number;
    lastMaintenanceDate: string;
    status?: MachineStatus;
  },
  thresholds: RiskThresholds = DEFAULT_RISK_THRESHOLDS
): RiskEvaluation {
  // 1. Temperature Deviation (Weight: 30%)
  const tempSpan = Math.max(1, thresholds.tempMax - thresholds.tempNominal);
  const tempRatio =
    input.temperature <= thresholds.tempNominal
      ? (input.temperature / Math.max(1, thresholds.tempNominal)) * 0.22
      : 0.22 + ((input.temperature - thresholds.tempNominal) / tempSpan) * 0.78;
  const tempNorm = Math.round(clamp(tempRatio * 100, 0, 100));
  const tempWeight = 0.3;
  const tempPoints = Math.round(tempNorm * tempWeight);

  // 2. Vibration Deviation (Weight: 30%)
  const vibSpan = Math.max(0.5, thresholds.vibrationMax - thresholds.vibrationNominal);
  const vibRatio =
    input.vibration <= thresholds.vibrationNominal
      ? (input.vibration / Math.max(0.5, thresholds.vibrationNominal)) * 0.22
      : 0.22 + ((input.vibration - thresholds.vibrationNominal) / vibSpan) * 0.78;
  const vibNorm = Math.round(clamp(vibRatio * 100, 0, 100));
  const vibWeight = 0.3;
  const vibPoints = Math.round(vibNorm * vibWeight);

  // 3. Pressure Deviation (Weight: 20%)
  const pressSpan = Math.max(5, thresholds.pressureMax - thresholds.pressureNominal);
  const pressRatio =
    input.pressure <= thresholds.pressureNominal
      ? (input.pressure / Math.max(10, thresholds.pressureNominal)) * 0.22
      : 0.22 + ((input.pressure - thresholds.pressureNominal) / pressSpan) * 0.78;
  const pressNorm = Math.round(clamp(pressRatio * 100, 0, 100));
  const pressWeight = 0.2;
  const pressPoints = Math.round(pressNorm * pressWeight);

  // 4. Operating Hours & Maintenance History (Weight: 20%)
  const hoursRatio = input.runningHours / Math.max(500, thresholds.maxRunningHours);
  let daysSinceMaintenance = 30;
  if (input.lastMaintenanceDate) {
    const parsed = Date.parse(input.lastMaintenanceDate);
    if (!Number.isNaN(parsed)) {
      const diffDays = Math.max(0, (Date.now() - parsed) / (1000 * 60 * 60 * 24));
      daysSinceMaintenance = Math.round(diffDays);
    }
  }
  const historyPenalty = clamp(daysSinceMaintenance / 180, 0, 0.35);
  const hoursNorm = Math.round(clamp((hoursRatio * 0.75 + historyPenalty) * 100, 0, 100));
  const hoursWeight = 0.2;
  const hoursPoints = Math.round(hoursNorm * hoursWeight);

  const totalScore = clamp(tempPoints + vibPoints + pressPoints + hoursPoints, 0, 100);
  const riskCategory = getRiskCategory(totalScore);
  const machineStatus = getMachineStatusFromRisk(totalScore, input.status);

  const factors: RiskFactorDetail[] = [
    {
      label: 'Temperature Deviation',
      value: `${input.temperature.toFixed(1)} °C (Threshold: ${thresholds.tempNominal}–${thresholds.tempMax} °C)`,
      normalizedContribution: tempNorm,
      weight: tempWeight,
      weightedPoints: tempPoints,
      status: tempNorm >= 75 ? 'Critical' : tempNorm >= 45 ? 'Elevated' : 'Nominal',
    },
    {
      label: 'Vibration Amplitude',
      value: `${input.vibration.toFixed(2)} mm/s (Threshold: ${thresholds.vibrationNominal}–${thresholds.vibrationMax} mm/s)`,
      normalizedContribution: vibNorm,
      weight: vibWeight,
      weightedPoints: vibPoints,
      status: vibNorm >= 75 ? 'Critical' : vibNorm >= 45 ? 'Elevated' : 'Nominal',
    },
    {
      label: 'Hydraulic / Air Pressure',
      value: `${input.pressure.toFixed(0)} PSI (Threshold: ${thresholds.pressureNominal}–${thresholds.pressureMax} PSI)`,
      normalizedContribution: pressNorm,
      weight: pressWeight,
      weightedPoints: pressPoints,
      status: pressNorm >= 75 ? 'Critical' : pressNorm >= 45 ? 'Elevated' : 'Nominal',
    },
    {
      label: 'Operating Hours & Service Age',
      value: `${input.runningHours.toLocaleString()} hrs · ${daysSinceMaintenance}d since service`,
      normalizedContribution: hoursNorm,
      weight: hoursWeight,
      weightedPoints: hoursPoints,
      status: hoursNorm >= 75 ? 'Critical' : hoursNorm >= 45 ? 'Elevated' : 'Nominal',
    },
  ];

  const elevatedDrivers = factors
    .filter((f) => f.status !== 'Nominal')
    .sort((a, b) => b.weightedPoints - a.weightedPoints)
    .map((f) => f.label.toLowerCase());

  let explanation = '';
  if (elevatedDrivers.length === 0) {
    explanation = `Machine ${input.id} (${input.name}) has a low risk score (${totalScore}/100) because temperature, vibration, pressure, and operating hours are all within nominal engineering thresholds.`;
  } else if (elevatedDrivers.length === 1) {
    explanation = `Machine ${input.id} (${input.name}) received a ${riskCategory.toLowerCase()} risk score (${totalScore}/100) primarily because its ${elevatedDrivers[0]} exceeds nominal operating thresholds.`;
  } else {
    const last = elevatedDrivers[elevatedDrivers.length - 1];
    const rest = elevatedDrivers.slice(0, -1).join(', ');
    explanation = `Machine ${input.id} (${input.name}) has a ${riskCategory.toLowerCase()} risk score (${totalScore}/100) because its ${rest} and ${last} are above their configured thresholds.`;
  }

  let recommendedAction = 'Continue standard automated telemetry monitoring and routine lubrication.';
  if (riskCategory === 'Critical') {
    recommendedAction =
      'Immediate controlled shutdown recommended. Dispatch maintenance crew to inspect bearings, thermal cooling loop, and pressure relief valves.';
  } else if (riskCategory === 'High') {
    recommendedAction =
      'Schedule preventive maintenance within 24 hours. Perform harmonic bearing alignment, thermal imaging scan, and pressure seal check.';
  } else if (riskCategory === 'Medium') {
    recommendedAction =
      'Queue predictive inspection during next shift handover. Verify sensor calibration and monitor vibration trend closely.';
  }

  return {
    riskScore: totalScore,
    riskCategory,
    machineStatus,
    explanation,
    recommendedAction,
    factors,
  };
}

export function recalculateAllMachines(
  machines: Machine[],
  thresholds: RiskThresholds
): Machine[] {
  return machines.map((m) => {
    const evalResult = evaluateMachineRisk(m, thresholds);
    return {
      ...m,
      riskScore: evalResult.riskScore,
      riskCategory: evalResult.riskCategory,
      status: evalResult.machineStatus,
    };
  });
}
