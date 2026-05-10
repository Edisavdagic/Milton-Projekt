<template>
  <div class="calendar__nav">
    <button
      type="button"
      aria-label="Forrige periode"
      @click="$emit('previous')"
    >
      <img
        class="calendar__nav-icon"
        :src="chevronLeftIcon"
        alt=""
      />
    </button>

    <div>{{ label }}</div>

    <button
      type="button"
      aria-label="Næste periode"
      @click="$emit('next')"
    >
      <img
        class="calendar__nav-icon"
        :src="chevronRightIcon"
        alt=""
      />
    </button>
  </div>
</template>

<script setup>
import chevronLeftIcon from '@/assets/icons/Chevron-Left.png';
import chevronRightIcon from '@/assets/icons/Chevron-Right.png';

defineProps({
  label: {
    type: String,
    required: true,
  },
});

defineEmits(['next', 'previous']);
</script>
