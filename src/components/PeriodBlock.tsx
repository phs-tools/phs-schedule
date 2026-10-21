"use client";

import { Period, PortablePeriod, portableToInterval } from "@/lib/schedule";
import { getNow } from "@/lib/now";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { useState, useEffect, useRef } from "react";

// Font sizes PeriodBlock steps through when a title doesn't fit its box.
const SHRINK_CLASSES = [
  "text-sm",
  "text-xs",
  "text-[0.65rem]",
  "text-[0.55rem]",
];
const MAX_SHRINK = SHRINK_CLASSES.length - 1;

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

  // Long titles in short boxes (e.g. "Evacuation Drill Review in 6th" in a
  // ten-minute block) spill past the border; step the text down until it fits.
  // The count is keyed to the title so a new title starts over from full size.
  const fitKey = `${period.type === "passing" ? "" : `${period.name}|${period.subheading}`}|${portablePeriod.interval.start}-${portablePeriod.interval.end}|${!!temporalSizing}`;
  const [fit, setFit] = useState({ key: fitKey, shrink: 0 });
  const shrink = fit.key === fitKey ? fit.shrink : 0;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-read once on mount so a stored time override applies immediately
    // (getNow falls back to the real clock on the server).
    setNow(getNow());

    const interval = setInterval(() => {
      setNow(getNow());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Shrink-only (shrinking further is always safe, so this converges and
    // can't oscillate). A ResizeObserver covers resizes and late layout.
    const check = () => {
      const overflows =
        el.scrollHeight > el.clientHeight + 1 ||
        el.scrollWidth > el.clientWidth + 1;
      if (overflows && shrink < MAX_SHRINK) {
        setFit({ key: fitKey, shrink: shrink + 1 });
      }
    };

    const frame = requestAnimationFrame(check);
    const observer = new ResizeObserver(() => requestAnimationFrame(check));
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [shrink, fitKey]);

  const hasHappened = period.interval.isBefore(now);
  const isHappening = period.interval.contains(now);

  // Homeroom periods (academy, rally, testing) render like class periods.
  const isClassLike =
    period.type === "instructional" || period.type === "homeroom";

  // Lunch/brunch are breaks, but calendar imports can misclassify them as
  // instructional ("LUNCH", "Brunch Advisory", ...). Never show a progress bar
  // on them either way. Passing periods are invisible spacers and never had one.
  const showProgress = isClassLike && !/lunch|brunch/i.test(period.name ?? "");

  // Breaks (Lunch, Brunch) show name and time together, any menu below.
  const isBreak = period.type === "break";

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

  const timeRange = `${period.interval.start?.toFormat("h:mm")} - ${period.interval.end?.toFormat("h:mm")}`;

  return (
    <div
      className={cn(
        "flex min-h-11 items-stretch justify-center transition duration-500",
        isClassLike &&
          "justify-stretch rounded-md border border-neutral-200 shadow-sm dark:border-neutral-800",
        hasHappened && "opacity-50",
      )}
      style={
        temporalSizing ? { flex: period.interval.length("minutes") / 10 } : {}
      }
    >
      <div
        className={cn(
          "flex flex-row items-stretch justify-stretch gap-2 px-3 transition duration-500",
          SHRINK_CLASSES[shrink],
          period.type === "break" && "justify-center",
          !temporalSizing && isClassLike && "p-3",
          isHappening && isClassLike && "pl-2",
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
          ref={contentRef}
          className={cn(
            "flex flex-col items-start justify-center",
            // Breaks center up: name and time on one line, menu under it.
            isBreak && "items-center text-center",
          )}
        >
          {isBreak ? (
            <>
              <div className="flex flex-row items-baseline gap-2">
                <h2 className="font-medium">{period.name}</h2>
                <p>{timeRange}</p>
              </div>
              {period.subheading && (
                <p className="text-xs opacity-70">{period.subheading}</p>
              )}
            </>
          ) : (
            <>
              <h2 className="font-medium">{period.name}</h2>
              {period.subheading && (
                <p className="text-xs opacity-70">{period.subheading}</p>
              )}
              <p>{timeRange}</p>
            </>
          )}
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
