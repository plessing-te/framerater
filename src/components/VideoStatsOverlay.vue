<script setup lang="ts">
import Chart from '@/components/Chart.vue';
import StatBlock from '@/components/StatBlock.vue';
import type { VideoStats } from '@/components/stats.ts';
import { computed } from 'vue';

const props = defineProps<{
  stats: VideoStats
}>()

const stalls = computed(() => {
  const duration = props.stats.stalls.currentStallTime ?? props.stats.stalls.totalDuration;
  if (duration > 2000) {
    return {
      value: (Math.round(duration * 100 / 1000) / 100).toFixed(1),
      unit: 's',
      isBad: true
    }
  } else {
    return {
      value: Math.round(duration).toFixed(0),
      unit: 'ms',
      isBad: duration > 500
    }
  }
})
</script>

<template>
<div class="video-stats-overlay">
  <StatBlock
      label="Startup Delay"
      :value="Math.round(stats.startupDelay ?? 0)"
      unit="ms"
      :isBad="(stats.startupDelay ?? 0) > 1000"
  ></StatBlock>
  <StatBlock
      label="Stall Count"
      :value="stats.stalls.totalCount"
      :isBad="stats.stalls.totalCount > 5"
  ></StatBlock>
  <StatBlock
      label="Stalls Total Duration"
      :value="stalls.value"
      :unit="stalls.unit"
      :isBad="stalls.isBad"
  ></StatBlock>
  <StatBlock
      label="Bandwidth"
      :value="Math.round(10 * (stats.bandwidth.currentEstimate ?? 0)) / 10"
      unit="Mbps"
  ></StatBlock>
  <StatBlock
      label="Latency"
      :value="Math.round(10 * (stats.latency.latest ?? 0)) / 10"
      unit="ms"
      :isBad="(stats.latency.latest ?? 0) > 30"
  ></StatBlock>
  <Chart :data="stats.latency.history" :minPointCount="40"></Chart>
</div>
</template>

<style scoped lang="scss">
.video-stats-overlay {
  position: absolute;
  left: 64px;
  top: 64px;
  bottom: 64px;
  min-width: 200px;
  width: 420px;
  background: rgba(0, 0, 0, 0.6);
  padding: 40px;

  color: white;

  > * {
    margin-bottom: 40px;
  }
}

</style>
