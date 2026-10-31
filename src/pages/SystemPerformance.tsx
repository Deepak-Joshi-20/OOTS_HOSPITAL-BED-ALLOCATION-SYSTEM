import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
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
  Cpu,
  HardDrive,
  Layers,
  Activity,
  Sliders,
  Info,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export const SystemPerformance: React.FC = () => {
  const { osProcesses, alerts, settings } = useSystem();

  // Interactive workload stress multiplier (1x to 5x incoming sensor stream rate)
  const [sensorLoadMultiplier, setSensorLoadMultiplier] = useState<number>(1.5);

  const metrics = useMemo(() => {
    const baseCpu = osProcesses.reduce((acc, p) => acc + p.cpuUsage, 0);
    const cpuUtil = Math.min(99, Math.round(baseCpu * (0.65 + sensorLoadMultiplier * 0.25)));

    const baseMem = osProcesses.reduce((acc, p) => acc + p.memoryUsage, 0);
    const memMb = Math.min(1020, Math.round(baseMem * (0.8 + sensorLoadMultiplier * 0.14)));
    const memPct = Math.round((memMb / 1024) * 100);

    const activeProcs = osProcesses.filter(
      (p) => p.state === 'Running' || p.state === 'Ready'
    ).length;
    const activeThreads = osProcesses
      .filter((p) => p.state !== 'Terminated')
      .reduce((acc, p) => acc + p.threads, 0);

    const bufferOcc = Math.min(
      settings.defaultBufferSize,
      Math.max(1, Math.round(sensorLoadMultiplier * 1.8))
    );

    const throughputFps = Math.round(28 * sensorLoadMultiplier);
    const avgLatencyMs = Number((8.4 + sensorLoadMultiplier * 4.6).toFixed(1));
    const pendingJobs =
      alerts.filter((a) => a.status === 'Active').length +
      Math.round(sensorLoadMultiplier * 2);

    return {
      cpuUtil,
      memMb,
      memPct,
      activeProcs,
      activeThreads,
      bufferOcc,
      throughputFps,
      avgLatencyMs,
      pendingJobs,
    };
  }, [osProcesses, alerts, settings.defaultBufferSize, sensorLoadMultiplier]);

  const trendSeries = useMemo(() => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const wave = Math.sin(idx * 0.65) * 6;
      const cpu = Math.min(99, Math.max(12, Math.round(metrics.cpuUtil + wave)));
      const mem = Math.min(98, Math.max(20, Math.round(metrics.memPct + wave * 0.5)));
      const throughput = Math.max(10, Math.round(metrics.throughputFps + wave * 1.5));
      const latency = Number(
        Math.max(4, metrics.avgLatencyMs + (idx % 3) * 1.4).toFixed(1)
      );
      return {
        slot: `T-${(11 - idx) * 5}s`,
        cpu,
        mem,
        throughput,
        latency,
      };
    });
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            System Performance &amp; Resource Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Monitor simulated OS kernel utilization, thread concurrency, buffer saturation, and telemetry pipeline throughput.
          </p>
        </div>
      </div>

      {/* Workload Stress Controller */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4169E1]">
              <Sliders className="h-3.5 w-3.5" />
              <span>Interactive Pipeline Workload Generator</span>
            </div>
            <h2 className="text-base font-bold text-[#252A36] font-display">
              Incoming Industrial Sensor Data Rate: {sensorLoadMultiplier.toFixed(1)}× Nominal Load
            </h2>
          </div>
          <span className="font-mono text-xs font-bold text-[#8B78DB]">
            {metrics.throughputFps} Telemetry Frames / sec
          </span>
        </div>

        <input
          type="range"
          min={0.5}
          max={5.0}
          step={0.5}
          value={sensorLoadMultiplier}
          onChange={(e) => setSensorLoadMultiplier(Number(e.target.value))}
          className="w-full accent-[#4169E1]"
        />

        <div className="flex items-start gap-2.5 text-xs text-[#7C8495] bg-[#F8F7F3] p-3 rounded-xl border border-[#E9EAF0]">
          <Info className="h-4 w-4 text-[#4169E1] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#252A36]">Simulation Disclosure:</strong> These metrics represent application-level OS simulation counters driven by your active processes and incoming sensor workload—not hardware measurements of your local computer.
          </span>
        </div>
      </div>

      {/* 8 Performance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>CPU Utilization</span>
            <Cpu className="h-4 w-4 text-[#4169E1]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#4169E1] tabular-nums">
            {metrics.cpuUtil}%
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            Across {metrics.activeProcs} active processes
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Memory Usage</span>
            <HardDrive className="h-4 w-4 text-[#8B78DB]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#8B78DB] tabular-nums">
            {metrics.memMb} MB
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            {metrics.memPct}% of 1024 MB pool
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Active Processes &amp; Threads</span>
            <Layers className="h-4 w-4 text-[#63A4FF]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {metrics.activeProcs}P / {metrics.activeThreads}T
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            Concurrent worker threads
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Buffer Occupancy</span>
            <Activity className="h-4 w-4 text-[#FF806D]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#FF806D] tabular-nums">
            {metrics.bufferOcc} / {settings.defaultBufferSize}
          </div>
          <div className="mt-1 text-[11px] text-[#7C8495]">
            Bounded ring buffer slots
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Processing Throughput</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-[#252A36] tabular-nums">
            {metrics.throughputFps} frames/s
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Avg Processing Time</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-[#4169E1] tabular-nums">
            {metrics.avgLatencyMs} ms
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Pending Analysis Jobs</div>
          <div className="mt-1.5 text-xl font-bold font-mono text-[#8B78DB] tabular-nums">
            {metrics.pendingJobs} Jobs
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Pipeline State</div>
          <div className="mt-1.5 text-sm font-bold text-[#4169E1]">
            {sensorLoadMultiplier >= 4
              ? 'High Load (Near Saturation)'
              : 'Nominal Balanced Flow'}
          </div>
        </div>
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <h3 className="text-base font-bold text-[#252A36] font-display mb-1">
            CPU &amp; Memory Utilization Trend
          </h3>
          <p className="text-xs text-[#7C8495] mb-4">
            Simulated percentage load across recent 5-second sampling intervals
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EAF0" />
                <XAxis dataKey="slot" tick={{ fontSize: 11, fill: '#7C8495' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#7C8495' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  name="CPU Utilization (%)"
                  stroke="#4169E1"
                  fill="#E9E4FF"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="mem"
                  name="Memory Usage (%)"
                  stroke="#8B78DB"
                  fill="#FFE4D8"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <h3 className="text-base font-bold text-[#252A36] font-display mb-1">
            Pipeline Throughput vs. Processing Latency
          </h3>
          <p className="text-xs text-[#7C8495] mb-4">
            Effect of incoming sensor stream rate on frame analysis time
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EAF0" />
                <XAxis dataKey="slot" tick={{ fontSize: 11, fill: '#7C8495' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7C8495' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="throughput"
                  name="Throughput (frames/s)"
                  stroke="#4169E1"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  name="Avg Latency (ms)"
                  stroke="#FF806D"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
