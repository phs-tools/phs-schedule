"use client";

import { useState } from "react";
import {
  TeacherSchedule,
  getSubjectCategory,
  getSubjectColor,
  isAPOrHonors,
} from "@/lib/master-schedule";
import { getCourseAlias } from "@/lib/course-aliases";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Link from "next/link";

type TeacherScheduleViewProps = {
  teachers: TeacherSchedule[];
};

export function TeacherScheduleView({ teachers }: TeacherScheduleViewProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<string>(
    teachers[0]?.teacher || "",
  );
  const [viewMode, setViewMode] = useState<"grid" | "single">("single");
  const [searchQuery, setSearchQuery] = useState("");

  const teacher = teachers.find((t) => t.teacher === selectedTeacher);

  const departments = Array.from(new Set(teachers.map((t) => t.department))).sort();
  const teachersByDept = departments.reduce(
    (acc, dept) => {
      acc[dept] = teachers.filter((t) => t.department === dept);
      return acc;
    },
    {} as Record<string, TeacherSchedule[]>,
  );

  const filteredTeachers = teachers.filter((t) =>
    t.teacher.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!teacher && teachers.length === 0) {
    return (
      <p className="text-neutral-500 dark:text-neutral-400">No data</p>
    );
  }

  const periodTimes = [
    { period: 1, time: "8:30-9:15" },
    { period: 2, time: "9:25-10:10" },
    { period: 3, time: "10:25-11:10" },
    { period: 4, time: "11:20-12:10" },
    { period: 5, time: "12:20-1:05" },
    { period: 6, time: "1:45-2:30" },
    { period: 7, time: "2:40-3:25" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {[1,2,3,4,5,6,7].map((p) => (
            <Link
              key={p}
              href={`/teachers/period/${p}`}
              className="rounded px-2.5 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:text-blue-400"
            >
              P{p}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("single")}
            className={`rounded px-3 py-1 text-sm ${
              viewMode === "single"
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            Single
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded px-3 py-1 text-sm ${
              viewMode === "grid"
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="h-8 rounded border border-neutral-300 bg-white px-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {searchQuery
            ? filteredTeachers.map((t) => (
                <option key={t.teacher} value={t.teacher}>
                  {t.teacher}
                </option>
              ))
            : departments.map((dept) => (
                <optgroup key={dept} label={dept}>
                  {teachersByDept[dept].map((t) => (
                    <option key={t.teacher} value={t.teacher}>
                      {t.teacher}
                    </option>
                  ))}
                </optgroup>
              ))}
        </select>
      </div>

      {teacher && (
        <>
          {viewMode === "single" ? (
            <div className="space-y-1.5">
              {periodTimes.map(({ period, time }) => {
                const className = teacher.periods[period];
                const aliasedName = className ? getCourseAlias(className) : null;
                const category = getSubjectCategory(className);
                const colorClass = getSubjectColor(category);
                const { isAP, isHonors } = isAPOrHonors(className);

                return (
                  <Card key={period} className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="flex items-center gap-4 p-2.5">
                      <div className="w-20 flex-shrink-0">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          P{period}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {time}
                        </div>
                      </div>
                      <div className="flex-1">
                        {className ? (
                          <div
                            className={`inline-block rounded border px-2.5 py-1 ${colorClass}`}
                          >
                            <span
                              className={`text-sm ${isAP ? "font-bold" : ""} ${isHonors ? "italic" : ""}`}
                            >
                              {aliasedName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                      P
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {periodTimes.map(({ period, time }) => {
                    const className = teacher.periods[period];
                    const aliasedName = className ? getCourseAlias(className) : null;
                    const category = getSubjectCategory(className);
                    const colorClass = getSubjectColor(category);
                    const { isAP, isHonors } = isAPOrHonors(className);

                    return (
                      <tr key={period}>
                        <td className="px-3 py-2 text-neutral-900 dark:text-neutral-100">
                          {period}
                        </td>
                        <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                          {time}
                        </td>
                        <td className="px-3 py-2">
                          {className ? (
                            <span
                              className={`inline-block rounded border px-2 py-0.5 ${colorClass}`}
                            >
                              <span
                                className={`${isAP ? "font-bold" : ""} ${isHonors ? "italic" : ""}`}
                              >
                                {aliasedName}
                              </span>
                            </span>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
