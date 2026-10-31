export interface BankerStepTrace {
  step: number;
  processId: string;
  needVector: number[];
  workBefore: number[];
  workAfter: number[];
  explanation: string;
}

export interface BankerEvaluationResult {
  isSafe: boolean;
  safeSequence: string[];
  needMatrix: number[][];
  steps: BankerStepTrace[];
  summary: string;
  requestGranted?: boolean;
  requestError?: string;
}

export function evaluateBankersAlgorithm(
  processIds: string[],
  resourceNames: string[],
  allocation: number[][],
  maxDemand: number[][],
  available: number[],
  request?: { processIndex: number; vector: number[] }
): BankerEvaluationResult {
  const numProcs = processIds.length;
  const numRes = resourceNames.length;

  // Deep clone matrices
  const alloc = allocation.map((row) => [...row]);
  const max = maxDemand.map((row) => [...row]);
  const avail = [...available];

  // Calculate initial Need = Max - Allocation
  const need: number[][] = alloc.map((row, i) =>
    row.map((val, j) => Math.max(0, max[i][j] - val))
  );

  let requestNote = '';

  if (request) {
    const { processIndex, vector } = request;
    const pName = processIds[processIndex];

    // Check 1: Request <= Need
    for (let j = 0; j < numRes; j++) {
      if (vector[j] > need[processIndex][j]) {
        return {
          isSafe: false,
          safeSequence: [],
          needMatrix: need,
          steps: [],
          requestGranted: false,
          requestError: `Request Rejected: Process ${pName} requested ${vector[j]} of ${resourceNames[j]}, exceeding its declared maximum remaining Need (${need[processIndex][j]}).`,
          summary: `Process ${pName} exceeded its maximum claim.`,
        };
      }
    }

    // Check 2: Request <= Available
    for (let j = 0; j < numRes; j++) {
      if (vector[j] > avail[j]) {
        return {
          isSafe: false,
          safeSequence: [],
          needMatrix: need,
          steps: [],
          requestGranted: false,
          requestError: `Process ${pName} must wait: Requested ${vector[j]} of ${resourceNames[j]}, but only ${avail[j]} units are currently available.`,
          summary: `Insufficient available resources to satisfy ${pName} immediately.`,
        };
      }
    }

    // Tentatively allocate
    for (let j = 0; j < numRes; j++) {
      avail[j] -= vector[j];
      alloc[processIndex][j] += vector[j];
      need[processIndex][j] -= vector[j];
    }
    requestNote = `After tentatively granting [${vector.join(', ')}] to ${pName}: `;
  }

  // Run Safety Algorithm
  const work = [...avail];
  const finish = new Array<boolean>(numProcs).fill(false);
  const safeSequence: string[] = [];
  const steps: BankerStepTrace[] = [];

  let progress = true;
  while (safeSequence.length < numProcs && progress) {
    progress = false;
    for (let i = 0; i < numProcs; i++) {
      if (!finish[i]) {
        const canSatisfy = need[i].every((n, j) => n <= work[j]);
        if (canSatisfy) {
          const workBefore = [...work];
          for (let j = 0; j < numRes; j++) {
            work[j] += alloc[i][j];
          }
          finish[i] = true;
          safeSequence.push(processIds[i]);
          steps.push({
            step: steps.length + 1,
            processId: processIds[i],
            needVector: [...need[i]],
            workBefore,
            workAfter: [...work],
            explanation: `${processIds[i]} Need [${need[i].join(', ')}] <= Work [${workBefore.join(', ')}]. ${processIds[i]} executes and releases Allocation [${alloc[i].join(', ')}], updating Work to [${work.join(', ')}].`,
          });
          progress = true;
        }
      }
    }
  }

  const isSafe = safeSequence.length === numProcs;
  const blockedProcs = processIds.filter((_, idx) => !finish[idx]);

  const summary = isSafe
    ? `${requestNote}System is in a SAFE STATE. Guaranteed deadlock-free execution order: < ${safeSequence.join(' → ')} >.`
    : `${requestNote}System is in an UNSAFE STATE (Deadlock Risk). Processes [${blockedProcs.join(', ')}] cannot have their maximum need satisfied with remaining Work [${work.join(', ')}].`;

  return {
    isSafe,
    safeSequence,
    needMatrix: need,
    steps,
    summary,
    requestGranted: request ? isSafe : undefined,
  };
}
