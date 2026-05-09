import { describe, it, expect } from 'vitest';
import { formatDate } from '../date';

describe('formatDate', () => {
  it('formats a Date in da-DK short month form', () => {
    expect(formatDate(new Date('2024-03-15T12:00:00Z'))).toMatch(/15\.\s*mar\.\s*2024/);
  });

  it('accepts a value the Date constructor can parse', () => {
    expect(formatDate('2024-03-15T12:00:00Z')).toMatch(/15\.\s*mar\.\s*2024/);
  });

  it('returns "Ukendt dato" for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('Ukendt dato');
    expect(formatDate(undefined)).toBe('Ukendt dato');
  });
});
