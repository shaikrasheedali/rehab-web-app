import { inclusiveDays, parseJsonSafe, currentISODate } from '../../src/utils/dateUtils.js';

describe('dateUtils Unit Tests', () => {
  test('currentISODate returns YYYY-MM-DD format', () => {
    const today = currentISODate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('inclusiveDays calculates accurate days for full month', () => {
    // 2026-08-01 to 2026-08-30 is 30 days
    const days = inclusiveDays('2026-08-01', '2026-08-30');
    expect(days).toBe(30);
  });

  test('inclusiveDays calculates single day when from === to', () => {
    const days = inclusiveDays('2026-08-15', '2026-08-15');
    expect(days).toBe(1);
  });

  test('inclusiveDays clamps within window correctly', () => {
    // Sub-service active from 2026-08-10 to 2026-08-25 within overall stay 2026-08-01 to 2026-08-20
    const clamped = inclusiveDays('2026-08-10', '2026-08-25', '2026-08-01', '2026-08-20');
    // Intersection is 2026-08-10 to 2026-08-20 => 11 days
    expect(clamped).toBe(11);
  });

  test('inclusiveDays returns 0 for invalid or disjoint ranges', () => {
    expect(inclusiveDays('2026-08-25', '2026-08-10')).toBe(0);
    expect(inclusiveDays('', '2026-08-10')).toBe(0);
  });

  test('parseJsonSafe safely parses JSON and handles fallbacks', () => {
    expect(parseJsonSafe('["a", "b"]', [])).toEqual(['a', 'b']);
    expect(parseJsonSafe('invalid json', ['fallback'])).toEqual(['fallback']);
    expect(parseJsonSafe(null, ['fallback'])).toEqual(['fallback']);
    expect(parseJsonSafe(['already', 'parsed'], [])).toEqual(['already', 'parsed']);
  });
});
