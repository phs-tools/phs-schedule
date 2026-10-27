import InfoMenu from "@/components/InfoMenu";
import { PeriodBlock } from "@/components/PeriodBlock";
import { AnimatedSchedule } from "@/components/AnimatedSchedule";
import {
  getScheduleForDay,
  intervalToPortable,
  schoolYearDates,
} from "@/lib/schedule";
import { DateTime } from "luxon";
import { redirect } from "next/navigation";
import { DayNav } from "@/components/DayNav";
import { PrefetchAdjacent } from "@/components/PrefetchAdjacent";

export const revalidate = 3600;

export async function generateStaticParams() {
  return schoolYearDates().map((date) => ({ date }));
}

export default async function DayView({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date: dateStr } = await params;

  // If the date is invalid, redirect to the current day
  if (!DateTime.fromFormat(dateStr, "yyyy-LL-dd").isValid) {
    redirect(`/day`);
  }

  const date = DateTime.fromFormat(dateStr, "yyyy-LL-dd");

  const { periods, message } = await getScheduleForDay(date);

  const prev = date.minus({ days: 1 }).toFormat("yyyy-LL-dd");
  const next = date.plus({ days: 1 }).toFormat("yyyy-LL-dd");

  return (
    <div>
      <PrefetchAdjacent prev={`/day/${prev}`} next={`/day/${next}`} />
      <div className="sticky top-0 right-0 left-0 flex flex-col items-center bg-white/40 p-4 backdrop-blur-sm dark:bg-neutral-950/40">
        <DayNav date={date.toFormat("yyyy-LL-dd")} />
        {message && (
          <p className="text-center text-neutral-700 dark:text-neutral-300">
            {message}
          </p>
        )}
      </div>
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-8 pb-8">
        <AnimatedSchedule viewKey={date.toFormat("yyyy-LL-dd")} name="day">
          {periods.map((period) => (
            <PeriodBlock
              portablePeriod={{
                ...period,
                interval: intervalToPortable(period.interval),
              }}
              key={period.interval.toString()}
            />
          ))}
          {periods.length === 0 && (
            <p className="text-center text-neutral-500 dark:text-neutral-400">
              No school
            </p>
          )}
        </AnimatedSchedule>
      </div>
      <InfoMenu />
    </div>
  );
}
