<script setup lang="ts">
import { computeTotalScore } from '@/components/calculate-score.ts';
import ResultStatBlock from '@/components/ResultStatBlock.vue';
import type { VideoStats } from '@/components/stats.ts';
import { computed } from 'vue';

const props = defineProps<{
  results: VideoStats
}>();

const emit = defineEmits<{
  again: [],
}>()


const stalls = computed(() => {
  if (props.results.stalls.totalDuration > 2000) {
    return {
      value: Math.round(props.results.stalls.totalDuration * 100 / 1000) / 100,
      unit: 's',
      percentage: (props.results.stalls.totalDuration / 20_000) * 100,
    }
  } else {
    return {
      value: Math.round(props.results.stalls.totalDuration),
      unit: 'ms',
      percentage: (props.results.stalls.totalDuration / 20_000) * 100,
    }
  }
});

const summary = computed(() => {
  const score = Math.round(computeTotalScore(props.results) * 100);
  if (score >= 90) {
    return {
      name: 'Excellent',
      variant: 'good',
      score,
    };
  }
  if (score >= 80) {
    return {
      name: 'Very Good',
      variant: 'good',
      score,
    };
  }
  if (score >= 60) {
    return {
      name: 'Good',
      variant: 'good',
      score,
    };
  }
  // if (score >= 40) {
  //   return {
  //     name: 'Fair',
  //     variant: 'bad',
  //     score,
  //   };
  // }
  if (score >= 20) {
    return {
      name: 'Poor',
      variant: 'bad',
      score,
    };
  }
  return {
    name: 'Bad',
    variant: 'bad',
    score,
  };
})

const resolution = computed(() => {
  const resolutions = [{
    width: 426,
    height: 240,
    name: '240p'
  },
    {
      width: 640,
      height: 360,
      name: '360p'
    },
    {
      width: 854,
      height: 480,
      name: '480p'
    },
    {
      width: 1280,
      height: 720,
      name: '720p'
    },
    {
      width: 1920,
      height: 1080,
      name: 'HD 1080p'
    },
    {
      width: 2560,
      height: 1440,
      name: '2K'
    },
    {
      width: 3840,
      height: 2160,
      name: '4K'
    },
    {
      width: 7680,
      height: 4320,
      name: '8K'
    },
  ];

  for (const resolution of resolutions) {
    if (resolution.width >= (props.results.level?.width ?? 0)) {
      return resolution.name;
    }
  }
  return 'n/a';
})


</script>

<template>

  <div class="results-page">
    <div class="results-page__content">
      <div class="results-page__header">
        <img src="../assets/logo.svg" height="19" class="results-page__logo">
        https://cdn.bitmovin.com/content/demos/4k/38e8&hellip;79b4dc/manifest.m3u8
      </div>
      <div class="content">
        <div class="content__column content__column--left">
          <div class="quality-score" :class="{ 'quality-score--bad': summary.variant === 'bad' }">
            <div class="quality-score__label">Quality Score</div>
            <div class="quality-score__value"><template v-if="summary.variant === 'bad'"><img src="../assets/sad.svg" class="quality-score__face"> {{ summary.name }}</template>
              <template v-else><img src="../assets/happy.svg" class="quality-score__face"> {{ summary.name }}</template>
              <span class="quality-score__percent">{{ summary.score }}%</span></div>
          </div>
          <div class="explanation">
            <h2 class="explanation__title">
              What does this mean?
            </h2>
            <p class="explanation__text">
              We calculated the quality score by combining multiple metrics such as startup delay, video quality you received, and stalls you experienced. Any score above 60% is considered acceptable quality.
            </p>

            <h2 class="explanation__title explanation__title--two">
              You can increase the score by:
            </h2>
            <ul class="explanation__bullets">
              <li>Getting closer to the access point if you are on Wi-Fi.</li>
              <li>Ensuring there are not many other devices consuming your bandwidth.</li>
            </ul>
          </div>
        </div>
        <div class="content__column content__column--right results">
          <div class="results__stats-row">
            <ResultStatBlock
                label="Startup Delay"
                :value="(results.startupDelay ?? 0).toFixed(0)"
                unit="ms"
                :variant="(results.startupDelay ?? 0) < 400 ? 'good' : (results.startupDelay ?? 0) > 1000 ? 'bad' : 'neutral'"
            ></ResultStatBlock>
            <ResultStatBlock
                label="Stall Count"
                :value="results.stalls.totalCount"
                :variant="results.stalls.totalCount === 0 ? 'good' : results.stalls.totalCount < 4 ? 'neutral' : 'bad'"
            ></ResultStatBlock>
            <ResultStatBlock
                label="Stalls Total Duration"
                :value="`${stalls.value.toFixed(0)} ${stalls.unit} (${stalls.percentage.toFixed(0)}%)`"
                :variant="stalls.value === 0 ? 'good' : stalls.value < 200 ? 'neutral' : 'bad'"
            ></ResultStatBlock>
          </div>
          <div class="results__single-row">
            <ResultStatBlock
                label="Latency (Avg)"
                :value="results.latency.average.toFixed(1)"
                unit="ms"
                :variant="results.latency.average < 10 ? 'good' : results.latency.average < 30 ? 'neutral' : 'bad'"
            ></ResultStatBlock>
          </div>
          <div class="results__single-row">
            <ResultStatBlock
                label="Video Quality"
                :value="resolution"
            ></ResultStatBlock>
          </div>
          <div class="results__single-row">
            <ResultStatBlock
                label="Bandwidth (Avg)"
                :value="results.bandwidth.average.toFixed(2)"
                unit="Mbps"
                :variant="results.bandwidth.average < 10 ? 'bad' : results.bandwidth.average > 80 ? 'good' : 'neutral'"
            ></ResultStatBlock>
          </div>
        </div>
      </div>
    </div>
    <footer class="results-page__footer">
      <button class="button button--share"><img src="../assets/share.svg">&nbsp;Share Results</button>
      <button class="button button--again" @click="emit('again')">Start again</button>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.results-page {
  min-height: 100vh;
  width: 100vw;

  padding: 0 64px;

  display: flex;
  flex-direction: column;

  &__header {
    margin-top: 30px;
    font-size: 16px;
    display: flex;
    align-items: center;
  }

  &__logo {
    margin-right: 16px;
    margin-left: 30px;
  }

  &__content {
    border-style: solid;
    border-width: 0 2px 2px;
    border-color: #EA5035;
    border-radius: 0 0 15px 15px;

    flex: 1 0 auto;
  }

  &__footer {
    flex: 0 0 auto;

    padding: 35px 0 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    > * {
      margin: 0 20px;
    }
  }
}

.button {
  box-sizing: border-box;
  height: 50px;
  padding: 0 38px;
  color: white;
  font-weight: bold;
  cursor: pointer;

  border-style: none;
  border-width: 0;
  display: flex;
  align-items: center;

  &--share {
    background-color: black;
  }

  &--again {
    background-color: #EA5035;
  }
}
.content {
  display: flex;
  padding: 30px;
  margin-top: 110px;

  &__column {
    margin: 30px;

    &--left {
      width: 45%;
    }

    &--right {
      width: 55%;
    }
  }
}

.quality-score {
  border-left: 4px solid #00B740;
  padding-left: 16px;

  &--bad {
    border-color: #D00034;
  }

  &__label {
    font-size: 40px;
    line-height: 1;
    font-weight: bold;
    margin-bottom: 16px;
  }

  &__value {
    font-size: 64px;
    font-weight: bold;
    color: #00B740;
    display: flex;

    .quality-score--bad & {
      color: #D00034;
    }
  }

  &__face {
    margin-right: 16px;
    width: 100px;
    height: 100px;
  }

  &__percent {
    font-size: 40px;
    color: white;
    align-self: flex-end;
    font-weight: bold;
    transform: translate(3px, -12px);
    margin-left: 12px;
  }
}

.results {
  &__stats-row {
    display: flex;
    flex-direction: row;

    > * {
      flex: 1 1 auto;
    }
  }

  &__single-row {
    margin-top: 52px;
    &:not(:last-child) {
      border-bottom: 1px solid #596069;
    }
  }
}
.explanation {
  font-size: 16px;
  color: #979FA8;
  line-height: 1.5;
  margin-top: 82px;

  &__title {
    font-size: inherit;
    color: white;
    font-weight: bold;

    &--two {
      margin-top: 32px;
    }
  }
}

</style>
