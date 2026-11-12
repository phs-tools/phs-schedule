import { getScheduleForDay, intervalToPortable } from "@/lib/schedule";
import { DateTime } from "luxon";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const value = searchParams.get("date");
  const day = value ? DateTime.fromFormat(value, "yyyy-LL-dd") : DateTime.now();

  if (!day.isValid) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }

  const { periods, message } = await getScheduleForDay(day);

  return Response.json({
    date: day.toFormat("yyyy-LL-dd"),
    message,
    periods: periods.map((period) => ({
      ...period,
      interval: intervalToPortable(period.interval),
    })),
  });
}
