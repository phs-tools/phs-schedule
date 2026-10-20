import InfoMenu from "@/components/InfoMenu";
import { PeriodBlock } from "@/components/PeriodBlock";
import { getScheduleForDay, intervalToPortable } from "@/lib/schedule";
import { DateTime } from "luxon";
import { redirect } from "next/navigation";
import { DayNav } from "@/components/DayNav";

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

  return (
    <div>
      <div className="sticky top-0 right-0 left-0 flex flex-col items-center bg-white/40 p-4 backdrop-blur-sm dark:bg-neutral-950/40">
        <DayNav date={date.toFormat("yyyy-LL-dd")} />
        {message && (
          <p className="text-center text-neutral-700 dark:text-neutral-300">
            {message}
          </p>
        )}
      </div>
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-8 pb-8">
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
      </div>
      <InfoMenu />
    </div>
  );
}
