import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import {
  CALENDAR_VIEW_OPTIONS,
  CALENDAR_VIEWS,
  MONTH_NAMES,
  createEventsByDate,
  createMonthDays,
  createTaskEvents,
  createWeekDays,
  createWeekEvents,
  formatCalendarRange,
  shiftCalendarDate,
  startOfWorkWeek,
  weekRowCount,
} from '@/utils/calendar';

export function useTaskCalendar(tasks) {
  const currentDate = ref(dayjs());
  const view = ref(CALENDAR_VIEWS.week);
  const hasSetInitialDate = ref(false);

  const taskEvents = computed(() => createTaskEvents(tasks.value));
  const eventsByDate = computed(() => createEventsByDate(taskEvents.value));
  const startOfWeek = computed(() => startOfWorkWeek(currentDate.value));
  const weekDays = computed(() => createWeekDays(startOfWeek.value));
  const weekEvents = computed(() => createWeekEvents(taskEvents.value, startOfWeek.value));
  const monthDays = computed(() => createMonthDays(currentDate.value, eventsByDate.value));
  const formattedRange = computed(() => formatCalendarRange(view.value, currentDate.value));
  const visibleWeekRowCount = computed(() => weekRowCount(weekEvents.value));

  watch(
    taskEvents,
    (events) => {
      if (!hasSetInitialDate.value && events.length) {
        currentDate.value = events[0].start;
        hasSetInitialDate.value = true;
      }
    },
    { immediate: true },
  );

  function goToPreviousPeriod() {
    currentDate.value = shiftCalendarDate(currentDate.value, view.value, -1);
  }

  function goToNextPeriod() {
    currentDate.value = shiftCalendarDate(currentDate.value, view.value, 1);
  }

  function goToWeek(date) {
    currentDate.value = dayjs(date);
    view.value = CALENDAR_VIEWS.week;
  }

  function goToMonth(month) {
    currentDate.value = currentDate.value.month(month - 1);
    view.value = CALENDAR_VIEWS.month;
  }

  return {
    calendarViews: CALENDAR_VIEWS,
    currentDate,
    formattedRange,
    goToMonth,
    goToNextPeriod,
    goToPreviousPeriod,
    goToWeek,
    monthDays,
    monthNames: MONTH_NAMES,
    view,
    viewOptions: CALENDAR_VIEW_OPTIONS,
    weekDays,
    weekEvents,
    weekRowCount: visibleWeekRowCount,
  };
}
