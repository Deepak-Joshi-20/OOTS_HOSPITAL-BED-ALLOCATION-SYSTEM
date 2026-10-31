export interface PageReplacementStep {
  stepIndex: number;
  page: number;
  framesAfter: (number | null)[];
  isHit: boolean;
  evictedPage: number | null;
  explanation: string;
}

export interface PageReplacementResult {
  algorithm: 'FIFO' | 'LRU';
  referenceString: number[];
  frameCount: number;
  steps: PageReplacementStep[];
  totalHits: number;
  totalFaults: number;
  hitRatio: number; // %
  faultRatio: number; // %
}

export function runPageReplacement(
  referenceString: number[],
  frameCount: number,
  algorithm: 'FIFO' | 'LRU'
): PageReplacementResult {
  const frames: (number | null)[] = new Array(frameCount).fill(null);
  const steps: PageReplacementStep[] = [];
  const fifoQueue: number[] = []; // stores frame indices in FIFO order
  const lastUsedStep = new Map<number, number>(); // page -> last step used

  let totalHits = 0;
  let totalFaults = 0;

  referenceString.forEach((page, idx) => {
    const existingFrameIdx = frames.indexOf(page);

    if (existingFrameIdx !== -1) {
      totalHits++;
      lastUsedStep.set(page, idx);
      steps.push({
        stepIndex: idx + 1,
        page,
        framesAfter: [...frames],
        isHit: true,
        evictedPage: null,
        explanation: `Page ${page} is already resident in Frame F${existingFrameIdx} (PAGE HIT).`,
      });
      return;
    }

    // Page Fault
    totalFaults++;
    const emptyFrameIdx = frames.indexOf(null);

    if (emptyFrameIdx !== -1) {
      frames[emptyFrameIdx] = page;
      fifoQueue.push(emptyFrameIdx);
      lastUsedStep.set(page, idx);
      steps.push({
        stepIndex: idx + 1,
        page,
        framesAfter: [...frames],
        isHit: false,
        evictedPage: null,
        explanation: `Page ${page} loaded into free Frame F${emptyFrameIdx} (Compulsory Page Fault).`,
      });
    } else if (algorithm === 'FIFO') {
      const victimFrameIdx = fifoQueue.shift()!;
      const evictedPage = frames[victimFrameIdx];
      frames[victimFrameIdx] = page;
      fifoQueue.push(victimFrameIdx);
      lastUsedStep.set(page, idx);

      steps.push({
        stepIndex: idx + 1,
        page,
        framesAfter: [...frames],
        isHit: false,
        evictedPage,
        explanation: `FIFO evicted oldest resident Page ${evictedPage} from Frame F${victimFrameIdx} and loaded Page ${page}.`,
      });
    } else {
      // LRU: find page in frames with minimum lastUsedStep
      let victimFrameIdx = 0;
      let oldestStep = Infinity;

      frames.forEach((residentPage, fIdx) => {
        if (residentPage !== null) {
          const usedAt = lastUsedStep.get(residentPage) ?? -1;
          if (usedAt < oldestStep) {
            oldestStep = usedAt;
            victimFrameIdx = fIdx;
          }
        }
      });

      const evictedPage = frames[victimFrameIdx];
      frames[victimFrameIdx] = page;
      lastUsedStep.set(page, idx);

      steps.push({
        stepIndex: idx + 1,
        page,
        framesAfter: [...frames],
        isHit: false,
        evictedPage,
        explanation: `LRU evicted least-recently-used Page ${evictedPage} from Frame F${victimFrameIdx} and loaded Page ${page}.`,
      });
    }
  });

  const total = Math.max(1, referenceString.length);
  const hitRatio = Number(((totalHits / total) * 100).toFixed(1));
  const faultRatio = Number(((totalFaults / total) * 100).toFixed(1));

  return {
    algorithm,
    referenceString,
    frameCount,
    steps,
    totalHits,
    totalFaults,
    hitRatio,
    faultRatio,
  };
}
