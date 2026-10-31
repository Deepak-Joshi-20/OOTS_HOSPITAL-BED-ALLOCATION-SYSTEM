import React, { useState, useMemo } from 'react';
import {
  HardDrive,
  Play,
  SkipForward,
  RotateCcw,
  Plus,
  Trash2,
  Cpu,
} from 'lucide-react';
import { runPageReplacement } from '../simulation/memoryEngine';
import { useSystem } from '../context/SystemContext';

interface MemoryPartition {
  id: string;
  processName: string;
  sizeMb: number;
  allocated: boolean;
}

export const MemoryManagement: React.FC = () => {
  const { settings, addEventLog } = useSystem();

  // Module A: Memory Allocation state (Total 1024 MB)
  const totalMemoryMb = 1024;
  const [partitions, setPartitions] = useState<MemoryPartition[]>([
    { id: 'BLK-1', processName: 'OS Kernel & Drivers', sizeMb: 128, allocated: true },
    { id: 'BLK-2', processName: 'Sensor Collector (PID 101)', sizeMb: 160, allocated: true },
    { id: 'BLK-3', processName: 'Data Analyzer (PID 103)', sizeMb: 256, allocated: true },
    { id: 'BLK-4', processName: 'Risk Calculator (PID 104)', sizeMb: 192, allocated: true },
    { id: 'BLK-5', processName: 'Alert Generator (PID 105)', sizeMb: 96, allocated: true },
  ]);
  const [allocName, setAllocName] = useState('FFT Harmonic Worker');
  const [allocSize, setAllocSize] = useState(128);

  const usedMemoryMb = partitions.reduce((acc, p) => acc + p.sizeMb, 0);
  const freeMemoryMb = Math.max(0, totalMemoryMb - usedMemoryMb);
  const memUtilPct = Math.round((usedMemoryMb / totalMemoryMb) * 100);

  // Module B: Paging Logical-to-Physical Translator
  const [logicalAddress, setLogicalAddress] = useState<number>(4380);
  const [pageSize, setPageSize] = useState<number>(1024);
  const pageTable = [5, 2, 7, 1, 9, 4, 0, 6]; // Page index -> Physical Frame

  const pagingCalc = useMemo(() => {
    const cleanAddr = Math.max(0, Math.floor(logicalAddress) || 0);
    const pageNumber = Math.floor(cleanAddr / pageSize);
    const offset = cleanAddr % pageSize;
    const frameNumber =
      pageNumber < pageTable.length ? pageTable[pageNumber] : (pageNumber * 3 + 1) % 16;
    const physicalAddress = frameNumber * pageSize + offset;
    return { pageNumber, offset, frameNumber, physicalAddress };
  }, [logicalAddress, pageSize]);

  // Module C: Page Replacement Simulator (FIFO & LRU)
  const [refStringInput, setRefStringInput] = useState<string>(
    '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2'
  );
  const [frameCount, setFrameCount] = useState<number>(
    settings.defaultMemoryFrames || 4
  );
  const [replacementAlgo, setReplacementAlgo] = useState<'FIFO' | 'LRU'>('LRU');
  const [stepLimit, setStepLimit] = useState<number | null>(null);

  const parsedRefString = useMemo(() => {
    return refStringInput
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 0)
      .slice(0, 24);
  }, [refStringInput]);

  const fifoResult = useMemo(
    () => runPageReplacement(parsedRefString, frameCount, 'FIFO'),
    [parsedRefString, frameCount]
  );
  const lruResult = useMemo(
    () => runPageReplacement(parsedRefString, frameCount, 'LRU'),
    [parsedRefString, frameCount]
  );

  const activeResult = replacementAlgo === 'FIFO' ? fifoResult : lruResult;
  const visibleSteps =
    stepLimit === null
      ? activeResult.steps
      : activeResult.steps.slice(0, stepLimit);

  // Module D: Working Set & Thrashing Simulator
  const [concurrentThreads, setConcurrentThreads] = useState<number>(6);
  const workingSetPagesPerThread = 3;
  const totalWorkingSetDemand = concurrentThreads * workingSetPagesPerThread;
  const availablePhysicalFrames = 24;
  const isThrashing = totalWorkingSetDemand > availablePhysicalFrames;

  const handleAllocateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const reqSize = Math.max(32, Number(allocSize) || 64);
    if (reqSize > freeMemoryMb) return;
    setPartitions((prev) => [
      ...prev,
      {
        id: `BLK-${Date.now().toString().slice(-3)}`,
        processName: allocName.trim() || 'Telemetry Worker',
        sizeMb: reqSize,
        allocated: true,
      },
    ]);
    addEventLog(
      'Memory Manager (MMU)',
      'Memory',
      `Allocated ${reqSize} MB physical memory block to ${allocName}.`,
      'Info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <div className="text-xs font-semibold text-[#4169E1] mb-1">
            OPERATING SYSTEM LAB · MODULE 06
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Virtual Memory, Paging &amp; Page Replacement Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Explore physical frame allocation, logical-to-physical address translation, FIFO vs. LRU page replacement, and working-set thrashing.
          </p>
        </div>
      </div>

      {/* Module C: Page Replacement Simulator (FIFO & LRU) */}
      <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#252A36] font-display">
              Page Replacement Algorithms (FIFO vs. LRU)
            </h2>
            <p className="text-xs text-[#7C8495]">
              Enter a page-reference string and frame count to inspect frame contents, hits, and page faults at every step
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['FIFO', 'LRU'] as const).map((alg) => (
              <button
                key={alg}
                onClick={() => {
                  setReplacementAlgo(alg);
                  setStepLimit(null);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                  replacementAlgo === alg
                    ? 'bg-[#4169E1] text-white'
                    : 'bg-[#F8F7F3] text-[#7C8495] hover:text-[#252A36]'
                }`}
              >
                {alg === 'FIFO'
                  ? 'First-In First-Out (FIFO)'
                  : 'Least Recently Used (LRU)'}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[#F8F7F3] p-4 rounded-2xl border border-[#E9EAF0]">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-[#252A36] mb-1">
              Page Reference String (Comma or space separated)
            </label>
            <input
              type="text"
              value={refStringInput}
              onChange={(e) => {
                setRefStringInput(e.target.value);
                setStepLimit(null);
              }}
              className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono text-[#252A36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#252A36] mb-1">
              Physical Frames ({frameCount})
            </label>
            <select
              value={frameCount}
              onChange={(e) => {
                setFrameCount(Number(e.target.value));
                setStepLimit(null);
              }}
              className="w-full rounded-xl border border-[#E9EAF0] bg-white px-3 py-2 text-xs font-mono"
            >
              {[2, 3, 4, 5, 6].map((f) => (
                <option key={f} value={f}>
                  {f} Frames
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <button
              onClick={() => setStepLimit(null)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4169E1] py-2 text-xs font-semibold text-white"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Run All</span>
            </button>
            <button
              onClick={() =>
                setStepLimit((prev) =>
                  prev === null
                    ? 1
                    : Math.min(activeResult.steps.length, prev + 1)
                )
              }
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-white py-2 text-xs font-semibold text-[#252A36]"
            >
              <SkipForward className="h-3.5 w-3.5 text-[#8B78DB]" />
              <span>Step</span>
            </button>
            <button
              onClick={() => {
                setRefStringInput('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2');
                setStepLimit(null);
              }}
              className="p-2 rounded-xl border border-[#E9EAF0] bg-white text-[#7C8495]"
              title="Reset Reference String"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary Metrics & Comparison */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
            <div className="text-[#7C8495]">Total Page Faults ({replacementAlgo})</div>
            <div className="mt-1 text-xl font-bold font-mono text-[#FF806D]">
              {activeResult.totalFaults}
            </div>
          </div>
          <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
            <div className="text-[#7C8495]">Total Page Hits ({replacementAlgo})</div>
            <div className="mt-1 text-xl font-bold font-mono text-[#4169E1]">
              {activeResult.totalHits}
            </div>
          </div>
          <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
            <div className="text-[#7C8495]">Page Hit Ratio</div>
            <div className="mt-1 text-xl font-bold font-mono text-[#8B78DB]">
              {activeResult.hitRatio}%
            </div>
          </div>
          <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3">
            <div className="text-[#7C8495]">FIFO Faults</div>
            <div className="mt-1 text-xl font-bold font-mono text-[#252A36]">
              {fifoResult.totalFaults} ({fifoResult.hitRatio}% hit)
            </div>
          </div>
          <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3 col-span-2 sm:col-span-1">
            <div className="text-[#7C8495]">LRU Faults</div>
            <div className="mt-1 text-xl font-bold font-mono text-[#4169E1]">
              {lruResult.totalFaults} ({lruResult.hitRatio}% hit)
            </div>
          </div>
        </div>

        {/* Step-by-Step Frame Matrix Table */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-2 min-w-full">
            {visibleSteps.map((st) => (
              <div
                key={st.stepIndex}
                className={`min-w-[68px] flex-1 rounded-2xl border p-2.5 text-center space-y-2 ${
                  st.isHit
                    ? 'border-[#4169E1]/50 bg-[#E9E4FF]/40'
                    : 'border-[#FF806D]/50 bg-[#FFE4D8]/35'
                }`}
              >
                <div className="text-[10px] font-mono text-[#7C8495]">
                  Step {st.stepIndex}
                </div>
                <div className="text-sm font-bold font-mono text-[#252A36] bg-white rounded-lg py-1 border border-[#E9EAF0]">
                  P{st.page}
                </div>
                <div className="space-y-1">
                  {st.framesAfter.map((val, fIdx) => (
                    <div
                      key={fIdx}
                      className="rounded-md bg-white/90 py-1 text-xs font-mono font-semibold text-[#252A36] border border-[#E9EAF0]"
                    >
                      {val !== null ? val : '–'}
                    </div>
                  ))}
                </div>
                <div
                  className={`text-[10px] font-mono font-bold ${
                    st.isHit ? 'text-[#4169E1]' : 'text-[#FF806D]'
                  }`}
                >
                  {st.isHit ? 'HIT' : 'FAULT'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Module A (Memory Allocation) + Module B (Paging Address Translation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* A. Memory Allocation Visualizer */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#252A36] font-display">
                Physical Memory Allocation ({usedMemoryMb} / {totalMemoryMb} MB)
              </h3>
              <p className="text-xs text-[#7C8495]">
                Utilization: {memUtilPct}% · Free Contiguous Pool: {freeMemoryMb} MB
              </p>
            </div>
            <HardDrive className="h-5 w-5 text-[#4169E1]" />
          </div>

          {/* Visual Memory Bar */}
          <div className="h-9 w-full rounded-xl bg-[#F8F7F3] border border-[#E9EAF0] overflow-hidden flex">
            {partitions.map((part, idx) => {
              const widthPct = (part.sizeMb / totalMemoryMb) * 100;
              const colors = ['#252A36', '#4169E1', '#8B78DB', '#63A4FF', '#FF806D'];
              return (
                <div
                  key={part.id}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: colors[idx % colors.length],
                  }}
                  title={`${part.processName}: ${part.sizeMb} MB`}
                  className="h-full border-r border-white/30 flex items-center justify-center text-[10px] font-mono font-bold text-white overflow-hidden"
                >
                  {part.sizeMb}M
                </div>
              );
            })}
          </div>

          {/* Partition List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {partitions.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between rounded-xl border border-[#E9EAF0] bg-[#F8F7F3]/60 px-3 py-2 text-xs"
              >
                <div>
                  <span className="font-semibold text-[#252A36]">
                    {part.processName}
                  </span>
                  <span className="ml-2 font-mono text-[#4169E1]">
                    {part.sizeMb} MB
                  </span>
                </div>
                {part.id !== 'BLK-1' && (
                  <button
                    onClick={() =>
                      setPartitions((prev) =>
                        prev.filter((p) => p.id !== part.id)
                      )
                    }
                    className="p-1 text-[#FF806D] hover:bg-[#FFE4D8] rounded-lg"
                    title="Release Memory Partition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Allocate Process Form */}
          <form
            onSubmit={handleAllocateBlock}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-[#E9EAF0] text-xs"
          >
            <input
              type="text"
              value={allocName}
              onChange={(e) => setAllocName(e.target.value)}
              placeholder="Process Name"
              className="sm:col-span-6 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2"
              required
            />
            <input
              type="number"
              min={32}
              max={512}
              step={32}
              value={allocSize}
              onChange={(e) => setAllocSize(Number(e.target.value))}
              className="sm:col-span-3 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 font-mono"
              required
            />
            <button
              type="submit"
              disabled={allocSize > freeMemoryMb}
              className="sm:col-span-3 inline-flex items-center justify-center gap-1 rounded-xl bg-[#4169E1] py-2 font-semibold text-white disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Allocate</span>
            </button>
          </form>
        </div>

        {/* B. Paging Address Translation & D. Working Set Thrashing */}
        <div className="lg:col-span-6 space-y-6">
          {/* B. Paging Translator */}
          <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-[#252A36] font-display">
              MMU Paging Address Translator
            </h3>
            <p className="text-xs text-[#7C8495]">
              Enter a Logical Address to decompose into Page Number (p) and Offset (d), lookup the Page Table, and compute Physical Address.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#252A36] mb-1">
                  Logical Address (Decimal)
                </label>
                <input
                  type="number"
                  min={0}
                  max={8191}
                  value={logicalAddress}
                  onChange={(e) => setLogicalAddress(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 font-mono font-bold text-[#4169E1]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#252A36] mb-1">
                  Page Size (Bytes)
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 font-mono"
                >
                  <option value={512}>512 Bytes</option>
                  <option value={1024}>1024 Bytes (1 KB)</option>
                  <option value={2048}>2048 Bytes (2 KB)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="rounded-xl bg-[#F8F7F3] p-2.5 border border-[#E9EAF0]">
                <div className="text-[10px] text-[#7C8495]">Page (p)</div>
                <div className="text-base font-bold text-[#4169E1]">
                  {pagingCalc.pageNumber}
                </div>
              </div>
              <div className="rounded-xl bg-[#F8F7F3] p-2.5 border border-[#E9EAF0]">
                <div className="text-[10px] text-[#7C8495]">Offset (d)</div>
                <div className="text-base font-bold text-[#8B78DB]">
                  {pagingCalc.offset}
                </div>
              </div>
              <div className="rounded-xl bg-[#F8F7F3] p-2.5 border border-[#E9EAF0]">
                <div className="text-[10px] text-[#7C8495]">Frame (f)</div>
                <div className="text-base font-bold text-[#4169E1]">
                  F{pagingCalc.frameNumber}
                </div>
              </div>
              <div className="rounded-xl bg-[#E9E4FF]/60 p-2.5 border border-[#4169E1]/40">
                <div className="text-[10px] text-[#4169E1]">Physical Addr</div>
                <div className="text-base font-bold text-[#252A36]">
                  {pagingCalc.physicalAddress}
                </div>
              </div>
            </div>
          </div>

          {/* D. Working Set & Thrashing Simulator */}
          <div className="rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#252A36] font-display">
                Working-Set Size &amp; Thrashing Pressure
              </h3>
              <Cpu className="h-4 w-4 text-[#8B78DB]" />
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-[#252A36]">
                  Concurrent Sensor Analysis Threads: {concurrentThreads}
                </span>
                <span className="font-mono text-[#7C8495]">
                  Working Set Demand: {totalWorkingSetDemand} / {availablePhysicalFrames} Frames
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={14}
                step={1}
                value={concurrentThreads}
                onChange={(e) => setConcurrentThreads(Number(e.target.value))}
                className="w-full accent-[#8B78DB]"
              />
            </div>

            <div
              className={`rounded-xl p-3 text-xs border ${
                isThrashing
                  ? 'border-[#FF806D] bg-[#FFE4D8]/60 text-[#252A36]'
                  : 'border-[#E9EAF0] bg-[#F8F7F3] text-[#7C8495]'
              }`}
            >
              {isThrashing ? (
                <span>
                  <strong className="text-[#FF806D]">THRASHING DETECTED:</strong> Aggregate working set ({totalWorkingSetDemand} pages) exceeds physical RAM ({availablePhysicalFrames} frames). Threads spend more time swapping pages than executing predictive maintenance calculations.
                </span>
              ) : (
                <span>
                  <strong className="text-[#4169E1]">NOMINAL WORKING SET:</strong> All {concurrentThreads} analysis threads fit comfortably in physical frames with high locality and minimal page fault overhead.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
