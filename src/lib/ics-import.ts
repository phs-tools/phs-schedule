import ICAL from "ical.js";
import crypto from "crypto";
import { DateTime, Interval, WeekdayNumbers } from "luxon";
import {
  academyPeriod,
  brunchPeriod,
  homeroomPeriod,
  instructionalPeriod,
  lunchPeriod,
  passingPeriod,
  vacation,
  DEFAULT_ACADEMY_ACTIVITY,
} from "./schedule-helpers";
import {
  SCHOOL_YEAR_START,
  SCHOOL_YEAR_END,
  DailySchedule,
  Period,
} from "./schedule";
import { defaultSchedule } from "./schedule-templates";
import { messageOverrides } from "./day-overrides";

// The bell-schedule calendar carries the special single-day schedules; the
// events calendar carries breaks and no-school days; the academy calendar
// names what happens during the academy/homeroom block. None alone is
// complete, so all three are fetched and merged.
const SCHEDULES_CALENDAR =
  "https://calendar.google.com/calendar/ical/c_30d5a2c1a8f1c82ef97ae6a5339f97aee29fcd9c09fcd30a6c738022fff30753%40group.calendar.google.com/public/basic.ics";
const EVENTS_CALENDAR =
  "https://calendar.google.com/calendar/ical/c_feedbfeaeb52412221c1a8e6cdfc43ee1e6e68e71a0d85c5d955bf48f0feea55%40group.calendar.google.com/public/basic.ics";
const ACADEMY_CALENDAR =
  "https://calendar.google.com/calendar/ical/c_61469fdd605944c6ecdd1a9251ec0c354ae0597978812eff4627662583d0f046%40group.calendar.google.com/public/basic.ics";
const ICS_URLS = [SCHEDULES_CALENDAR, EVENTS_CALENDAR, ACADEMY_CALENDAR];

// The school runs on Pacific time; academy events are stored as UTC instants
// or in a named zone, so read them in Pacific.
const ACADEMY_ZONE = "America/Los_Angeles";

// Matches summaries that mean "no instruction today" on the events calendar,
// which is otherwise full of unrelated notices (meetings, concerts, etc.).
const NO_SCHOOL_PATTERN = /no school|district closed|no students/i;

// Multi-day events are only days off when they read like a break; things like
// "Spirit Week" or "AP Testing" span several days but are normal school days.
const MULTI_DAY_OFF_PATTERN =
  /no school|district closed|no students|break|holiday|recess/i;

// Bell-schedule rows that are homeroom periods rather than classes: rally,
// testing, and anything explicitly homeroom ("Consent Assembly / Homeroom").
// Academy rows are caught earlier and keep their activity name.
const HOMEROOM_ROW_PATTERN = /rally|testing|homeroom/i;

// The academy calendar marks days with no academy at all.
const NO_ACADEMY_PATTERN = /^\s*no\s+academy/i;

// "Academy - Office Hours" -> "Office Hours", "Academy: Homeroom" ->
// "Homeroom", "Homeroom Academy" -> "Homeroom", plain "Academy" -> default.
function parseAcademyActivity(summary: string): string {
  const afterLabel =
    summary.match(/^\s*academy\s*[-–—:]?\s*(.*)$/i)?.[1] ?? summary;
  const activity = afterLabel
    .replace(/\bacademy\b/gi, "")
    .replace(/^[-–—:/\s]+/, "")
    .replace(/[-–—:/\s]+$/, "")
    .trim();
  return activity || DEFAULT_ACADEMY_ACTIVITY;
}

// Strips the "no school"/"district closed" qualifiers for display.
function cleanMessage(summary: string): string {
  return summary
    .replace(/\s*[-–—]\s*no school/i, "")
    .replace(/\s*\(no school[^)]*\)/i, "")
    .replace(/\s*[-–—]\s*district closed/i, "")
    .replace(/\s*\(district closed[^)]*\)/i, "")
    .trim();
}

type IcsRow = {
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  uid: string;
  source: string;
};

const DAY_MS = 86_400_000;

function daySpan(startDate: Date, endDate: Date): number {
  return Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

let cachedIcs: IcsRow[] | null = null;
let cacheTime: number = 0;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

let cachedIcsTextHash: string | null = null;
let cachedParsedResult: IcsRow[] | null = null;

async function fetchAndParseIcs(): Promise<IcsRow[]> {
  const now = Date.now();
  if (cachedParsedResult && now - cacheTime < CACHE_TTL_MS) {
    return cachedParsedResult;
  }
  try {
    const responses = await Promise.all(ICS_URLS.map((url) => fetch(url)));
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }

    const texts = await Promise.all(responses.map((r) => r.text()));
    const textHash = crypto
      .createHash("sha256")
      .update(texts.join("\n"))
      .digest("hex");

    if (
      cachedIcsTextHash &&
      cachedIcsTextHash === textHash &&
      cachedParsedResult
    ) {
      cacheTime = now;
      return cachedParsedResult;
    }

    const events: IcsRow[] = [];
    texts.forEach((icsText, index) => {
      const source = ICS_URLS[index];
      const jCalData = ICAL.parse(icsText);
      const comp = new ICAL.Component(jCalData);
      const vevents = comp.getAllSubcomponents("vevent");

      for (const vevent of vevents) {
        const event = new ICAL.Event(vevent);
        events.push({
          summary: event.summary,
          description: event.description,
          startDate: event.startDate.toJSDate(),
          endDate: event.endDate.toJSDate(),
          location: event.location,
          uid: event.uid,
          source,
        });
      }
    });

    // in order
    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // only dates this school year
    const schoolYearEvents = events.filter(
      (ev) =>
        ev.startDate.getTime() >= SCHOOL_YEAR_START.toJSDate().getTime() &&
        ev.startDate.getTime() <= SCHOOL_YEAR_END.toJSDate().getTime(),
    );
    cachedParsedResult = schoolYearEvents;
    cachedIcsTextHash = textHash;
    cacheTime = now;
    return schoolYearEvents;
  } catch (error) {
    console.error("Failed to fetch or parse ICS:", error);
    if (cachedParsedResult) {
      return cachedParsedResult;
    }
    throw error;
  }
}

async function getOverridesFromIcs(ics: IcsRow[]) {
  const dayOverrides: Record<string, DailySchedule> = {};
  for (const event of ics) {
    // All-day ICS events mark a single day with DTEND = DTSTART + 1 day, so a
    // span of one day (or less) means a special schedule; anything longer is a
    // multi-day break/vacation.
    const spanDays = daySpan(event.startDate, event.endDate);

    if (spanDays <= 1) {
      // Only the bell-schedule calendar defines days' periods; the events and
      // academy calendars are handled separately below.
      if (event.source !== SCHEDULES_CALENDAR) continue;
      // Skip the recurring routine bell-schedule events; only overrides count.
      const routineSummary = dayToSummary[event.startDate.getDay()]?.trim();
      if (event.summary.trim() !== routineSummary) {
        const message = (
          event.summary.startsWith("SPECIAL")
            ? event.summary.slice(10)
            : event.summary
        ).trim();
        const matches = Array.from(
          event.description.matchAll(
            /<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/g,
          ),
        );
        // Helper to strip HTML tags and non-breaking spaces
        const cleanText = (text: string) =>
          text
            .replace(/<[^>]*>/g, "") // Removes tags like <b>, </b>, etc.
            .replace(/&nbsp;|\u00A0/g, " ") // Replaces non-breaking spaces with normal spaces
            .trim();

        let schedule: {
          name: string;
          startTime: string;
          endTime: string;
        }[];

        if (matches.length > 0) {
          schedule = matches.map((match) => ({
            name: cleanText(match[1]),
            startTime: cleanText(match[2]),
            endTime: cleanText(match[3]),
          }));
        } else {
          // Some events use plain text rows ("Period 2 - 8:30 AM - 10:00 AM"
          // or "Period 1    8:30 AM    9:50 AM") separated by newlines or <br>
          // tags instead of an HTML table.
          const timePattern = String.raw`\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?\.?`;
          const rowPattern = new RegExp(
            String.raw`^(.+?)\s*(?:-\s*|\s{2,})\s*(${timePattern})\s*(?:-\s*|\s{2,})\s*(${timePattern})`,
            "i",
          );
          const text = event.description
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/(p|div)>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;|\u00A0/g, " ");
          schedule = text
            .split(/\n+/)
            .map((line) => {
              const m = line.trim().match(rowPattern);
              return m
                ? {
                    name: m[1].trim(),
                    startTime: m[2].trim(),
                    endTime: m[3].trim(),
                  }
                : null;
            })
            .filter((row): row is NonNullable<typeof row> => row !== null);
        }

        // Parse a clock cell like "8:30", "8:30:00", "8:30 AM" or "8:30AM"
        const parseClock = (
          timeStr: string,
        ): { time: DateTime; hasMeridiem: boolean } | null => {
          const s = timeStr.replace(/^-+\s*/, "").trim();
          if (!s) return null;

          const withMeridiem = s.match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?m\.?|p\.?m\.?)$/i,
          );
          if (withMeridiem) {
            const dt = DateTime.fromFormat(
              `${Number(withMeridiem[1])}:${withMeridiem[2]} ${withMeridiem[3][0].toUpperCase()}M`,
              "h:mm a",
            );
            if (dt.isValid) return { time: dt, hasMeridiem: true };
          }

          for (const format of ["H:mm", "H:mm:ss"]) {
            const dt = DateTime.fromFormat(s, format);
            if (dt.isValid) return { time: dt, hasMeridiem: false };
          }
          return null;
        };

        // The source tables usually omit AM/PM, so resolve bare times against
        // the previous time in the table ("1:25" after "11:55" is 1:25 PM).
        let lastMinuteOfDay = -1;
        const resolveTime = (timeStr: string): DateTime | null => {
          const parsed = parseClock(timeStr);
          if (!parsed) return null;
          const { time, hasMeridiem } = parsed;
          const minutes = time.hour * 60 + time.minute;
          if (!hasMeridiem && minutes < lastMinuteOfDay && time.hour < 12) {
            const pm = time.plus({ hours: 12 });
            lastMinuteOfDay = Math.max(
              lastMinuteOfDay,
              pm.hour * 60 + pm.minute,
            );
            return pm;
          }
          lastMinuteOfDay = Math.max(lastMinuteOfDay, minutes);
          return time;
        };

        const periods: Period[] = [];

        for (const period of schedule) {
          if (!period.name) continue;
          const start = resolveTime(period.startTime);
          const end = resolveTime(period.endTime);
          // Skip header/note rows and anything we couldn't parse into a real span
          if (!start || !end || end.toMillis() <= start.toMillis()) continue;

          const startTime = start.toFormat("HH:mm:ss");
          const endTime = end.toFormat("HH:mm:ss");

          if (period.name.startsWith("Period ")) {
            periods.push(
              instructionalPeriod(
                Number(period.name.slice(-1)),
                startTime,
                endTime,
              ),
            );
          } else if (period.name.startsWith("Academy")) {
            periods.push(academyPeriod(startTime, endTime));
          } else if (HOMEROOM_ROW_PATTERN.test(period.name)) {
            // Rally and testing blocks are homeroom periods; keep their names.
            periods.push(homeroomPeriod(period.name, startTime, endTime));
          } else if (period.name.startsWith("Lunch")) {
            periods.push(lunchPeriod(startTime, endTime));
          } else if (period.name.startsWith("Brunch")) {
            periods.push(brunchPeriod(startTime, endTime));
          } else if (period.name.startsWith("Passing")) {
            periods.push(passingPeriod(startTime, endTime));
          } else {
            periods.push({
              id: period.name,
              type: "instructional" as const,
              name: period.name,
              interval: Interval.fromDateTimes(start, end),
            });
          }
        }

        // Insert invisible spacers for any gap the source table has no Passing
        // row for, so blocks aren't rendered flush against each other.
        const periodsWithSpacing: Period[] = [];
        for (const period of periods) {
          const previous = periodsWithSpacing[periodsWithSpacing.length - 1];
          if (
            previous &&
            previous.type !== "passing" &&
            period.type !== "passing" &&
            previous.interval.end &&
            period.interval.start &&
            period.interval.start > previous.interval.end
          ) {
            periodsWithSpacing.push(
              passingPeriod(
                previous.interval.end.toFormat("HH:mm:ss"),
                period.interval.start.toFormat("HH:mm:ss"),
              ),
            );
          }
          periodsWithSpacing.push(period);
        }

        // Preset schedules fold the passing period that follows a break into
        // the break itself — Monday Brunch is 10:10-10:25 (15 min), not
        // 10:10-10:15 plus a passing period. The source tables list the break
        // and its passing separately (explicitly or as a gap), which made
        // override days show Brunch/Lunch ten minutes shorter. Extend each
        // break to include the passing period directly after it.
        const mergedPeriods: Period[] = [];
        for (const period of periodsWithSpacing) {
          const previous = mergedPeriods[mergedPeriods.length - 1];
          if (previous?.type === "break" && period.type === "passing") {
            mergedPeriods[mergedPeriods.length - 1] = {
              ...previous,
              interval: Interval.fromDateTimes(
                previous.interval.start!,
                period.interval.end!,
              ),
            };
          } else {
            mergedPeriods.push(period);
          }
        }

        const formatted = toIsoDate(event.startDate);
        dayOverrides[formatted] = {
          message: messageOverrides[formatted] ?? message,
          periods: mergedPeriods,
        };
      }
    } else if (MULTI_DAY_OFF_PATTERN.test(event.summary)) {
      // DTEND is exclusive, so the last day off is the day before it.
      const lastDay = new Date(event.endDate);
      lastDay.setDate(lastDay.getDate() - 1);
      // Pass date-only strings: ICAL's all-day dates are local-midnight, and
      // an ISO timestamp would be re-zoned by `vacation`, dropping the last day
      // on servers whose timezone differs from the schedule's.
      Object.assign(
        dayOverrides,
        vacation(
          toIsoDate(event.startDate),
          toIsoDate(lastDay),
          cleanMessage(event.summary),
        ),
      );
    }
  }
  // Single-day no-school days (holidays etc.) live on the events calendar and
  // are EXDATEd from the bell-schedule feed, so pull them from there.
  for (const event of ics) {
    if (event.source !== EVENTS_CALENDAR) continue;
    if (daySpan(event.startDate, event.endDate) > 1) continue;
    if (!NO_SCHOOL_PATTERN.test(event.summary)) continue;
    const formatted = toIsoDate(event.startDate);
    if (!(formatted in dayOverrides)) {
      dayOverrides[formatted] = {
        message: messageOverrides[formatted] ?? cleanMessage(event.summary),
        periods: [],
      };
    }
  }
  // No-school dates (holidays etc.) are EXDATEd from the calendar, so they
  // never appear as ICS events — add them from the static list.
  for (const [date, message] of Object.entries(messageOverrides)) {
    if (!(date in dayOverrides)) {
      dayOverrides[date] = { message, periods: [] };
    }
  }
  applyAcademyEvents(ics, dayOverrides);
  return dayOverrides;
}

// The academy calendar tells us what each academy block is ("Academy -
// Office Hours") and, when it differs from the bell schedule, when it runs.
// It can also put academy on days whose schedule has no academy block at all
// (rally/assembly days), where the matching block becomes a homeroom period.
function applyAcademyEvents(
  ics: IcsRow[],
  dayOverrides: Record<string, DailySchedule>,
) {
  const eventsByDate = new Map<string, IcsRow[]>();
  for (const event of ics) {
    if (event.source !== ACADEMY_CALENDAR) continue;
    if (NO_ACADEMY_PATTERN.test(event.summary)) continue;
    const date = toIsoDate(event.startDate);
    const events = eventsByDate.get(date);
    if (events) {
      events.push(event);
    } else {
      eventsByDate.set(date, [event]);
    }
  }

  for (const [date, events] of eventsByDate) {
    const day = DateTime.fromISO(date);
    const template =
      day.weekday <= 5
        ? defaultSchedule[day.weekday as WeekdayNumbers]
        : undefined;
    // Days off (empty periods, from either source) don't get academy blocks.
    const base = dayOverrides[date] ?? template;
    if (!base || base.periods.length === 0) continue;

    const schedule: DailySchedule = {
      ...base,
      periods: [...base.periods],
    };
    for (const event of events) {
      applyAcademyEvent(event, schedule);
    }
    dayOverrides[date] = schedule;
  }
}

function applyAcademyEvent(event: IcsRow, schedule: DailySchedule) {
  // Re-express the event's span as a time of day so it lines up with the
  // hour/minute-based intervals everywhere else (transformScheduleToDate
  // re-dates them per day).
  const dayTime = (dt: DateTime) => DateTime.fromISO(dt.toFormat("HH:mm:ss"));
  const span = Interval.fromDateTimes(
    dayTime(DateTime.fromJSDate(event.startDate, { zone: ACADEMY_ZONE })),
    dayTime(DateTime.fromJSDate(event.endDate, { zone: ACADEMY_ZONE })),
  );
  if (!span.isValid || span.isEmpty()) return;

  // Prefer the visible period that overlaps the event the most.
  let matchIndex = -1;
  let matchOverlap = 0;
  schedule.periods.forEach((period, index) => {
    if (period.type === "passing") return;
    const overlap = period.interval.intersection(span);
    if (!overlap) return;
    const length = overlap.length("milliseconds");
    if (length > matchOverlap) {
      matchOverlap = length;
      matchIndex = index;
    }
  });

  if (matchIndex >= 0) {
    const matched = schedule.periods[matchIndex];
    if (matched.type === "passing") return;
    if (matched.type === "homeroom" && /^academy/i.test(matched.name)) {
      // The calendar knows the activity and the real times for academy blocks.
      schedule.periods[matchIndex] = {
        ...matched,
        name: `Academy - ${parseAcademyActivity(event.summary)}`,
        interval: span,
      };
    } else {
      // Rally/testing/assembly blocks belong to the bell schedule; only their
      // type changes.
      schedule.periods[matchIndex] = { ...matched, type: "homeroom" };
    }
    return;
  }

  // No block to attach to — the academy block still happens, at the
  // calendar's time.
  schedule.periods.push(
    academyPeriod(
      span.start!.toFormat("HH:mm:ss"),
      span.end!.toFormat("HH:mm:ss"),
      parseAcademyActivity(event.summary),
    ),
  );
  schedule.periods.sort(
    (a, b) =>
      (a.interval.start?.toMillis() ?? 0) - (b.interval.start?.toMillis() ?? 0),
  );
}

const dayToSummary: Record<number, string> = {
  1: "Monday Bell Schedule",
  2: "Tuesday/Thursday Bell Schedule",
  3: "Wednesday/Friday Bell Schedule ",
  4: "Tuesday/Thursday Bell Schedule",
  5: "Wednesday/Friday Bell Schedule ",
};

let overridesPromise: Promise<Record<string, DailySchedule> | null> | null =
  null;

export async function generateDayOverrides() {
  if (!overridesPromise) {
    overridesPromise = (async () => {
      try {
        const ics = await fetchAndParseIcs();
        return await getOverridesFromIcs(ics);
      } catch (error) {
        console.error("Error running script:", error);
        overridesPromise = null; // allow retry on next call
        return null;
      }
    })();
  }
  return overridesPromise;
}
