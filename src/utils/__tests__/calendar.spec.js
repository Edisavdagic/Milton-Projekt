import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  actorList,
  createEventsByDate,
  createMonthDays,
  createTaskEvents,
  createWeekEvents,
  formatCalendarRange,
  startOfWorkWeek,
} from '../calendar';

describe('calendar utilities', () => {
  it('normalizes actors from arrays and comma-separated strings', () => {
    expect(actorList([' Anne ', '', 'Bo'])).toEqual(['Anne', 'Bo']);
    expect(actorList('Anne, Bo,')).toEqual(['Anne', 'Bo']);
    expect(actorList(null)).toEqual([]);
  });

  it('creates sorted task events with normalized dates and fallback labels', () => {
    const events = createTaskEvents([
      {
        id: 'later',
        title: '',
        status: 'ikke',
        startDate: '2026-05-08',
        endDate: '2026-05-07',
        actors: '',
      },
      {
        id: 'first',
        title: 'Fundament',
        column: 'Byggeri',
        startDate: '2026-05-04',
        endDate: '2026-05-05',
        actors: ['Mia'],
      },
      {
        id: 'invalid',
        title: 'Mangler dato',
      },
    ]);

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      id: 'first',
      title: 'Fundament',
      description: 'Byggeri',
      actorLabels: ['Mia'],
    });
    expect(events[1]).toMatchObject({
      id: 'later',
      title: 'Opgave',
      actorLabels: ['Ansvarlige'],
    });
    expect(events[1].start.format('YYYY-MM-DD')).toBe('2026-05-07');
    expect(events[1].end.format('YYYY-MM-DD')).toBe('2026-05-08');
  });

  it('clips week events to the visible work week', () => {
    const [event] = createTaskEvents([
      {
        id: 'span',
        title: 'Lang opgave',
        startDate: '2026-05-03',
        endDate: '2026-05-06',
      },
    ]);

    const [weekEvent] = createWeekEvents([event], dayjs('2026-05-04'));

    expect(weekEvent.columnStart).toBe(1);
    expect(weekEvent.columnSpan).toBe(3);
    expect(weekEvent.row).toBe(2);
  });

  it('groups multi-day events into month days', () => {
    const events = createTaskEvents([
      {
        id: 'paint',
        title: 'Maling',
        startDate: '2026-05-04',
        endDate: '2026-05-05',
      },
    ]);

    const days = createMonthDays(
      dayjs('2026-05-10'),
      createEventsByDate(events),
      dayjs('2026-05-10'),
    );

    expect(days.find((day) => day.date === '2026-05-04').events).toHaveLength(1);
    expect(days.find((day) => day.date === '2026-05-05').events).toHaveLength(1);
    expect(days.find((day) => day.date === '2026-05-10').isToday).toBe(true);
  });

  it('formats the active calendar range', () => {
    expect(startOfWorkWeek(dayjs('2026-05-10')).format('YYYY-MM-DD')).toBe('2026-05-04');
    expect(formatCalendarRange('week', dayjs('2026-05-10'))).toBe('4. maj - 8. maj 2026');
    expect(formatCalendarRange('month', dayjs('2026-05-10'))).toBe('maj 2026');
    expect(formatCalendarRange('year', dayjs('2026-05-10'))).toBe('2026');
  });
});
