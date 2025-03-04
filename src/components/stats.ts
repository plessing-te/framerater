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
    currentStallTime: null | number;
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
    historyEstimates: {
      value: number,
      time: number,
    }[],
    average: number,
  },
  level: {
    latest: Level | null,
    history: {
      level: Level,
      time: number,
    }[],
    lowest: Level
  }
}
