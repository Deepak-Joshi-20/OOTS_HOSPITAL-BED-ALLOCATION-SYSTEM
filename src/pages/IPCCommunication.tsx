import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Play,
  Pause,
  RotateCcw,
  GitCommit,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

interface PipeMessage {
  id: string;
  machineId: string;
  payload: string;
  byteSize: number;
  stage: 'Sent to fd[1]' | 'Queued in Kernel Pipe' | 'Received via fd[0]';
  timestamp: string;
}

export const IPCCommunication: React.FC = () => {
  const { machines, addEventLog } = useSystem();

  const pipeCapacity = 6;
  const [pipeQueue, setPipeQueue] = useState<PipeMessage[]>([
    {
      id: 'MSG-301',
      machineId: 'H-101',
      payload: 'TEMP=96.4C;VIB=7.4mm/s;PRESS=168PSI',
      byteSize: 128,
      stage: 'Queued in Kernel Pipe',
      timestamp: '19:42:10',
    },
    {
      id: 'MSG-302',
      machineId: 'C-402',
      payload: 'TEMP=102.8C;VIB=8.1mm/s;PRESS=174PSI',
      byteSize: 128,
      stage: 'Queued in Kernel Pipe',
      timestamp: '19:42:14',
    },
  ]);

  const [collectorRunning, setCollectorRunning] = useState<boolean>(true);
  const [analyzerRunning, setAnalyzerRunning] = useState<boolean>(true);
  const [autoStream, setAutoStream] = useState<boolean>(false);
  const [messagesSent, setMessagesSent] = useState<number>(14);
  const [messagesReceived, setMessagesReceived] = useState<number>(12);
  const [processedHistory, setProcessedHistory] = useState<PipeMessage[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    machines[0]?.id || 'H-101'
  );

  const sendMessageIntoPipe = useCallback(() => {
    if (!collectorRunning) return;
    if (pipeQueue.length >= pipeCapacity) {
      return;
    }
    const m =
      machines.find((item) => item.id === selectedMachineId) ||
      machines[Math.floor(Math.random() * machines.length)];
    if (!m) return;

    const newMsg: PipeMessage = {
      id: `MSG-${Math.floor(300 + Math.random() * 699)}`,
      machineId: m.id,
      payload: `TEMP=${m.temperature}C;VIB=${m.vibration}mm/s;PRESS=${m.pressure}PSI`,
      byteSize: 128,
      stage: 'Queued in Kernel Pipe',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setPipeQueue((prev) => [...prev, newMsg]);
    setMessagesSent((s) => s + 1);
  }, [collectorRunning, pipeQueue.length, machines, selectedMachineId]);

  const receiveMessageFromPipe = useCallback(() => {
    if (!analyzerRunning || pipeQueue.length === 0) return;

    setPipeQueue((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      const received: PipeMessage = {
        ...first,
        stage: 'Received via fd[0]',
      };
      setProcessedHistory((hist) => [received, ...hist.slice(0, 7)]);
      setMessagesReceived((r) => r + 1);
      return rest;
    });
  }, [analyzerRunning, pipeQueue.length]);

  useEffect(() => {
    if (!autoStream) return;
    const timer = setInterval(() => {
      if (collectorRunning && pipeQueue.length < pipeCapacity) {
        sendMessageIntoPipe();
      }
      if (analyzerRunning && pipeQueue.length > 0) {
        setTimeout(() => {
          receiveMessageFromPipe();
        }, 550);
      }
    }, 1400);

    return () => clearInterval(timer);
  }, [
    autoStream,
    collectorRunning,
    analyzerRunning,
    pipeQueue.length,
    sendMessageIntoPipe,
    receiveMessageFromPipe,
  ]);

  const handleReset = () => {
    setAutoStream(false);
    setPipeQueue([]);
    setProcessedHistory([]);
    setMessagesSent(0);
    setMessagesReceived(0);
    addEventLog(
      'IPC Subsystem',
      'IPC',
      'Flushed unidirectional POSIX pipe buffer between Log Collector and Analyzer.',
      'Info'
    );
  };

  const commStatus =
    pipeQueue.length >= pipeCapacity
      ? 'Pipe Full (Write Blocked)'
      : !collectorRunning && !analyzerRunning
      ? 'Communication Paused'
      : autoStream
      ? 'Active Streaming'
      : 'Ready for Manual Packet';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <div className="text-xs font-semibold text-[#4169E1] mb-1">
            OPERATING SYSTEM LAB · MODULE 04
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Inter-Process Communication (IPC) — Unidirectional Pipe
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Simulate POSIX pipe message passing between the isolated Log Collector Process and Risk Analyzer Process.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={sendMessageIntoPipe}
            disabled={pipeQueue.length >= pipeCapacity || !collectorRunning}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4169E1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3457c9] disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Message</span>
          </button>

          <button
            onClick={receiveMessageFromPipe}
            disabled={pipeQueue.length === 0 || !analyzerRunning}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B78DB] px-4 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-40"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Read Next Packet</span>
          </button>

          <button
            onClick={() => setAutoStream((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-white px-3.5 py-2 text-xs font-semibold text-[#252A36] hover:bg-[#E9E4FF]"
          >
            {autoStream ? (
              <>
                <Pause className="h-3.5 w-3.5 text-[#FF806D]" />
                <span>Pause Communication</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-[#4169E1]" />
                <span>Resume Auto Stream</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3.5 py-2 text-xs font-semibold text-[#7C8495]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Pipe Capacity</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {pipeCapacity} Packets
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Messages Sent</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#4169E1] tabular-nums">
            {messagesSent}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Messages Waiting</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#FF806D] tabular-nums">
            {pipeQueue.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Messages Received</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#8B78DB] tabular-nums">
            {messagesReceived}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-[#7C8495]">Communication Status</div>
          <div className="mt-1 text-sm font-bold text-[#4169E1] truncate">
            {commStatus}
          </div>
        </div>
      </div>

      {/* Visual Two-Process Pipe Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Process 1: Log Collector */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E9EAF0] bg-white p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#4169E1]">
                PID 101 · SENDER
              </span>
              <button
                onClick={() => setCollectorRunning((c) => !c)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  collectorRunning
                    ? 'bg-[#E9E4FF] text-[#4169E1]'
                    : 'bg-[#FFE4D8] text-[#FF806D]'
                }`}
              >
                {collectorRunning ? 'Collector Active' : 'Collector Stopped'}
              </button>
            </div>
            <h3 className="text-base font-bold text-[#252A36] font-display">
              Log Collector Process
            </h3>
            <p className="text-xs text-[#7C8495]">
              Private virtual address space. Serializes sensor telemetry frames and invokes <code className="font-mono text-[#4169E1]">write(fd[1], buf, 128)</code>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#252A36] mb-1">
                Select Source Machine
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3 py-2 text-xs"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={sendMessageIntoPipe}
            disabled={!collectorRunning || pipeQueue.length >= pipeCapacity}
            className="w-full rounded-xl bg-[#4169E1] py-2 text-xs font-semibold text-white hover:bg-[#3457c9] disabled:opacity-40"
          >
            Write Packet to fd[1]
          </button>
        </div>

        {/* Center: Kernel Pipe Buffer Queue */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#252A36] font-display">
                Kernel Space FIFO Pipe Buffer (fd[1] → fd[0])
              </h3>
              <p className="text-xs text-[#7C8495]">
                In-memory kernel ring buffer bridging separate user-space processes
              </p>
            </div>
            <GitCommit className="h-5 w-5 text-[#4169E1]" />
          </div>

          <div className="rounded-2xl border border-[#E9EAF0] bg-[#F8F7F3] p-4 space-y-2.5 min-h-[180px]">
            {pipeQueue.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-xs text-[#7C8495] italic">
                Pipe queue is currently empty — click &quot;Send Message&quot; to write a telemetry frame.
              </div>
            ) : (
              pipeQueue.map((msg, idx) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-[#4169E1]/40 bg-white p-3 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-[#4169E1]">
                        #{idx + 1} · {msg.id}
                      </span>
                      <span className="font-semibold text-[#252A36]">
                        Machine {msg.machineId}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#7C8495] truncate mt-0.5">
                      {msg.payload}
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px] text-[#8B78DB]">
                    <div>{msg.byteSize} B</div>
                    <div>{msg.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#7C8495] font-mono">
            <span>Write Descriptor: fd[1]</span>
            <span>
              Occupied: {pipeQueue.length} / {pipeCapacity} frames
            </span>
            <span>Read Descriptor: fd[0]</span>
          </div>
        </div>

        {/* Process 2: Analyzer Process */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E9EAF0] bg-white p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#8B78DB]">
                PID 103 · RECEIVER
              </span>
              <button
                onClick={() => setAnalyzerRunning((a) => !a)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  analyzerRunning
                    ? 'bg-[#E9E4FF] text-[#8B78DB]'
                    : 'bg-[#FFE4D8] text-[#FF806D]'
                }`}
              >
                {analyzerRunning ? 'Analyzer Active' : 'Analyzer Stopped'}
              </button>
            </div>
            <h3 className="text-base font-bold text-[#252A36] font-display">
              Risk Analyzer Process
            </h3>
            <p className="text-xs text-[#7C8495]">
              Separate virtual address space. Invokes <code className="font-mono text-[#8B78DB]">read(fd[0], buf, 128)</code> to deserialize and score incoming packets.
            </p>

            <div className="rounded-xl bg-[#F8F7F3] p-3 text-xs space-y-1">
              <div className="text-[#7C8495]">Last Decoded Packet:</div>
              <div className="font-mono font-bold text-[#252A36] truncate">
                {processedHistory[0]
                  ? `${processedHistory[0].id} (${processedHistory[0].machineId})`
                  : 'None yet'}
              </div>
            </div>
          </div>

          <button
            onClick={receiveMessageFromPipe}
            disabled={!analyzerRunning || pipeQueue.length === 0}
            className="w-full rounded-xl bg-[#8B78DB] py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-40"
          >
            Read &amp; Analyze from fd[0]
          </button>
        </div>
      </div>

      {/* Bottom Comparison: Processes vs Threads & Message Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4169E1]">
            <Cpu className="h-4 w-4" />
            <span>OS Architecture Concept</span>
          </div>
          <h3 className="text-base font-bold text-[#252A36] font-display">
            Processes vs. Threads in Predictive Maintenance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3.5 space-y-1.5">
              <div className="font-bold text-[#4169E1]">
                Separate Processes (IPC Required)
              </div>
              <p className="text-[#7C8495] leading-relaxed">
                Log Collector (PID 101) and Risk Analyzer (PID 103) have isolated memory spaces for fault isolation. If the Collector crashes on a malformed Modbus frame, the Analyzer stays alive. They exchange data via kernel IPC pipes.
              </p>
            </div>
            <div className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] p-3.5 space-y-1.5">
              <div className="font-bold text-[#8B78DB]">
                Worker Threads (Shared Memory)
              </div>
              <p className="text-[#7C8495] leading-relaxed">
                Inside the Analyzer process, multiple threads share the same heap memory and bounded buffer. They communicate without kernel context switches but require Mutex locks and Semaphores to prevent race conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Message Lifecycle History */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-3">
          <h3 className="text-base font-bold text-[#252A36] font-display">
            Completed IPC Packet Lifecycle Log
          </h3>
          {processedHistory.length === 0 ? (
            <p className="text-xs text-[#7C8495] py-6">
              Click &quot;Read Next Packet&quot; or enable Auto Stream to observe packets completing their sender → pipe → receiver lifecycle.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {processedHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#E9EAF0] bg-[#F8F7F3]/70 p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[#4169E1] mr-2">
                      {item.id}
                    </span>
                    <span className="font-semibold text-[#252A36]">
                      {item.machineId}
                    </span>
                    <span className="text-[#7C8495] ml-2 font-mono text-[11px]">
                      {item.payload}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#8B78DB] shrink-0">
                    {item.stage}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
