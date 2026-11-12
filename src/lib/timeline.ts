import "./zone";
import { DateTime } from "luxon";
import {
  PortablePeriod,
  portableToInterval,
  SCHOOL_YEAR_END,
  SCHOOL_YEAR_START,
  SEMESTER_1_END,
  SEMESTER_1_START,
  SEMESTER_2_END,
  SEMESTER_2_START,
  VisiblePeriod,
} from "./schedule";

export type CountdownEventGroup =
  "School day" | "Periods" | "Breaks" | "Calendar" | "Semesters" | "Custom";

export const COUNTDOWN_GROUP_ORDER: CountdownEventGroup[] = [
  "School day",
  "Periods",
  "Breaks",
  "Calendar",
  "Semesters",
  "Custom",
];

export type CountdownEvent = {
  id: string;
  label: string;
  when: DateTime;
  group: CountdownEventGroup;
  detail?: string;
};

export type ProgressBar = {
  id: string;
  label: string;
  detail: string;
  progress: number;
};

export type PeriodProgress = {
  id: string;
  label: string;
  progress: number;
};

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function toVisiblePeriods(periods: PortablePeriod[]): VisiblePeriod[] {
  const visible: VisiblePeriod[] = [];

  for (const period of periods) {
    if (period.type === "passing") continue;
    visible.push({ ...period, interval: portableToInterval(period.interval) });
  }

  return visible;
}

/**
 * Builds every countdown target for a day: the school day boundaries, the end
 * of each class, the start and end of each break, the end of the week/month,
 * and the semester milestones. Targets are sorted chronologically so the
 * first one after `now` is the next event.
 */
export function buildCountdownEvents(
  periods: PortablePeriod[],
  day: DateTime,
): CountdownEvent[] {
  const visible = toVisiblePeriods(periods);
  const events: CountdownEvent[] = [];

  const first = visible[0];
  const last = visible[visible.length - 1];

  if (first?.interval.start) {
    events.push({
      id: "school-day-start",
      label: "Start of school day",
      when: first.interval.start,
      group: "School day",
    });
  }

  if (last?.interval.end) {
    events.push({
      id: "school-day-end",
      label: "End of school day",
      when: last.interval.end,
      group: "School day",
    });
  }

  for (const period of visible) {
    const start = period.interval.start;
    const end = period.interval.end;
    if (!start || !end) continue;

    if (period.type === "break") {
      events.push({
        id: `${period.id}-start`,
        label: `${period.name} starts`,
        when: start,
        group: "Breaks",
        detail: period.subheading,
      });
      events.push({
        id: `${period.id}-end`,
        label: `${period.name} ends`,
        when: end,
        group: "Breaks",
        detail: period.subheading,
      });
    } else {
      events.push({
        id: `end-${period.id}`,
        label: `End of ${period.name}`,
        when: end,
        group: "Periods",
        detail: period.subheading,
      });
    }
  }

  // End of the school week uses today's dismissal time; after Friday's
  // dismissal (or on the weekend), it rolls forward to the next Friday.
  const dismissal =
    last?.interval.end ?? day.set({ hour: 15, minute: 25, second: 0 });
  let endOfWeek = day.startOf("week").plus({ days: 4 }).set({
    hour: dismissal.hour,
    minute: dismissal.minute,
    second: 0,
    millisecond: 0,
  });
  if (endOfWeek <= day) {
    endOfWeek = endOfWeek.plus({ weeks: 1 });
  }

  let endOfMonth = day.endOf("month");
  if (endOfMonth <= day) {
    endOfMonth = day.plus({ months: 1 }).endOf("month");
  }

  events.push(
    {
      id: "week-end",
      label: "End of week",
      when: endOfWeek,
      group: "Calendar",
      detail: endOfWeek.toFormat("EEEE, LLL d"),
    },
    {
      id: "month-end",
      label: "End of month",
      when: endOfMonth,
      group: "Calendar",
      detail: endOfMonth.toFormat("LLLL d"),
    },
    {
      id: "semester-1-end",
      label: "End of first semester",
      when: SEMESTER_1_END.endOf("day"),
      group: "Semesters",
      detail: "Winter break starts",
    },
    {
      id: "semester-2-end",
      label: "End of second semester",
      when: SEMESTER_2_END.endOf("day"),
      group: "Semesters",
      detail: "School year complete",
    },
  );

  return events.sort((a, b) => a.when.toMillis() - b.when.toMillis());
}

/** The first event still in the future, or the last event if today is over. */
export function nextCountdownEvent(
  events: CountdownEvent[],
  now: DateTime,
): CountdownEvent | undefined {
  return events.find((event) => event.when > now) ?? events[events.length - 1];
}

export function getCountdownParts(milliseconds: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Compact duration for buttons and progress details, e.g. "2h 14m". */
export function formatDurationShort(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));
  if (totalMinutes < 1) return "<1m";

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function progressBetween(
  now: DateTime,
  start: DateTime,
  end: DateTime,
): number {
  const total = end.toMillis() - start.toMillis();
  if (total <= 0) return now >= end ? 1 : 0;

  return Math.min(1, Math.max(0, (now.toMillis() - start.toMillis()) / total));
}

function percent(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

function windowDetail(start: DateTime, end: DateTime, now: DateTime): string {
  const progress = progressBetween(now, start, end);

  if (progress >= 1) return "Complete";
  if (now < start) return `Starts ${start.toFormat("LLL d")}`;

  return `${percent(progress)} • ${formatDurationShort(end.diff(now).toMillis())} left`;
}

function semesterWindow(now: DateTime): {
  label: string;
  start: DateTime;
  end: DateTime;
} {
  const firstStart = SEMESTER_1_START.startOf("day");
  const firstEnd = SEMESTER_1_END.plus({ days: 1 }).startOf("day");
  const secondStart = SEMESTER_2_START.startOf("day");
  const secondEnd = SEMESTER_2_END.plus({ days: 1 }).startOf("day");

  if (now < secondStart) {
    return { label: "First semester", start: firstStart, end: firstEnd };
  }

  return { label: "Second semester", start: secondStart, end: secondEnd };
}

function breakDetail(period: VisiblePeriod, now: DateTime): string {
  const start = period.interval.start;
  const end = period.interval.end;
  if (!start || !end) return "";

  const window = `${start.toFormat("h:mm a")}–${end.toFormat("h:mm a")}`;
  if (now < start) {
    return `${window} • starts in ${formatDurationShort(
      start.diff(now).toMillis(),
    )}`;
  }
  if (now >= end) return `${window} • complete`;

  const progress = progressBetween(now, start, end);
  return `${window} • ${percent(progress)} • ${formatDurationShort(
    end.diff(now).toMillis(),
  )} left`;
}

function currentPeriodDetail(
  periods: VisiblePeriod[],
  now: DateTime,
): { progress: number; detail: string } {
  const classes = periods.filter((period) => period.type !== "break");
  const current = classes.find((period) => period.interval.contains(now));

  if (current) {
    const progress = progressBetween(
      now,
      current.interval.start!,
      current.interval.end!,
    );
    return {
      progress,
      detail: `${current.name} • ${percent(progress)} • ${formatDurationShort(
        current.interval.end!.diff(now).toMillis(),
      )} left`,
    };
  }

  const upcoming = classes.find((period) => period.interval.start! > now);
  if (upcoming) {
    return {
      progress: 0,
      detail: `${upcoming.name} starts in ${formatDurationShort(
        upcoming.interval.start!.diff(now).toMillis(),
      )}`,
    };
  }

  const last = classes[classes.length - 1];
  return {
    progress: last ? 1 : 0,
    detail: last ? "Done for today" : "No classes today",
  };
}

export function buildProgressBars(
  periods: PortablePeriod[],
  now: DateTime,
): ProgressBar[] {
  const visible = toVisiblePeriods(periods);
  const classes = visible.filter((period) => period.type !== "break");

  const dayStart = visible[0]?.interval.start;
  const dayEnd = visible[visible.length - 1]?.interval.end;
  const dayProgress =
    dayStart && dayEnd ? progressBetween(now, dayStart, dayEnd) : 0;

  const current = currentPeriodDetail(visible, now);
  const breakBars: ProgressBar[] = visible
    .filter(
      (period) =>
        period.type === "break" && period.interval.start && period.interval.end,
    )
    .map((period) => ({
      id: `break-${period.id}`,
      label: period.name,
      detail: breakDetail(period, now),
      progress: progressBetween(
        now,
        period.interval.start!,
        period.interval.end!,
      ),
    }));
  const completed = classes.filter(
    (period) => period.interval.end && period.interval.end <= now,
  ).length;

  // "End of week" means the end of the school week (Friday), not Sunday, so
  // the bar reads as complete over the weekend.
  const weekStart = now.startOf("week");
  const weekEnd = weekStart.plus({ days: 5 }).startOf("day");
  const monthStart = now.startOf("month");
  const monthEnd = monthStart.plus({ months: 1 }).startOf("day");
  const semester = semesterWindow(now);
  const yearStart = SCHOOL_YEAR_START.startOf("day");
  const yearEnd = SCHOOL_YEAR_END.plus({ days: 1 }).startOf("day");

  return [
    {
      id: "current-period",
      label: "Current period",
      detail: current.detail,
      progress: current.progress,
    },
    ...breakBars,
    {
      id: "school-day",
      label: "School day",
      detail:
        dayStart && dayEnd
          ? windowDetail(dayStart, dayEnd, now)
          : "No school today",
      progress: dayProgress,
    },
    {
      id: "classes-complete",
      label: "Classes complete",
      detail: `${completed} of ${classes.length} periods`,
      progress: classes.length > 0 ? completed / classes.length : 0,
    },
    {
      id: "week",
      label: "End of week",
      detail: `${weekStart
        .plus({ days: 4 })
        .toFormat("EEEE, LLL d")} • ${windowDetail(weekStart, weekEnd, now)}`,
      progress: progressBetween(now, weekStart, weekEnd),
    },
    {
      id: "month",
      label: "End of month",
      detail: `${monthEnd
        .minus({ days: 1 })
        .toFormat("LLLL d")} • ${windowDetail(monthStart, monthEnd, now)}`,
      progress: progressBetween(now, monthStart, monthEnd),
    },
    {
      id: "semester",
      label: "Semester",
      detail: `${semester.label} • ${windowDetail(
        semester.start,
        semester.end,
        now,
      )}`,
      progress: progressBetween(now, semester.start, semester.end),
    },
    {
      id: "school-year",
      label: "School year",
      detail: windowDetail(yearStart, yearEnd, now),
      progress: progressBetween(now, yearStart, yearEnd),
    },
  ];
}

export function buildPeriodProgress(
  periods: PortablePeriod[],
  now: DateTime,
): PeriodProgress[] {
  return toVisiblePeriods(periods).map((period) => ({
    id: period.id,
    label: period.name,
    progress:
      period.interval.start && period.interval.end
        ? progressBetween(now, period.interval.start, period.interval.end)
        : 0,
  }));
}
