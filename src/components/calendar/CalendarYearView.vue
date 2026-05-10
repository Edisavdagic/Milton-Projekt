<template>
  <div class="calendar__year">
    <button
      v-for="(monthName, monthIndex) in monthNames"
      :key="monthName"
      type="button"
      class="calendar__month-box"
      @click="$emit('select-month', monthIndex + 1)"
    >
      {{ monthName }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  monthNames: {
    type: Array,
    required: true,
  },
});

defineEmits(['select-month']);
</script>
