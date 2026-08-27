import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import JourneyEditClient from "@/components/profile/JourneyEditClient";
import ServicesEditClient from "@/components/profile/ServicesEditClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Profile" };

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <main className="flex-1 px-4 pt-6 pb-12 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-8">
          Edit Profile
        </h1>

        {/* PROFILE EDIT */}
        <section className="mb-8">
          <div className="card-3d p-6 shadow-sm">
            <ProfileEditForm profile={profile} />
          </div>
        </section>

        {/* MY JOURNEY (Camp History) */}
        <JourneyEditClient userId={user.id} initialHistory={profile.camp_history || []} />

        {/* MY SERVICES (Volunteer History) */}
        <ServicesEditClient userId={user.id} initialServices={profile.services_history || []} />
    </main>
  );
}
