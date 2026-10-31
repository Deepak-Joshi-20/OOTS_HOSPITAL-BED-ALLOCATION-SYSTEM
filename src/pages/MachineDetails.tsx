import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ArrowLeft,
  RefreshCw,
  Thermometer,
  Activity,
  Gauge,
  Clock,
  Wrench,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { evaluateMachineRisk } from '../services/riskEngine';

export const MachineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    machines,
    sensorReadings,
    maintenanceRecords,
    alerts,
    settings,
    simulateMachineReading,
    acknowledgeAlert,
    resolveAlert,
  } = useSystem();

  const machine = useMemo(
    () => machines.find((m) => m.id === id) || machines[0],
    [machines, id]
  );

  const [customTemp, setCustomTemp] = useState<number | null>(null);
  const [customVib, setCustomVib] = useState<number | null>(null);
  const [customPress, setCustomPress] = useState<number | null>(null);

  if (!machine) {
    return (
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-8 text-center space-y-4">
        <p className="text-sm text-[#7C8495]">No machines available in the dataset.</p>
        <button
          onClick={() => navigate('/machines')}
          className="rounded-xl bg-[#4169E1] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Machine Monitoring
        </button>
      </div>
    );
  }

  const riskEval = evaluateMachineRisk(machine, settings.thresholds);

  const machineHistory = sensorReadings
    .filter((r) => r.machineId === machine.id)
    .slice(-15)
    .map((r, idx) => ({
      step: `#${idx + 1}`,
      time: new Date(r.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      temperature: r.temperature,
      vibration: r.vibration,
      pressure: r.pressure,
      riskScore: r.riskScore,
    }));

  const relatedAlerts = alerts.filter((a) => a.machineId === machine.id);
  const relatedMaintenance = maintenanceRecords.filter(
    (mr) => mr.machineId === machine.id
  );

  const handleInjectCustomReading = () => {
    simulateMachineReading(machine.id, {
      temperature: customTemp ?? machine.temperature,
      vibration: customVib ?? machine.vibration,
      pressure: customPress ?? machine.pressure,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/machines')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4169E1] hover:underline mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Machine Fleet</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
              {machine.name}
            </h1>
            <span className="font-mono text-xs text-[#7C8495]">
              ID: {machine.id} · {machine.category} · {machine.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => simulateMachineReading(machine.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4169E1] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3457c9] transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Simulate Sensor Update</span>
          </button>
        </div>
      </div>

      {/* Live Sensor & Risk KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Failure Risk Score</span>
            <AlertTriangle className="h-4 w-4 text-[#FF806D]" />
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              machine.riskScore >= 80
                ? 'text-[#FF806D]'
                : machine.riskScore >= 60
                ? 'text-[#8B78DB]'
                : 'text-[#4169E1]'
            }`}
          >
            {machine.riskScore}/100
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            {machine.riskCategory} Risk ({machine.status})
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Temperature</span>
            <Thermometer className="h-4 w-4 text-[#FF806D]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {machine.temperature.toFixed(1)} °C
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            Max threshold: {settings.thresholds.tempMax} °C
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Vibration RMS</span>
            <Activity className="h-4 w-4 text-[#8B78DB]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {machine.vibration.toFixed(2)} mm/s
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            Max threshold: {settings.thresholds.vibrationMax} mm/s
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Manifold Pressure</span>
            <Gauge className="h-4 w-4 text-[#4169E1]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {machine.pressure} PSI
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            Max threshold: {settings.thresholds.pressureMax} PSI
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Running Hours</span>
            <Clock className="h-4 w-4 text-[#63A4FF]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {machine.runningHours.toLocaleString()} h
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            Last service: {machine.lastMaintenanceDate}
          </div>
        </div>
      </div>

      {/* Transparent Risk Explanation + Interactive Sensor Injection Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <h2 className="text-base font-bold text-[#252A36] font-display">
            Rule-Based Risk Evaluation Breakdown
          </h2>
          <p className="text-xs text-[#252A36] leading-relaxed bg-[#F8F7F3] p-3.5 rounded-xl border border-[#E9EAF0]">
            {riskEval.explanation}
          </p>

          <div className="space-y-3">
            {riskEval.factors.map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#252A36]">
                    {f.label} (Weight {Math.round(f.weight * 100)}%)
                  </span>
                  <span className="font-mono text-[#7C8495]">
                    {f.value} →{' '}
                    <strong className="text-[#252A36]">+{f.weightedPoints} pts</strong>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F8F7F3] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${f.normalizedContribution}%`,
                      backgroundColor:
                        f.status === 'Critical'
                          ? '#FF806D'
                          : f.status === 'Elevated'
                          ? '#8B78DB'
                          : '#4169E1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E9EAF0] text-xs">
            <span className="font-semibold text-[#252A36]">Recommended Action: </span>
            <span className="text-[#7C8495]">{riskEval.recommendedAction}</span>
          </div>
        </div>

        {/* Custom Telemetry Injection Control */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E9EAF0] bg-white p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4169E1]">
              <Sliders className="h-4 w-4" />
              <span>Interactive Sensor Override</span>
            </div>
            <h2 className="text-base font-bold text-[#252A36] font-display">
              Test Custom Telemetry Reading
            </h2>
            <p className="text-xs text-[#7C8495]">
              Adjust sensor parameters and inject a custom reading to observe real-time risk score recalculation and automatic alert generation.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#252A36]">Temperature (°C)</span>
                  <span className="font-mono font-semibold text-[#FF806D]">
                    {customTemp ?? machine.temperature} °C
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={120}
                  step={0.5}
                  value={customTemp ?? machine.temperature}
                  onChange={(e) => setCustomTemp(Number(e.target.value))}
                  className="w-full accent-[#4169E1]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#252A36]">Vibration (mm/s)</span>
                  <span className="font-mono font-semibold text-[#8B78DB]">
                    {customVib ?? machine.vibration} mm/s
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={12}
                  step={0.1}
                  value={customVib ?? machine.vibration}
                  onChange={(e) => setCustomVib(Number(e.target.value))}
                  className="w-full accent-[#8B78DB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#252A36]">Pressure (PSI)</span>
                  <span className="font-mono font-semibold text-[#4169E1]">
                    {customPress ?? machine.pressure} PSI
                  </span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={200}
                  step={1}
                  value={customPress ?? machine.pressure}
                  onChange={(e) => setCustomPress(Number(e.target.value))}
                  className="w-full accent-[#4169E1]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleInjectCustomReading}
            className="w-full rounded-xl bg-[#4169E1] py-2.5 text-xs font-semibold text-white hover:bg-[#3457c9] transition-colors"
          >
            Commit Sensor Frame &amp; Recalculate Risk
          </button>
        </div>
      </div>

      {/* Historical Sensor & Risk Score Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <h3 className="text-sm font-bold text-[#252A36] font-display mb-4">
            Historical Sensor Readings ({machine.id})
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={machineHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C5D3EB" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#3B455E', fontWeight: 600 }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#3B455E', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111A35',
                    borderColor: '#4169E1',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F0F4FC', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temp (°C)"
                  stroke="#D94E43"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  name="Pressure (PSI)"
                  stroke="#2E56D6"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <h3 className="text-sm font-bold text-[#252A36] font-display mb-4">
            Risk Score History ({machine.id})
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={machineHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C5D3EB" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#3B455E', fontWeight: 600 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#3B455E', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111A35',
                    borderColor: '#4169E1',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F0F4FC', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  name="Risk Score (0–100)"
                  stroke="#6B54C4"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Maintenance History & Related Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#252A36] font-display">
              Related Maintenance Alerts ({relatedAlerts.length})
            </h3>
          </div>
          {relatedAlerts.length === 0 ? (
            <p className="text-xs text-[#7C8495] py-4">
              No maintenance alerts recorded for {machine.name}.
            </p>
          ) : (
            <div className="space-y-3">
              {relatedAlerts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3]/60 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#252A36]">
                      {a.id} · {a.title}
                    </span>
                    <span className="font-mono font-semibold text-[#FF806D]">
                      {a.priority} ({a.status})
                    </span>
                  </div>
                  <p className="text-xs text-[#7C8495]">{a.description}</p>
                  {a.status !== 'Resolved' && (
                    <div className="flex items-center gap-2 pt-1">
                      {a.status === 'Active' && (
                        <button
                          onClick={() => acknowledgeAlert(a.id)}
                          className="rounded-lg border border-[#E9EAF0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#252A36]"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveAlert(a.id)}
                        className="rounded-lg bg-[#4169E1] px-2.5 py-1 text-[11px] font-semibold text-white"
                      >
                        Resolve Alert
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-[#4169E1]" />
            <h3 className="text-sm font-bold text-[#252A36] font-display">
              Service &amp; Maintenance Log ({relatedMaintenance.length})
            </h3>
          </div>
          {relatedMaintenance.length === 0 ? (
            <p className="text-xs text-[#7C8495] py-4">
              No prior maintenance entries logged for {machine.name}. Next scheduled date: {machine.nextScheduledMaintenance}.
            </p>
          ) : (
            <div className="space-y-3">
              {relatedMaintenance.map((mr) => (
                <div
                  key={mr.id}
                  className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3]/60 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#252A36]">
                      {mr.type} · {mr.id}
                    </span>
                    <span className="font-mono text-[#7C8495]">{mr.date}</span>
                  </div>
                  <p className="text-xs text-[#7C8495]">{mr.notes}</p>
                  <div className="text-[11px] text-[#4169E1] font-mono">
                    Technician: {mr.technician} · Est. Cost: ${mr.costEstimate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
