import type { Metadata } from "next";
import RosarioClient from "@/components/prayers/RosarioClient";

export const metadata: Metadata = { title: "Rosario" };

export default function RosarioPage() {
  return <RosarioClient />;
}
