import type { Level } from 'hls.js';

export interface VideoStats {
  stalls: {
    history: {
      start: number;
      end: number;
      duration: number;
    }[];
    currentStart: number | null;
    totalCount: number;
    totalDuration: number;
  }
  latency: {
    latest: number | null,
    history: number[],
    average: number;
    jitter: number;
  },
  startupDelay: number | null,
  bandwidth: {
    currentEstimate: number,
    historyEstimates: number[],
    average: number,
  },
  level: Level | null;
}
