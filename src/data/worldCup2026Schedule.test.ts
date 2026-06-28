import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTournamentToday } from './worldCup2026Schedule';

describe('worldCup2026Schedule', () => {
  describe('getTournamentToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns the date in YYYY-MM-DD format', () => {
      const mockDate = new Date('2026-06-15T12:00:00Z');
      vi.setSystemTime(mockDate);

      expect(getTournamentToday()).toBe('2026-06-15');
    });

    it('pads single-digit month and day with zeros', () => {
      // Month is 0-indexed in Date constructor (0 = Jan, 8 = Sep)
      const mockDate = new Date(2026, 8, 5, 12, 0, 0); // Sep 5, 2026
      vi.setSystemTime(mockDate);

      expect(getTournamentToday()).toBe('2026-09-05');
    });

    it('handles leap years correctly', () => {
      const mockDate = new Date(2024, 1, 29, 12, 0, 0); // Feb 29, 2024
      vi.setSystemTime(mockDate);

      expect(getTournamentToday()).toBe('2024-02-29');
    });

    it('handles end of year correctly', () => {
      const mockDate = new Date(2025, 11, 31, 12, 0, 0); // Dec 31, 2025
      vi.setSystemTime(mockDate);

      expect(getTournamentToday()).toBe('2025-12-31');
    });
  });
});
