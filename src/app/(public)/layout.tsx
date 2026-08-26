import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import { getLanguage } from "@/lib/lang";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLanguage();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-brand-dark">
      <Navbar profile={profile} lang={lang} />
      <main className="flex-1 overflow-x-hidden md:h-screen md:overflow-y-auto">{children}</main>
    </div>
  );
}
