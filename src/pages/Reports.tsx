import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useSystem, exportToCSV } from '../context/SystemContext';
import { runCPUScheduling } from '../simulation/cpuSchedulingEngine';
import { runPageReplacement } from '../simulation/memoryEngine';

export const Reports: React.FC = () => {
  const {
    machines,
    alerts,
    osProcesses,
    schedulingProcesses,
    settings,
  } = useSystem();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Risk distribution summary
  const riskSummary = useMemo(() => {
    return [
      {
        band: 'Low Risk (0–29)',
        count: machines.filter((m) => m.riskCategory === 'Low').length,
      },
      {
        band: 'Medium Risk (30–59)',
        count: machines.filter((m) => m.riskCategory === 'Medium').length,
      },
      {
        band: 'High Risk (60–79)',
        count: machines.filter((m) => m.riskCategory === 'High').length,
      },
      {
        band: 'Critical Risk (80–100)',
        count: machines.filter((m) => m.riskCategory === 'Critical').length,
      },
    ];
  }, [machines]);

  // CPU Scheduling comparison summary
  const schedulingComparison = useMemo(() => {
    return (['FCFS', 'SJF', 'Priority', 'RoundRobin'] as const).map((alg) => {
      const res = runCPUScheduling(
        schedulingProcesses,
        alg,
        settings.defaultTimeQuantum
      );
      return {
        algorithm: alg,
        avgWaitingTime: res.avgWaitingTime,
        avgTurnaroundTime: res.avgTurnaroundTime,
      };
    });
  }, [schedulingProcesses, settings.defaultTimeQuantum]);

  // Page Fault comparison across frame counts (3, 4, 5 frames)
  const pageFaultComparison = useMemo(() => {
    const sampleRef = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2];
    return [3, 4, 5].map((frames) => {
      const fifo = runPageReplacement(sampleRef, frames, 'FIFO');
      const lru = runPageReplacement(sampleRef, frames, 'LRU');
      return {
        frames: `${frames} Frames`,
        FIFO_Faults: fifo.totalFaults,
        LRU_Faults: lru.totalFaults,
      };
    });
  }, []);

  const handleExportFleetCSV = () => {
    exportToCSV(
      `pmas_fleet_health_report_${dateRange}.csv`,
      machines.map((m) => ({
        MachineID: m.id,
        Name: m.name,
        Category: m.category,
        Location: m.location,
        Status: m.status,
        RiskScore: m.riskScore,
        RiskCategory: m.riskCategory,
        Temperature_C: m.temperature,
        Vibration_mms: m.vibration,
        Pressure_PSI: m.pressure,
        RunningHours: m.runningHours,
        LastMaintenance: m.lastMaintenanceDate,
        NextMaintenance: m.nextScheduledMaintenance,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Executive Reports &amp; OS Simulation Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Comprehensive summary of industrial equipment health, maintenance alerts, CPU scheduling benchmarks, and virtual memory performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs font-semibold text-[#252A36]"
          >
            <option value="7d">Window: Last 7 Days</option>
            <option value="30d">Window: Last 30 Days</option>
            <option value="90d">Window: Last 90 Days</option>
          </select>

          <button
            onClick={handleExportFleetCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4169E1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3457c9]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-white px-3.5 py-2 text-xs font-semibold text-[#252A36] hover:bg-[#F8F7F3]"
          >
            <Printer className="h-3.5 w-3.5 text-[#8B78DB]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Executive Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Fleet Mean Risk Score</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#4169E1] tabular-nums">
            {machines.length
              ? Math.round(
                  machines.reduce((acc, m) => acc + m.riskScore, 0) /
                    machines.length
                )
              : 0}
            /100
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Alert Resolution Rate</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#8B78DB] tabular-nums">
            {alerts.length
              ? Math.round(
                  (alerts.filter((a) => a.status !== 'Active').length /
                    alerts.length) *
                    100
                )
              : 100}
            %
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Total Pipeline CPU Time</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {osProcesses
              .reduce((acc, p) => acc + p.executionTime, 0)
              .toLocaleString()}{' '}
            s
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Total Resident RAM</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#FF806D] tabular-nums">
            {osProcesses.reduce((acc, p) => acc + p.memoryUsage, 0)} MB
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <h3 className="text-base font-bold text-[#252A36] font-display mb-1">
            Machine Risk Distribution Summary
          </h3>
          <p className="text-xs text-[#7C8495] mb-4">
            Equipment count across Low, Medium, High, and Critical risk tiers
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C5D3EB" />
                <XAxis
                  dataKey="band"
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
                <Bar
                  dataKey="count"
                  name="Machine Count"
                  fill="#2E56D6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Page Fault Comparison */}
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <h3 className="text-base font-bold text-[#252A36] font-display mb-1">
            FIFO vs. LRU Page Replacement Fault Benchmark
          </h3>
          <p className="text-xs text-[#7C8495] mb-4">
            Simulated page fault counts across 3, 4, and 5 physical memory frames
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageFaultComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C5D3EB" />
                <XAxis
                  dataKey="frames"
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
                <Bar
                  dataKey="FIFO_Faults"
                  name="FIFO Page Faults"
                  fill="#D94E43"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="LRU_Faults"
                  name="LRU Page Faults"
                  fill="#2E56D6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CPU Scheduling & Process Execution Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <h3 className="text-base font-bold text-[#252A36] font-display mb-4">
            CPU Scheduling Benchmark Summary
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E9EAF0] text-[#7C8495]">
                <th className="py-2.5">Algorithm</th>
                <th className="py-2.5 text-right">Avg Waiting Time</th>
                <th className="py-2.5 text-right">Avg Turnaround Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0]">
              {schedulingComparison.map((row) => (
                <tr key={row.algorithm}>
                  <td className="py-2.5 font-bold text-[#252A36]">
                    {row.algorithm}
                  </td>
                  <td className="py-2.5 text-right font-mono text-[#4169E1]">
                    {row.avgWaitingTime} ms
                  </td>
                  <td className="py-2.5 text-right font-mono text-[#8B78DB]">
                    {row.avgTurnaroundTime} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#252A36] font-display">
              OS Pipeline Process Statistics
            </h3>
            <FileSpreadsheet className="h-4 w-4 text-[#4169E1]" />
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E9EAF0] text-[#7C8495]">
                <th className="py-2.5">Process (PID)</th>
                <th className="py-2.5">State</th>
                <th className="py-2.5 text-right">Memory</th>
                <th className="py-2.5 text-right">Exec Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0]">
              {osProcesses.map((p) => (
                <tr key={p.pid}>
                  <td className="py-2.5 font-semibold text-[#252A36]">
                    {p.name} ({p.pid})
                  </td>
                  <td className="py-2.5 text-[#4169E1] font-medium">
                    {p.state}
                  </td>
                  <td className="py-2.5 text-right font-mono">{p.memoryUsage} MB</td>
                  <td className="py-2.5 text-right font-mono">
                    {p.executionTime} s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
