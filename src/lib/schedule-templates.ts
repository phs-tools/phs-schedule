import "./zone";
import { Interval, DateTime, WeekdayNumbers } from "luxon";
import { Period, DailySchedule } from "./schedule";

export const mondayPeriods: Period[] = [
  {
    id: "period-1",
    type: "instructional",
    name: "1st Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("08:30:00"),
      DateTime.fromISO("09:15:00"),
    ),
  },
  {
    type: "passing",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("09:15:00"),
      DateTime.fromISO("09:25:00"),
    ),
  },
  {
    id: "period-2",
    type: "instructional",
    name: "2nd Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("09:25:00"),
      DateTime.fromISO("10:10:00"),
    ),
  },
  {
    id: "brunch",
    type: "break",
    name: "Brunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("10:10:00"),
      DateTime.fromISO("10:25:00"),
    ),
  },
  {
    id: "period-3",
    type: "instructional",
    name: "3rd Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("10:25:00"),
      DateTime.fromISO("11:10:00"),
    ),
  },
  {
    type: "passing",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("11:10:00"),
      DateTime.fromISO("11:20:00"),
    ),
  },
  {
    id: "period-4",
    type: "instructional",
    name: "4th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("11:20:00"),
      DateTime.fromISO("12:10:00"),
    ),
  },
  {
    type: "passing",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("12:10:00"),
      DateTime.fromISO("12:20:00"),
    ),
  },
  {
    id: "period-5",
    type: "instructional",
    name: "5th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("12:20:00"),
      DateTime.fromISO("13:05:00"),
    ),
  },
  {
    id: "lunch",
    type: "break",
    name: "Lunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("13:05:00"),
      DateTime.fromISO("13:45:00"),
    ),
  },
  {
    id: "period-6",
    type: "instructional",
    name: "6th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("13:45:00"),
      DateTime.fromISO("14:30:00"),
    ),
  },
  {
    type: "passing",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("14:30:00"),
      DateTime.fromISO("14:40:00"),
    ),
  },
  {
    id: "period-7",
    type: "instructional",
    name: "7th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("14:40:00"),
      DateTime.fromISO("15:25:00"),
    ),
  },
];

export const oddPeriods: Period[] = [
  {
    id: "period-1",
    type: "instructional",
    name: "1st Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("08:30:00"),
      DateTime.fromISO("10:00:00"),
    ),
  },
  {
    id: "brunch",
    type: "break",
    name: "Brunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("10:00:00"),
      DateTime.fromISO("10:15:00"),
    ),
  },
  {
    id: "period-3",
    type: "instructional",
    name: "3rd Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("10:15:00"),
      DateTime.fromISO("11:45:00"),
    ),
  },
  {
    type: "passing",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("11:45:00"),
      DateTime.fromISO("11:55:00"),
    ),
  },
  {
    id: "period-5",
    type: "instructional",
    name: "5th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("11:55:00"),
      DateTime.fromISO("13:25:00"),
    ),
  },
  {
    id: "lunch",
    type: "break",
    name: "Lunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("13:25:00"),
      DateTime.fromISO("14:05:00"),
    ),
  },
  {
    id: "period-7",
    type: "instructional",
    name: "7th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("14:05:00"),
      DateTime.fromISO("15:35:00"),
    ),
  },
];

export const evenPeriods: Period[] = [
  {
    id: "period-2",
    type: "instructional",
    name: "2nd Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("08:30:00"),
      DateTime.fromISO("10:00:00"),
    ),
  },
  {
    id: "brunch",
    type: "break",
    name: "Brunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("10:00:00"),
      DateTime.fromISO("10:15:00"),
    ),
  },
  {
    id: "academy",
    type: "homeroom",
    name: "Academy - Office Hours",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("10:15:00"),
      DateTime.fromISO("11:00:00"),
    ),
  },
  {
    type: "passing",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("11:00:00"),
      DateTime.fromISO("11:10:00"),
    ),
  },
  {
    id: "period-4",
    type: "instructional",
    name: "4th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("11:10:00"),
      DateTime.fromISO("12:40:00"),
    ),
  },
  {
    id: "lunch",
    type: "break",
    name: "Lunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("12:40:00"),
      DateTime.fromISO("13:20:00"),
    ),
  },
  {
    id: "period-6",
    type: "instructional",
    name: "6th Period",
    interval: Interval.fromDateTimes(
      DateTime.fromISO("13:20:00"),
      DateTime.fromISO("14:50:00"),
    ),
  },
];

export const emptyDay: DailySchedule = { periods: [] };

export const defaultSchedule: Record<WeekdayNumbers, DailySchedule> = {
  1: { periods: mondayPeriods },
  2: { periods: oddPeriods },
  3: { periods: evenPeriods },
  4: { periods: oddPeriods },
  5: { periods: evenPeriods },
  6: emptyDay,
  7: emptyDay,
};
