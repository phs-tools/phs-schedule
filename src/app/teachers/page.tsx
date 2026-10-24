import { fetchMasterSchedule } from "@/lib/master-schedule";
import { TeacherScheduleView } from "@/components/TeacherScheduleView";
import Link from "next/link";

export const revalidate = 3600;

export default async function TeachersPage() {
  const data = await fetchMasterSchedule();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Teachers
            </h1>
            <div className="flex gap-3">
              <Link
                href="/master-schedule"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Master
              </Link>
              <Link
                href="/day"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Day
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        <TeacherScheduleView teachers={data.teachers} />
      </div>
    </div>
  );
}
