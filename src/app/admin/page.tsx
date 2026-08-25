import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Newspaper, Calendar, Users, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: postCount },
    { count: eventCount },
    { count: memberCount },
    { count: commentCount },
  ] = await Promise.all([
    supabase.from("news_posts").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("news_comments").select("id", { count: "exact", head: true }).eq("is_hidden", false),
  ]);

  const stats = [
    { label: "News Posts", value: postCount ?? 0, icon: Newspaper, href: "/admin/news", color: "text-brand-blue bg-brand-blue-50" },
    { label: "Events", value: eventCount ?? 0, icon: Calendar, href: "/admin/events", color: "text-brand-gold bg-brand-gold-50" },
    { label: "Members", value: memberCount ?? 0, icon: Users, href: "/admin/members", color: "text-green-600 bg-green-50" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{value}</p>
              <p className="text-sm text-stone-500">{label}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-stone-800">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/news/new" className="flex items-center gap-2 rounded-lg bg-brand-blue-50 px-4 py-2.5 text-sm font-medium text-brand-blue hover:bg-brand-blue-100 transition-colors">
              <Newspaper className="h-4 w-4" /> Write a news post
            </Link>
            <Link href="/admin/events/new" className="flex items-center gap-2 rounded-lg bg-brand-gold-50 px-4 py-2.5 text-sm font-medium text-brand-gold-400 hover:bg-brand-gold-100 transition-colors">
              <Calendar className="h-4 w-4" /> Create an event
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-stone-800">Activity Summary</h2>
          <p className="text-sm text-stone-500">
            {commentCount} active comments · {memberCount} members
          </p>
          <Link href="/admin/members" className="mt-3 inline-flex items-center gap-1 text-sm text-brand-blue hover:underline">
            Manage members <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
