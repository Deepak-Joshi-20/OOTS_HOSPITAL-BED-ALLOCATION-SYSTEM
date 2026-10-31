import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Layers,
  ArrowRight,
  Cpu,
  HardDrive,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { OSProcess, OSProcessState } from '../types';

const PROCESS_STATES: OSProcessState[] = [
  'New',
  'Ready',
  'Running',
  'Waiting',
  'Terminated',
];

export const ProcessManagement: React.FC = () => {
  const { osProcesses, setProcessState, restartAllProcesses } = useSystem();
  const [selectedPid, setSelectedPid] = useState<number>(
    osProcesses[0]?.pid || 101
  );

  const selectedProcess: OSProcess | undefined =
    osProcesses.find((p) => p.pid === selectedPid) || osProcesses[0];

  const stateCounts = PROCESS_STATES.reduce((acc, st) => {
    acc[st] = osProcesses.filter((p) => p.state === st).length;
    return acc;
  }, {} as Record<OSProcessState, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <div className="text-xs font-semibold text-[#4169E1] mb-1">
            OPERATING SYSTEM LAB · MODULE 01
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Process Management &amp; State Transitions
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Simulated OS Process Control Blocks (PCBs) managing the 6 stages of the predictive maintenance pipeline.
          </p>
        </div>

        <button
          onClick={restartAllProcesses}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-4 py-2.5 text-xs font-semibold text-[#252A36] hover:border-[#4169E1] transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#4169E1]" />
          <span>Reset Pipeline Processes</span>
        </button>
      </div>

      {/* Interactive 5-State Transition Diagram */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#252A36] font-display">
              Interactive 5-State Process Lifecycle Diagram
            </h2>
            <p className="text-xs text-[#7C8495]">
              Click any state node below to transition the currently selected process ({selectedProcess?.name} · PID {selectedProcess?.pid}) and observe PCB updates.
            </p>
          </div>
          <span className="text-xs font-mono text-[#4169E1]">
            Active Selection: PID {selectedProcess?.pid} [{selectedProcess?.state}]
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
          {PROCESS_STATES.map((state, idx) => {
            const isCurrent = selectedProcess?.state === state;
            return (
              <div key={state} className="flex items-center gap-2">
                <button
                  onClick={() =>
                    selectedProcess && setProcessState(selectedProcess.pid, state)
                  }
                  className={`flex-1 rounded-2xl border p-4 text-left transition-all ${
                    isCurrent
                      ? 'border-[#4169E1] bg-[#E9E4FF]/65 shadow-xs'
                      : 'border-[#E9EAF0] bg-[#F8F7F3] hover:border-[#63A4FF]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#252A36] font-display">
                      {state}
                    </span>
                    <span className="font-mono font-bold text-[#4169E1]">
                      {stateCounts[state]}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-[#7C8495]">
                    {state === 'New' && 'PCB allocated'}
                    {state === 'Ready' && 'In ready queue'}
                    {state === 'Running' && 'Dispatched on CPU'}
                    {state === 'Waiting' && 'Blocked on I/O or Mutex'}
                    {state === 'Terminated' && 'Resources freed'}
                  </div>
                </button>
                {idx < PROCESS_STATES.length - 1 && (
                  <ArrowRight className="hidden sm:block h-4 w-4 text-[#7C8495] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split: Process Table + PCB Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl border border-[#E9EAF0] bg-white overflow-hidden">
          <div className="p-5 border-b border-[#E9EAF0] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#252A36] font-display">
              Predictive Maintenance Pipeline Process Table
            </h2>
            <span className="text-xs font-mono text-[#7C8495]">
              Simulated OS Kernel Table
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9EAF0] bg-[#F8F7F3]/70 text-[11px] font-semibold text-[#7C8495] uppercase">
                  <th className="py-3 px-4">PID &amp; Process Name</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Priority</th>
                  <th className="py-3 px-4 text-right">CPU %</th>
                  <th className="py-3 px-4 text-right">Memory</th>
                  <th className="py-3 px-4 text-right">Exec Time</th>
                  <th className="py-3 px-4 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF0] text-xs">
                {osProcesses.map((proc) => {
                  const isSelected = proc.pid === selectedProcess?.pid;
                  return (
                    <tr
                      key={proc.pid}
                      onClick={() => setSelectedPid(proc.pid)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#E9E4FF]/40' : 'hover:bg-[#F8F7F3]/60'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#252A36]">
                          {proc.name}
                        </div>
                        <div className="font-mono text-[11px] text-[#7C8495]">
                          PID {proc.pid} · Created {proc.creationTime}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            proc.state === 'Running'
                              ? 'text-[#4169E1]'
                              : proc.state === 'Waiting'
                              ? 'text-[#8B78DB]'
                              : proc.state === 'Terminated'
                              ? 'text-[#FF806D]'
                              : 'text-[#252A36]'
                          }`}
                        >
                          {proc.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        P-{proc.priority}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#4169E1] font-semibold">
                        {proc.cpuUsage.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#252A36]">
                        {proc.memoryUsage} MB
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#7C8495]">
                        {proc.executionTime}s
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1">
                          {proc.state !== 'Running' && (
                            <button
                              onClick={() => setProcessState(proc.pid, 'Running')}
                              title="Start / Resume Process"
                              className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#4169E1] hover:bg-[#E9E4FF]"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {proc.state === 'Running' && (
                            <button
                              onClick={() => setProcessState(proc.pid, 'Waiting')}
                              title="Pause / Block Process"
                              className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#8B78DB] hover:bg-[#E9E4FF]"
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setProcessState(proc.pid, 'Ready')}
                            title="Move to Ready Queue"
                            className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#252A36] hover:bg-[#F8F7F3]"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                          {proc.state !== 'Terminated' && (
                            <button
                              onClick={() =>
                                setProcessState(proc.pid, 'Terminated')
                              }
                              title="Terminate Process"
                              className="p-1.5 rounded-lg border border-[#E9EAF0] bg-white text-[#FF806D] hover:bg-[#FFE4D8]"
                            >
                              <Square className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Process Control Block (PCB) Inspector */}
        <div className="lg:col-span-4 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-5">
          {selectedProcess && (
            <>
              <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-4">
                <div>
                  <div className="text-xs font-mono text-[#4169E1]">
                    PROCESS CONTROL BLOCK (PCB)
                  </div>
                  <h3 className="text-lg font-bold text-[#252A36] font-display">
                    {selectedProcess.name}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-[#8B78DB]">
                  PID {selectedProcess.pid}
                </span>
              </div>

              <p className="text-xs text-[#7C8495] leading-relaxed">
                {selectedProcess.role}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#F8F7F3] p-3">
                  <div className="text-[#7C8495] flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-[#4169E1]" />
                    <span>CPU Share</span>
                  </div>
                  <div className="mt-1 text-base font-bold font-mono text-[#252A36]">
                    {selectedProcess.cpuUsage.toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-xl bg-[#F8F7F3] p-3">
                  <div className="text-[#7C8495] flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-[#8B78DB]" />
                    <span>Resident Memory</span>
                  </div>
                  <div className="mt-1 text-base font-bold font-mono text-[#252A36]">
                    {selectedProcess.memoryUsage} MB
                  </div>
                </div>
                <div className="rounded-xl bg-[#F8F7F3] p-3">
                  <div className="text-[#7C8495] flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-[#63A4FF]" />
                    <span>Worker Threads</span>
                  </div>
                  <div className="mt-1 text-base font-bold font-mono text-[#252A36]">
                    {selectedProcess.threads} Threads
                  </div>
                </div>
                <div className="rounded-xl bg-[#F8F7F3] p-3">
                  <div className="text-[#7C8495]">Scheduler Priority</div>
                  <div className="mt-1 text-base font-bold font-mono text-[#252A36]">
                    Level {selectedProcess.priority}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E9EAF0]">
                <div className="text-xs font-semibold text-[#252A36]">
                  Transition Process State
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProcessState(selectedProcess.pid, 'Running')}
                    className="rounded-xl bg-[#4169E1] py-2 text-xs font-semibold text-white hover:bg-[#3457c9]"
                  >
                    Dispatch (Running)
                  </button>
                  <button
                    onClick={() => setProcessState(selectedProcess.pid, 'Waiting')}
                    className="rounded-xl bg-[#E9E4FF] py-2 text-xs font-semibold text-[#4169E1]"
                  >
                    Wait on I/O
                  </button>
                  <button
                    onClick={() => setProcessState(selectedProcess.pid, 'Ready')}
                    className="rounded-xl border border-[#E9EAF0] bg-white py-2 text-xs font-semibold text-[#252A36]"
                  >
                    Preempt (Ready)
                  </button>
                  <button
                    onClick={() =>
                      setProcessState(selectedProcess.pid, 'Terminated')
                    }
                    className="rounded-xl bg-[#FFE4D8] py-2 text-xs font-semibold text-[#FF806D]"
                  >
                    Terminate
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
