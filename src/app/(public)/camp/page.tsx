import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Lock, Globe, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community" };

export default async function CommunityListingPage() {
  const supabase = await createClient();

  const { data: communities } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Community</h1>
        <p className="text-brand-muted mt-1 text-sm">Pilih komunitas yang ingin kamu masuki</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(communities || []).map((c: any) => (
          <Link
            key={c.id}
            href={`/camp/${c.slug || c.id}`}
            className="group bg-[#1a1d24] border border-[#2a2d35] hover:border-brand-gold/50 rounded-2xl p-6 transition-all hover:bg-[#1e2129] shadow-lg hover:shadow-brand-gold/10"
          >
            <div className="flex items-start justify-between mb-4">
              {c.logo_url ? (
                <img src={c.logo_url} alt={c.name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-brand-gold" />
                </div>
              )}
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                c.is_public 
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" 
                  : "text-orange-400 bg-orange-500/10 border-orange-500/30"
              }`}>
                {c.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {c.is_public ? "Public" : "Private"}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-brand-gold transition-colors mb-1">
              {c.name}
            </h3>
            {c.description && (
              <p className="text-sm text-brand-muted mb-4 line-clamp-2">{c.description}</p>
            )}

            <div className="pt-4 border-t border-[#2a2d35] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>{c.member_count} members</span>
              </div>
              <span className="text-brand-gold text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Enter <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {(!communities || communities.length === 0) && (
        <div className="text-center text-brand-muted py-16">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No communities available yet.</p>
        </div>
      )}
    </div>
  );
}
