<!-- TODO: Diskuter om at bruge library til dato-håndtering -->
<template>
  <div class="calendar">
    <!-- Header -->
    <div class="calendar__header">

      <div class="calendar__view-switch">
        <button @click="view = 'week'" :class="{ active: view === 'week' }">Uge</button>
        <button @click="view = 'month'" :class="{ active: view === 'month' }">Måned</button>
        <button @click="view = 'year'" :class="{ active: view === 'year' }">År</button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="calendar__nav">
      <button @click="prev">◀</button>
      <div>{{ formattedRange }}</div>
      <button @click="next">▶</button>
    </div>

    <!-- ================= WEEK VIEW ================= -->
    <div v-if="view === 'week'">
      <!-- Days -->
      <div class="calendar__days">
        <div v-for="day in weekDays" :key="day.date">
          {{ day.label }}
        </div>
      </div>

      <!-- Grid -->
      <div class="calendar__grid">
        <div
          v-for="day in weekDays"
          :key="day.date"
          class="calendar__column"
        >
          <div
            v-for="event in getEventsForDay(day.date)"
            :key="event.id"
            class="event"
            :style="getEventStyle(event)"
          >
            <div class="event__title">{{ event.title }}</div>
            <div class="event__desc">{{ event.description }}</div>
            <div class="event__assignee">{{ event.assignee }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MONTH VIEW ================= -->
    <div v-else-if="view === 'month'" class="calendar__month">
      <div
        v-for="day in monthDays"
        :key="day.date"
        class="calendar__month-day"
        @click="goToWeek(day.date)"
      >
        <div class="date">{{ day.day }}</div>

        <div
          v-for="event in getEventsForDay(day.date)"
          :key="event.id"
          class="event small"
        >
          {{ event.title }}
        </div>
      </div>
    </div>

    <!-- ================= YEAR VIEW ================= -->
    <div v-else-if="view === 'year'" class="calendar__year">
      <div
        v-for="m in 12"
        :key="m"
        class="calendar__month-box"
        @click="goToMonth(m)"
      >
        {{ dayjs().month(m - 1).format("MMMM") }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import dayjs from "dayjs"

const currentDate = ref(dayjs())
const view = ref("week")

const events = ref([
  {
    id: 1,
    title: "Loft montering",
    description: "Montering af loftplader",
    date: "2026-02-09",
    start: 8,
    duration: 3,
    assignee: "Henrik Nielsen",
  },
  {
    id: 2,
    title: "Opdatering af plantegning",
    description: "Grafiker opdaterer plantegning",
    date: "2026-02-09",
    start: 12,
    duration: 2,
    assignee: "Simon Jensen",
  },
])

const startOfWeek = computed(() =>
  currentDate.value.startOf("week").add(1, "day")
)

const weekDays = computed(() =>
  Array.from({ length: 5 }).map((_, i) => {
    const date = startOfWeek.value.add(i, "day")
    return {
      date: date.format("YYYY-MM-DD"),
      label: date.format("dddd D"),
    }
  })
)

const monthDays = computed(() => {
  const start = currentDate.value.startOf("month")
  const end = currentDate.value.endOf("month")

  const days = []
  let d = start

  while (d.isBefore(end) || d.isSame(end)) {
    days.push({
      date: d.format("YYYY-MM-DD"),
      day: d.format("D"),
    })
    d = d.add(1, "day")
  }

  return days
})

const formattedRange = computed(() => {
  if (view.value === "week") {
    const start = startOfWeek.value
    const end = start.add(4, "day")
    return `${start.format("D. MMMM")} - ${end.format("D. MMMM YYYY")}`
  }

  if (view.value === "month") {
    return currentDate.value.format("MMMM YYYY")
  }

  if (view.value === "year") {
    return currentDate.value.format("YYYY")
  }

  return currentDate.value.format("D. MMMM YYYY")
})

function prev() {
  if (view.value === "week") currentDate.value = currentDate.value.subtract(1, "week")
  if (view.value === "month") currentDate.value = currentDate.value.subtract(1, "month")
  if (view.value === "year") currentDate.value = currentDate.value.subtract(1, "year")
}

function next() {
  if (view.value === "week") currentDate.value = currentDate.value.add(1, "week")
  if (view.value === "month") currentDate.value = currentDate.value.add(1, "month")
  if (view.value === "year") currentDate.value = currentDate.value.add(1, "year")
}

function getEventsForDay(date) {
  return events.value.filter((e) => e.date === date)
}

function getEventStyle(event) {
  return {
    top: `${event.start * 5}px`,
    height: `${event.duration * 40}px`,
  }
}

// navigation helpers (fra template)
function goToWeek(date) {
  currentDate.value = dayjs(date)
  view.value = "week"
}

function goToMonth(month) {
  currentDate.value = currentDate.value.month(month - 1)
  view.value = "month"
}
</script>

<style lang="scss" scoped>
/* Variables */
$primary: #2f6f73;
$primary-light: #6f9ea1;
$background: #eef6f6;
$event-bg: #f3d27a;
$border: #cfd8dc;

/* Calendar */
.calendar {
  background: $background;
  padding: 1rem;
  border-radius: 12px;
  font-family: Arial, sans-serif;

  /* HEADER */
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      font-size: 24px;
      font-weight: bold;
    }
  }

  /* VIEW SWITCH */
  &__view-switch {
    button {
      background: #e0e0e0;
      border: none;
      padding: 6px 10px;
      margin-left: 5px;
      border-radius: 6px;
      cursor: pointer;

      &.active {
        background: #f0c75e;
      }
    }
  }

  /* NAV */
  &__nav {
    margin-top: 10px;
    background: $primary;
    color: white;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    border-radius: 8px 8px 0 0;

    button {
      background: transparent;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
    }
  }

  /* WEEK HEADER */
  &__days {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background: $primary-light;
    color: white;
    font-weight: bold;

    div {
      text-align: center;
      padding: 8px;
      border-right: 1px solid rgba(255,255,255,0.2);
    }
  }

  /* WEEK GRID */
  &__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    min-height: 400px;
    background: white;
  }

  &__column {
    position: relative;
    border-right: 1px solid $border;
  }

  /* MONTH VIEW */
  &__month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    margin-top: 10px;
  }

  &__month-day {
    background: white;
    min-height: 100px;
    padding: 6px;
    border-radius: 6px;
    border: 1px solid $border;

    .date {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .event.small {
      position: relative; // 🔥 vigtig fix (ikke absolute!)
      font-size: 10px;
      margin-top: 2px;
      padding: 2px 4px;
      border-radius: 4px;
      background: $event-bg;
    }
  }

  /* YEAR VIEW */
  &__year {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 10px;
  }

  &__month-box {
    background: white;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    border: 1px solid $border;
    cursor: pointer;
    transition: 0.2s;
    font-weight: bold;

    &:hover {
      background: #f5f5f5;
    }
  }
}

/* Event (UGE VIEW) */
.event {
  position: absolute;
  left: 6px;
  right: 6px;
  background: $event-bg;
  border-radius: 6px;
  padding: 6px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &__title {
    font-weight: bold;
  }

  &__desc {
    font-size: 11px;
    opacity: 0.7;
  }

  &__assignee {
    text-align: right;
    font-size: 11px;
    margin-top: 4px;
  }
}
</style>