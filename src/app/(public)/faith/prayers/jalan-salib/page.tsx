import type { Metadata } from "next";
import JalanSalibClient from "@/components/prayers/JalanSalibClient";

export const metadata: Metadata = { title: "Jalan Salib" };

// Opt out of layout so we get full-screen
export default function JalanSalibPage() {
  return <JalanSalibClient />;
}
