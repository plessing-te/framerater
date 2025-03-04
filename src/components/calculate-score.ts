import type { VideoStats } from '@/components/stats.ts';

export function computeTotalScore(stats: VideoStats): number {

  const streamWidth = stats.level.lowest?.width ?? 0; // minimum observed?
  const streamHeight = stats.level.lowest?.height ?? 0; // minimum observed
  const videoDuration = 20_000;

  const stallsCount = stats.stalls.totalCount;
  const stallsDuration = stats.stalls.totalDuration;
  const startupDelay = stats.startupDelay;

  const resolutions = [{
      width: 426,
      height: 240,
      score: 0.1
    },
    {
      width: 640,
      height: 360,
      score: 0.2
    },
    {
      width: 854,
      height: 480,
      score: 0.3
    },
    {
      width: 1280,
      height: 720,
      score: 0.5
    },
    {
      width: 1920,
      height: 1080,
      score: 0.7
    },
    {
      width: 2560,
      height: 1440,
      score: 0.8
    },
    {
      width: 3840,
      height: 2160,
      score: 0.9
    },
    {
      width: 7680,
      height: 4320,
      score: 1
    },
  ];

  const startupScore = (8 / (8 + startupDelay! / 1000));

  let bestResWidth = resolutions.length - 1;
  let bestResHeight = resolutions.length - 1;

  for (let i = 0; i < resolutions.length; i++) {
    const r = resolutions[i];
    if (streamWidth <= r.width) {
      bestResWidth = i;
      break;
    }
  }
  for (let i = 0; i < resolutions.length; i++) {
    const r = resolutions[i];
    if (streamHeight <= r.height) {
      bestResHeight = i;
      break;
    }
  }
  const streamQualityScore = resolutions[Math.floor((bestResWidth + bestResHeight) / 2)].score;
  const normalisedStallsCount = Math.min(stallsCount, 5);
  const stallsCountScore = 1 - 0.15 * normalisedStallsCount;

  const stallsDurationPercentage = stallsDuration / videoDuration;
  console.log({
    stallsDurationPercentage,
    stallsDuration,
    videoDuration,
  })
  const stallsDurationScore = Math.pow(Math.E, (-10 * stallsDurationPercentage));
  const stallsScore = stallsCountScore * stallsDurationScore;

  console.log({
    startupScore,
    streamQualityScore,
    stallsScore,
  })

  return (
    startupScore +
    2 * streamQualityScore +
    2 * stallsScore
  ) / 5;
}
