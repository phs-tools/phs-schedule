import InfoMenu from "@/components/InfoMenu";
import { CountdownView } from "@/components/CountdownView";
import { getScheduleForDay, intervalToPortable } from "@/lib/schedule";
import { DateTime } from "luxon";

// The countdown is anchored to the current day, so it can't be prerendered.
export const revalidate = 0;

export default async function CountdownPage() {
  const now = DateTime.now();
  const { periods, message } = await getScheduleForDay(now);

  return (
    <div>
      <div className="mx-auto flex max-w-lg flex-col px-8 py-8">
        <CountdownView
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
