import dayjs from 'dayjs';

export const CALENDAR_VIEWS = Object.freeze({
  week: 'week',
  month: 'month',
  year: 'year',
});

export const CALENDAR_VIEW_OPTIONS = Object.freeze([
  { value: CALENDAR_VIEWS.week, label: 'Uge' },
  { value: CALENDAR_VIEWS.month, label: 'Måned' },
  { value: CALENDAR_VIEWS.year, label: 'År' },
]);

export const WEEKDAY_NAMES = Object.freeze([
  'Søndag',
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag',
]);

export const MONTH_NAMES = Object.freeze([
  'januar',
  'februar',
  'marts',
  'april',
  'maj',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'december',
]);

const WORK_WEEK_DAY_COUNT = 5;
const MIN_WEEK_ROW_COUNT = 8;

export function actorList(value) {
  if (Array.isArray(value)) {
    return value.map((actor) => String(actor).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((actor) => actor.trim()).filter(Boolean);
  }

  return [];
}

export function parseCalendarDate(value) {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.startOf('day') : null;
}

export function startOfWorkWeek(date) {
  const mondayOffset = (date.day() + 6) % 7;
  return date.startOf('day').subtract(mondayOffset, 'day');
}

export function statusLabel(status) {
  const labels = {
    færdig: 'Færdig',
    igang: 'I gang',
    ikke: 'Ikke begyndt',
  };

  return labels[status] ?? 'Opgave';
}

export function formatDateRange(start, end) {
  const startMonth = MONTH_NAMES[start.month()];
  const endMonth = MONTH_NAMES[end.month()];
  const startYear = start.isSame(end, 'year') ? '' : ` ${start.format('YYYY')}`;

  return `${start.format('D')}. ${startMonth}${startYear} - ${end.format('D')}. ${endMonth} ${end.format('YYYY')}`;
}

export function formatEventPeriod(start, end) {
  const formatDate = (date) => {
    const weekday = WEEKDAY_NAMES[date.day()].slice(0, 3);
    const month = MONTH_NAMES[date.month()].slice(0, 3);

    return `${weekday} ${date.format('D')}. ${month}`;
  };

  if (start.isSame(end, 'day')) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function createTaskEvent(task) {
  const firstDate = parseCalendarDate(task.startDate || task.endDate);
  const secondDate = parseCalendarDate(task.endDate || task.startDate);

  if (!firstDate || !secondDate) {
    return null;
  }

  const startsBeforeEnd = firstDate.isBefore(secondDate) || firstDate.isSame(secondDate, 'day');
  const start = startsBeforeEnd ? firstDate : secondDate;
  const end = startsBeforeEnd ? secondDate : firstDate;
  const actors = actorList(task.actors);

  return {
    id: task.id,
    title: task.title || 'Opgave',
    description: task.description || task.column || statusLabel(task.status),
    start,
    end,
    periodLabel: formatEventPeriod(start, end),
    actorLabels: actors.length ? actors : ['Ansvarlige'],
  };
}

export function createTaskEvents(tasks) {
  return tasks
    .map(createTaskEvent)
    .filter(Boolean)
    .sort((a, b) => {
      if (!a.start.isSame(b.start)) {
        return a.start.valueOf() - b.start.valueOf();
      }

      return b.end.diff(b.start, 'day') - a.end.diff(a.start, 'day');
    });
}

export function createEventsByDate(events) {
  const eventsByDate = new Map();

  events.forEach((event) => {
    let date = event.start;

    while (date.isBefore(event.end, 'day') || date.isSame(event.end, 'day')) {
      const key = date.format('YYYY-MM-DD');
      const dateEvents = eventsByDate.get(key) ?? [];

      dateEvents.push(event);
      eventsByDate.set(key, dateEvents);
      date = date.add(1, 'day');
    }
  });

  return eventsByDate;
}

export function createWeekDays(weekStart, today = dayjs()) {
  return Array.from({ length: WORK_WEEK_DAY_COUNT }).map((_, index) => {
    const date = weekStart.add(index, 'day');

    return {
      date: date.format('YYYY-MM-DD'),
      isToday: date.isSame(today, 'day'),
      label: `${WEEKDAY_NAMES[date.day()]} ${date.format('D')}`,
    };
  });
}

export function createWeekEvents(events, weekStart) {
  const weekEnd = weekStart.add(WORK_WEEK_DAY_COUNT - 1, 'day');

  return events
    .filter((event) => !event.end.isBefore(weekStart, 'day') && !event.start.isAfter(weekEnd, 'day'))
    .map((event, index) => {
      const visibleStart = event.start.isBefore(weekStart, 'day') ? weekStart : event.start;
      const visibleEnd = event.end.isAfter(weekEnd, 'day') ? weekEnd : event.end;

      return {
        ...event,
        columnStart: visibleStart.diff(weekStart, 'day') + 1,
        columnSpan: visibleEnd.diff(visibleStart, 'day') + 1,
        visiblePeriodLabel: formatEventPeriod(visibleStart, visibleEnd),
        row: index + 2,
      };
    });
}

export function weekRowCount(events) {
  return Math.max(MIN_WEEK_ROW_COUNT, events.length + 2);
}

export function createMonthDays(currentDate, eventsByDate, today = dayjs()) {
  const start = currentDate.startOf('month');
  const end = currentDate.endOf('month');
  const days = [];
  let date = start;

  while (date.isBefore(end) || date.isSame(end, 'day')) {
    const dateKey = date.format('YYYY-MM-DD');

    days.push({
      date: dateKey,
      day: date.format('D'),
      events: eventsByDate.get(dateKey) ?? [],
      isToday: date.isSame(today, 'day'),
    });
    date = date.add(1, 'day');
  }

  return days;
}

export function formatCalendarRange(view, currentDate) {
  if (view === CALENDAR_VIEWS.week) {
    const weekStart = startOfWorkWeek(currentDate);
    return formatDateRange(weekStart, weekStart.add(WORK_WEEK_DAY_COUNT - 1, 'day'));
  }

  if (view === CALENDAR_VIEWS.month) {
    return `${MONTH_NAMES[currentDate.month()]} ${currentDate.format('YYYY')}`;
  }

  if (view === CALENDAR_VIEWS.year) {
    return currentDate.format('YYYY');
  }

  return currentDate.format('D. MMMM YYYY');
}

export function shiftCalendarDate(currentDate, view, amount) {
  if (view === CALENDAR_VIEWS.week) {
    return currentDate.add(amount, 'week');
  }

  if (view === CALENDAR_VIEWS.month) {
    return currentDate.add(amount, 'month');
  }

  if (view === CALENDAR_VIEWS.year) {
    return currentDate.add(amount, 'year');
  }

  return currentDate;
}
