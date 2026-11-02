import { DAYS_OF_WEEK, TIMES_OF_DAY } from '../seedData';

export interface OverlapResult {
  slotKey: string;
  dayLabel: string;
  timeLabel: string;
  desc: string;
}

/**
 * Calculates overlapping free slots between two student profiles.
 */
export function getOverlappingFreeSlots(
  slotsA: string[] = [],
  slotsB: string[] = []
): OverlapResult[] {
  const setB = new Set(slotsB);
  const commonKeys = slotsA.filter((slot) => setB.has(slot));

  return commonKeys.map((key) => {
    const [dayKey, timeKey] = key.split('-');
    const dayObj = DAYS_OF_WEEK.find((d) => d.key === dayKey);
    const timeObj = TIMES_OF_DAY.find((t) => t.key === timeKey);

    return {
      slotKey: key,
      dayLabel: dayObj ? dayObj.label : dayKey,
      timeLabel: timeObj ? timeObj.label : timeKey,
      desc: timeObj ? timeObj.desc : '',
    };
  });
}
