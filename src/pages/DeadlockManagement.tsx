import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Lock,
  GitMerge,
} from 'lucide-react';
import { evaluateBankersAlgorithm } from '../simulation/bankerEngine';
import { useSystem } from '../context/SystemContext';

const PROCESS_IDS = ['P0 (Collector)', 'P1 (Filter)', 'P2 (Analyzer)', 'P3 (RiskCalc)', 'P4 (AlertGen)'];
const RESOURCE_NAMES = ['R1 (Fieldbus)', 'R2 (DMA Buffer)', 'R3 (Alert Socket)'];

const SAFE_PRESET = {
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  maxDemand: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  available: [3, 3, 2],
};

const UNSAFE_PRESET = {
  allocation: [
    [1, 1, 1],
    [2, 1, 0],
    [3, 0, 2],
    [2, 1, 1],
    [1, 0, 2],
  ],
  maxDemand: [
    [7, 5, 3],
    [5, 4, 3],
    [9, 3, 4],
    [6, 4, 4],
    [5, 3, 3],
  ],
  available: [0, 1, 0],
};

export const DeadlockManagement: React.FC = () => {
  const { addEventLog } = useSystem();

  // Tab A: RAG Circular Wait Demonstration State
  const [ragCircularWait, setRagCircularWait] = useState<boolean>(true);
  const [fixedOrderingEnabled, setFixedOrderingEnabled] = useState<boolean>(false);

  // Tab B: Banker's Algorithm Matrices
  const [allocation, setAllocation] = useState<number[][]>(SAFE_PRESET.allocation);
  const [maxDemand, setMaxDemand] = useState<number[][]>(SAFE_PRESET.maxDemand);
  const [available, setAvailable] = useState<number[]>(SAFE_PRESET.available);

  // Resource Request Tester
  const [reqProcessIdx, setReqProcessIdx] = useState<number>(1);
  const [reqVector, setReqVector] = useState<number[]>([1, 0, 2]);
  const [applyRequest, setApplyRequest] = useState<boolean>(false);

  const bankerResult = useMemo(() => {
    return evaluateBankersAlgorithm(
      PROCESS_IDS,
      RESOURCE_NAMES,
      allocation,
      maxDemand,
      available,
      applyRequest
        ? { processIndex: reqProcessIdx, vector: reqVector }
        : undefined
    );
  }, [allocation, maxDemand, available, applyRequest, reqProcessIdx, reqVector]);

  const handleLoadPreset = (preset: typeof SAFE_PRESET, label: string) => {
    setAllocation(preset.allocation.map((r) => [...r]));
    setMaxDemand(preset.maxDemand.map((r) => [...r]));
    setAvailable([...preset.available]);
    setApplyRequest(false);
    addEventLog(
      'Deadlock Monitor',
      'Deadlock',
      `Loaded ${label} scenario into Banker's Algorithm matrix.`,
      label.includes('Unsafe') ? 'Warning' : 'Info'
    );
  };

  const updateMatrixCell = (
    matrixType: 'allocation' | 'max',
    rowIdx: number,
    colIdx: number,
    val: number
  ) => {
    const clean = Math.max(0, Math.min(15, Number(val) || 0));
    if (matrixType === 'allocation') {
      setAllocation((prev) =>
        prev.map((r, i) => (i === rowIdx ? r.map((c, j) => (j === colIdx ? clean : c)) : r))
      );
    } else {
      setMaxDemand((prev) =>
        prev.map((r, i) => (i === rowIdx ? r.map((c, j) => (j === colIdx ? clean : c)) : r))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <div className="text-xs font-semibold text-[#4169E1] mb-1">
            OPERATING SYSTEM LAB · MODULE 05
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Deadlock Management &amp; Banker’s Safety Algorithm
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Analyze circular wait in Resource Allocation Graphs, run the Banker&apos;s Algorithm, and verify deadlock prevention strategies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleLoadPreset(SAFE_PRESET, 'Safe State Preset')}
            className="rounded-xl bg-[#4169E1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3457c9]"
          >
            Load Safe Scenario
          </button>
          <button
            onClick={() => handleLoadPreset(UNSAFE_PRESET, 'Unsafe Deadlock-Risk Preset')}
            className="rounded-xl bg-[#FF806D] px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
          >
            Load Unsafe Scenario
          </button>
          <button
            onClick={() => handleLoadPreset(SAFE_PRESET, 'Default Reset')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3.5 py-2 text-xs font-semibold text-[#7C8495]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Section B: Banker's Algorithm Interactive Laboratory */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9EAF0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#252A36] font-display">
              Banker’s Algorithm Deadlock Avoidance Simulator
            </h2>
            <p className="text-xs text-[#7C8495]">
              Automatically computes <code className="font-mono text-[#4169E1]">Need[i][j] = Max[i][j] − Allocation[i][j]</code> and evaluates whether a safe execution sequence exists.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#252A36]">
              Available Vector (A, B, C):
            </span>
            {available.map((val, j) => (
              <input
                key={j}
                type="number"
                min={0}
                max={20}
                value={val}
                onChange={(e) => {
                  const next = [...available];
                  next[j] = Math.max(0, Number(e.target.value) || 0);
                  setAvailable(next);
                }}
                className="w-14 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-2.5 py-1.5 text-center font-mono text-xs font-bold text-[#4169E1]"
              />
            ))}
          </div>
        </div>

        {/* Safe / Unsafe Banner */}
        <div
          className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            bankerResult.isSafe
              ? 'border-[#4169E1]/40 bg-[#E9E4FF]/45'
              : 'border-[#FF806D] bg-[#FFE4D8]/65'
          }`}
        >
          <div className="flex items-start gap-3">
            {bankerResult.isSafe ? (
              <CheckCircle2 className="h-5 w-5 text-[#4169E1] shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-[#FF806D] shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-[#252A36]">
                {bankerResult.isSafe
                  ? 'SAFE STATE VERIFIED — No Deadlock Possible Along Safe Sequence'
                  : 'UNSAFE STATE DETECTED — High Risk of Deadlock'}
              </div>
              <p className="text-[#252A36] leading-relaxed">
                {bankerResult.requestError || bankerResult.summary}
              </p>
            </div>
          </div>

          {bankerResult.isSafe && (
            <div className="font-mono text-xs font-bold text-[#4169E1] bg-white px-3.5 py-2 rounded-xl border border-[#E9EAF0] shrink-0">
              {bankerResult.safeSequence.join(' → ')}
            </div>
          )}
        </div>

        {/* Matrices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E9EAF0] bg-[#F8F7F3] text-[11px] font-semibold text-[#7C8495] uppercase">
                <th className="py-3 px-3">Process</th>
                <th className="py-3 px-3 text-center">Allocation (R1, R2, R3)</th>
                <th className="py-3 px-3 text-center">Maximum Demand (R1, R2, R3)</th>
                <th className="py-3 px-3 text-center">
                  Calculated Need (Max − Alloc)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0]">
              {PROCESS_IDS.map((pName, i) => (
                <tr key={pName} className="hover:bg-[#F8F7F3]/50">
                  <td className="py-3 px-3 font-bold text-[#252A36] font-mono">
                    {pName}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-2">
                      {allocation[i].map((val, j) => (
                        <input
                          key={j}
                          type="number"
                          min={0}
                          max={15}
                          value={val}
                          onChange={(e) =>
                            updateMatrixCell('allocation', i, j, Number(e.target.value))
                          }
                          className="w-12 rounded-lg border border-[#E9EAF0] bg-[#F8F7F3] py-1 text-center font-mono"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-2">
                      {maxDemand[i].map((val, j) => (
                        <input
                          key={j}
                          type="number"
                          min={0}
                          max={15}
                          value={val}
                          onChange={(e) =>
                            updateMatrixCell('max', i, j, Number(e.target.value))
                          }
                          className="w-12 rounded-lg border border-[#E9EAF0] bg-[#F8F7F3] py-1 text-center font-mono"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-2 font-mono font-bold text-[#4169E1]">
                      {bankerResult.needMatrix[i].map((n, j) => (
                        <span
                          key={j}
                          className="w-12 rounded-lg bg-[#E9E4FF]/55 py-1 text-center"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resource Request Evaluator & Step Trace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          <div className="lg:col-span-5 rounded-2xl border border-[#E9EAF0] bg-[#F8F7F3] p-4 space-y-3 text-xs">
            <div className="font-bold text-[#252A36]">
              Test Immediate Resource Request
            </div>
            <p className="text-[#7C8495]">
              Simulate a process requesting additional instances of (R1, R2, R3) and check if granting it preserves a safe state.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={reqProcessIdx}
                onChange={(e) => setReqProcessIdx(Number(e.target.value))}
                className="rounded-xl border border-[#E9EAF0] bg-white px-3 py-1.5 font-semibold"
              >
                {PROCESS_IDS.map((p, idx) => (
                  <option key={p} value={idx}>
                    {p}
                  </option>
                ))}
              </select>
              {reqVector.map((v, j) => (
                <input
                  key={j}
                  type="number"
                  min={0}
                  max={10}
                  value={v}
                  onChange={(e) => {
                    const next = [...reqVector];
                    next[j] = Math.max(0, Number(e.target.value) || 0);
                    setReqVector(next);
                  }}
                  className="w-12 rounded-xl border border-[#E9EAF0] bg-white py-1.5 text-center font-mono font-bold"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setApplyRequest(true)}
                className="rounded-xl bg-[#4169E1] px-4 py-2 font-semibold text-white"
              >
                Evaluate Request Safety
              </button>
              {applyRequest && (
                <button
                  onClick={() => setApplyRequest(false)}
                  className="rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 font-semibold text-[#7C8495]"
                >
                  Clear Request
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-[#E9EAF0] bg-[#F8F7F3] p-4 space-y-2 text-xs">
            <div className="font-bold text-[#252A36]">
              Safety Algorithm Step-by-Step Execution Trace
            </div>
            {bankerResult.steps.length === 0 ? (
              <p className="text-[#FF806D] py-3">
                No process could satisfy Need[i] ≤ Work. System cannot progress without deadlocking if all processes request their maximum claim.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {bankerResult.steps.map((s) => (
                  <div
                    key={s.step}
                    className="rounded-xl bg-white p-2.5 border border-[#E9EAF0] font-mono text-[11px] text-[#252A36]"
                  >
                    <strong className="text-[#4169E1]">Step {s.step}:</strong>{' '}
                    {s.explanation}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section A & C: Resource Allocation Graph (RAG) & Deadlock Prevention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* A. Resource Allocation Graph Circular Wait Visualizer */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#252A36] font-display">
                Resource Allocation Graph (RAG) Demonstration
              </h3>
              <p className="text-xs text-[#7C8495]">
                Visualize Hold-and-Wait and Circular Wait cycles across processes and resources
              </p>
            </div>
            <button
              onClick={() => setRagCircularWait((c) => !c)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
                ragCircularWait
                  ? 'bg-[#FFE4D8] text-[#FF806D]'
                  : 'bg-[#E9E4FF] text-[#4169E1]'
              }`}
            >
              {ragCircularWait
                ? 'Cycle Active (Deadlocked) — Click to Break'
                : 'Cycle Broken (Safe) — Click to Induce Cycle'}
            </button>
          </div>

          <div className="rounded-2xl border border-[#E9EAF0] bg-[#F8F7F3] p-4 flex justify-center">
            <svg className="w-full max-w-md h-52" viewBox="0 0 420 200">
              {/* Resource Nodes */}
              <rect
                x="40"
                y="20"
                width="90"
                height="36"
                rx="8"
                fill="#FFFFFF"
                stroke="#4169E1"
                strokeWidth="1.8"
              />
              <text x="85" y="42" textAnchor="middle" fontSize="11" fill="#252A36" fontWeight="bold">
                R1: Fieldbus
              </text>

              <rect
                x="290"
                y="20"
                width="90"
                height="36"
                rx="8"
                fill="#FFFFFF"
                stroke="#8B78DB"
                strokeWidth="1.8"
              />
              <text x="335" y="42" textAnchor="middle" fontSize="11" fill="#252A36" fontWeight="bold">
                R2: Buffer
              </text>

              {/* Process Circles */}
              <circle
                cx="85"
                cy="150"
                r="28"
                fill="#E9E4FF"
                stroke="#4169E1"
                strokeWidth="2"
              />
              <text x="85" y="154" textAnchor="middle" fontSize="11" fill="#4169E1" fontWeight="bold">
                P1
              </text>

              <circle
                cx="335"
                cy="150"
                r="28"
                fill="#E9E4FF"
                stroke="#8B78DB"
                strokeWidth="2"
              />
              <text x="335" y="154" textAnchor="middle" fontSize="11" fill="#8B78DB" fontWeight="bold">
                P2
              </text>

              {/* Edges: R1 allocated to P1, P1 requests R2 */}
              <line x1="85" y1="56" x2="85" y2="122" stroke="#4169E1" strokeWidth="2" />
              <line
                x1="113"
                y1="140"
                x2="290"
                y2="48"
                stroke="#FF806D"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* R2 allocated to P2 */}
              <line x1="335" y1="56" x2="335" y2="122" stroke="#8B78DB" strokeWidth="2" />

              {/* Conditional Circular Wait Edge: P2 requests R1 */}
              {ragCircularWait && (
                <line
                  x1="307"
                  y1="140"
                  x2="130"
                  y2="48"
                  stroke="#FF806D"
                  strokeWidth="2.2"
                  strokeDasharray="4 4"
                />
              )}
            </svg>
          </div>

          <p className="text-xs text-[#7C8495] leading-relaxed">
            {ragCircularWait
              ? 'Circular Wait Active: P1 holds R1 (Fieldbus) and waits for R2 (Buffer), while P2 holds R2 and waits for R1. Neither process can proceed without preemption.'
              : 'Cycle Broken: P2 released its hold/request on R1, allowing P1 to acquire R2, finish execution, and release all locks.'}
          </p>
        </div>

        {/* C. Deadlock Prevention & Necessary Conditions */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#252A36] font-display">
                Deadlock Prevention &amp; Necessary Conditions
              </h3>
              <p className="text-xs text-[#7C8495]">
                Break at least one of the 4 Coffman conditions to prevent deadlock structurally
              </p>
            </div>
            <GitMerge className="h-5 w-5 text-[#4169E1]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
              <div className="font-bold text-[#252A36]">1. Mutual Exclusion</div>
              <p className="text-[#7C8495] mt-1">
                Non-shareable hardware registers (e.g., Modbus serial bus) can only be held by one process at a time.
              </p>
            </div>
            <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
              <div className="font-bold text-[#252A36]">2. Hold and Wait</div>
              <p className="text-[#7C8495] mt-1">
                A process holds a DMA buffer while waiting to acquire the Alert Socket lock.
              </p>
            </div>
            <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
              <div className="font-bold text-[#252A36]">3. No Preemption</div>
              <p className="text-[#7C8495] mt-1">
                Resources cannot be forcibly taken mid-write without corrupting telemetry packets.
              </p>
            </div>
            <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
              <div className="font-bold text-[#4169E1]">
                4. Circular Wait (Preventable!)
              </div>
              <p className="text-[#7C8495] mt-1">
                Impose a strict global lock hierarchy: every process must acquire <code className="font-mono">R1 → R2 → R3</code> in ascending order.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E9EAF0] bg-[#E9E4FF]/40 p-4 flex items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-[#252A36] flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#4169E1]" />
                <span>Enforce Fixed Resource Ordering (R1 &lt; R2 &lt; R3)</span>
              </div>
              <p className="text-[#7C8495]">
                {fixedOrderingEnabled
                  ? 'Active: Any thread holding R2 is forbidden from requesting R1, eliminating circular wait.'
                  : 'Disabled: Processes may request locks in arbitrary order, requiring runtime deadlock detection.'}
              </p>
            </div>
            <button
              onClick={() => {
                setFixedOrderingEnabled((f) => !f);
                setRagCircularWait(false);
              }}
              className={`rounded-xl px-4 py-2 font-semibold shrink-0 ${
                fixedOrderingEnabled
                  ? 'bg-[#4169E1] text-white'
                  : 'bg-white border border-[#E9EAF0] text-[#252A36]'
              }`}
            >
              {fixedOrderingEnabled ? 'Ordering Enforced' : 'Enable Lock Ordering'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
