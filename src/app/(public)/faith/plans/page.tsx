import { redirect } from "next/navigation";

// "Rencana Baca" is the same as Renungan (devotions)
export default function PlansPage() {
  redirect("/faith/devotions");
}
