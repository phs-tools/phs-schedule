"use client";

import { Period, PortablePeriod, portableToInterval } from "@/lib/schedule";
import { getNow } from "@/lib/now";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { useState, useEffect } from "react";

export function PeriodBlock({
  portablePeriod,
  temporalSizing,
}: {
  portablePeriod: PortablePeriod;
  temporalSizing?: boolean;
}) {
  const period: Period = {
    ...portablePeriod,
    interval: portableToInterval(portablePeriod.interval),
  };

  const [now, setNow] = useState<DateTime<boolean>>(DateTime.now());

  useEffect(() => {
    // Re-read once on mount so a stored time override applies immediately
    // (getNow falls back to the real clock on the server).
    setNow(getNow());

    const interval = setInterval(() => {
      setNow(getNow());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hasHappened = period.interval.isBefore(now);
  const isHappening = period.interval.contains(now);

  // Lunch/brunch are breaks, but calendar imports can misclassify them as
  // instructional ("LUNCH", "Brunch Advisory", ...). Never show a progress bar
  // on them either way. Passing periods are invisible spacers and never had one.
  const showProgress =
    period.type === "instructional" && !/lunch|brunch/i.test(period.name ?? "");

  if (period.type === "passing")
    return (
      <div
        aria-hidden
        style={
          temporalSizing
            ? {
                flex: period.interval.length("minutes") / 10,
              }
            : {}
        }
        className={cn(!temporalSizing && "h-3")}
      />
    );

  return (
    <div
      className={cn(
        "flex min-h-11 items-stretch justify-center transition duration-500",
        period.type === "instructional" &&
          "justify-stretch rounded-md border border-neutral-200 shadow-sm dark:border-neutral-800",
        hasHappened && "opacity-50",
      )}
      style={
        temporalSizing ? { flex: period.interval.length("minutes") / 10 } : {}
      }
    >
      <div
        className={cn(
          "flex flex-row items-stretch justify-stretch gap-2 px-3 text-sm transition duration-500",
          period.type === "break" && "justify-center",
          !temporalSizing && period.type === "instructional" && "p-3",
          isHappening && period.type === "instructional" && "pl-2",
        )}
      >
        {showProgress && (
          <ProgressIndicator
            progress={
              (now.toMillis() - (period.interval.start?.toMillis() ?? 0)) /
              period.interval.length("milliseconds")
            }
          />
        )}
        <div
          className={cn(
            "flex flex-col items-start justify-center",
            period.type === "break" &&
              "flex w-auto flex-row items-center gap-2",
          )}
        >
          <h2 className="font-medium">{period.name}</h2>
          <p>
            {period.interval.start?.toFormat("h:mm")} -{" "}
            {period.interval.end?.toFormat("h:mm")}
          </p>
        </div>
      </div>
    </div>
  );
}

const ProgressIndicator = ({ progress }: { progress: number }) => {
  if (progress <= 0 || progress >= 1) return null;

  return (
    <div className="relative my-2 w-[5px] overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <div
        className="absolute top-0 right-0 left-0 rounded-full bg-purple transition"
        style={{ height: Math.round(progress * 100) + "%" }}
      />
    </div>
  );
};
