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
import { Activity, RefreshCw, Zap, Sliders } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { useTheme } from '../../context/ThemeContext';

interface InteractivePredictiveChartProps {
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * Interactive Recharts component displaying historical predictive maintenance
 * and critical hospital equipment telemetry with smooth animations on value updates.
 * Adapts colors seamlessly between Blossom Care and Initial Theme.
 */
export const InteractivePredictiveChart: React.FC<
  InteractivePredictiveChartProps
> = ({
  compact = false,
  title = 'Historical Predictive Maintenance & Biomedical Equipment Telemetry',
  subtitle = 'Smooth animated telemetry trajectories across ICU life-support compressors, chillers, and backup turbine units.',
}) => {
  const { machines, sensorReadings, simulateMachineReading, settings } =
    useSystem();
  const { isBlossom, palette } = useTheme();

  const [selectedMachineId, setSelectedMachineId] = useState<string>('ALL');
  const [windowSize, setWindowSize] = useState<number>(compact ? 10 : 16);
  const [showRisk, setShowRisk] = useState<boolean>(true);
  const [showTemp, setShowTemp] = useState<boolean>(true);
  const [showPressure, setShowPressure] = useState<boolean>(!compact);
  const [showVibration, setShowVibration] = useState<boolean>(true);
  const [pulseCount, setPulseCount] = useState<number>(0);

  const chartSeries = useMemo(() => {
    const filtered =
      selectedMachineId === 'ALL'
        ? sensorReadings
        : sensorReadings.filter((r) => r.machineId === selectedMachineId);

    const sliced = filtered.slice(-windowSize);

    return sliced.map((r, idx) => {
      const timeFormatted = new Date(r.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      return {
        frameKey: `${r.id}-${idx}`,
        label: `${r.machineId} · ${timeFormatted.slice(0, 5)}`,
        machineId: r.machineId,
        riskScore: r.riskScore,
        temperature: r.temperature,
        pressure: r.pressure,
        vibrationScaled: Number((r.vibration * 10).toFixed(1)),
        rawVibration: r.vibration,
      };
    });
  }, [sensorReadings, selectedMachineId, windowSize, pulseCount]);

  const handleStreamUpdate = () => {
    if (machines.length === 0) return;
    const targetId =
      selectedMachineId === 'ALL'
        ? machines[Math.floor(Math.random() * machines.length)].id
        : selectedMachineId;
    simulateMachineReading(targetId);
    setPulseCount((c) => c + 1);
  };

  const handleSimulateAnomalyWave = () => {
    if (machines.length === 0) return;
    const target =
      selectedMachineId === 'ALL'
        ? machines[0]
        : machines.find((m) => m.id === selectedMachineId) || machines[0];

    simulateMachineReading(target.id, {
      temperature: Number(
        Math.min(114, target.temperature + 8.5 + Math.random() * 4).toFixed(1)
      ),
      vibration: Number(
        Math.min(10.8, target.vibration + 1.4 + Math.random() * 0.8).toFixed(2)
      ),
      pressure: Math.min(192, Math.round(target.pressure + 14)),
    });
    setPulseCount((c) => c + 1);
  };

  const latestPoint = chartSeries[chartSeries.length - 1];

  return (
    <div
      className={`rounded-3xl border p-6 shadow-xs space-y-5 ${
        isBlossom
          ? 'border-[#D9B9C8] bg-[#FFFDFB]'
          : 'border-[#D5E0F2] bg-white'
      }`}
    >
      {/* Header & Live Update Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold ${
              isBlossom ? 'text-[#754C68]' : 'text-[#4169E1]'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>LIVE PREDICTIVE TELEMETRY STREAM</span>
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

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none ${
              isBlossom
                ? 'border-[#D9B9C8] bg-[#FAF1E8] text-[#3D3440] focus:border-[#754C68]'
                : 'border-[#D5E0F2] bg-[#E9EFF8]/70 text-[#252D43] focus:border-[#4169E1]'
            }`}
            aria-label="Select Equipment Stream"
          >
            <option value="ALL">All Monitored Equipment Streams</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.name} (Risk {m.riskScore}/100)
              </option>
            ))}
          </select>

          <button
            onClick={handleStreamUpdate}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all active:scale-95 shadow-xs whitespace-nowrap cursor-pointer ${
              isBlossom
                ? 'bg-[#754C68] hover:bg-[#5E3B53]'
                : 'bg-[#4169E1] hover:bg-[#3256C9]'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Stream New Reading</span>
          </button>

          <button
            onClick={handleSimulateAnomalyWave}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
              isBlossom
                ? 'bg-[#F5E9E8] border border-[#C9A9B8] text-[#754C68] hover:bg-[#E9B9A7]/50'
                : 'bg-[#FFE3D9] border border-[#F0A79E] text-[#B83227] hover:bg-[#ffd5c6]'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Inject Load Spike</span>
          </button>
        </div>
      </div>

      {/* Interactive Series Toggles & Window Selector */}
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
            <span>Active Series:</span>
          </span>

          <button
            type="button"
            onClick={() => setShowRisk((s) => !s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              showRisk
                ? isBlossom
                  ? 'bg-[#754C68] text-white'
                  : 'bg-[#2E56D6] text-white'
                : 'bg-white text-[#3B455E] border border-[#B8C7E0] hover:bg-[#F4F7FC]'
            }`}
          >
            Risk Score (0–100)
          </button>

          <button
            type="button"
            onClick={() => setShowTemp((s) => !s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              showTemp
                ? isBlossom
                  ? 'bg-[#B84335] text-white'
                  : 'bg-[#C4382B] text-white'
                : 'bg-white text-[#3B455E] border border-[#B8C7E0] hover:bg-[#F4F7FC]'
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
                : 'bg-white text-[#3B455E] border border-[#B8C7E0] hover:bg-[#F4F7FC]'
            }`}
          >
            Vibration (×10 mm/s)
          </button>

          <button
            type="button"
            onClick={() => setShowPressure((s) => !s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              showPressure
                ? isBlossom
                  ? 'bg-[#4E3145] text-white'
                  : 'bg-[#202B52] text-white'
                : 'bg-white text-[#3B455E] border border-[#B8C7E0] hover:bg-[#F4F7FC]'
            }`}
          >
            Pressure (PSI)
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-[#3B455E]">Window:</span>
          {[8, 16, 28].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWindowSize(w)}
              className={`rounded-lg px-2.5 py-1 font-mono font-bold transition-colors cursor-pointer ${
                windowSize === w
                  ? isBlossom
                    ? 'bg-[#2E2532] text-white'
                    : 'bg-[#111A35] text-white'
                  : 'bg-white text-[#3B455E] border border-[#B8C7E0] hover:bg-[#F4F7FC]'
              }`}
            >
              {w}pt
            </button>
          ))}
        </div>
      </div>

      {/* Animated Recharts Canvas */}
      <div className={compact ? 'h-64 w-full' : 'h-80 w-full'}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartSeries}
            margin={{ top: 10, right: 16, left: -8, bottom: 4 }}
          >
            <defs>
              <linearGradient id="themeRiskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.chartRisk}
                  stopOpacity={0.32}
                />
                <stop
                  offset="95%"
                  stopColor={palette.chartRisk}
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="themeTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.chartTemp}
                  stopOpacity={0.26}
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
              dataKey="label"
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
              y={80}
              stroke={palette.chartTemp}
              strokeDasharray="4 4"
              label={{
                value: 'Critical Threshold (80)',
                position: 'insideTopRight',
                fill: palette.chartTemp,
                fontSize: 10,
              }}
            />

            {showRisk && (
              <Area
                type="monotone"
                dataKey="riskScore"
                name="Failure Risk Score (0–100)"
                stroke={palette.chartRisk}
                strokeWidth={2.5}
                fill="url(#themeRiskGrad)"
                isAnimationActive={true}
                animationDuration={650}
                animationEasing="ease-in-out"
                dot={{ r: 3.5, fill: palette.chartRisk }}
                activeDot={{ r: 6, fill: palette.secondaryAccent }}
              />
            )}

            {showTemp && (
              <Area
                type="monotone"
                dataKey="temperature"
                name={`Temperature (°C · Max ${settings.thresholds.tempMax}°C)`}
                stroke={palette.chartTemp}
                strokeWidth={2.2}
                fill="url(#themeTempGrad)"
                isAnimationActive={true}
                animationDuration={650}
                animationEasing="ease-in-out"
                dot={{ r: 3, fill: palette.chartTemp }}
              />
            )}

            {showVibration && (
              <Line
                type="monotone"
                dataKey="vibrationScaled"
                name="Vibration Amplitude (×10 mm/s)"
                stroke={palette.chartVibration}
                strokeWidth={2.2}
                isAnimationActive={true}
                animationDuration={650}
                animationEasing="ease-in-out"
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
                animationEasing="ease-in-out"
                dot={{ r: 2.5, fill: palette.chartPressure }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Latest Snapshot Strip */}
      {latestPoint && (
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t text-xs ${
            isBlossom ? 'border-[#DFC8D3]' : 'border-[#C5D3EB]'
          }`}
        >
          <div
            className={`rounded-xl px-3 py-2 border ${
              isBlossom
                ? 'bg-[#FAF1E8] border-[#C9A9B8]'
                : 'bg-[#E9EFF8]/85 border-[#C5D3EB]'
            }`}
          >
            <span className="font-medium text-[#414C66]">Latest Unit: </span>
            <strong className="font-mono text-[#1A2130]">
              {latestPoint.machineId}
            </strong>
          </div>
          <div
            className={`rounded-xl px-3 py-2 border ${
              isBlossom
                ? 'bg-[#F5E9E8] border-[#C9A9B8]'
                : 'bg-[#E9EFF8]/85 border-[#C5D3EB]'
            }`}
          >
            <span className="font-medium text-[#414C66]">Risk Score: </span>
            <strong
              className="font-mono font-bold"
              style={{ color: palette.chartRisk }}
            >
              {latestPoint.riskScore}/100
            </strong>
          </div>
          <div
            className={`rounded-xl px-3 py-2 border ${
              isBlossom
                ? 'bg-[#FAF1E8] border-[#C9A9B8]'
                : 'bg-[#E9EFF8]/85 border-[#C5D3EB]'
            }`}
          >
            <span className="font-medium text-[#414C66]">Temperature: </span>
            <strong
              className="font-mono font-bold"
              style={{ color: palette.chartTemp }}
            >
              {latestPoint.temperature}°C
            </strong>
          </div>
          <div
            className={`rounded-xl px-3 py-2 border ${
              isBlossom
                ? 'bg-[#EAE2F3]/85 border-[#C9A9B8]'
                : 'bg-[#E9EFF8]/85 border-[#C5D3EB]'
            }`}
          >
            <span className="font-medium text-[#414C66]">Vibration: </span>
            <strong
              className="font-mono font-bold"
              style={{ color: palette.chartVibration }}
            >
              {latestPoint.rawVibration} mm/s
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};
