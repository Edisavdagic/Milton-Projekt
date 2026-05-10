<template>
  <div class="calendar__month">
    <button
      v-for="day in days"
      :key="day.date"
      type="button"
      class="calendar__month-day"
      :class="{ 'is-today': day.isToday }"
      @click="$emit('select-day', day.date)"
    >
      <span class="date">{{ day.day }}</span>

      <span
        v-for="event in day.events.slice(0, visibleEventCount)"
        :key="event.id"
        class="event small"
      >
        {{ event.title }}
      </span>

      <span
        v-if="day.events.length > visibleEventCount"
        class="calendar__more"
      >
        +{{ day.events.length - visibleEventCount }} flere
      </span>
    </button>
  </div>
</template>

<script setup>
const visibleEventCount = 3;

defineProps({
  days: {
    type: Array,
    required: true,
  },
});

defineEmits(['select-day']);
</script>
