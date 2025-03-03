<script setup lang="ts">
defineProps<{
  label: string;
  value: number;
  unit?: string;
  isBad?: boolean;
}>();
</script>

<template>
  <div class="stat-block" :class="{ 'stat-block--bad': isBad }">
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
    border-color: red;
  }

  &__label {
    margin: 0 0 8px;
    font-size: 20px;
    line-height: 1;
    font-weight: bold;
  }
  &__value {
    margin: 0;
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
  }
}
</style>
