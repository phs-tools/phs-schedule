import { fetchMasterSchedule } from "@/lib/master-schedule";
import { getCourseAlias } from "@/lib/course-aliases";
import { getSubjectCategory, getSubjectColor, isAPOrHonors } from "@/lib/master-schedule";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 3600;

export default async function PeriodViewPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  const periodNum = parseInt(period);
  
  if (isNaN(periodNum) || periodNum < 1 || periodNum > 7) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-neutral-600 dark:text-neutral-400">Invalid period</p>
        </div>
      </div>
    );
  }

  const data = await fetchMasterSchedule();
  
  const teachersWithPeriod = data.teachers
    .filter((t) => t.periods[periodNum])
    .sort((a, b) => a.teacher.localeCompare(b.teacher));

  const periodTimes = [
    { period: 1, time: "8:30 - 9:15 AM" },
    { period: 2, time: "9:25 - 10:10 AM" },
    { period: 3, time: "10:25 - 11:10 AM" },
    { period: 4, time: "11:20 AM - 12:10 PM" },
    { period: 5, time: "12:20 - 1:05 PM" },
    { period: 6, time: "1:45 - 2:30 PM" },
    { period: 7, time: "2:40 - 3:25 PM" },
  ];

  const timeInfo = periodTimes.find((p) => p.period === periodNum);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Period {periodNum}
              </h1>
              {timeInfo && (
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {timeInfo.time}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href="/teachers"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Teachers
              </Link>
              {[1,2,3,4,5,6,7].map((p) => (
                <Link
                  key={p}
                  href={`/teachers/period/${p}`}
                  className={`text-sm ${p === periodNum ? 'font-medium text-neutral-900 dark:text-neutral-100' : 'text-blue-600 hover:underline dark:text-blue-400'}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-1.5">
          {teachersWithPeriod.map((teacher) => {
            const className = teacher.periods[periodNum]!;
            const aliasedName = getCourseAlias(className);
            const category = getSubjectCategory(className);
            const colorClass = getSubjectColor(category);
            const { isAP, isHonors } = isAPOrHonors(className);

            return (
              <Card key={teacher.teacher} className="border-neutral-200 dark:border-neutral-800">
                <CardContent className="flex items-center gap-4 p-2.5">
                  <div className="w-36 flex-shrink-0">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {teacher.teacher}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div
                      className={`inline-block rounded border px-2.5 py-1 ${colorClass}`}
                    >
                      <span
                        className={`text-sm ${isAP ? "font-bold" : ""} ${isHonors ? "italic" : ""}`}
                      >
                        {aliasedName}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
