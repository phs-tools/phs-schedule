import "./zone";

export type TeacherSchedule = {
  teacher: string;
  department: string;
  periods: Record<number, string | null>; // period 1-7 -> class name or null
};

export type MasterScheduleData = {
  teachers: TeacherSchedule[];
  lastUpdated?: string;
};

// Simple HTML parser for the PHS master schedule
export async function fetchMasterSchedule(): Promise<MasterScheduleData> {
  try {
    const res = await fetch(
      "https://phs.piedmont.k12.ca.us/academics-programs/master-schedule",
      {
        next: { revalidate: 3600 }, // cache for 1 hour
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    const html = await res.text();
    return parseMasterSchedule(html);
  } catch (error) {
    console.error("Error fetching master schedule:", error);
    return { teachers: [] };
  }
}

function parseMasterSchedule(html: string): MasterScheduleData {
  const teachers: TeacherSchedule[] = [];
  let lastUpdated: string | undefined;

  // Try to find last updated
  const updatedMatch = html.match(/updated:\s*([^\n<]+)/i);
  if (updatedMatch) {
    lastUpdated = updatedMatch[1].trim();
  }

  // Find all department sections - look for h3/h4 or table headers followed by tables
  // Pattern: department name followed by table with Teacher, Class 1-7
  const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
  const tables = html.match(tableRegex) || [];

  for (const table of tables) {
    // Check if this table has the structure we need
    if (!table.includes("Teacher") || !table.includes("Class 1")) {
      continue;
    }

    // Find department name - look backwards from table for heading
    const tableIndex = html.indexOf(table);
    const beforeTable = html.slice(Math.max(0, tableIndex - 500), tableIndex);
    
    // Try to find department heading
    let department = "Unknown";
    const deptMatch = beforeTable.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i) || 
                      beforeTable.match(/<strong>([^<]+)<\/strong>/i) ||
                      beforeTable.match(/([A-Za-z\s\-]+)\s*<\/h/i);
    if (deptMatch) {
      department = deptMatch[1].replace(/&amp;/g, "&").trim();
      // Skip if it's just "Teacher" or generic
      if (department === "Teacher" || department.length < 3) {
        department = "Unknown";
      }
    }

    // Parse rows
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(table)) !== null) {
      const rowHtml = rowMatch[1];
      // Skip header row
      if (rowHtml.includes("<th") || rowHtml.includes("Teacher") && rowHtml.includes("Class 1")) {
        continue;
      }
      
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        let cellContent = cellMatch[1]
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .replace(/&nbsp;|\u00A0/g, " ")
          .replace(/&amp;/g, "&")
          .trim();
        cells.push(cellContent);
      }
      
      if (cells.length < 8) continue; // Need teacher + 7 periods
      const teacher = cells[0];
      if (!teacher || teacher === "") continue;
      
      const periods: Record<number, string | null> = {};
      for (let i = 1; i <= 7; i++) {
        const className = cells[i] || "";
        periods[i] = className === "" || className === "&nbsp;" ? null : className;
      }
      
      teachers.push({
        teacher,
        department,
        periods,
      });
    }
  }

  return { teachers, lastUpdated };
}

// Helper to determine subject category for coloring
export function getSubjectCategory(className: string | null): string {
  if (!className) return "none";
  const lower = className.toLowerCase();
  
  if (lower.includes("math") || lower.includes("calc") || lower.includes("im") || lower.includes("ma") || lower.includes("stats") || lower.includes("fin lit")) {
    return "math";
  }
  if (lower.includes("english") || lower.includes("journalism") || lower.includes("creative/public")) {
    return "english";
  }
  if (lower.includes("history") || lower.includes("civics") || lower.includes("econ") || lower.includes("mwh") || lower.includes("ush") || lower.includes("psychology") || lower.includes("world cultures") || lower.includes("dir studies")) {
    return "social";
  }
  if (lower.includes("bio") || lower.includes("chem") || lower.includes("physics") || lower.includes("anat") || lower.includes("apes") || lower.includes("entomology") || lower.includes("guitar eng")) {
    return "science";
  }
  if (lower.includes("spanish") || lower.includes("french") || lower.includes("chinese") || lower.includes("foundations")) {
    return "language";
  }
  if (lower.includes("art") || lower.includes("ceramic")) {
    return "art";
  }
  if (lower.includes("band") || lower.includes("orchestra") || lower.includes("choir") || lower.includes("jazz") || lower.includes("pms") || lower.includes("acting") || lower.includes("theater")) {
    return "performing";
  }
  if (lower.includes("pe") || lower.includes("dance") || lower.includes("weight")) {
    return "pe";
  }
  if (lower.includes("cs") || lower.includes("ap csp") || lower.includes("ap csa") || lower.includes("robotics") || lower.includes("tech") || lower.includes("business")) {
    return "cs";
  }
  if (lower.includes("cec") || lower.includes("lc") || lower.includes("sc lc") || lower.includes("hb") || lower.includes("mhs")) {
    return "special";
  }
  if (lower.includes("prep") || lower.includes("asb") || lower.includes("apt") || lower.includes("yearbook") || lower.includes("affinity")) {
    return "prep";
  }
  
  return "other";
}

// Check if class is AP or Honors
export function isAPOrHonors(className: string | null): { isAP: boolean; isHonors: boolean } {
  if (!className) return { isAP: false, isHonors: false };
  const lower = className.toLowerCase();
  const isAP = lower.includes("ap ");
  const isHonors = lower.includes(" h") || lower.startsWith("h ") || lower.includes("/h") || lower.endsWith(" h");
  return { isAP, isHonors };
}

// Get color classes for subject
export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    math: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700",
    english: "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700",
    social: "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700",
    science: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700",
    language: "bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100 border-pink-300 dark:border-pink-700",
    art: "bg-rose-100 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 border-rose-300 dark:border-rose-700",
    performing: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-900 dark:text-fuchsia-100 border-fuchsia-300 dark:border-fuchsia-700",
    pe: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 border-orange-300 dark:border-orange-700",
    cs: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-100 border-cyan-300 dark:border-cyan-700",
    special: "bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600",
    prep: "bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600",
    other: "bg-neutral-100 dark:bg-neutral-800/30 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600",
    none: "bg-transparent",
  };
  return colors[subject] || colors.other;
}
