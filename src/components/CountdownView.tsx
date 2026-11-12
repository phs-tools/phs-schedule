"use client";

import { CountdownTargetControl } from "@/components/CountdownTargetControl";
import { Button } from "@/components/ui/button";
import { useEffectiveSchedule } from "@/components/useEffectiveSchedule";
import { useNow } from "@/components/useNow";
import type { PortablePeriod } from "@/lib/schedule";
import {
  buildCountdownEvents,
  COUNTDOWN_GROUP_ORDER,
  formatDurationShort,
  getCountdownParts,
  nextCountdownEvent,
  type CountdownEvent,
} from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { SCHOOL_ZONE } from "@/lib/zone";
import { DateTime } from "luxon";
import Link from "next/link";
import { useMemo, useState } from "react";

export function CountdownView({
  periods,
  date,
  message,
  initialNow,
}: {
  periods: PortablePeriod[];
  date: string;
  message?: string;
  initialNow?: string;
}) {
  const now = useNow(1000, initialNow);
  const schedule = useEffectiveSchedule({ date, periods, message, now });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customTarget, setCustomTarget] = useState<DateTime | null>(null);

  const events = useMemo(() => {
    const all = buildCountdownEvents(
      schedule.periods,
      DateTime.fromFormat(schedule.date, "yyyy-LL-dd"),
    );

    if (customTarget) {
      all.push({
        id: "custom-target",
        label: "Custom target",
        when: customTarget,
        group: "Custom",
        detail: customTarget.setZone(SCHOOL_ZONE).toFormat("EEEE, LLL d"),
      });
      all.sort((a, b) => a.when.toMillis() - b.when.toMillis());
    }

    return all;
  }, [schedule.periods, schedule.date, customTarget]);

  const selected =
    (selectedId
      ? events.find((event) => event.id === selectedId)
      : undefined) ?? (now ? nextCountdownEvent(events, now) : events[0]);

  const remaining = selected && now ? selected.when.diff(now).toMillis() : 0;
  const parts = getCountdownParts(Math.max(0, remaining));
  const isPast = !!selected && !!now && remaining <= 0;

  const day = DateTime.fromFormat(schedule.date, "yyyy-LL-dd");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Countdown</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {day.toFormat("EEEE, LLLL d")}
            {schedule.loading
              ? " • Loading schedule…"
              : schedule.message
                ? ` • ${schedule.message}`
                : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <CountdownTargetControl
            value={customTarget ?? undefined}
            fallback={selected?.when}
            onApply={(target) => {
              setCustomTarget(target);
              setSelectedId("custom-target");
            }}
            onClear={() => {
              setCustomTarget(null);
              setSelectedId(null);
            }}
          />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/day">Today</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/progress">Progress</Link>
          </Button>
        </div>
      </header>

      <section className="rounded-md border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        {selected ? (
          <>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {selected.label}
            </p>
            <div className="mt-3 flex items-end justify-center gap-3">
              {parts.days > 0 && <TimePart value={parts.days} label="days" />}
              <TimePart value={parts.hours} label="hours" />
              <TimePart value={parts.minutes} label="min" />
              <TimePart value={parts.seconds} label="sec" />
            </div>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              {selected.when
                .setZone(SCHOOL_ZONE)
                .toFormat("EEEE, LLLL d • h:mm a")}
            </p>
            {isPast && (
              <p className="mt-1 text-xs font-medium text-purple">
                This event has passed
              </p>
            )}
          </>
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400">
            No events today
          </p>
        )}
      </section>

      {COUNTDOWN_GROUP_ORDER.map((group) => {
        const groupEvents = events.filter((event) => event.group === group);
        if (groupEvents.length === 0) return null;

        return (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              {group}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {groupEvents.map((event) => (
                <EventButton
                  key={event.id}
                  event={event}
                  now={now}
                  active={selected?.id === event.id}
                  onSelect={() => setSelectedId(event.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TimePart({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-14 flex-col items-center">
      <span className="text-4xl font-semibold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[0.65rem] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {label}
      </span>
    </div>
  );
}

function EventButton({
  event,
  now,
  active,
  onSelect,
}: {
  event: CountdownEvent;
  now: DateTime | null;
  active: boolean;
  onSelect: () => void;
}) {
  const past = now ? event.when <= now : false;

  return (
    <Button
      variant="outline"
      onClick={onSelect}
      className={cn(
        "h-auto flex-col items-start justify-start gap-0.5 px-3 py-2 text-left whitespace-normal",
        active &&
          "border-purple bg-purple text-white hover:bg-purple/90 hover:text-white dark:border-purple dark:bg-purple dark:text-white dark:hover:bg-purple/90",
        past && !active && "opacity-60",
      )}
    >
      <span className="w-full truncate text-sm font-medium">{event.label}</span>
      <span
        className={cn(
          "flex w-full items-center justify-between gap-2 text-xs",
          active ? "text-white/80" : "text-neutral-500 dark:text-neutral-400",
        )}
      >
        <span>{event.when.setZone(SCHOOL_ZONE).toFormat("h:mm a")}</span>
        <span>
          {past
            ? "passed"
            : now
              ? formatDurationShort(event.when.diff(now).toMillis())
              : ""}
        </span>
      </span>
    </Button>
  );
}
