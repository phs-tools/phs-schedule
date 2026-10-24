import { fetchMasterSchedule } from "@/lib/master-schedule";
import Link from "next/link";

export const revalidate = 3600;

export default async function MasterSchedulePage() {
  const data = await fetchMasterSchedule();
  
  // Group by department
  const departments = Array.from(
    new Set(data.teachers.map((t) => t.department))
  ).sort();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Master Schedule
              </h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                PHS Fall 2026
                {data.lastUpdated && ` • Updated: ${data.lastUpdated}`}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/teachers"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Teacher View (Single Periods)
              </Link>
              <Link
                href="/day"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Daily Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {departments.map((dept) => {
          const deptTeachers = data.teachers.filter((t) => t.department === dept);
          if (deptTeachers.length === 0) return null;
          
          return (
            <section key={dept} className="mb-8">
              <h2 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {dept}
              </h2>
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-900">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Teacher
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Class 1
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Class 2
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Class 3
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Class 4
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Class 5
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Class 6
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                        Class 7
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {deptTeachers.map((teacher) => (
                      <tr
                        key={teacher.teacher}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                      >
                        <td className="px-4 py-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {teacher.teacher}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                          <td
                            key={period}
                            className="px-4 py-2 text-neutral-700 dark:text-neutral-300"
                          >
                            {teacher.periods[period] || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
