import "./zone";
import { Interval, DateTime, WeekdayNumbers } from "luxon";
import { emptyDay, defaultSchedule } from "./schedule-templates";
import { generateDayOverrides, getFoodMenus } from "./ics-import";

let cachedOverrides: Record<string, DailySchedule> | null = null;
let overridesCacheTime: number = 0;
const OVERRIDES_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export type VisiblePeriod = {
  interval: Interval;
  id: string;
  // "homeroom" covers Academy, Rally, and testing blocks — periods students
  // spend in their homeroom rather than in a class.
  type: "instructional" | "break" | "homeroom";
  name: string;
  // A short detail line under the name (e.g. what an academy block is for).
  subheading?: string;
};

export type InvisiblePeriod = {
  interval: Interval;
  type: "passing";
};

export type Period = VisiblePeriod | InvisiblePeriod;

export type PortablePeriod = (
  Omit<VisiblePeriod, "interval"> | Omit<InvisiblePeriod, "interval">
) & {
  interval: PortableInterval;
};

export type PortableInterval = {
  start?: string;
  end?: string;
};

export function intervalToPortable(interval: Interval): PortableInterval {
  return {
    start: interval.start?.toISO(),
    end: interval.end?.toISO(),
  };
}

export function portableToInterval(interval: PortableInterval): Interval {
  return Interval.fromDateTimes(
    DateTime.fromISO(interval.start ?? ""),
    DateTime.fromISO(interval.end ?? ""),
  );
}

export type DailySchedule = {
  periods: Period[];
  message?: string;
};

export const SCHOOL_YEAR_START = DateTime.fromISO("2026-08-10");
export const SCHOOL_YEAR_END = DateTime.fromISO("2027-06-04");

export async function getScheduleForDay(day: DateTime): Promise<DailySchedule> {
  // No school if it's before the start of the school year
  if (day < SCHOOL_YEAR_START) {
    return transformScheduleToDate(emptyDay, day);
  }

  // No school if it's after the end of the school year
  if (day > SCHOOL_YEAR_END) {
    return transformScheduleToDate(emptyDay, day);
  }

  const now = Date.now();
  if (!cachedOverrides || now - overridesCacheTime > OVERRIDES_CACHE_TTL_MS) {
    cachedOverrides = (await generateDayOverrides()) ?? {};
    overridesCacheTime = now;
  }
  const dayOverrides = cachedOverrides;

  // If the day is in the dayOverrides, use that
  if (day.toFormat("yyyy-LL-dd") in dayOverrides) {
    return transformScheduleToDate(
      await applyFoodMenus(
        dayOverrides[day.toFormat("yyyy-LL-dd")],
        day.toFormat("yyyy-LL-dd"),
      ),
      day,
    );
  }

  return transformScheduleToDate(
    await applyFoodMenus(
      day.weekday in defaultSchedule
        ? defaultSchedule[day.weekday as WeekdayNumbers]
        : emptyDay,
      day.toFormat("yyyy-LL-dd"),
    ),
    day,
  );
}

// The food-service calendars know the day's lunch and brunch; show each under
// its block, the same way the academy block shows its detail.
async function applyFoodMenus(
  schedule: DailySchedule,
  dateKey: string,
): Promise<DailySchedule> {
  const menus = (await getFoodMenus())[dateKey];
  if (!menus) return schedule;
  return {
    ...schedule,
    periods: schedule.periods.map((period) => {
      if (period.type === "passing") return period;
      // Calendar imports occasionally misclassify the row as instructional
      // ("LUNCH", "Brunch Advisory"), so match on the name as well as the id.
      const menu =
        period.id === "lunch" || /^lunch\b/i.test(period.name)
          ? menus.lunch
          : period.id === "brunch" || /^brunch\b/i.test(period.name)
            ? menus.brunch
            : undefined;
      return menu ? { ...period, subheading: menu } : period;
    }),
  };
}

/// Returns a `DailySchedule` where each interval has the same time of day but uses the given date
export function transformScheduleToDate(
  schedule: DailySchedule,
  day: DateTime,
): DailySchedule {
  const transformedPeriods = schedule.periods.map(function (period) {
    return {
      ...period,
      interval: Interval.fromDateTimes(
        day.set({
          hour: period.interval.start?.hour,
          minute: period.interval.start?.minute,
        }),
        day.set({
          hour: period.interval.end?.hour,
          minute: period.interval.end?.minute,
        }),
      ),
    };
  });

  return {
    ...schedule,
    periods: transformedPeriods,
  };
}

export async function getScheduleForWeek(
  week: DateTime,
): Promise<(DailySchedule & { date: DateTime })[]> {
  const weekStart = week.startOf("week");

  const schedule: (DailySchedule & { date: DateTime })[] = [];

  for (let i = 0; i < 7; i++) {
    const day = weekStart.plus({ days: i });
    schedule.push({ ...(await getScheduleForDay(day)), date: day });
  }

  return schedule;
}
