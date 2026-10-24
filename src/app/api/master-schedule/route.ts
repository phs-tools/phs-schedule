import { fetchMasterSchedule } from "@/lib/master-schedule";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await fetchMasterSchedule();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in master-schedule API:", error);
    return NextResponse.json({ teachers: [] }, { status: 500 });
  }
}
