<template>
  <div class="calendar__week">
    <div class="calendar__days">
      <div
        v-for="day in days"
        :key="day.date"
        :class="{ 'is-today': day.isToday }"
      >
        {{ day.label }}
      </div>
    </div>

    <div class="calendar__grid">
      <div
        v-for="(day, dayIndex) in days"
        :key="day.date"
        class="calendar__column"
        :class="{ 'is-today': day.isToday }"
        :style="getColumnStyle(dayIndex)"
      />

      <div
        v-if="loading"
        class="calendar__empty"
      >
        Indlæser opgaver...
      </div>
      <div
        v-else-if="events.length === 0"
        class="calendar__empty"
      >
        Ingen opgaver i denne uge
      </div>

      <article
        v-for="event in events"
        :key="event.id"
        class="event"
        :style="getEventStyle(event)"
      >
        <div class="event__text">
          <div class="event__title">{{ event.title }}</div>
          <div class="event__desc">{{ event.description }}</div>
          <div class="event__period">
            <span>{{ event.periodLabel }}</span>
            <span v-if="event.visiblePeriodLabel !== event.periodLabel">
              I denne uge: {{ event.visiblePeriodLabel }}
            </span>
          </div>
        </div>

        <div class="event__actors">
          <span
            v-for="actor in event.actorLabels"
            :key="`${event.id}-${actor}`"
          >
            {{ actor }}
          </span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  days: {
    type: Array,
    required: true,
  },
  events: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  rowCount: {
    type: Number,
    required: true,
  },
});

function getColumnStyle(dayIndex) {
  return {
    gridColumn: `${dayIndex + 1}`,
    gridRow: `1 / span ${props.rowCount}`,
  };
}

function getEventStyle(event) {
  return {
    gridColumn: `${event.columnStart} / span ${event.columnSpan}`,
    gridRow: `${event.row}`,
  };
}
</script>
