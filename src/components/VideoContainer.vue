<template>
  <div class="video-stats">
    <video
        ref="video-player"
    ></video>
    <div v-if="!videoStarted" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: #2C2C2C">
      <Spinner></Spinner>
    </div>
    <VideoStatsOverlay
      :stats="stats"
    ></VideoStatsOverlay>
  </div>
</template>

<script setup lang="ts">
import Spinner from '@/components/Spinner.vue';
import type { VideoStats } from '@/components/stats.ts';
import VideoStatsOverlay from '@/components/VideoStatsOverlay.vue';
import Hls, { type Level } from 'hls.js'
import { onMounted, onUnmounted, reactive, useTemplateRef, watch, ref } from 'vue';

const props = defineProps<{
  adaptive: boolean;
}>();

const emit = defineEmits<{
  done: [{ stats: VideoStats }]
}>()

let pageLoaded: number = 0;

const videoRef = useTemplateRef('video-player');

const stats = reactive<VideoStats>({
  stalls: {
    history: [],
    currentStart: null,
    get totalCount() {
      return this.history.length + (this.currentStart ? 1 : 0);
    },
    get totalDuration() {
      return this.history.reduce((total, { duration }) => total + duration, 0);
    },
    currentStallTime: null
  },
  latency: {
    latest: null,
    history: [],
    get average() {
      return this.history.reduce(average);
    },
    get jitter() {
      const mean = this.average;
      // TODO verify this works
      return this.history.map((value) => Math.abs(value - mean)).reduce(average);
    }
  },
  startupDelay: null,
  bandwidth: {
    currentEstimate: 0,
    historyEstimates: [],
    get average() {
      return this.historyEstimates.map(({ value }) => value).reduce(average);
    }
  },
  level: {
    latest: null,
    history: [],
    get lowest() {
      return this.history.reduce((acc: { level: Level, time: number } | null, curr) => (acc === null || acc.level.width > curr.level.width) ? curr : acc, null)!.level;
    }
  }
} satisfies VideoStats);

// watch(stats, (value) => {
//   console.log(JSON.parse(JSON.stringify(stats, null, 2)));
// })

const videoStarted = ref(false);

onMounted(() => {
  pageLoaded = performance.now();

  setupVideoPlayback();
})

let isEmitted = false;

let levelInterval: number | null = null;

onUnmounted(() => {
  if (levelInterval) {
    clearInterval(levelInterval);
  }
})

function setupVideoPlayback() {
  const video = videoRef.value!;

  if (Hls.isSupported()) {
    const hls = new Hls({
      debug: false,
      startLevel: 10,
      maxBufferLength: 5,
      maxBufferSize: 10 * 1000 * 1000
    });
    //hls.loadSource('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    hls.loadSource('https://cdn.bitmovin.com/content/demos/4k/38e843e0-1998-11e9-8a92-c734cd79b4dc/manifest.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      video.muted = true;
      if (!props.adaptive) {
        hls.currentLevel = 10;
      }
      video.currentTime = 457;
      video.play();
    });
    // Grab the initial level
    hls.on(Hls.Events.LEVEL_UPDATED, computeFirstLevel);

    hls.on(Hls.Events.FRAG_BUFFERED, function() {
      if (isEmitted) {
        return;
      }
      const estimate = hls.bandwidthEstimate;
      stats.bandwidth.currentEstimate = estimate / 1_000_000;
      stats.bandwidth.historyEstimates.push({ value: estimate / 1_000_000, time: performance.now() });
      // console.log("fragment buffered, BW estimate now: "+(hls.bandwidthEstimate/1_000_000)+" Mbit/s");
    });
    hls.on(Hls.Events.LEVEL_SWITCHED, function() {
      if (isEmitted) {
        return;
      }
      let level = hls.levels[hls.currentLevel];
      if (level) {
        console.log('LEVEL ADDED', level);
        stats.level.latest = level;
        stats.level.history = [...stats.level.history, { time: performance.now(), level }];
      }
    });

    video.addEventListener("timeupdate", getStartupDelay);

    video.addEventListener("timeupdate", stallDetector);

    function computeFirstLevel(): void {
      let level = hls.levels[hls.currentLevel];
      // console.log('level', level, hls.currentLevel);
      // console.log("level: "+level.name+" with bitrate "+(level.bitrate/1_000_000)+" Mbit/s");
      if (!level || stats.level.latest) {
        return;
      }
      console.log('LEVEL ADDED 1st', level);
      stats.level.latest = level;
      stats.level.history = [...stats.level.history, { time: performance.now(), level }];
    }

    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (isEmitted) {
        return;
      }
      if (data.details == Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
        if (stats.stalls.currentStart) {
          return;
        }
        stats.stalls.currentStart = performance.now();

        let start = 0;
        let total = stats.stalls.totalDuration;
        function tick(now: number) {
          if (start === 0) {
            start = now;
          }
          if (stats.stalls.currentStart === 0) {
            return;
          }
          stats.stalls.currentStallTime = total + now - start;
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);

        // console.log("Stall started!");
      }
    });

    function recordLevel() {
      if (videoStarted.value) {
        let level = hls.levels[hls.currentLevel];
        if (level) {
          console.log('LEVEL ADDED', level);
          stats.level.latest = level;
          stats.level.history = [...stats.level.history, { time: performance.now(), level }];
        }
      }
    }

    watch(videoStarted, (started) => {
      if (started) {
        levelInterval = setInterval(() => {
          if (isEmitted) {
            levelInterval && clearInterval(levelInterval);
            levelInterval = null;
            return;
          }
          let level = hls.levels[hls.currentLevel];
          if (level) {
            console.log('LEVEL ADDED', level);
            stats.level.latest = level;
            stats.level.history = [...stats.level.history, { time: performance.now(), level }];
          }
        }, 250);
      }
    })
  }
  function stallDetector() {
    if (isEmitted) {
      return;
    }
    const start = stats.stalls.currentStart;
    if (!start) {
      return;
    }
    const end = performance.now();
    stats.stalls.history.push({
      start,
      end,
      duration: end - start,
    })
    stats.stalls.currentStart = 0;
    stats.stalls.currentStallTime = null;
    // console.log("Stall finished in "+(end - start)+" ms");
  }

  function getStartupDelay(e: unknown) {
    if (isEmitted) {
      return;
    }
    // console.log(e);
    // console.log("Startup delay was: "+delta);
    stats.startupDelay = performance.now() - pageLoaded;
    video.removeEventListener("timeupdate",getStartupDelay);

    videoStarted.value = true;

    setTimeout(finish, 20_000);
  }
}

function finish(): void {
  if (isEmitted) {
    return;
  }
  if (stats.stalls.currentStart) {
    // End the current stall
    const start = stats.stalls.currentStart;
    const end = performance.now();
    stats.stalls.history.push({
      start,
      end,
      duration: end - start,
    });
    stats.stalls.currentStart = 0;
    stats.stalls.currentStallTime = null;
  }
  stats.bandwidth.historyEstimates = [...stats.bandwidth.historyEstimates, { value: stats.bandwidth.currentEstimate, time: performance.now() }];
  isEmitted = true;
  emit('done', { stats: stats as any });
}

let interval = setInterval(latencyMeasurement, 500);
onUnmounted(() => interval && clearInterval(interval));

function latencyMeasurement() {
  if (isEmitted) {
    return;
  }
  let start = performance.now();

  fetch('/ping', {
    method: 'HEAD'
  })
    .finally(() => {
      if (isEmitted) {
        return;
      }
      let end = performance.now();
      let delta = end - start;
      stats.latency.latest = delta;
      stats.latency.history = [...stats.latency.history, delta];

      // console.log('latency', stats.latency.latest, 'avg', stats.latency.average, 'jitter', stats.latency.jitter);
    });
}

function average(runningTotal: number = 0, current: number, index: number, values: number[]) {
  return runningTotal + current / values.length;
}

</script>

<style scoped lang="scss">
.video-stats {
  background: black;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  max-width: 100vw;
  overflow: hidden;
}

video {
  height: 100%;
}
</style>
