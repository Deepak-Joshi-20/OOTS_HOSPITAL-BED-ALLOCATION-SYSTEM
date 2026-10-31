import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Gauge,
  Sliders,
  ArrowRight,
  Info,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { evaluateMachineRisk } from '../services/riskEngine';

export const Predictions: React.FC = () => {
  const { machines, settings, simulateMachineReading } = useSystem();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<string>(
    machines[0]?.id || 'H-101'
  );

  const selectedMachine = useMemo(
    () => machines.find((m) => m.id === selectedId) || machines[0],
    [machines, selectedId]
  );

  // Interactive What-If Sandbox state
  const [sandboxTemp, setSandboxTemp] = useState<number>(88);
  const [sandboxVib, setSandboxVib] = useState<number>(5.8);
  const [sandboxPress, setSandboxPress] = useState<number>(152);
  const [sandboxHours, setSandboxHours] = useState<number>(2750);

  const machineEvaluation = useMemo(() => {
    if (!selectedMachine) return null;
    return evaluateMachineRisk(selectedMachine, settings.thresholds);
  }, [selectedMachine, settings.thresholds]);

  const sandboxEvaluation = useMemo(() => {
    return evaluateMachineRisk(
      {
        id: 'SANDBOX',
        name: 'What-If Simulation Model',
        temperature: sandboxTemp,
        vibration: sandboxVib,
        pressure: sandboxPress,
        runningHours: sandboxHours,
        lastMaintenanceDate: '2026-07-15',
      },
      settings.thresholds
    );
  }, [sandboxTemp, sandboxVib, sandboxPress, sandboxHours, settings.thresholds]);

  const chartData = useMemo(() => {
    return [...machines]
      .sort((a, b) => b.riskScore - a.riskScore)
      .map((m) => ({
        id: m.id,
        name: m.name,
        riskScore: m.riskScore,
        category: m.riskCategory,
        color:
          m.riskScore >= 80
            ? '#FF806D'
            : m.riskScore >= 60
            ? '#8B78DB'
            : m.riskScore >= 30
            ? '#63A4FF'
            : '#4169E1',
      }));
  }, [machines]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Rule-Based Predictive Maintenance Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Transparent, deterministic risk-scoring algorithm combining normalized temperature, vibration, pressure, and service hours.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-4 py-2.5 text-xs font-semibold text-[#252A36] hover:border-[#4169E1] transition-colors self-start sm:self-auto"
        >
          <Settings className="h-3.5 w-3.5 text-[#4169E1]" />
          <span>Configure Risk Thresholds</span>
        </button>
      </div>

      {/* Risk Band Legend & Methodology Banner */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-[#4169E1] shrink-0 mt-0.5" />
          <p className="text-xs text-[#7C8495] leading-relaxed">
            <strong className="text-[#252A36]">Transparent Methodology:</strong> Rather than claiming an opaque black-box neural network, this platform normalizes each machine&apos;s physical readings against configurable engineering thresholds: Temperature Deviation (30% weight), Vibration RMS (30% weight), Pressure Deviation (20% weight), and Cumulative Operating Hours &amp; Service Age (20% weight).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
            <div className="text-xs font-bold text-[#4169E1] font-mono">0 – 29 Points</div>
            <div className="text-xs font-semibold text-[#252A36] mt-0.5">Low Risk</div>
            <div className="text-[11px] text-[#7C8495]">Nominal routine operation</div>
          </div>
          <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
            <div className="text-xs font-bold text-[#63A4FF] font-mono">30 – 59 Points</div>
            <div className="text-xs font-semibold text-[#252A36] mt-0.5">Medium Risk</div>
            <div className="text-[11px] text-[#7C8495]">Queue shift inspection</div>
          </div>
          <div className="rounded-xl border border-[#E9EAF0] bg-[#E9E4FF]/50 p-3">
            <div className="text-xs font-bold text-[#8B78DB] font-mono">60 – 79 Points</div>
            <div className="text-xs font-semibold text-[#252A36] mt-0.5">High Risk</div>
            <div className="text-[11px] text-[#7C8495]">Preventive service within 24h</div>
          </div>
          <div className="rounded-xl border border-[#E9EAF0] bg-[#FFE4D8]/60 p-3">
            <div className="text-xs font-bold text-[#FF806D] font-mono">80 – 100 Points</div>
            <div className="text-xs font-semibold text-[#252A36] mt-0.5">Critical Risk</div>
            <div className="text-[11px] text-[#7C8495]">Immediate controlled intervention</div>
          </div>
        </div>
      </div>

      {/* Main Split: Machine Risk Inspector + Fleet Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Machine Risk Inspector */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#252A36] font-display">
                Why Did This Machine Receive Its Score?
              </h2>
              <p className="text-xs text-[#7C8495]">
                Select any machine to audit its exact factor-by-factor calculation
              </p>
            </div>
            <select
              value={selectedMachine?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs font-semibold text-[#252A36] focus:border-[#4169E1] focus:outline-none"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name} ({m.riskScore}/100)
                </option>
              ))}
            </select>
          </div>

          {selectedMachine && machineEvaluation && (
            <>
              <div className="rounded-2xl border border-[#E9EAF0] bg-[#F8F7F3] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#252A36]">
                      {selectedMachine.name} ({selectedMachine.id})
                    </div>
                    <div className="text-[11px] text-[#7C8495]">
                      {selectedMachine.location} · Last Maintained:{' '}
                      {selectedMachine.lastMaintenanceDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-mono font-bold tabular-nums ${
                        machineEvaluation.riskScore >= 80
                          ? 'text-[#FF806D]'
                          : machineEvaluation.riskScore >= 60
                          ? 'text-[#8B78DB]'
                          : 'text-[#4169E1]'
                      }`}
                    >
                      {machineEvaluation.riskScore}/100
                    </div>
                    <div className="text-[11px] font-semibold text-[#7C8495]">
                      {machineEvaluation.riskCategory} Risk
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#252A36] leading-relaxed pt-2 border-t border-[#E9EAF0]">
                  {machineEvaluation.explanation}
                </p>
              </div>

              <div className="space-y-3">
                {machineEvaluation.factors.map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#252A36]">
                        {f.label} ({Math.round(f.weight * 100)}%)
                      </span>
                      <span className="font-mono text-[#7C8495]">
                        {f.value} ·{' '}
                        <strong className="text-[#252A36]">+{f.weightedPoints} pts</strong>
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#F8F7F3] overflow-hidden">
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

              <div className="rounded-xl border border-[#E9EAF0] bg-[#E9E4FF]/35 p-3.5 text-xs space-y-1">
                <div className="font-bold text-[#4169E1]">
                  Recommended Engineering Action
                </div>
                <p className="text-[#252A36] leading-relaxed">
                  {machineEvaluation.recommendedAction}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => simulateMachineReading(selectedMachine.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#4169E1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3457c9]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Poll New Reading for {selectedMachine.id}</span>
                </button>
                <button
                  onClick={() => navigate(`/machines/${selectedMachine.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4169E1] hover:underline"
                >
                  <span>Open Full Machine Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: Interactive What-If Risk Calculator Sandbox */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B78DB]">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Interactive Formula Sandbox</span>
                </div>
                <h2 className="text-base font-bold text-[#252A36] font-display mt-0.5">
                  What-If Telemetry Risk Simulator
                </h2>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-mono font-bold tabular-nums ${
                    sandboxEvaluation.riskScore >= 80
                      ? 'text-[#FF806D]'
                      : sandboxEvaluation.riskScore >= 60
                      ? 'text-[#8B78DB]'
                      : 'text-[#4169E1]'
                  }`}
                >
                  {sandboxEvaluation.riskScore}/100
                </div>
                <div className="text-[11px] font-semibold text-[#7C8495]">
                  {sandboxEvaluation.riskCategory} Risk
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#252A36]">
                    Simulated Temperature: {sandboxTemp} °C
                  </span>
                  <span className="font-mono text-[#7C8495]">
                    Nominal ≤ {settings.thresholds.tempNominal}°C
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={120}
                  step={1}
                  value={sandboxTemp}
                  onChange={(e) => setSandboxTemp(Number(e.target.value))}
                  className="w-full accent-[#FF806D]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#252A36]">
                    Simulated Vibration: {sandboxVib.toFixed(1)} mm/s
                  </span>
                  <span className="font-mono text-[#7C8495]">
                    Nominal ≤ {settings.thresholds.vibrationNominal} mm/s
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={12}
                  step={0.1}
                  value={sandboxVib}
                  onChange={(e) => setSandboxVib(Number(e.target.value))}
                  className="w-full accent-[#8B78DB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#252A36]">
                    Simulated Pressure: {sandboxPress} PSI
                  </span>
                  <span className="font-mono text-[#7C8495]">
                    Nominal ≤ {settings.thresholds.pressureNominal} PSI
                  </span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={200}
                  step={1}
                  value={sandboxPress}
                  onChange={(e) => setSandboxPress(Number(e.target.value))}
                  className="w-full accent-[#4169E1]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#252A36]">
                    Cumulative Operating Hours: {sandboxHours.toLocaleString()} hrs
                  </span>
                  <span className="font-mono text-[#7C8495]">
                    Max cycle: {settings.thresholds.maxRunningHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={4500}
                  step={50}
                  value={sandboxHours}
                  onChange={(e) => setSandboxHours(Number(e.target.value))}
                  className="w-full accent-[#63A4FF]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E9EAF0] bg-[#F8F7F3] p-4 space-y-2 text-xs">
            <div className="font-bold text-[#252A36]">Sandbox Output Diagnosis</div>
            <p className="text-[#7C8495] leading-relaxed">
              {sandboxEvaluation.explanation}
            </p>
            <div className="text-[#4169E1] font-medium pt-1">
              Action: {sandboxEvaluation.recommendedAction}
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Risk Comparison Bar Chart */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#252A36] font-display">
              Fleet-Wide Risk Score Ranking
            </h2>
            <p className="text-xs text-[#7C8495]">
              Comparative view of all monitored industrial units sorted by failure probability score
            </p>
          </div>
          <Gauge className="h-5 w-5 text-[#4169E1]" />
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C5D3EB" />
              <XAxis
                dataKey="id"
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
              <Bar dataKey="riskScore" name="Risk Score (0–100)" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
