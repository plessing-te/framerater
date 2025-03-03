<template>
  <div class="video-stats">
    <video
        ref="video-player"
    ></video>
    <VideoStatsOverlay
        :stats="stats"
    ></VideoStatsOverlay>
  </div>
</template>

<script setup lang="ts">
import type { VideoStats } from '@/components/stats.ts';
import VideoStatsOverlay from '@/components/VideoStatsOverlay.vue';
import Hls from 'hls.js'
import { onMounted, onUnmounted, reactive, useTemplateRef, watch } from 'vue';

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
    }
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
      return this.historyEstimates.reduce(average);
    }
  },
  level: null
} satisfies VideoStats);

// watch(stats, (value) => {
//   console.log(JSON.parse(JSON.stringify(stats, null, 2)));
// })

onMounted(() => {
  pageLoaded = performance.now();

  setupVideoPlayback();
})

let isEmitted = false;

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

      stats.level = hls.levels[hls.currentLevel];
    });

    hls.on(Hls.Events.FRAG_BUFFERED, function() {
      if (isEmitted) {
        return;
      }
      const estimate = hls.bandwidthEstimate;
      stats.bandwidth.currentEstimate = estimate / 1_000_000;
      stats.bandwidth.historyEstimates.push(estimate / 1_000_000);
      // console.log("fragment buffered, BW estimate now: "+(hls.bandwidthEstimate/1_000_000)+" Mbit/s");
    });
    hls.on(Hls.Events.LEVEL_SWITCHED, function() {
      if (isEmitted) {
        return;
      }
      // console.log(hls.levels);
      let level = hls.levels[hls.currentLevel];
      // console.log("level: "+level.name+" with bitrate "+(level.bitrate/1_000_000)+" Mbit/s");
      if (!stats.level || level.bitrate < stats.level.bitrate) {
        stats.level = level;
      }
    });

    video.addEventListener("timeupdate", getStartupDelay);

    video.addEventListener("timeupdate", stallDetector);

    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (isEmitted) {
        return;
      }
      if (data.details == Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
        if (stats.stalls.currentStart) {
          return;
        }
        stats.stalls.currentStart = performance.now();
        // console.log("Stall started!");
      }
    });
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

    setTimeout(() => {
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
      }
      isEmitted = true;
      emit('done', { stats: stats as any });
    }, 20_000);
  }
}

let interval = setInterval(latencyMeasurement, 500);
onUnmounted(() => interval && clearInterval(interval));

function latencyMeasurement() {
  if (isEmitted) {
    return;
  }
  let start = performance.now();
  fetch('/ping')
    .finally(() => {
      let end = performance.now();
      let delta = end - start;
      stats.latency.latest = delta;
      stats.latency.history.push(delta);

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
