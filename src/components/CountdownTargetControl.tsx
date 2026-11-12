"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SCHOOL_ZONE } from "@/lib/zone";
import { Clock } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

/**
 * Sets the instant the countdown is counting down to. It defaults to the
 * currently selected event but accepts any date and time.
 */
export function CountdownTargetControl({
  value,
  fallback,
  onApply,
  onClear,
}: {
  value?: DateTime;
  fallback?: DateTime;
  onApply: (target: DateTime) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ?? fallback;

  const [dateValue, setDateValue] = useState(
    selected?.toFormat("yyyy-LL-dd") ?? "",
  );
  const [timeValue, setTimeValue] = useState(selected?.toFormat("HH:mm") ?? "");

  useEffect(() => {
    const target = value ?? fallback;
    if (!target) return;

    setDateValue(target.toFormat("yyyy-LL-dd"));
    setTimeValue(target.toFormat("HH:mm"));
  }, [value, fallback]);

  const apply = () => {
    if (!dateValue || !timeValue) return;

    const target = DateTime.fromISO(`${dateValue}T${timeValue}`, {
      zone: SCHOOL_ZONE,
    });
    if (!target.isValid) return;

    onApply(target);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Clock className="h-3.5 w-3.5" />
          {value ? "Custom target" : "Set target"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Target date
            <Input
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="mt-1"
            />
          </label>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Target time
            <Input
              type="time"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
              className="mt-1"
            />
          </label>
          <div className="mt-1 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button type="submit" size="sm" disabled={!dateValue || !timeValue}>
              Count down
            </Button>
          </div>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
