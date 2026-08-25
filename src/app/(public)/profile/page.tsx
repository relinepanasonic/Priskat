import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { Shield, BookOpen } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch today's devotion
  const today = new Date().toISOString().split("T")[0];
  const { data: devotion } = await supabase
    .from("daily_devotions")
    .select("*")
    .eq("publish_date", today)
    .single();

  const completed = profile.completed_modules || [];

  return (
    <main className="flex-1 px-4 pt-6 pb-12 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {profile.full_name.split(" ")[0]}!
        </h1>
        <p className="text-brand-muted mb-8 text-sm">Have a blessed day.</p>

        {/* BADGES SECTION */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand-gold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> My Journey
          </h2>
          <div className="flex flex-col gap-3">
            {profile.gender === "male" ? (
              <>
                <div className={`p-4 rounded-xl border ${completed.includes('module_1') ? 'bg-brand-surface border-brand-gold shadow-lg shadow-brand-gold/10' : 'bg-brand-bg border-brand-border opacity-50'}`}>
                  <h3 className="font-bold text-white text-lg">Pria Sejati Katolik</h3>
                  <p className="text-sm text-brand-light">Young Man (Module 1)</p>
                </div>
                <div className={`p-4 rounded-xl border ${completed.includes('module_2') ? 'bg-brand-surface border-brand-gold shadow-lg shadow-brand-gold/10' : 'bg-brand-bg border-brand-border opacity-50'}`}>
                  <h3 className="font-bold text-white text-lg">Bapa Sejati</h3>
                  <p className="text-sm text-brand-light">Module 2</p>
                </div>
                <div className={`p-4 rounded-xl border ${completed.includes('module_3') ? 'bg-brand-surface border-brand-gold shadow-lg shadow-brand-gold/10' : 'bg-brand-bg border-brand-border opacity-50'}`}>
                  <h3 className="font-bold text-white text-lg">Patriot</h3>
                  <p className="text-sm text-brand-light">Module 3</p>
                </div>
              </>
            ) : profile.gender === "female" ? (
              <div className={`p-4 rounded-xl border ${completed.includes('module_1') ? 'bg-brand-surface border-brand-gold shadow-lg shadow-brand-gold/10' : 'bg-brand-bg border-brand-border opacity-50'}`}>
                <h3 className="font-bold text-white text-lg">Wanita Berhikmat Katolik</h3>
                <p className="text-sm text-brand-light">Module 1</p>
              </div>
            ) : (
              <div className="p-4 card-3d text-center text-sm text-brand-muted">
                Please edit your profile and set your gender to see your module track.
              </div>
            )}
          </div>
        </section>

        {/* DAILY DEVOTION SECTION */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand-gold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Daily Inspiration
          </h2>
          {devotion ? (
            <div className="card-3d overflow-hidden">
              <div className="p-5 border-b border-brand-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">Verse of the Day</span>
                <p className="text-white italic text-lg leading-relaxed mb-3">"{devotion.verse_text}"</p>
                <p className="text-brand-gold font-medium text-sm">— {devotion.verse_reference}</p>
              </div>
              <div className="p-5 bg-brand-surface-hover/30">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">{devotion.prayer_title}</span>
                <p className="text-brand-light text-sm leading-relaxed whitespace-pre-wrap">{devotion.prayer_text}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 card-3d text-center text-brand-muted text-sm">
              Today's devotion has not been posted yet.
            </div>
          )}
        </section>

        {/* QUICK LINKS */}
        <section className="mb-10 grid grid-cols-2 gap-4">
          <Link href="/prayers" className="p-4 bg-brand-surface rounded-xl border border-brand-border text-center flex flex-col items-center gap-2 hover:border-brand-gold transition">
             <span className="text-2xl">🙏</span>
             <span className="text-sm font-medium text-white">Doa / Prayers</span>
          </Link>
          <Link href="/gallery" className="p-4 bg-brand-surface rounded-xl border border-brand-border text-center flex flex-col items-center gap-2 hover:border-brand-gold transition">
             <span className="text-2xl">📸</span>
             <span className="text-sm font-medium text-white">Gallery</span>
          </Link>
          <Link href="/news" className="p-4 bg-brand-surface rounded-xl border border-brand-border text-center flex flex-col items-center gap-2 hover:border-brand-gold transition">
             <span className="text-2xl">📰</span>
             <span className="text-sm font-medium text-white">News</span>
          </Link>
          <Link href="/events" className="p-4 bg-brand-surface rounded-xl border border-brand-border text-center flex flex-col items-center gap-2 hover:border-brand-gold transition">
             <span className="text-2xl">📅</span>
             <span className="text-sm font-medium text-white">Events</span>
          </Link>
        </section>

        {/* PROFILE EDIT */}
        <section>
          <h2 className="text-xl font-semibold text-brand-gold mb-4">Edit Profile</h2>
          <div className="card-3d p-6 shadow-sm">
            <ProfileEditForm profile={profile} />
          </div>
        </section>

    </main>
  );
}
