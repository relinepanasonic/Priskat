import { getLanguage } from "@/lib/lang";
import { createClient } from "@/lib/supabase/server";
import IntensiClient from "./IntensiClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Intensi Doa" };

export default async function IntensiPage() {
  const isId = (await getLanguage()) === "id";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <IntensiClient isId={isId} signedIn={!!user} />;
}
