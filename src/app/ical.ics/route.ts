import {
  DailySchedule,
  getScheduleForDay,
  SCHOOL_YEAR_END,
  SCHOOL_YEAR_START,
  VisiblePeriod,
} from "@/lib/schedule";
import * as ics from "ics";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  periods: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  one: z.string().optional(),
  two: z.string().optional(),
  three: z.string().optional(),
  four: z.string().optional(),
  five: z.string().optional(),
  six: z.string().optional(),
  seven: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    periods: searchParams.get("periods") ?? undefined,
    one: searchParams.get("one") ?? undefined,
    two: searchParams.get("two") ?? undefined,
    three: searchParams.get("three") ?? undefined,
    four: searchParams.get("four") ?? undefined,
    five: searchParams.get("five") ?? undefined,
    six: searchParams.get("six") ?? undefined,
    seven: searchParams.get("seven") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const { periods, one, two, three, four, five, six, seven } = parsed.data;

  const remapPeriods: Record<string, string | undefined> = {
    "1st Period": one ? `① ${one}` : undefined,
    "2nd Period": two ? `② ${two}` : undefined,
    "3rd Period": three ? `③ ${three}` : undefined,
    "4th Period": four ? `④ ${four}` : undefined,
    "5th Period": five ? `⑤ ${five}` : undefined,
    "6th Period": six ? `⑥ ${six}` : undefined,
    "7th Period": seven ? `⑦ ${seven}` : undefined,
  };

  const daysForYear: DailySchedule[] = [];

  const totalDays = SCHOOL_YEAR_END.diff(SCHOOL_YEAR_START, "days").days + 1;

  for (let i = 0; i < totalDays; i++) {
    const day = SCHOOL_YEAR_START.plus({ days: i });
    daysForYear.push(await getScheduleForDay(day));
  }

  const allPeriods = daysForYear.map((schedule) => schedule.periods).flat();

  const { error, value: events } = ics.createEvents(
    allPeriods
      .filter(
        (period): period is VisiblePeriod =>
          period.type === "instructional" || period.type === "homeroom",
      )
      .map((period) => {
        const periodName = period.name;
        return {
          start: period.interval.start!.toMillis(),
          end: period.interval.end!.toMillis(),
          title: periods
            ? (remapPeriods[periodName] ?? periodName)
            : periodName,
          uid: crypto.randomUUID(),
        };
      }),
  );

  if (error) {
    throw new Error("Error creating iCal feed", { cause: error });
  }

  return new NextResponse(events, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="phs-schedule.ics"`,
    },
  });
}
