<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineController,
  LineElement,
  PointElement, } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineController, LineElement)

const props = defineProps<{
  data: number[],
  labels?: number[],
  stepped?: boolean,
  minPointCount?: number,
}>()

const labels = computed(() => {
  if (props.labels) {
    return props.labels;
  }
  return (((props.minPointCount ?? 0) > props.data.length) ?
      new Array(props.minPointCount).fill(0) :
      props.data
  ).map((_, i) => i);
  }
)

onMounted(() => {
  console.log(props.data.map((x) => x));
})
</script>

<template>
  <div style="display: block; height: 40px;">
<Line
  :data="{
    labels: labels,
    datasets: [{
      label: '',
      data: data,
      borderColor: 'white',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      stepped: stepped ?? false
    }]
  }"
  :options="{
    animation: {
      duration: 0,
    },
    scales: {
      x: {
        display: false, // Hide x-axis labels and grid lines
        grid: {
          display: false // No grid lines
        }
      },
      y: {
        display: false, // Hide y-axis labels and grid lines
        grid: {
          display: false // No grid lines
        }
      }
    },
    plugins: {
      legend: {
        display: false // Optionally hide the legend if not needed
      }
    },
    elements: {
      line: {
        tension: 0 // No curve in the line (set between 0 and 1 for different curve effects)
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }"
></Line>
  </div>
</template>

<style scoped lang="scss">

</style>
