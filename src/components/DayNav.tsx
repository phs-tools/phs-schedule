"use client";

import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { DatePickerMenu } from "@/components/DatePickerMenu";
import { scheduleTransitionTypes } from "@/components/AnimatedSchedule";

export function DayNav({ date }: { date: string }) {
  const router = useRouter();
  const day = DateTime.fromFormat(date, "yyyy-LL-dd");

  const prefetch = (href: string) => {
    router.prefetch(href);
  };

  useEffect(() => {
    prefetch(`/day/${day.minus({ days: 1 }).toFormat("yyyy-LL-dd")}`);
    prefetch(`/day/${day.plus({ days: 1 }).toFormat("yyyy-LL-dd")}`);
    prefetch("/day");
    prefetch(`/week/${day.startOf("week").toFormat("yyyy-LL-dd")}`);
  }, [day.toISODate(), router]);

  return (
    <nav className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Yesterday"
          className="print:hidden"
        >
          <Link
            href={`/day/${day.minus({ days: 1 }).toFormat("yyyy-LL-dd")}`}
            transitionTypes={scheduleTransitionTypes("day", "prev")}
            prefetch={false}
            onMouseEnter={() =>
              prefetch(`/day/${day.minus({ days: 1 }).toFormat("yyyy-LL-dd")}`)
            }
            onFocus={() =>
              prefetch(`/day/${day.minus({ days: 1 }).toFormat("yyyy-LL-dd")}`)
            }
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="print:hidden">
          <Link
            href="/day"
            prefetch={false}
            onMouseEnter={() => prefetch("/day")}
            onFocus={() => prefetch("/day")}
          >
            Today
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label="Tomorrow"
          className="print:hidden"
        >
          <Link
            href={`/day/${day.plus({ days: 1 }).toFormat("yyyy-LL-dd")}`}
            transitionTypes={scheduleTransitionTypes("day", "next")}
            prefetch={false}
            onMouseEnter={() =>
              prefetch(`/day/${day.plus({ days: 1 }).toFormat("yyyy-LL-dd")}`)
            }
            onFocus={() =>
              prefetch(`/day/${day.plus({ days: 1 }).toFormat("yyyy-LL-dd")}`)
            }
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="print:hidden"
          onMouseEnter={() =>
            prefetch(`/week/${day.startOf("week").toFormat("yyyy-LL-dd")}`)
          }
          onFocus={() =>
            prefetch(`/week/${day.startOf("week").toFormat("yyyy-LL-dd")}`)
          }
          onClick={() =>
            router.push(`/week/${day.startOf("week").toFormat("yyyy-LL-dd")}`)
          }
        >
          View week
        </Button>
      </div>
      <DatePickerMenu
        label={
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {day.toFormat("EEEE, LLLL d")}
          </span>
        }
        defaultValue={day.toFormat("yyyy-MM-dd")}
        onSelect={(date) => router.push(`/day/${date}`)}
      />
    </nav>
  );
}
