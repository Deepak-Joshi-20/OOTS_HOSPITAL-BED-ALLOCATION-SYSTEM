import {
  GanttSegment,
  SchedulingProcessInput,
  SchedulingProcessMetric,
  SchedulingResult,
} from '../types';

export function runCPUScheduling(
  processes: SchedulingProcessInput[],
  algorithm: 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin',
  timeQuantum: number = 3
): SchedulingResult {
  if (!processes || processes.length === 0) {
    return {
      algorithm,
      metrics: [],
      gantt: [],
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
    };
  }

  const cleanProcs = processes.map((p) => ({
    ...p,
    arrivalTime: Math.max(0, Number(p.arrivalTime) || 0),
    burstTime: Math.max(1, Number(p.burstTime) || 1),
    priority: Math.max(1, Number(p.priority) || 1),
  }));

  const gantt: GanttSegment[] = [];
  const metricsMap = new Map<string, SchedulingProcessMetric>();

  if (algorithm === 'FCFS') {
    const sorted = [...cleanProcs].sort(
      (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
    );
    let currentTime = 0;

    for (const p of sorted) {
      if (currentTime < p.arrivalTime) {
        gantt.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: p.arrivalTime,
          isIdle: true,
        });
        currentTime = p.arrivalTime;
      }
      const startTime = currentTime;
      const completionTime = startTime + p.burstTime;
      const turnaroundTime = completionTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;
      const responseTime = startTime - p.arrivalTime;

      gantt.push({
        processId: p.id,
        processName: p.name,
        startTime,
        endTime: completionTime,
      });

      metricsMap.set(p.id, {
        ...p,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime,
      });
      currentTime = completionTime;
    }
  } else if (algorithm === 'SJF' || algorithm === 'Priority') {
    const remaining = [...cleanProcs];
    let currentTime = 0;

    while (remaining.length > 0) {
      const available = remaining.filter((p) => p.arrivalTime <= currentTime);
      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map((p) => p.arrivalTime));
        gantt.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArrival,
          isIdle: true,
        });
        currentTime = nextArrival;
        continue;
      }

      available.sort((a, b) => {
        if (algorithm === 'SJF') {
          return a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime;
        }
        return a.priority - b.priority || a.arrivalTime - b.arrivalTime;
      });

      const chosen = available[0];
      const idx = remaining.findIndex((r) => r.id === chosen.id);
      remaining.splice(idx, 1);

      const startTime = currentTime;
      const completionTime = startTime + chosen.burstTime;
      const turnaroundTime = completionTime - chosen.arrivalTime;
      const waitingTime = turnaroundTime - chosen.burstTime;
      const responseTime = startTime - chosen.arrivalTime;

      gantt.push({
        processId: chosen.id,
        processName: chosen.name,
        startTime,
        endTime: completionTime,
      });

      metricsMap.set(chosen.id, {
        ...chosen,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime,
      });
      currentTime = completionTime;
    }
  } else if (algorithm === 'RoundRobin') {
    const quantum = Math.max(1, Math.floor(timeQuantum) || 2);
    const sorted = [...cleanProcs].sort(
      (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
    );
    const remBurst = new Map<string, number>();
    const firstStart = new Map<string, number>();
    sorted.forEach((p) => remBurst.set(p.id, p.burstTime));

    const queue: SchedulingProcessInput[] = [];
    let currentTime = 0;
    let nextIdx = 0;

    while (nextIdx < sorted.length && sorted[nextIdx].arrivalTime <= currentTime) {
      queue.push(sorted[nextIdx]);
      nextIdx++;
    }

    while (queue.length > 0 || nextIdx < sorted.length) {
      if (queue.length === 0) {
        const nextArr = sorted[nextIdx].arrivalTime;
        gantt.push({
          processId: 'IDLE',
          processName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArr,
          isIdle: true,
        });
        currentTime = nextArr;
        while (nextIdx < sorted.length && sorted[nextIdx].arrivalTime <= currentTime) {
          queue.push(sorted[nextIdx]);
          nextIdx++;
        }
        continue;
      }

      const currentProc = queue.shift()!;
      if (!firstStart.has(currentProc.id)) {
        firstStart.set(currentProc.id, currentTime);
      }

      const remainingTime = remBurst.get(currentProc.id)!;
      const execSlice = Math.min(quantum, remainingTime);
      const startTime = currentTime;
      const endTime = startTime + execSlice;

      // Merge contiguous identical blocks if applicable
      const lastSeg = gantt[gantt.length - 1];
      if (lastSeg && lastSeg.processId === currentProc.id && lastSeg.endTime === startTime) {
        lastSeg.endTime = endTime;
      } else {
        gantt.push({
          processId: currentProc.id,
          processName: currentProc.name,
          startTime,
          endTime,
        });
      }

      currentTime = endTime;
      const newRem = remainingTime - execSlice;
      remBurst.set(currentProc.id, newRem);

      while (nextIdx < sorted.length && sorted[nextIdx].arrivalTime <= currentTime) {
        queue.push(sorted[nextIdx]);
        nextIdx++;
      }

      if (newRem > 0) {
        queue.push(currentProc);
      } else {
        const completionTime = currentTime;
        const turnaroundTime = completionTime - currentProc.arrivalTime;
        const waitingTime = turnaroundTime - currentProc.burstTime;
        const responseTime = (firstStart.get(currentProc.id) ?? startTime) - currentProc.arrivalTime;

        metricsMap.set(currentProc.id, {
          ...currentProc,
          completionTime,
          turnaroundTime,
          waitingTime,
          responseTime,
        });
      }
    }
  }

  const metrics = cleanProcs.map((p) => metricsMap.get(p.id)!);
  const count = metrics.length;
  const avgWaitingTime = Number(
    (metrics.reduce((acc, m) => acc + m.waitingTime, 0) / count).toFixed(2)
  );
  const avgTurnaroundTime = Number(
    (metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / count).toFixed(2)
  );
  const avgResponseTime = Number(
    (metrics.reduce((acc, m) => acc + m.responseTime, 0) / count).toFixed(2)
  );

  const totalSpan = gantt.length > 0 ? gantt[gantt.length - 1].endTime - gantt[0].startTime : 1;
  const busySpan = gantt
    .filter((seg) => !seg.isIdle)
    .reduce((acc, seg) => acc + (seg.endTime - seg.startTime), 0);
  const cpuUtilization = Number(((busySpan / Math.max(1, totalSpan)) * 100).toFixed(1));

  return {
    algorithm,
    metrics,
    gantt,
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    cpuUtilization,
  };
}
