import { getTodayReadings } from "@/lib/bacaanHarian";
import { seasonFromCelebration } from "@/lib/ekaristi";
import EkaristiClient from "./EkaristiClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ekaristi" };

export default async function EkaristiPage() {
  const today = await getTodayReadings();
  return <EkaristiClient defaultSeason={seasonFromCelebration(today?.celebration)} celebration={today?.celebration ?? null} />;
}
