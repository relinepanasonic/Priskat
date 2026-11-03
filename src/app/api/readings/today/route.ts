import { NextResponse } from "next/server";
import { getTodayReadings } from "@/lib/bacaanHarian";
import { readingTitle } from "@/lib/readingText";

/** Today's Mass readings as plain lines (references only), for the phone widget. */
export async function GET() {
  const day = await getTodayReadings();
  if (!day) return NextResponse.json({ celebration: "", readings: [] }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  return NextResponse.json(
    {
      celebration: day.celebration,
      readings: day.readings.map((r) => ({ label: r.label, title: readingTitle(r.display, r.book) })),
    },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } }
  );
}
