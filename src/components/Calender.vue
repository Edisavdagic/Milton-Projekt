<template>
  <div class="calendar">
    <div class="calendar__header">
      <CalendarViewSwitch
        v-model="view"
        :options="viewOptions"
      />
    </div>

    <CalendarNavigator
      :label="formattedRange"
      @next="goToNextPeriod"
      @previous="goToPreviousPeriod"
    />

    <CalendarWeekView
      v-if="view === calendarViews.week"
      :days="weekDays"
      :events="weekEvents"
      :loading="milestoneStore.loading"
      :row-count="weekRowCount"
    />

    <CalendarMonthView
      v-else-if="view === calendarViews.month"
      :days="monthDays"
      @select-day="goToWeek"
    />

    <CalendarYearView
      v-else-if="view === calendarViews.year"
      :month-names="monthNames"
      @select-month="goToMonth"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import CalendarMonthView from '@/components/calendar/CalendarMonthView.vue';
import CalendarNavigator from '@/components/calendar/CalendarNavigator.vue';
import CalendarViewSwitch from '@/components/calendar/CalendarViewSwitch.vue';
import CalendarWeekView from '@/components/calendar/CalendarWeekView.vue';
import CalendarYearView from '@/components/calendar/CalendarYearView.vue';
import { useProjectMilestones } from '@/composables/useProjectMilestones';
import { useTaskCalendar } from '@/composables/useTaskCalendar';

defineOptions({
  name: 'ProjectCalendar',
});

const route = useRoute();
const projectId = computed(() => route.params.projectId);
const { milestoneStore } = useProjectMilestones(projectId);
const tasks = computed(() => milestoneStore.flatTasks);

const {
  calendarViews,
  formattedRange,
  goToMonth,
  goToNextPeriod,
  goToPreviousPeriod,
  goToWeek,
  monthDays,
  monthNames,
  view,
  viewOptions,
  weekDays,
  weekEvents,
  weekRowCount,
} = useTaskCalendar(tasks);
</script>

<style lang="scss">
@use "@/assets/styles/components/calendar";
</style>
