"use client";

import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePickerMenu } from "@/components/DatePickerMenu";
import { scheduleTransitionTypes } from "@/components/AnimatedSchedule";

export function DayNav({ date }: { date: string }) {
  const router = useRouter();
  const day = DateTime.fromFormat(date, "yyyy-LL-dd");

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
            prefetch
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="print:hidden">
          <Link href="/day" prefetch>
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
            prefetch
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="print:hidden"
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
