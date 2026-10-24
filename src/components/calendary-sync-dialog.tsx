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
import { CheckIcon, CopyIcon, SearchIcon, UserIcon } from "lucide-react";
import { useState, useSyncExternalStore, useEffect, useRef } from "react";
import { TeacherSchedule } from "@/lib/master-schedule";
import { getCourseAlias } from "@/lib/course-aliases";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  { key: "one", placeholder: "1st Period", label: "Period 1" },
  { key: "two", placeholder: "2nd Period", label: "Period 2" },
  { key: "three", placeholder: "3rd Period", label: "Period 3" },
  { key: "four", placeholder: "4th Period", label: "Period 4" },
  { key: "five", placeholder: "5th Period", label: "Period 5" },
  { key: "six", placeholder: "6th Period", label: "Period 6" },
  { key: "seven", placeholder: "7th Period", label: "Period 7" },
] as const;

const STORAGE_KEY = "phs-schedule-custom-periods";

export function CalendarSyncDialog() {
  const origin = useOrigin();
  const [customPeriods, setCustomPeriods] = useState(false);
  const [periodNames, setPeriodNames] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<TeacherSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [useAliases, setUseAliases] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customPeriods !== undefined) setCustomPeriods(parsed.customPeriods);
        if (parsed.periodNames) setPeriodNames(parsed.periodNames);
        if (parsed.selectedTeacher) setSelectedTeacher(parsed.selectedTeacher);
        if (parsed.useAliases !== undefined) setUseAliases(parsed.useAliases);
      }
    } catch (e) {
      console.error("Failed to load saved periods:", e);
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          customPeriods,
          periodNames,
          selectedTeacher,
          useAliases,
        }),
      );
    } catch (e) {
      console.error("Failed to save periods:", e);
    }
  }, [customPeriods, periodNames, selectedTeacher, useAliases]);

  // Load master schedule
  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/master-schedule");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data.teachers || []);
        }
      } catch (e) {
        console.error("Failed to load master schedule:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTeachers = teachers
    .filter((t) => t.teacher.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 8);

  const handleSelectTeacher = (teacherName: string) => {
    setSelectedTeacher(teacherName);
    setSearchQuery(teacherName);
    setShowSuggestions(false);
    
    const teacher = teachers.find((t) => t.teacher === teacherName);
    if (teacher) {
      const newPeriodNames: Record<string, string> = {};
      PERIOD_FIELDS.forEach(({ key }, index) => {
        const periodNum = index + 1;
        const className = teacher.periods[periodNum];
        if (className) {
          newPeriodNames[key] = useAliases ? getCourseAlias(className) : className;
        }
      });
      setPeriodNames(newPeriodNames);
      setCustomPeriods(true);
    }
  };

  const handleClearSaved = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCustomPeriods(false);
      setPeriodNames({});
      setSelectedTeacher("");
      setSearchQuery("");
      setUseAliases(true);
    } catch (e) {
      console.error("Failed to clear saved periods:", e);
    }
  };

  const handleAliasToggle = () => {
    setUseAliases(!useAliases);
    if (selectedTeacher && teachers.length > 0) {
      const teacher = teachers.find((t) => t.teacher === selectedTeacher);
      if (teacher) {
        const newPeriodNames: Record<string, string> = {};
        PERIOD_FIELDS.forEach(({ key }, index) => {
          const periodNum = index + 1;
          const className = teacher.periods[periodNum];
          if (className) {
            newPeriodNames[key] = !useAliases ? getCourseAlias(className) : className;
          }
        });
        setPeriodNames(newPeriodNames);
      }
    }
  };

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
        <DialogTitle className="text-xl">Add to Calendar</DialogTitle>
        <DialogDescription>
          Subscribe to your PHS schedule in your calendar app
        </DialogDescription>
      </DialogHeader>
      <div className="min-w-0 space-y-4">
        <div className="min-w-0 space-y-2">
          <CopyLinkButton link={httpLink} />
          <Button className="w-full" asChild>
            <Link href={webcalLink} target="_blank">
              Subscribe with Calendar App
            </Link>
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            <Checkbox
              id="custom-periods"
              checked={customPeriods}
              onChange={(event) => setCustomPeriods(event.target.checked)}
            />
            <Label htmlFor="custom-periods" className="cursor-pointer font-medium">
              Customize Period Names
            </Label>
          </div>
          
          {customPeriods && (
            <Card className="p-4">
              <div className="space-y-4">
                {/* Teacher Search/Dropdown */}
                <div className="space-y-2" ref={searchRef}>
                  <Label htmlFor="teacher-search" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Load from Teacher Schedule
                  </Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      id="teacher-search"
                      placeholder="Search for your teacher..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                        if (e.target.value === "") {
                          setSelectedTeacher("");
                        }
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="pl-9"
                      disabled={loading}
                    />
                    {showSuggestions && searchQuery && (
                      <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                        <div className="max-h-56 overflow-auto">
                          {loading ? (
                            <div className="px-3 py-3 text-sm text-neutral-500">
                              Loading schedules...
                            </div>
                          ) : filteredTeachers.length > 0 ? (
                            filteredTeachers.map((teacher) => (
                              <button
                                key={teacher.teacher}
                                onClick={() => handleSelectTeacher(teacher.teacher)}
                                className="w-full border-b border-neutral-100 px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                              >
                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {teacher.teacher}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {teacher.department}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-3 text-sm text-neutral-500">
                              No teachers found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedTeacher && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        ✓ Loaded from {selectedTeacher}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Alias Toggle */}
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="use-aliases"
                      checked={useAliases}
                      onChange={handleAliasToggle}
                    />
                    <Label htmlFor="use-aliases" className="cursor-pointer text-sm">
                      Use standardized course names
                    </Label>
                  </div>
                </div>

                {/* Manual Period Inputs */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Period Names</Label>
                  <div className="space-y-2">
                    {PERIOD_FIELDS.map(({ key, placeholder, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-16 text-xs text-neutral-600 dark:text-neutral-400">
                          {label}
                        </span>
                        <Input
                          placeholder={placeholder}
                          aria-label={placeholder}
                          value={periodNames[key] ?? ""}
                          onChange={(event) =>
                            setPeriodNames((prev) => ({
                              ...prev,
                              [key]: event.target.value,
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {(Object.keys(periodNames).length > 0 || selectedTeacher) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSaved}
                    className="w-full"
                  >
                    Clear All Saved Periods
                  </Button>
                )}
              </div>
            </Card>
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
