import React, { useState, useMemo } from 'react';
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
import {
  Play,
  SkipForward,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { runCPUScheduling } from '../simulation/cpuSchedulingEngine';
import { INITIAL_SCHEDULING_PROCESSES } from '../services/demoData';

const BLOCK_COLORS: Record<string, string> = {
  P1: '#4169E1',
  P2: '#8B78DB',
  P3: '#FF806D',
  P4: '#63A4FF',
  P5: '#252A36',
  P6: '#4169E1',
  IDLE: '#E9EAF0',
};

export const CPUScheduling: React.FC = () => {
  const {
    schedulingProcesses,
    setSchedulingProcesses,
    settings,
    addEventLog,
  } = useSystem();

  const [algorithm, setAlgorithm] = useState<
    'FCFS' | 'SJF' | 'Priority' | 'RoundRobin'
  >('RoundRobin');
  const [timeQuantum, setTimeQuantum] = useState<number>(
    settings.defaultTimeQuantum || 3
  );
  const [stepCount, setStepCount] = useState<number | null>(null);

  // New process input fields
  const [newName, setNewName] = useState('Telemetry Flusher');
  const [newArrival, setNewArrival] = useState(4);
  const [newBurst, setNewBurst] = useState(4);
  const [newPriority, setNewPriority] = useState(2);

  const result = useMemo(
    () => runCPUScheduling(schedulingProcesses, algorithm, timeQuantum),
    [schedulingProcesses, algorithm, timeQuantum]
  );

  // Comparison across all 4 algorithms
  const comparisonData = useMemo(() => {
    const algos: ('FCFS' | 'SJF' | 'Priority' | 'RoundRobin')[] = [
      'FCFS',
      'SJF',
      'Priority',
      'RoundRobin',
    ];
    return algos.map((alg) => {
      const res = runCPUScheduling(schedulingProcesses, alg, timeQuantum);
      return {
        algorithm: alg === 'RoundRobin' ? `Round Robin (Q=${timeQuantum})` : alg,
        avgWaitingTime: res.avgWaitingTime,
        avgTurnaroundTime: res.avgTurnaroundTime,
        avgResponseTime: res.avgResponseTime,
      };
    });
  }, [schedulingProcesses, timeQuantum]);

  const visibleGantt = useMemo(() => {
    if (stepCount === null) return result.gantt;
    return result.gantt.slice(0, stepCount);
  }, [result.gantt, stepCount]);

  const totalDuration = useMemo(() => {
    if (result.gantt.length === 0) return 1;
    return Math.max(1, result.gantt[result.gantt.length - 1].endTime);
  }, [result.gantt]);

  const handleRunFull = () => {
    setStepCount(null);
    addEventLog(
      'CPU Scheduler',
      'Process',
      `Executed ${algorithm} scheduling simulation across ${schedulingProcesses.length} processes (Avg Wait: ${result.avgWaitingTime}ms, Avg Turnaround: ${result.avgTurnaroundTime}ms).`,
      'Info'
    );
  };

  const handleStepForward = () => {
    setStepCount((prev) => {
      if (prev === null) return 1;
      if (prev >= result.gantt.length) return result.gantt.length;
      return prev + 1;
    });
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `P${schedulingProcesses.length + 1}`;
    setSchedulingProcesses((prev) => [
      ...prev,
      {
        id: nextId,
        name: newName.trim() || `Task ${nextId}`,
        arrivalTime: Math.max(0, Number(newArrival)),
        burstTime: Math.max(1, Number(newBurst)),
        priority: Math.max(1, Number(newPriority)),
      },
    ]);
    setStepCount(null);
  };

  const updateProcField = (
    id: string,
    field: 'arrivalTime' | 'burstTime' | 'priority',
    value: number
  ) => {
    setSchedulingProcesses((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]:
                field === 'arrivalTime'
                  ? Math.max(0, value)
                  : Math.max(1, value),
            }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <div className="text-xs font-semibold text-[#4169E1] mb-1">
            OPERATING SYSTEM LAB · MODULE 02
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            CPU Scheduling Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Simulate FCFS, SJF, Priority, and Round Robin scheduling on predictive maintenance worker processes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunFull}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4169E1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3457c9]"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Run Simulation</span>
          </button>
          <button
            onClick={handleStepForward}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-white px-3.5 py-2 text-xs font-semibold text-[#252A36] hover:bg-[#E9E4FF]"
          >
            <SkipForward className="h-3.5 w-3.5 text-[#8B78DB]" />
            <span>Step Forward</span>
          </button>
          <button
            onClick={() => {
              setSchedulingProcesses(INITIAL_SCHEDULING_PROCESSES);
              setStepCount(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3.5 py-2 text-xs font-semibold text-[#7C8495] hover:text-[#252A36]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Algorithm Selector & Round Robin Time Quantum */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'FCFS', label: 'First Come First Serve (FCFS)' },
              { id: 'SJF', label: 'Shortest Job First (SJF)' },
              { id: 'Priority', label: 'Priority Scheduling' },
              { id: 'RoundRobin', label: 'Round Robin (Preemptive)' },
            ] as const
          ).map((alg) => (
            <button
              key={alg.id}
              onClick={() => {
                setAlgorithm(alg.id);
                setStepCount(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                algorithm === alg.id
                  ? 'bg-[#4169E1] text-white shadow-xs'
                  : 'bg-[#F8F7F3] text-[#7C8495] hover:text-[#252A36]'
              }`}
            >
              {alg.label}
            </button>
          ))}
        </div>

        {algorithm === 'RoundRobin' && (
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-[#8B78DB]" />
            <label className="text-xs font-semibold text-[#252A36]">
              Time Quantum (ms):
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={timeQuantum}
              onChange={(e) =>
                setTimeQuantum(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-16 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-2.5 py-1.5 text-xs font-mono font-bold text-center text-[#4169E1]"
            />
          </div>
        )}
      </div>

      {/* Gantt Chart Visualization */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#252A36] font-display">
              CPU Execution Gantt Timeline ({algorithm})
            </h2>
            <p className="text-xs text-[#7C8495]">
              {stepCount !== null
                ? `Step-by-step mode: Showing slice ${stepCount} of ${result.gantt.length}`
                : `Complete execution schedule across ${totalDuration} time units`}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>
              Avg Waiting:{' '}
              <strong className="text-[#4169E1]">{result.avgWaitingTime} ms</strong>
            </span>
            <span>
              Avg Turnaround:{' '}
              <strong className="text-[#8B78DB]">
                {result.avgTurnaroundTime} ms
              </strong>
            </span>
            <span>
              CPU Busy:{' '}
              <strong className="text-[#FF806D]">{result.cpuUtilization}%</strong>
            </span>
          </div>
        </div>

        {/* Gantt Blocks */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex min-w-[540px] rounded-2xl border border-[#E9EAF0] bg-[#F8F7F3] p-2 gap-1">
            {visibleGantt.map((seg, idx) => {
              const duration = seg.endTime - seg.startTime;
              const widthPct = Math.max(6, (duration / totalDuration) * 100);
              const bgColor =
                BLOCK_COLORS[seg.processId] || '#4169E1';
              return (
                <div
                  key={`${seg.processId}-${idx}`}
                  style={{ width: `${widthPct}%`, backgroundColor: bgColor }}
                  className={`rounded-xl p-2.5 flex flex-col justify-between transition-all ${
                    seg.isIdle ? 'text-[#252A36]' : 'text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span>{seg.processId}</span>
                    <span className="opacity-85 text-[10px]">{duration}ms</span>
                  </div>
                  <div className="text-[11px] truncate opacity-90 mt-1">
                    {seg.processName}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mt-2">
                    <span>{seg.startTime}</span>
                    <span>{seg.endTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plain-Language Algorithm Outcome Explanation */}
        <div className="rounded-xl bg-[#F8F7F3] p-3.5 text-xs text-[#252A36] border border-[#E9EAF0]">
          {algorithm === 'FCFS' && (
            <span>
              <strong>FCFS Analysis:</strong> Processes execute strictly in arrival order. Simple and starvation-free, but short high-priority tasks like Alert Generator wait behind longer jobs (convoy effect).
            </span>
          )}
          {algorithm === 'SJF' && (
            <span>
              <strong>SJF Analysis:</strong> Minimizes average waiting time ({result.avgWaitingTime} ms) by selecting the shortest burst in the ready queue next. Ideal when burst durations of telemetry tasks are known in advance.
            </span>
          )}
          {algorithm === 'Priority' && (
            <span>
              <strong>Priority Analysis:</strong> Dispatches critical tasks (Priority 1: Data Analyzer &amp; Alert Generator) ahead of lower-priority reporting jobs, ensuring rapid fault detection.
            </span>
          )}
          {algorithm === 'RoundRobin' && (
            <span>
              <strong>Round Robin Analysis (Quantum = {timeQuantum}ms):</strong> Time-slices CPU fairly across all ready processes, providing responsive initial execution (Avg Response Time: {result.avgResponseTime} ms) for interactive monitoring.
            </span>
          )}
        </div>
      </div>

      {/* Editable Processes Table & Calculated Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl border border-[#E9EAF0] bg-white overflow-hidden">
          <div className="p-5 border-b border-[#E9EAF0] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#252A36] font-display">
              Editable Process Queue &amp; Calculated Metrics
            </h3>
            <span className="text-[11px] text-[#7C8495]">
              Edit Arrival, Burst, or Priority to recalculate live
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E9EAF0] bg-[#F8F7F3]/70 text-[11px] font-semibold text-[#7C8495] uppercase">
                  <th className="py-3 px-3">PID &amp; Task</th>
                  <th className="py-3 px-3 text-right">Arrival (AT)</th>
                  <th className="py-3 px-3 text-right">Burst (BT)</th>
                  <th className="py-3 px-3 text-right">Priority</th>
                  <th className="py-3 px-3 text-right">Completion (CT)</th>
                  <th className="py-3 px-3 text-right">Turnaround (TAT)</th>
                  <th className="py-3 px-3 text-right">Waiting (WT)</th>
                  <th className="py-3 px-3 text-right">Response (RT)</th>
                  <th className="py-3 px-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF0]">
                {result.metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F8F7F3]/60">
                    <td className="py-2.5 px-3 font-semibold text-[#252A36]">
                      <span className="font-mono text-[#4169E1] mr-1.5">
                        {m.id}
                      </span>
                      {m.name}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={m.arrivalTime}
                        onChange={(e) =>
                          updateProcField(
                            m.id,
                            'arrivalTime',
                            Number(e.target.value)
                          )
                        }
                        className="w-14 rounded-lg border border-[#E9EAF0] bg-[#F8F7F3] px-2 py-1 text-right font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={m.burstTime}
                        onChange={(e) =>
                          updateProcField(
                            m.id,
                            'burstTime',
                            Number(e.target.value)
                          )
                        }
                        className="w-14 rounded-lg border border-[#E9EAF0] bg-[#F8F7F3] px-2 py-1 text-right font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={m.priority}
                        onChange={(e) =>
                          updateProcField(
                            m.id,
                            'priority',
                            Number(e.target.value)
                          )
                        }
                        className="w-14 rounded-lg border border-[#E9EAF0] bg-[#F8F7F3] px-2 py-1 text-right font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#252A36] tabular-nums">
                      {m.completionTime}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#8B78DB] tabular-nums">
                      {m.turnaroundTime}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#4169E1] tabular-nums">
                      {m.waitingTime}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#7C8495] tabular-nums">
                      {m.responseTime}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        disabled={schedulingProcesses.length <= 1}
                        onClick={() =>
                          setSchedulingProcesses((prev) =>
                            prev.filter((p) => p.id !== m.id)
                          )
                        }
                        className="p-1 rounded-lg text-[#FF806D] hover:bg-[#FFE4D8] disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Process Form */}
        <div className="lg:col-span-4 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#252A36] font-display">
            Add Process to Ready Queue
          </h3>
          <form onSubmit={handleAddProcess} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#252A36] mb-1">
                Process Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-[#252A36] mb-1">
                  Arrival
                </label>
                <input
                  type="number"
                  min={0}
                  value={newArrival}
                  onChange={(e) => setNewArrival(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-2.5 py-2 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#252A36] mb-1">
                  Burst
                </label>
                <input
                  type="number"
                  min={1}
                  value={newBurst}
                  onChange={(e) => setNewBurst(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-2.5 py-2 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#252A36] mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  min={1}
                  value={newPriority}
                  onChange={(e) => setNewPriority(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-2.5 py-2 font-mono"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4169E1] py-2.5 font-semibold text-white hover:bg-[#3457c9]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Append Process</span>
            </button>
          </form>

          <div className="rounded-xl bg-[#F8F7F3] p-3.5 text-[11px] text-[#7C8495] space-y-1 font-mono">
            <div>TAT = Completion Time − Arrival Time</div>
            <div>WT = Turnaround Time − Burst Time</div>
            <div>RT = First CPU Start − Arrival Time</div>
          </div>
        </div>
      </div>

      {/* Multi-Algorithm Comparison Chart */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <h3 className="text-base font-bold text-[#252A36] font-display mb-1">
          Side-by-Side Scheduling Algorithm Comparison
        </h3>
        <p className="text-xs text-[#7C8495] mb-4">
          Comparing Average Waiting Time, Turnaround Time, and Response Time for the current process queue
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EAF0" />
              <XAxis dataKey="algorithm" tick={{ fontSize: 11, fill: '#7C8495' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7C8495' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="avgWaitingTime"
                name="Avg Waiting Time (ms)"
                fill="#4169E1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="avgTurnaroundTime"
                name="Avg Turnaround Time (ms)"
                fill="#8B78DB"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="avgResponseTime"
                name="Avg Response Time (ms)"
                fill="#FF806D"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
