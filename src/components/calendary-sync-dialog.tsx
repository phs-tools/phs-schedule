"use client";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

/**
 * `window` is not available while rendering on the server, so the origin is
 * read through `useSyncExternalStore`: the server snapshot is empty and the
 * client snapshot reads `window.location.origin`.
 */
function subscribeToOrigin() {
  return () => {};
}

function useOrigin() {
  return useSyncExternalStore(
    subscribeToOrigin,
    () => window.location.origin,
    () => "",
  );
}

const PERIOD_FIELDS = [
  { key: "one", placeholder: "1st Period" },
  { key: "two", placeholder: "2nd Period" },
  { key: "three", placeholder: "3rd Period" },
  { key: "four", placeholder: "4th Period" },
  { key: "five", placeholder: "5th Period" },
  { key: "six", placeholder: "6th Period" },
  { key: "seven", placeholder: "7th Period" },
] as const;

export function CalendarSyncDialog() {
  const origin = useOrigin();
  const [customPeriods, setCustomPeriods] = useState(false);
  const [periodNames, setPeriodNames] = useState<Record<string, string>>({});

  const params = new URLSearchParams();
  if (customPeriods) {
    params.set("periods", "true");
    for (const { key } of PERIOD_FIELDS) {
      const name = periodNames[key]?.trim();
      if (name) params.set(key, name);
    }
  }

  const query = params.toString();
  const icsPath = query ? `/ical.ics?${query}` : "/ical.ics";
  const httpLink = `${origin}${icsPath}`;
  const webcalLink = `${origin.replace(/^https?/, "webcal")}${icsPath}`;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add to calendar</DialogTitle>
        <DialogDescription>
          See your classes in your calendar app.
        </DialogDescription>
      </DialogHeader>
      <div className="min-w-0 space-y-4">
        <div className="min-w-0 space-y-2">
          <CopyLinkButton link={httpLink} />
          <Button className="w-full" asChild>
            <Link href={webcalLink} target="_blank">
              Subscribe to calendar
            </Link>
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="custom-periods"
              checked={customPeriods}
              onChange={(event) => setCustomPeriods(event.target.checked)}
            />
            <Label htmlFor="custom-periods" className="cursor-pointer">
              Custom period names
            </Label>
          </div>
          {customPeriods && (
            <div className="flex flex-col gap-2">
              {PERIOD_FIELDS.map(({ key, placeholder }) => (
                <Input
                  key={key}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  value={periodNames[key] ?? ""}
                  onChange={(event) =>
                    setPeriodNames((prev) => ({
                      ...prev,
                      [key]: event.target.value,
                    }))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CopyLinkButton(props: { link: string }) {
  const [isCopied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(props.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const iconClassName = "absolute right-3 ml-2 h-4 w-4";

  return (
    <>
      <Button
        variant="outline"
        className="relative flex w-full justify-start overflow-hidden px-3 py-1 pr-8 font-normal"
        onClick={onCopy}
      >
        <span className="sr-only">Copy link</span>
        <span
          className="flex-1 overflow-hidden text-start whitespace-nowrap"
          style={{
            maskImage:
              "linear-gradient(to right, black calc(100% - 2rem), transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, black calc(100% - 2rem), transparent)",
          }}
          aria-hidden="true"
        >
          {props.link}
        </span>
        {isCopied ? (
          <CheckIcon className={iconClassName} />
        ) : (
          <CopyIcon className={iconClassName} />
        )}
      </Button>
      {isCopied && (
        <span className="sr-only" aria-live="polite" role="log">
          Link copied to clipboard
        </span>
      )}
    </>
  );
}
