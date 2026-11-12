import InfoMenu from "@/components/InfoMenu";
import { ProgressView } from "@/components/ProgressView";
import { getScheduleForDay, intervalToPortable } from "@/lib/schedule";
import { DateTime } from "luxon";

// Progress is anchored to the current time, so it can't be prerendered.
export const revalidate = 0;

export default async function ProgressPage() {
  const now = DateTime.now();
  const { periods, message } = await getScheduleForDay(now);

  return (
    <div>
      <div className="mx-auto flex max-w-lg flex-col px-8 py-8">
        <ProgressView
          date={now.toFormat("yyyy-LL-dd")}
          message={message}
          initialNow={now.toISO() ?? undefined}
          periods={periods.map((period) => ({
            ...period,
            interval: intervalToPortable(period.interval),
          }))}
        />
      </div>
      <InfoMenu />
    </div>
  );
}
