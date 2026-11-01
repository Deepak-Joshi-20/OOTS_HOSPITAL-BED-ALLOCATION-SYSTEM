import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  RefreshCw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Gauge,
  Waves,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface InteractivePredictiveChartProps {
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

interface TelemetryPoint {
  timestamp: string;
  temperature: number;
  vibration: number;
  vibrationScaled: number;
  pressure: number;
  riskScore: number;
}

interface BiomedicalEquipmentTelemetryProfile {
  id: string;
  name: string;
  ward: string;
  category: string;
  status: 'Operational' | 'Warning' | 'Critical';
  baseTemp: number;
  baseVib: number;
  basePressure: number;
  baseRisk: number;
  history: {
    timestamp: string;
    temperature: number;
    vibration: number;
    pressure: number;
    riskScore: number;
  }[];
}

const HOSPITAL_BIOMEDICAL_PROFILES: BiomedicalEquipmentTelemetryProfile[] = [
  {
    id: 'EQ-ICU-01',
    name: 'Hamilton G5 Mechanical Ventilator #1',
    ward: 'Intensive Care Unit (ICU)',
    category: 'Critical Life Support',
    status: 'Operational',
    baseTemp: 36.8,
    baseVib: 1.4,
    basePressure: 58,
    baseRisk: 22,
    history: [
      { timestamp: '06:00', temperature: 35.2, vibration: 1.1, pressure: 54, riskScore: 16 },
      { timestamp: '07:00', temperature: 35.8, vibration: 1.2, pressure: 55, riskScore: 18 },
      { timestamp: '08:00', temperature: 36.1, vibration: 1.3, pressure: 57, riskScore: 20 },
      { timestamp: '09:00', temperature: 36.5, vibration: 1.4, pressure: 58, riskScore: 23 },
      { timestamp: '10:00', temperature: 36.3, vibration: 1.3, pressure: 56, riskScore: 21 },
      { timestamp: '11:00', temperature: 36.7, vibration: 1.4, pressure: 58, riskScore: 24 },
      { timestamp: '12:00', temperature: 36.9, vibration: 1.5, pressure: 59, riskScore: 25 },
      { timestamp: '13:00', temperature: 36.6, vibration: 1.3, pressure: 57, riskScore: 21 },
    ],
  },
  {
    id: 'EQ-RAD-02',
    name: 'Siemens Magnetom 3T MRI Cryo-Cooling Unit',
    ward: 'Diagnostic Imaging Wing',
    category: 'Cryogenic & Imaging',
    status: 'Warning',
    baseTemp: 68.4,
    baseVib: 3.6,
    basePressure: 86,
    baseRisk: 64,
    history: [
      { timestamp: '06:00', temperature: 58.0, vibration: 2.4, pressure: 74, riskScore: 42 },
      { timestamp: '07:00', temperature: 60.5, vibration: 2.7, pressure: 77, riskScore: 47 },
      { timestamp: '08:00', temperature: 62.8, vibration: 3.0, pressure: 80, riskScore: 52 },
      { timestamp: '09:00', temperature: 65.1, vibration: 3.2, pressure: 82, riskScore: 56 },
      { timestamp: '10:00', temperature: 66.4, vibration: 3.4, pressure: 84, riskScore: 60 },
      { timestamp: '11:00', temperature: 67.9, vibration: 3.5, pressure: 85, riskScore: 63 },
      { timestamp: '12:00', temperature: 69.2, vibration: 3.7, pressure: 87, riskScore: 67 },
      { timestamp: '13:00', temperature: 68.4, vibration: 3.6, pressure: 86, riskScore: 64 },
    ],
  },
  {
    id: 'EQ-CARD-03',
    name: 'Philips IntelliVue Central Telemetry Array',
    ward: 'Cardiac & Telemetry Ward',
    category: 'Hemodynamic Monitoring',
    status: 'Operational',
    baseTemp: 41.2,
    baseVib: 0.9,
    basePressure: 48,
    baseRisk: 14,
    history: [
      { timestamp: '06:00', temperature: 39.8, vibration: 0.8, pressure: 46, riskScore: 12 },
      { timestamp: '07:00', temperature: 40.1, vibration: 0.8, pressure: 47, riskScore: 13 },
      { timestamp: '08:00', temperature: 40.5, vibration: 0.9, pressure: 48, riskScore: 14 },
      { timestamp: '09:00', temperature: 41.0, vibration: 0.9, pressure: 48, riskScore: 15 },
      { timestamp: '10:00', temperature: 41.4, vibration: 1.0, pressure: 49, riskScore: 16 },
      { timestamp: '11:00', temperature: 41.1, vibration: 0.9, pressure: 48, riskScore: 14 },
      { timestamp: '12:00', temperature: 41.3, vibration: 0.9, pressure: 48, riskScore: 15 },
      { timestamp: '13:00', temperature: 41.2, vibration: 0.9, pressure: 48, riskScore: 14 },
    ],
  },
  {
    id: 'EQ-SURG-04',
    name: 'Dräger Perseus A500 Anesthesia Workstation',
    ward: 'Surgical Recovery & OR Suite',
    category: 'Surgical Life Support',
    status: 'Critical',
    baseTemp: 76.5,
    baseVib: 4.4,
    basePressure: 94,
    baseRisk: 78,
    history: [
      { timestamp: '06:00', temperature: 63.0, vibration: 2.9, pressure: 81, riskScore: 54 },
      { timestamp: '07:00', temperature: 66.2, vibration: 3.3, pressure: 84, riskScore: 60 },
      { timestamp: '08:00', temperature: 69.5, vibration: 3.7, pressure: 88, riskScore: 66 },
      { timestamp: '09:00', temperature: 72.1, vibration: 4.0, pressure: 90, riskScore: 71 },
      { timestamp: '10:00', temperature: 74.0, vibration: 4.2, pressure: 92, riskScore: 74 },
      { timestamp: '11:00', temperature: 75.8, vibration: 4.3, pressure: 93, riskScore: 77 },
      { timestamp: '12:00', temperature: 77.1, vibration: 4.5, pressure: 95, riskScore: 80 },
      { timestamp: '13:00', temperature: 76.5, vibration: 4.4, pressure: 94, riskScore: 78 },
    ],
  },
];

/**
 * Interactive Recharts component that displays historical predictive maintenance
 * and biomedical equipment telemetry data with smooth animations on value updates.
 */
export const InteractivePredictiveChart: React.FC<
  InteractivePredictiveChartProps
> = ({
  compact = false,
  title = 'Historical Predictive Maintenance & Biomedical Telemetry',
  subtitle = 'Interactive multi-axis Recharts visualization with smooth value-update transitions across hospital life-support equipment.',
}) => {
  const { isBlossom, palette } = useTheme();

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    HOSPITAL_BIOMEDICAL_PROFILES[0].id
  );
  const [showTemp, setShowTemp] = useState<boolean>(true);
  const [showRisk, setShowRisk] = useState<boolean>(true);
  const [showVibration, setShowVibration] = useState<boolean>(true);
  const [showPressure, setShowPressure] = useState<boolean>(!compact);
  const [tickOffset, setTickOffset] = useState<number>(0);
  const [pulseCount, setPulseCount] = useState<number>(0);

  const selectedMachine = useMemo(
    () =>
      HOSPITAL_BIOMEDICAL_PROFILES.find((m) => m.id === selectedEquipmentId) ||
      HOSPITAL_BIOMEDICAL_PROFILES[0],
    [selectedEquipmentId]
  );

  // Build animated chart series with live simulated telemetry updates
  const chartSeries = useMemo<TelemetryPoint[]>(() => {
    const basePoints = selectedMachine.history.map((pt, index) => {
      const wave =
        pulseCount === 0
          ? 0
          : Math.sin((index + pulseCount) * 0.9) * 2.4 + tickOffset * 0.4;
      const temp = Number((pt.temperature + wave).toFixed(1));
      const vib = Number(
        Math.max(0.4, pt.vibration + wave * 0.15).toFixed(2)
      );
      const press = Math.round(pt.pressure + wave * 1.1);
      const risk = Math.min(
        99,
        Math.max(5, Math.round(pt.riskScore + wave * 1.8))
      );

      return {
        timestamp: pt.timestamp,
        temperature: temp,
        vibration: vib,
        vibrationScaled: Number((vib * 10).toFixed(1)),
        pressure: press,
        riskScore: risk,
      };
    });

    const liveWave = pulseCount === 0 ? 0 : (pulseCount % 3 === 0 ? 3.2 : -1.8);
    const liveTemp = Number((selectedMachine.baseTemp + liveWave).toFixed(1));
    const liveVib = Number(
      Math.max(0.5, selectedMachine.baseVib + liveWave * 0.12).toFixed(2)
    );
    const livePress = Math.round(selectedMachine.basePressure + liveWave * 1.2);
    const liveRisk = Math.min(
      99,
      Math.max(8, Math.round(selectedMachine.baseRisk + liveWave * 2))
    );

    return [
      ...basePoints,
      {
        timestamp: 'Now (Live)',
        temperature: liveTemp,
        vibration: liveVib,
        vibrationScaled: Number((liveVib * 10).toFixed(1)),
        pressure: livePress,
        riskScore: liveRisk,
      },
    ];
  }, [selectedMachine, pulseCount, tickOffset]);

  const latestPoint = chartSeries[chartSeries.length - 1];

  const handleSimulateUpdate = () => {
    setPulseCount((c) => c + 1);
    setTickOffset((prev) => (prev >= 6 ? -3 : prev + 3));
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-xs space-y-5 ${
        isBlossom
          ? 'border-[#D9B9C8] bg-[#FFFDFB]'
          : 'border-[#D5E0F2] bg-white'
      }`}
    >
      {/* Top Header & Machine Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold ${
              isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
            }`}
          >
            <Activity className="h-4 w-4 shrink-0" />
            <span className="truncate">
              BIOMEDICAL EQUIPMENT TELEMETRY &amp; PREDICTIVE MAINTENANCE
            </span>
          </div>
          <h3
            className={`text-lg sm:text-xl font-bold ${
              isBlossom
                ? 'text-[#3D3440] font-editorial'
                : 'text-[#252D43] font-display'
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-xs ${
              isBlossom ? 'text-[#786675]' : 'text-[#5A6582]'
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* Controls: Equipment Selector + Live Telemetry Trigger */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto min-w-0">
          <select
            value={selectedMachine.id}
            onChange={(e) => setSelectedEquipmentId(e.target.value)}
            aria-label="Select Hospital Biomedical Asset"
            className={`w-full sm:w-auto max-w-full truncate rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none ${
              isBlossom
                ? 'border-[#D9B9C8] bg-[#FAF1E8] text-[#3D3440] focus:border-[#754C68]'
                : 'border-[#D5E0F2] bg-[#E9EFF8]/70 text-[#252D43] focus:border-[#4169E1]'
            }`}
          >
            {HOSPITAL_BIOMEDICAL_PROFILES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} · {m.name} ({m.ward})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSimulateUpdate}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all active:scale-95 shadow-xs whitespace-nowrap cursor-pointer ${
              isBlossom
                ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                : 'bg-[#4169E1] hover:bg-[#3256C9]'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Simulate Value Update</span>
          </button>
        </div>
      </div>

      {/* 4 Live Equipment Telemetry Summary KPI Pills */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          className={`rounded-2xl border p-3.5 ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#F5E9E8]/70'
              : 'border-[#D5E0F2] bg-[#E9EFF8]/55'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#414C66]">
            <span>FAILURE RISK SCORE</span>
            {latestPoint.riskScore >= 65 ? (
              <AlertTriangle className="h-3.5 w-3.5 text-[#C4382B]" />
            ) : (
              <CheckCircle2
                className={`h-3.5 w-3.5 ${
                  isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
                }`}
              />
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                latestPoint.riskScore >= 65
                  ? 'text-[#C4382B]'
                  : isBlossom
                  ? 'text-[#754C68]'
                  : 'text-[#252D43]'
              }`}
            >
              {latestPoint.riskScore}%
            </span>
            <span className="text-[11px] font-semibold text-[#414C66] truncate">
              {selectedMachine.status}
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-3.5 ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FAF1E8]/80'
              : 'border-[#D5E0F2] bg-[#E9EFF8]/55'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#414C66]">
            <span>THERMAL SENSOR</span>
            <Thermometer
              className={`h-3.5 w-3.5 ${
                isBlossom ? 'text-[#754C68]' : 'text-[#FF8278]'
              }`}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#252D43]">
              {latestPoint.temperature}°C
            </span>
            <span className="text-[11px] font-semibold text-[#414C66] truncate">
              Nominal &lt; 75°C
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-3.5 ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#EAE2F3]/65'
              : 'border-[#D5E0F2] bg-[#E8E4FF]/55'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#414C66]">
            <span>VIBRATION HARMONICS</span>
            <Waves
              className={`h-3.5 w-3.5 ${
                isBlossom ? 'text-[#754C68]' : 'text-[#8975D5]'
              }`}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#252D43]">
              {latestPoint.vibration} mm/s
            </span>
            <span className="text-[11px] font-semibold text-[#414C66] truncate">
              Scaled ×10 on axis
            </span>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-3.5 ${
            isBlossom
              ? 'border-[#D9B9C8] bg-[#FFFDFB]'
              : 'border-[#D5E0F2] bg-[#E9EFF8]/55'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#414C66]">
            <span>LINE PRESSURE</span>
            <Gauge
              className={`h-3.5 w-3.5 ${
                isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
              }`}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#252D43]">
              {latestPoint.pressure} PSI
            </span>
            <span className="text-[11px] font-semibold text-[#414C66] truncate">
              {selectedMachine.ward}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Series Toggles */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 border ${
          isBlossom
            ? 'bg-[#FAF1E8] border-[#C9A9B8]'
            : 'bg-[#E9EFF8]/85 border-[#B8C7E0]'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1A2130] mr-1">
            <Sliders
              className={`h-3.5 w-3.5 ${
                isBlossom ? 'text-[#754C68]' : 'text-[#2850C8]'
              }`}
            />
            <span>Toggle Series:</span>
          </span>

          <button
            type="button"
            onClick={() => setShowRisk((s) => !s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              showRisk
                ? isBlossom
                  ? 'bg-[#754C68] text-white'
                  : 'bg-[#2E56D6] text-white'
                : 'bg-white text-[#3B455E] border border-[#B8C7E0]'
            }`}
          >
            Risk Score (%)
          </button>

          <button
            type="button"
            onClick={() => setShowTemp((s) => !s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              showTemp
                ? isBlossom
                  ? 'bg-[#B84335] text-white'
                  : 'bg-[#C4382B] text-white'
                : 'bg-white text-[#3B455E] border border-[#B8C7E0]'
            }`}
          >
            Temperature (°C)
          </button>

          <button
            type="button"
            onClick={() => setShowVibration((s) => !s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              showVibration
                ? isBlossom
                  ? 'bg-[#6E4987] text-white'
                  : 'bg-[#5641A6] text-white'
                : 'bg-white text-[#3B455E] border border-[#B8C7E0]'
            }`}
          >
            Vibration (mm/s ×10)
          </button>

          <button
            type="button"
            onClick={() => setShowPressure((s) => !s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              showPressure
                ? isBlossom
                  ? 'bg-[#4E3145] text-white'
                  : 'bg-[#202B52] text-white'
                : 'bg-white text-[#3B455E] border border-[#B8C7E0]'
            }`}
          >
            Pressure (PSI)
          </button>
        </div>

        <span className="text-[11px] font-mono font-bold text-[#414C66]">
          Asset: {selectedMachine.id} · {selectedMachine.category}
        </span>
      </div>

      {/* Animated Recharts Canvas */}
      <div className={compact ? 'h-64 w-full' : 'h-80 w-full'}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartSeries}
            margin={{ top: 10, right: 16, left: -8, bottom: 4 }}
          >
            <defs>
              <linearGradient id="predRiskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.chartRisk}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={palette.chartRisk}
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="predTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.chartTemp}
                  stopOpacity={0.28}
                />
                <stop
                  offset="95%"
                  stopColor={palette.chartTemp}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isBlossom ? '#DFC8D3' : '#C5D3EB'}
            />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 11, fill: palette.textMuted, fontWeight: 600 }}
              axisLine={{ stroke: palette.borderSubtle }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: palette.textMuted, fontWeight: 600 }}
              axisLine={{ stroke: palette.borderSubtle }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: palette.tooltipBg,
                borderColor: palette.tooltipBorder,
                borderRadius: '14px',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#FAF1E8' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />

            <ReferenceLine
              y={75}
              stroke={palette.chartTemp}
              strokeDasharray="4 4"
              label={{
                value: 'Critical Maintenance Threshold (75)',
                position: 'insideTopRight',
                fill: palette.chartTemp,
                fontSize: 10,
              }}
            />

            {showRisk && (
              <Area
                type="monotone"
                dataKey="riskScore"
                name="Predictive Failure Risk (%)"
                stroke={palette.chartRisk}
                strokeWidth={2.5}
                fill="url(#predRiskGrad)"
                isAnimationActive={true}
                animationDuration={650}
                dot={{ r: 3.5, fill: palette.chartRisk }}
              />
            )}

            {showTemp && (
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke={palette.chartTemp}
                strokeWidth={2.2}
                fill="url(#predTempGrad)"
                isAnimationActive={true}
                animationDuration={650}
                dot={{ r: 3, fill: palette.chartTemp }}
              />
            )}

            {showVibration && (
              <Line
                type="monotone"
                dataKey="vibrationScaled"
                name="Vibration (mm/s × 10)"
                stroke={palette.chartVibration}
                strokeWidth={2.2}
                isAnimationActive={true}
                animationDuration={650}
                dot={{ r: 3, fill: palette.chartVibration }}
              />
            )}

            {showPressure && (
              <Line
                type="monotone"
                dataKey="pressure"
                name="Line Pressure (PSI)"
                stroke={palette.chartPressure}
                strokeWidth={2}
                strokeDasharray="5 3"
                isAnimationActive={true}
                animationDuration={650}
                dot={{ r: 2.5, fill: palette.chartPressure }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
