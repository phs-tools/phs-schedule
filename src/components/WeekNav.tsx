"use client";

import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { DatePickerMenu } from "@/components/DatePickerMenu";
import { scheduleTransitionTypes } from "@/components/AnimatedSchedule";

export function WeekNav({ date }: { date: string }) {
  const router = useRouter();
  const weekStart = DateTime.fromFormat(date, "yyyy-LL-dd");

  const prefetch = (href: string) => {
    router.prefetch(href);
  };

  useEffect(() => {
    prefetch(`/week/${weekStart.minus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`);
    prefetch(`/week/${weekStart.plus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`);
    prefetch("/week");
  }, [weekStart.toISODate(), router]);

  return (
    <nav className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Previous week"
          className="print:hidden"
        >
          <Link
            href={`/week/${weekStart.minus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`}
            transitionTypes={scheduleTransitionTypes("week", "prev")}
            prefetch={false}
            onMouseEnter={() =>
              prefetch(
                `/week/${weekStart.minus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`,
              )
            }
            onFocus={() =>
              prefetch(
                `/week/${weekStart.minus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`,
              )
            }
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="print:hidden">
          <Link
            href="/week"
            prefetch={false}
            onMouseEnter={() => prefetch("/week")}
            onFocus={() => prefetch("/week")}
          >
            Today
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Next week"
          className="print:hidden"
        >
          <Link
            href={`/week/${weekStart.plus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`}
            transitionTypes={scheduleTransitionTypes("week", "next")}
            prefetch={false}
            onMouseEnter={() =>
              prefetch(
                `/week/${weekStart.plus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`,
              )
            }
            onFocus={() =>
              prefetch(
                `/week/${weekStart.plus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`,
              )
            }
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <DatePickerMenu
        label={
          <>
            <span className="text-neutral-600 dark:text-neutral-400">
              Week of{" "}
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {weekStart.toFormat("LLLL d")}
            </span>
          </>
        }
        defaultValue={weekStart.toFormat("yyyy-MM-dd")}
        onSelect={(date) => router.push(`/week/${date}`)}
      />
    </nav>
  );
}
