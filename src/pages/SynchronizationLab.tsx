import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Lock,
  Unlock,
  Layers,
  Sliders,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

interface BufferSlotItem {
  id: string;
  machineId: string;
  reading: string;
  producer: string;
}

type SyncPhase =
  | 'IDLE'
  | 'PRODUCER_ACQUIRE_MUTEX'
  | 'PRODUCER_INSERT'
  | 'PRODUCER_RELEASE_MUTEX'
  | 'CONSUMER_ACQUIRE_MUTEX'
  | 'CONSUMER_REMOVE'
  | 'CONSUMER_RELEASE_MUTEX';

export const SynchronizationLab: React.FC = () => {
  const { machines, settings, addEventLog } = useSystem();

  const [capacity, setCapacity] = useState<number>(
    settings.defaultBufferSize || 8
  );
  const [buffer, setBuffer] = useState<(BufferSlotItem | null)[]>(() =>
    new Array(settings.defaultBufferSize || 8).fill(null)
  );

  const [producersActive, setProducersActive] = useState<boolean>(true);
  const [consumersActive, setConsumersActive] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [producerSpeedMs, setProducerSpeedMs] = useState<number>(1100);
  const [consumerSpeedMs, setConsumerSpeedMs] = useState<number>(1300);

  // Synchronization primitives
  const [mutexHolder, setMutexHolder] = useState<string | null>(null);
  const [phase, setPhase] = useState<SyncPhase>('IDLE');
  const [producerState, setProducerState] = useState<
    'Idle' | 'Producing' | 'In Critical Section' | 'Waiting (Buffer Full)'
  >('Idle');
  const [consumerState, setConsumerState] = useState<
    'Idle' | 'Consuming' | 'In Critical Section' | 'Waiting (Buffer Empty)'
  >('Idle');
  const [activeItem, setActiveItem] = useState<BufferSlotItem | null>(null);
  const [syncLogs, setSyncLogs] = useState<
    { id: string; time: string; message: string; tone: 'blue' | 'lavender' | 'coral' }[]
  >([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      message: 'Initialized bounded telemetry buffer with Mutex = 1, Empty = 8, Full = 0.',
      tone: 'blue',
    },
  ]);

  const fullCount = buffer.filter((b) => b !== null).length;
  const emptyCount = capacity - fullCount;

  const appendSyncLog = useCallback(
    (message: string, tone: 'blue' | 'lavender' | 'coral' = 'blue') => {
      setSyncLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          time: new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          message,
          tone,
        },
        ...prev.slice(0, 39),
      ]);
    },
    []
  );

  // Resize buffer safely when capacity slider changes
  const handleCapacityChange = (newCap: number) => {
    setIsRunning(false);
    setMutexHolder(null);
    setPhase('IDLE');
    setCapacity(newCap);
    setBuffer((prev) => {
      const existing = prev.filter((x) => x !== null).slice(0, newCap);
      const next = new Array(newCap).fill(null);
      existing.forEach((item, i) => {
        next[i] = item;
      });
      return next;
    });
    appendSyncLog(
      `Reconfigured bounded buffer capacity to ${newCap} slots.`,
      'lavender'
    );
  };

  // Deterministic state machine step for Producer-Consumer synchronization
  const executeStep = useCallback(
    (preferActor?: 'producer' | 'consumer') => {
      if (phase === 'IDLE') {
        const canProduce = producersActive && emptyCount > 0;
        const canConsume = consumersActive && fullCount > 0;

        if (producersActive && emptyCount === 0) {
          setProducerState('Waiting (Buffer Full)');
          appendSyncLog(
            'Producer P1 waiting for an empty slot (empty semaphore = 0).',
            'coral'
          );
        }
        if (consumersActive && fullCount === 0) {
          setConsumerState('Waiting (Buffer Empty)');
          appendSyncLog(
            'Consumer C1 waiting for item in buffer (full semaphore = 0).',
            'coral'
          );
        }

        let chooseProducer = false;
        if (preferActor === 'producer' && canProduce) {
          chooseProducer = true;
        } else if (preferActor === 'consumer' && canConsume) {
          chooseProducer = false;
        } else if (canProduce && canConsume) {
          chooseProducer = Math.random() > 0.45;
        } else if (canProduce) {
          chooseProducer = true;
        } else if (canConsume) {
          chooseProducer = false;
        } else {
          return;
        }

        if (chooseProducer) {
          setMutexHolder('Producer P1');
          setProducerState('In Critical Section');
          setPhase('PRODUCER_INSERT');
          appendSyncLog(
            'wait(empty) succeeded → Producer P1 acquired mutex lock.',
            'blue'
          );
        } else {
          setMutexHolder('Consumer C1');
          setConsumerState('In Critical Section');
          setPhase('CONSUMER_REMOVE');
          appendSyncLog(
            'wait(full) succeeded → Consumer C1 acquired mutex lock.',
            'lavender'
          );
        }
        return;
      }

      if (phase === 'PRODUCER_INSERT') {
        const pickedMachine =
          machines[Math.floor(Math.random() * machines.length)] || {
            id: 'H-101',
            temperature: 92.4,
          };
        const newItem: BufferSlotItem = {
          id: `FRM-${Math.floor(100 + Math.random() * 899)}`,
          machineId: pickedMachine.id,
          reading: `${pickedMachine.temperature}°C`,
          producer: 'P1',
        };

        setBuffer((prev) => {
          const next = [...prev];
          const firstEmpty = next.indexOf(null);
          if (firstEmpty !== -1) {
            next[firstEmpty] = newItem;
          }
          return next;
        });
        setActiveItem(newItem);
        setPhase('PRODUCER_RELEASE_MUTEX');
        appendSyncLog(
          `Item ${newItem.id} (${newItem.machineId}) inserted into bounded buffer.`,
          'blue'
        );
        return;
      }

      if (phase === 'PRODUCER_RELEASE_MUTEX') {
        setMutexHolder(null);
        setProducerState('Producing');
        setPhase('IDLE');
        appendSyncLog(
          'Mutex released by Producer P1 → signal(full) incremented.',
          'blue'
        );
        return;
      }

      if (phase === 'CONSUMER_REMOVE') {
        let removedItem: BufferSlotItem | null = null;
        setBuffer((prev) => {
          const next = [...prev];
          const firstFullIdx = next.findIndex((x) => x !== null);
          if (firstFullIdx !== -1) {
            removedItem = next[firstFullIdx];
            next[firstFullIdx] = null;
          }
          return next;
        });
        if (removedItem) {
          setActiveItem(removedItem);
        }
        setPhase('CONSUMER_RELEASE_MUTEX');
        appendSyncLog(
          `Item consumed successfully by Consumer C1 for risk analysis.`,
          'lavender'
        );
        return;
      }

      if (phase === 'CONSUMER_RELEASE_MUTEX') {
        setMutexHolder(null);
        setConsumerState('Consuming');
        setPhase('IDLE');
        appendSyncLog(
          'Mutex released by Consumer C1 → signal(empty) incremented.',
          'lavender'
        );
      }
    },
    [
      phase,
      producersActive,
      consumersActive,
      emptyCount,
      fullCount,
      machines,
      appendSyncLog,
    ]
  );

  useEffect(() => {
    if (!isRunning) return;
    const avgInterval = Math.round((producerSpeedMs + consumerSpeedMs) / 2);
    const timer = setInterval(() => {
      executeStep();
    }, Math.max(300, Math.round(avgInterval / 2)));

    return () => clearInterval(timer);
  }, [isRunning, producerSpeedMs, consumerSpeedMs, executeStep]);

  const handleReset = () => {
    setIsRunning(false);
    setMutexHolder(null);
    setPhase('IDLE');
    setProducerState('Idle');
    setConsumerState('Idle');
    setActiveItem(null);
    setBuffer(new Array(capacity).fill(null));
    appendSyncLog(
      'Reset bounded buffer simulation: Mutex unlocked, all slots cleared.',
      'blue'
    );
    addEventLog(
      'Synchronization Lab',
      'Synchronization',
      'Reset Producer–Consumer bounded buffer and semaphore counters.',
      'Info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E9EAF0] bg-white p-6">
        <div>
          <div className="text-xs font-semibold text-[#4169E1] mb-1">
            OPERATING SYSTEM LAB · MODULE 03
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252A36] font-display">
            Synchronization Lab — Producer–Consumer Bounded Buffer
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8495] mt-1">
            Visualize mutual exclusion (Mutex) and counting semaphores (Empty &amp; Full) protecting shared sensor telemetry memory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4169E1] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3457c9]"
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Execution</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Start Continuous Sync</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              executeStep();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#252A36] hover:bg-[#E9E4FF]"
          >
            <SkipForward className="h-3.5 w-3.5 text-[#8B78DB]" />
            <span>Step State Machine</span>
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3] px-3.5 py-2.5 text-xs font-semibold text-[#7C8495] hover:text-[#252A36]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Semaphore & Mutex Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="flex items-center justify-between text-xs text-[#7C8495]">
            <span>Mutex Lock Status</span>
            {mutexHolder ? (
              <Lock className="h-4 w-4 text-[#FF806D]" />
            ) : (
              <Unlock className="h-4 w-4 text-[#4169E1]" />
            )}
          </div>
          <div
            className={`mt-1.5 text-lg font-bold font-mono ${
              mutexHolder ? 'text-[#FF806D]' : 'text-[#4169E1]'
            }`}
          >
            {mutexHolder ? `LOCKED (${mutexHolder})` : 'UNLOCKED (1)'}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7C8495]">
            Mutual exclusion on critical section
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Empty Semaphore</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-[#4169E1] tabular-nums">
            {emptyCount}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7C8495]">
            Available free slots for Producers
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Full Semaphore</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-[#8B78DB] tabular-nums">
            {fullCount}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7C8495]">
            Queued items ready for Consumers
          </div>
        </div>

        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4">
          <div className="text-xs text-[#7C8495]">Buffer Occupancy</div>
          <div className="mt-1.5 text-2xl font-bold font-mono text-[#252A36] tabular-nums">
            {fullCount} / {capacity}
          </div>
          <div className="mt-0.5 text-[11px] text-[#7C8495]">
            {fullCount === capacity
              ? 'Buffer Full (Producers block)'
              : fullCount === 0
              ? 'Buffer Empty (Consumers block)'
              : 'Normal bounded operation'}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Producer -> Bounded Buffer -> Consumer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Producer Thread Card */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E9EAF0] bg-white p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#4169E1]">
                PRODUCER THREAD P1
              </span>
              <button
                onClick={() => setProducersActive((a) => !a)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  producersActive
                    ? 'bg-[#E9E4FF] text-[#4169E1]'
                    : 'bg-[#F8F7F3] text-[#7C8495]'
                }`}
              >
                {producersActive ? 'Enabled' : 'Paused'}
              </button>
            </div>
            <h3 className="text-base font-bold text-[#252A36] font-display">
              Sensor Collector Thread
            </h3>
            <p className="text-xs text-[#7C8495]">
              Reads raw machine temperature &amp; vibration frames and inserts them into the shared buffer.
            </p>
            <div className="rounded-xl bg-[#F8F7F3] p-3 text-xs space-y-1">
              <div className="text-[#7C8495]">Thread State:</div>
              <div className="font-mono font-bold text-[#4169E1]">
                {producerState}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsRunning(false);
              executeStep('producer');
            }}
            disabled={emptyCount === 0 && phase === 'IDLE'}
            className="w-full rounded-xl bg-[#4169E1] py-2 text-xs font-semibold text-white hover:bg-[#3457c9] disabled:opacity-40"
          >
            Trigger Producer Step
          </button>
        </div>

        {/* Center Bounded Buffer Visualization */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#252A36] font-display">
                Shared Bounded Buffer (Critical Section)
              </h3>
              <p className="text-xs text-[#7C8495]">
                Protected by Mutex lock — only one thread may modify slots at any instant
              </p>
            </div>
            <Layers className="h-5 w-5 text-[#4169E1]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {buffer.map((slot, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-3.5 min-h-[86px] flex flex-col justify-between transition-all ${
                  slot
                    ? 'border-[#4169E1] bg-[#E9E4FF]/50 shadow-2xs'
                    : 'border-dashed border-[#E9EAF0] bg-[#F8F7F3]/70'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#7C8495]">
                  <span>Slot [{idx}]</span>
                  <span>{slot ? 'FULL' : 'EMPTY'}</span>
                </div>
                {slot ? (
                  <div>
                    <div className="text-xs font-bold font-mono text-[#4169E1]">
                      {slot.id}
                    </div>
                    <div className="text-[11px] text-[#252A36] font-medium">
                      {slot.machineId} · {slot.reading}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#7C8495] italic">
                    Awaiting frame...
                  </div>
                )}
              </div>
            ))}
          </div>

          {activeItem && (
            <div className="rounded-xl bg-[#F8F7F3] px-3.5 py-2.5 text-xs flex items-center justify-between border border-[#E9EAF0]">
              <span className="text-[#7C8495]">Latest Critical Section Frame:</span>
              <span className="font-mono font-bold text-[#252A36]">
                {activeItem.id} ({activeItem.machineId} · {activeItem.reading})
              </span>
            </div>
          )}
        </div>

        {/* Consumer Thread Card */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E9EAF0] bg-white p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#8B78DB]">
                CONSUMER THREAD C1
              </span>
              <button
                onClick={() => setConsumersActive((a) => !a)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  consumersActive
                    ? 'bg-[#E9E4FF] text-[#8B78DB]'
                    : 'bg-[#F8F7F3] text-[#7C8495]'
                }`}
              >
                {consumersActive ? 'Enabled' : 'Paused'}
              </button>
            </div>
            <h3 className="text-base font-bold text-[#252A36] font-display">
              Risk Analyzer Thread
            </h3>
            <p className="text-xs text-[#7C8495]">
              Removes telemetry items from the buffer and computes equipment failure risk scores.
            </p>
            <div className="rounded-xl bg-[#F8F7F3] p-3 text-xs space-y-1">
              <div className="text-[#7C8495]">Thread State:</div>
              <div className="font-mono font-bold text-[#8B78DB]">
                {consumerState}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsRunning(false);
              executeStep('consumer');
            }}
            disabled={fullCount === 0 && phase === 'IDLE'}
            className="w-full rounded-xl bg-[#8B78DB] py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-40"
          >
            Trigger Consumer Step
          </button>
        </div>
      </div>

      {/* Bottom Row: Parameters Deck + Synchronization Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4169E1]">
            <Sliders className="h-4 w-4" />
            <span>Simulation Parameters</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-[#252A36]">
                  Bounded Buffer Capacity: {capacity} Slots
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={12}
                step={2}
                value={capacity}
                onChange={(e) => handleCapacityChange(Number(e.target.value))}
                className="w-full accent-[#4169E1]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-[#252A36]">
                  Producer Polling Cadence: {producerSpeedMs} ms
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={2200}
                step={100}
                value={producerSpeedMs}
                onChange={(e) => setProducerSpeedMs(Number(e.target.value))}
                className="w-full accent-[#4169E1]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-[#252A36]">
                  Consumer Analysis Cadence: {consumerSpeedMs} ms
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={2200}
                step={100}
                value={consumerSpeedMs}
                onChange={(e) => setConsumerSpeedMs(Number(e.target.value))}
                className="w-full accent-[#8B78DB]"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#F8F7F3] p-3.5 text-xs text-[#7C8495] space-y-1">
            <div className="font-bold text-[#252A36]">
              Why Synchronization Is Necessary
            </div>
            <p className="leading-relaxed">
              Without the Mutex lock and Empty/Full semaphores, concurrent Producer and Consumer threads would cause race conditions—overwriting unread sensor frames on buffer overflow or reading garbage memory on buffer underflow.
            </p>
          </div>
        </div>

        {/* Live Synchronization Event Log */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E9EAF0] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#252A36] font-display">
              Synchronization &amp; Critical Section Trace
            </h3>
            <span className="text-xs font-mono text-[#7C8495]">
              wait() / signal() log
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#E9EAF0] bg-[#F8F7F3]/70 px-3.5 py-2 text-xs"
              >
                <span
                  className={`font-medium ${
                    log.tone === 'coral'
                      ? 'text-[#FF806D]'
                      : log.tone === 'lavender'
                      ? 'text-[#8B78DB]'
                      : 'text-[#252A36]'
                  }`}
                >
                  {log.message}
                </span>
                <span className="font-mono text-[11px] text-[#7C8495] shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
