<template>
  <main>
    <StartPage v-if="currentPage === 'start'" @next="currentPage='video'"></StartPage>
    <VideoContainer
        v-if="currentPage === 'video'"
        @done="onDone"
        :adaptive="ENABLE_ADAPTIVE_VIDEO_SIZE"
    ></VideoContainer>
    <ResultsPage v-if="currentPage === 'results'" :results="results" @again="currentPage='start'"></ResultsPage>
  </main>
</template>

<script setup lang="ts">
import ResultsPage from '@/components/ResultsPage.vue';
import StartPage from '@/components/StartPage.vue';
import type { VideoStats } from '@/components/stats.ts';
import VideoContainer from '@/components/VideoContainer.vue';
import { ref } from 'vue';

const ENABLE_ADAPTIVE_VIDEO_SIZE = true;

const currentPage = ref('start');

const results = ref();

function onDone({ stats }: { stats: VideoStats }) {
  results.value = stats;
  currentPage.value = 'results';
}
</script>

<style scoped>
</style>
