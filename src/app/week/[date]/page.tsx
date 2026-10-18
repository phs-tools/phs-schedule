import { WeekNav } from "@/components/WeekNav";
import {
  getScheduleForWeek,
  type VisiblePeriod,
  DailySchedule,
  transformScheduleToDate,
  intervalToPortable,
} from "@/lib/schedule";
import { DateTime } from "luxon";
import Link from "next/link";
import { redirect } from "next/navigation";
import InfoMenu from "@/components/InfoMenu";
import { PeriodBlock } from "../../../components/PeriodBlock";

export default async function WeekView({
  params,
}: {
  params: { date: string };
}) {
  // If the date is invalid, redirect to the current week
  if (!DateTime.fromFormat(params.date, "yyyy-LL-dd").isValid) {
    redirect(`/week`);
  }

  // If the date isn't the first day of the week, redirect to the first day of its week
  if (DateTime.fromFormat(params.date, "yyyy-LL-dd").weekday !== 1) {
    redirect(
      `/week/${DateTime.fromFormat(params.date, "yyyy-LL-dd")
        .startOf("week")
        .toFormat("yyyy-LL-dd")}`,
    );
  }

  const weekStart = DateTime.fromFormat(params.date, "yyyy-LL-dd");

  const schedule = await getScheduleForWeek(weekStart);
  const hasCustomTitle = schedule.some((s) => !!s.message);
  let latestDismissal: DateTime | null = weekStart.set({
    hour: 14,
    minute: 30,
  });

  for (const daySchedule of schedule) {
    const { periods } = transformScheduleToDate(daySchedule, weekStart);

    const dismissalTime = periods[periods.length - 1]?.interval?.end ?? null;

    if (
      !latestDismissal ||
      (dismissalTime && dismissalTime > latestDismissal)
    ) {
      latestDismissal = dismissalTime;
    }
  }

  return (
    <>
      <div className="flex h-screen flex-col">
        <WeekNav date={weekStart.toFormat("yyyy-LL-dd")} />
        <main className="flex max-h-[800px] flex-1 items-stretch justify-center overflow-hidden">
          {schedule.map((schedule) => {
            const { date, periods } = schedule;

            if (periods.length === 0 && date.isWeekend) {
              return null;
            }

            const visiblePeriods: VisiblePeriod[] = [];

            for (const period of periods) {
              if (period.type !== "passing") {
                visiblePeriods.push(period);
              }
            }

            const dismissal = transformScheduleToDate(schedule, weekStart)
              .periods[periods.length - 1]?.interval?.end;

            const minutesBeforeMax =
              dismissal && latestDismissal
                ? latestDismissal?.diff(dismissal, "minutes").minutes
                : undefined;

            return (
              <DailyScheduleView
                schedule={schedule}
                date={date}
                key={date.weekday}
                minutesBeforeMax={minutesBeforeMax}
                temporalSizing
                hasCustomTitle={hasCustomTitle}
              />
            );
          })}
        </main>
      </div>
      <InfoMenu />
    </>
  );
}

function DailyScheduleView({
  schedule,
  date,
  minutesBeforeMax,
  temporalSizing,
  hasCustomTitle,
}: {
  schedule: DailySchedule;
  date: DateTime;
  minutesBeforeMax?: number;
  temporalSizing?: boolean;
  hasCustomTitle?: boolean;
}) {
  const { periods } = schedule;

  return (
    <div className="flex max-w-52 flex-1 flex-col p-2">
      <div
        className={`flex flex-col items-center gap-1 pt-2 ${
          hasCustomTitle ? "min-h-[72px]" : ""
        }`}
      >
        {date && (
          <Link href={`/day/${date.toFormat("yyyy-LL-dd")}`} prefetch>
            <button className="flex min-w-[160px] cursor-pointer select-none items-center justify-center gap-1 rounded-md border-none bg-transparent px-2 py-1 text-center text-base text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 print:hidden">
              {date.weekdayLong}{" "}
              <span className="text-neutral-500 dark:text-neutral-400">
                {date.toFormat("M/d")}
              </span>
            </button>
          </Link>
        )}
        {schedule.message && (
          <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
            {schedule.message}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-start">
        {periods.map((period) => (
          <PeriodBlock
            portablePeriod={{
              ...period,
              interval: intervalToPortable(period.interval),
            }}
            key={period.interval.toString()}
            temporalSizing={temporalSizing}
          />
        ))}
        {temporalSizing && periods.length > 0 && !!minutesBeforeMax && (
          <div style={{ flex: minutesBeforeMax / 10 }} aria-hidden />
        )}
        {periods.length === 0 && (
          <p className="text-center text-neutral-500 dark:text-neutral-400">
            No school
          </p>
        )}
      </div>
    </div>
  );
}
