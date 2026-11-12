"use client";

import { Button } from "@/components/ui/button";
import { useEffectiveSchedule } from "@/components/useEffectiveSchedule";
import { useNow } from "@/components/useNow";
import type { PortablePeriod } from "@/lib/schedule";
import {
  buildPeriodProgress,
  buildProgressBars,
  type ProgressBar,
} from "@/lib/timeline";
import { DateTime } from "luxon";
import Link from "next/link";

export function ProgressView({
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
  const bars = now ? buildProgressBars(schedule.periods, now) : [];
  const periodBars = now ? buildPeriodProgress(schedule.periods, now) : [];
  const day = DateTime.fromFormat(schedule.date, "yyyy-LL-dd");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/day">Today</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/countdown">Countdown</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        {bars.map((bar) => (
          <ProgressBarRow key={bar.id} bar={bar} />
        ))}
        {!now && (
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Loading…
          </p>
        )}
      </section>

      {periodBars.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Today&apos;s periods
          </h2>
          <div className="flex flex-col gap-2">
            {periodBars.map((period) => (
              <div
                key={period.id}
                className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400"
              >
                <span className="w-24 shrink-0 truncate">{period.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-purple"
                    style={{ width: `${Math.round(period.progress * 100)}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right tabular-nums">
                  {Math.round(period.progress * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProgressBarRow({ bar }: { bar: ProgressBar }) {
  const percent = Math.round(bar.progress * 100);

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{bar.label}</span>
        <span className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400">
          {percent}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
        role="progressbar"
        aria-label={bar.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-purple transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {bar.detail}
      </p>
    </div>
  );
}
