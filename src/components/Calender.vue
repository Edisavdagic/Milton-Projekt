<template>
  <div class="calendar">
    <div class="calendar__header">
      <div class="calendar__view-switch">
        <button
          type="button"
          :class="{ active: view === 'week' }"
          @click="view = 'week'"
        >
          Uge
        </button>
        <button
          type="button"
          :class="{ active: view === 'month' }"
          @click="view = 'month'"
        >
          Måned
        </button>
        <button
          type="button"
          :class="{ active: view === 'year' }"
          @click="view = 'year'"
        >
          År
        </button>
      </div>
    </div>

    <div class="calendar__nav">
      <button
        type="button"
        aria-label="Forrige"
        @click="prev"
      >
        ‹
      </button>
      <div>{{ formattedRange }}</div>
      <button
        type="button"
        aria-label="Næste"
        @click="next"
      >
        ›
      </button>
    </div>

    <div v-if="view === 'week'" class="calendar__week">
      <div class="calendar__days">
        <div
          v-for="day in weekDays"
          :key="day.date"
          :class="{ 'is-today': day.isToday }"
        >
          {{ day.label }}
        </div>
      </div>

      <div class="calendar__grid">
        <div
          v-for="(day, dayIndex) in weekDays"
          :key="day.date"
          class="calendar__column"
          :class="{ 'is-today': day.isToday }"
          :style="getColumnStyle(dayIndex)"
        />

        <div v-if="store.loading" class="calendar__empty">
          Indlæser opgaver...
        </div>
        <div
          v-else-if="weekEvents.length === 0"
          class="calendar__empty"
        >
          Ingen opgaver i denne uge
        </div>

        <article
          v-for="event in weekEvents"
          :key="event.id"
          class="event"
          :style="getWeekEventStyle(event)"
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

    <div v-else-if="view === 'month'" class="calendar__month">
      <button
        v-for="day in monthDays"
        :key="day.date"
        type="button"
        class="calendar__month-day"
        :class="{ 'is-today': day.isToday }"
        @click="goToWeek(day.date)"
      >
        <span class="date">{{ day.day }}</span>

        <span
          v-for="event in day.events.slice(0, 3)"
          :key="event.id"
          class="event small"
        >
          {{ event.title }}
        </span>

        <span
          v-if="day.events.length > 3"
          class="calendar__more"
        >
          +{{ day.events.length - 3 }} flere
        </span>
      </button>
    </div>

    <div v-else-if="view === 'year'" class="calendar__year">
      <button
        v-for="month in 12"
        :key="month"
        type="button"
        class="calendar__month-box"
        @click="goToMonth(month)"
      >
        {{ monthNames[month - 1] }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { useMilestoneStore } from "@/stores/milestones";

const route = useRoute();
const store = useMilestoneStore();

const currentDate = ref(dayjs());
const view = ref("week");
const hasSetInitialDate = ref(false);

const weekdayNames = [
  "Søndag",
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
];

const monthNames = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];

const actorList = (task) => {
  if (Array.isArray(task.actors)) {
    return task.actors.map((actor) => String(actor).trim()).filter(Boolean);
  }

  if (typeof task.actors === "string") {
    return task.actors.split(",").map((actor) => actor.trim()).filter(Boolean);
  }

  return [];
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.startOf("day") : null;
};

const startOfWorkWeek = (date) => {
  const mondayOffset = (date.day() + 6) % 7;
  return date.startOf("day").subtract(mondayOffset, "day");
};

const formatDateRange = (start, end) => {
  const startMonth = monthNames[start.month()];
  const endMonth = monthNames[end.month()];

  if (start.isSame(end, "month")) {
    return `${start.format("D")}. ${startMonth} - ${end.format("D")}. ${endMonth} ${end.format("YYYY")}`;
  }

  return `${start.format("D")}. ${startMonth} - ${end.format("D")}. ${endMonth} ${end.format("YYYY")}`;
};

const formatEventPeriod = (start, end) => {
  const formatDate = (date) => {
    const weekday = weekdayNames[date.day()].slice(0, 3);
    const month = monthNames[date.month()].slice(0, 3);

    return `${weekday} ${date.format("D")}. ${month}`;
  };

  if (start.isSame(end, "day")) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};

const taskEvents = computed(() =>
  store.flatTasks
    .map((task) => {
      const firstDate = parseDate(task.startDate || task.endDate);
      const secondDate = parseDate(task.endDate || task.startDate);

      if (!firstDate || !secondDate) {
        return null;
      }

      const startsBeforeEnd = firstDate.isBefore(secondDate) || firstDate.isSame(secondDate, "day");
      const start = startsBeforeEnd ? firstDate : secondDate;
      const end = startsBeforeEnd ? secondDate : firstDate;
      const actors = actorList(task);

      return {
        id: task.id,
        title: task.title || "Opgave",
        description: task.description || task.column || statusLabel(task.status),
        start,
        end,
        periodLabel: formatEventPeriod(start, end),
        actorLabels: actors.length ? actors : ["Ansvarlige"],
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a.start.isSame(b.start)) {
        return a.start.valueOf() - b.start.valueOf();
      }

      return b.end.diff(b.start, "day") - a.end.diff(a.start, "day");
    })
);

const eventsByDate = computed(() => {
  const map = new Map();

  taskEvents.value.forEach((event) => {
    let date = event.start;

    while (date.isBefore(event.end, "day") || date.isSame(event.end, "day")) {
      const key = date.format("YYYY-MM-DD");
      const events = map.get(key) ?? [];

      events.push(event);
      map.set(key, events);
      date = date.add(1, "day");
    }
  });

  return map;
});

const startOfWeek = computed(() => startOfWorkWeek(currentDate.value));

const weekDays = computed(() =>
  Array.from({ length: 5 }).map((_, index) => {
    const date = startOfWeek.value.add(index, "day");

    return {
      date: date.format("YYYY-MM-DD"),
      isToday: date.isSame(dayjs(), "day"),
      label: `${weekdayNames[date.day()]} ${date.format("D")}`,
    };
  })
);

const weekEvents = computed(() => {
  const weekStart = startOfWeek.value;
  const weekEnd = weekStart.add(4, "day");

  return taskEvents.value
    .filter((event) => !event.end.isBefore(weekStart, "day") && !event.start.isAfter(weekEnd, "day"))
    .map((event, index) => {
      const visibleStart = event.start.isBefore(weekStart, "day") ? weekStart : event.start;
      const visibleEnd = event.end.isAfter(weekEnd, "day") ? weekEnd : event.end;

      return {
        ...event,
        columnStart: visibleStart.diff(weekStart, "day") + 1,
        columnSpan: visibleEnd.diff(visibleStart, "day") + 1,
        visiblePeriodLabel: formatEventPeriod(visibleStart, visibleEnd),
        row: index + 2,
      };
    });
});

const weekRowCount = computed(() => Math.max(8, weekEvents.value.length + 2));

const monthDays = computed(() => {
  const start = currentDate.value.startOf("month");
  const end = currentDate.value.endOf("month");
  const days = [];
  let date = start;

  while (date.isBefore(end) || date.isSame(end, "day")) {
    const dateKey = date.format("YYYY-MM-DD");

    days.push({
      date: dateKey,
      day: date.format("D"),
      events: eventsByDate.value.get(dateKey) ?? [],
      isToday: date.isSame(dayjs(), "day"),
    });
    date = date.add(1, "day");
  }

  return days;
});

const formattedRange = computed(() => {
  if (view.value === "week") {
    return formatDateRange(startOfWeek.value, startOfWeek.value.add(4, "day"));
  }

  if (view.value === "month") {
    return `${monthNames[currentDate.value.month()]} ${currentDate.value.format("YYYY")}`;
  }

  if (view.value === "year") {
    return currentDate.value.format("YYYY");
  }

  return currentDate.value.format("D. MMMM YYYY");
});

onMounted(() => {
  fetchProjectMilestones(route.params.projectId);
});

watch(
  () => route.params.projectId,
  (projectId) => {
    fetchProjectMilestones(projectId);
  }
);

watch(
  taskEvents,
  (events) => {
    if (!hasSetInitialDate.value && events.length) {
      currentDate.value = events[0].start;
      hasSetInitialDate.value = true;
    }
  },
  { immediate: true }
);

async function fetchProjectMilestones(projectId) {
  if (!projectId) {
    return;
  }

  if (store.projectId !== projectId || store.milestones.length === 0) {
    await store.fetchMilestones(projectId);
  }
}

function statusLabel(status) {
  const labels = {
    færdig: "Færdig",
    igang: "I gang",
    ikke: "Ikke begyndt",
  };

  return labels[status] ?? "Opgave";
}

function prev() {
  if (view.value === "week") currentDate.value = currentDate.value.subtract(1, "week");
  if (view.value === "month") currentDate.value = currentDate.value.subtract(1, "month");
  if (view.value === "year") currentDate.value = currentDate.value.subtract(1, "year");
}

function next() {
  if (view.value === "week") currentDate.value = currentDate.value.add(1, "week");
  if (view.value === "month") currentDate.value = currentDate.value.add(1, "month");
  if (view.value === "year") currentDate.value = currentDate.value.add(1, "year");
}

function getEventsForDay(date) {
  return eventsByDate.value.get(date) ?? [];
}

function getColumnStyle(dayIndex) {
  return {
    gridColumn: `${dayIndex + 1}`,
    gridRow: `1 / span ${weekRowCount.value}`,
  };
}

function getWeekEventStyle(event) {
  return {
    gridColumn: `${event.columnStart} / span ${event.columnSpan}`,
    gridRow: `${event.row}`,
  };
}

function goToWeek(date) {
  currentDate.value = dayjs(date);
  view.value = "week";
}

function goToMonth(month) {
  currentDate.value = currentDate.value.month(month - 1);
  view.value = "month";
}
</script>

<style lang="scss" scoped>
@use "../assets/styles/variables" as *;

.calendar {
  overflow: hidden;
  border: $calendar-border-width solid $accent-2;
  border-radius: $radius-md;
  background: $tertiary;
  color: $textcolor-4;
  font-family: $font-family;

  &__header {
    display: flex;
    justify-content: flex-end;
    padding: $calendar-header-padding;
  }

  &__view-switch {
    display: flex;
    gap: $calendar-view-switch-gap;

    button {
      min-height: $dashboard-control-height;
      border: $border-width solid $accent-2;
      border-radius: $radius-md;
      background: $textcolor-2;
      color: $primary;
      padding: 0 $spacing-sm;
      font-family: $font-family;
      font-size: $dashboard-small-font-size;
      font-weight: $h2-weight;
      cursor: pointer;

      &.active {
        background: $accent-1;
        color: $textcolor-3;
      }
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $calendar-nav-gap;
    padding: $calendar-nav-padding;
    color: $textcolor-3;
    font-size: $calendar-nav-font-size;
    font-weight: $h1-weight;
    text-align: center;

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: $calendar-nav-button-size;
      height: $calendar-nav-button-size;
      border: none;
      border-radius: $radius-pill;
      background: $primary;
      color: $textcolor-2;
      font-family: $font-family;
      font-size: $calendar-nav-button-font-size;
      line-height: 1;
      cursor: pointer;
    }
  }

  &__days {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: $calendar-border-width solid $accent-2;
    border-bottom: $calendar-border-width solid $accent-2;
    background: $textcolor-2;
    color: $textcolor-3;
    font-weight: $h1-weight;

    div {
      min-width: 0;
      padding: $calendar-day-padding-y $calendar-day-padding-x;
      border-right: $border-width solid $accent-2;
      text-align: center;

      &:last-child {
        border-right: none;
      }

      &.is-today {
        background: $accent-1;
      }
    }
  }

  &__grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-auto-rows: minmax($calendar-grid-row-height, auto);
    min-height: $calendar-grid-min-height;
  }

  &__column {
    border-right: $border-width solid $accent-2;
    z-index: 1;

    &:nth-child(5) {
      border-right: none;
    }

    &.is-today {
      background: rgba($accent-1, 0.18);
    }
  }

  &__empty {
    grid-column: 1 / -1;
    grid-row: 2;
    z-index: 2;
    align-self: start;
    justify-self: center;
    margin-top: $calendar-empty-margin-top;
    padding: $calendar-empty-padding-y $calendar-empty-padding-x;
    border-radius: $radius-sm;
    background: rgba($textcolor-2, 0.85);
    color: $primary;
    font-size: $body-size;
    font-weight: $h2-weight;
  }

  &__month {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: $calendar-panel-gap;
    padding: $calendar-panel-padding;
    background: $textcolor-2;
  }

  &__month-day {
    min-height: $calendar-month-day-min-height;
    border: $border-width solid $border-color;
    border-radius: $radius-sm;
    background: $textcolor-2;
    padding: $calendar-month-day-padding;
    color: $textcolor-4;
    font-family: $font-family;
    text-align: left;
    cursor: pointer;

    &.is-today {
      border-color: $accent-2;
      background: rgba($accent-1, 0.28);
    }

    .date {
      display: block;
      margin-bottom: $spacing-xxs;
      color: $textcolor-3;
      font-size: $dashboard-small-font-size;
      font-weight: $h1-weight;
    }
  }

  &__more {
    display: block;
    margin-top: $calendar-event-small-margin-top;
    color: $primary;
    font-size: $dashboard-status-font-size;
    font-weight: $h2-weight;
  }

  &__year {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: $spacing-sm;
    padding: $calendar-panel-padding;
    background: $textcolor-2;
  }

  &__month-box {
    border: $border-width solid $border-color;
    border-radius: $radius-sm;
    background: $textcolor-2;
    padding: $calendar-month-box-padding;
    color: $primary;
    font-family: $font-family;
    font-size: $body-size;
    font-weight: $h1-weight;
    text-align: center;
    cursor: pointer;

    &:hover {
      background: $secondary;
    }
  }
}

.event {
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $calendar-event-gap;
  min-width: 0;
  margin: $calendar-event-margin-y 0;
  padding: $calendar-event-padding;
  border-radius: $radius-md;
  background: $accent-1;
  color: $textcolor-3;

  &__text {
    min-width: 0;
  }

  &__title {
    overflow: hidden;
    color: $textcolor-3;
    font-size: $calendar-event-title-size;
    font-weight: $h1-weight;
    line-height: 1.15;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    overflow: hidden;
    margin-top: $spacing-xxs;
    color: $textcolor-5;
    font-size: $body-size;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__period {
    display: flex;
    gap: $spacing-xxs;
    flex-wrap: wrap;
    margin-top: $spacing-xs;
    color: $primary;
    font-size: $dashboard-small-font-size;
    font-weight: $h2-weight;
  }

  &__actors {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-xxs;
    flex: 0 1 auto;
    flex-wrap: wrap;
    min-width: $calendar-event-actor-min-width;

    span {
      max-width: $calendar-event-actor-max-width;
      overflow: hidden;
      min-height: $dashboard-chip-height;
      border: $border-width solid $accent-2;
      border-radius: $radius-sm;
      background: $textcolor-2;
      padding: 0 $spacing-xs;
      color: $textcolor-5;
      font-size: $dashboard-small-font-size;
      font-weight: $h2-weight;
      line-height: $dashboard-chip-height;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &.small {
    display: block;
    margin-top: $calendar-event-small-margin-top;
    padding: $calendar-event-small-padding-y $calendar-event-small-padding-x;
    border-radius: $radius-xs;
    background: $accent-1;
    color: $textcolor-3;
    font-size: $dashboard-status-font-size;
    font-weight: $h2-weight;
    line-height: 1.2;
  }
}

@media (max-width: $breakpoint-md) {
  .calendar {
    &__nav {
      gap: $calendar-mobile-nav-gap;
      font-size: $calendar-mobile-nav-font-size;

      button {
        width: $calendar-mobile-nav-button-size;
        height: $calendar-mobile-nav-button-size;
        font-size: $calendar-mobile-nav-button-font-size;
      }
    }

    &__grid {
      grid-auto-rows: minmax($calendar-mobile-grid-row-height, auto);
      min-height: $calendar-mobile-grid-min-height;
    }

    &__month,
    &__year {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .event {
    align-items: flex-start;
    flex-direction: column;
    gap: $spacing-xs;
    padding: $spacing-sm;

    &__title {
      font-size: $calendar-mobile-event-title-size;
      white-space: normal;
    }

    &__desc {
      font-size: $calendar-mobile-event-desc-size;
      white-space: normal;
    }

    &__actors {
      justify-content: flex-start;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .calendar {
    &__header {
      justify-content: flex-start;
    }

    &__view-switch {
      width: 100%;

      button {
        flex: 1;
      }
    }

    &__nav {
      justify-content: space-between;
    }

    &__month,
    &__year {
      grid-template-columns: 1fr;
    }
  }
}
</style>
