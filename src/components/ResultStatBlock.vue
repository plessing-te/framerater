<script setup lang="ts">
defineProps<{
  label: string;
  value: number | string;
  unit?: string;
  variant?: 'good' | 'bad' | 'neutral';
}>();
</script>

<template>
  <div class="stat-block" :class="{ 'stat-block--bad': variant === 'bad', 'stat-block--good': variant === 'good' }">
    <p class="stat-block__label">
      {{ label }}
    </p>
    <p class="stat-block__value">
      {{ value }}{{ unit ? ` ${unit}` : '' }}
    </p>
  </div>
  <br>
</template>

<style scoped lang="scss">
.stat-block {
  border-left: 4px solid white;
  padding-left: 16px;

  &--bad {
    border-color: #D00034;
  }

  &--good {
    border-color: #00B740;
  }

  &__label {
    margin: 0 0 8px;
    font-size: 20px;
    line-height: 1;
    font-weight: bold;
  }
  &__value {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
  }
}
</style>
