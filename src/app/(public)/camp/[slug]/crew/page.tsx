"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Tent, Users, ArrowRight, Trash2, Handshake, X } from "lucide-react";
import AddCampModal from "@/components/camp/AddCampModal";
import Link from "next/link";
import { useParams } from "next/navigation";
import { resolveCommunity, sortCommunities } from "@/lib/community";
import { formatDate } from "@/lib/utils";

export default function CampCrewPage() {
  const params = useParams();
  const slug = (params.slug as string) || "";
  const [camps, setCamps] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [moveCamp, setMoveCamp] = useState<{ id: string; name: string } | null>(null);
  const [collabTab, setCollabTab] = useState<"community" | "person">("community");
  const [collabIds, setCollabIds] = useState<string[]>([]);
  const [collabMsg, setCollabMsg] = useState("");
  const [personQ, setPersonQ] = useState("");
  const [personResults, setPersonResults] = useState<{ id: string; full_name: string | null; username: string | null }[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCamps = async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Check role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile && (profile.role === "founder" || profile.role === "superadmin" || profile.role === "admin")) {
        setIsSuperadmin(true);
      }
    }

    // This workspace = one community
    const community = await resolveCommunity(supabase, slug);
    if (!community) {
      setNotFound(true);
      setCamps([]);
      setIsLoading(false);
      return;
    }
    setNotFound(false);
    setCommunityId(community.id);

    const { data } = await supabase
      .from("camp_cohorts")
      .select("*, camp_crew(count)")
      .eq("community_id", community.id)
      .order("created_at", { ascending: false });

    // camps other communities shared with this one (collaboration)
    let shared: any[] = [];
    const { data: collabs } = await supabase.from("camp_collaborations").select("cohort_id").eq("community_id", community.id);
    const sharedIds = ((collabs as { cohort_id: string }[]) ?? []).map((r) => r.cohort_id);
    if (sharedIds.length) {
      const { data: sc } = await supabase.from("camp_cohorts").select("*, camp_crew(count)").in("id", sharedIds);
      shared = ((sc as any[]) ?? []).map((c) => ({ ...c, _shared: true }));
    }
    if (data) setCamps([...data, ...shared]);

    const { data: comms } = await supabase
      .from("communities")
      .select("id, name")
      .order("created_at", { ascending: true });
    if (comms) setCommunities(sortCommunities(comms));

    setIsLoading(false);
  };

  const handleDeleteCamp = async (e: any, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this camp? This will also delete all tasks, meetings, chats, and crew assignments associated with it.")) return;

    const supabase = createClient();
    await supabase.from("camp_cohorts").delete().eq("id", id);
    fetchCamps();
  };

  const doCollabCommunity = async (targetCommunityId: string, add: boolean) => {
    if (!moveCamp) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("camp_collab_community", { p_cohort: moveCamp.id, p_community: targetCommunityId, p_add: add });
    setCollabMsg(error ? error.message : add ? "Camp dibagikan ke komunitas itu." : "Kolaborasi dihapus.");
    if (!error) {
      setCollabIds((prev) => (add ? [...prev, targetCommunityId] : prev.filter((x) => x !== targetCommunityId)));
      fetchCamps();
    }
  };

  const openCollab = async (camp: any, name: string) => {
    setMoveCamp({ id: camp.id, name });
    setCollabTab("community");
    setCollabMsg("");
    setPersonQ("");
    setPersonResults([]);
    const supabase = createClient();
    const { data } = await supabase.from("camp_collaborations").select("community_id").eq("cohort_id", camp.id);
    setCollabIds(((data as { community_id: string }[]) ?? []).map((r) => r.community_id));
  };

  const searchPeople = async (q: string) => {
    setPersonQ(q);
    if (q.trim().length < 2) { setPersonResults([]); return; }
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("id, full_name, username").ilike("full_name", `%${q.trim()}%`).eq("is_bot", false).limit(8);
    setPersonResults((data as { id: string; full_name: string | null; username: string | null }[]) ?? []);
  };

  const doCollabPerson = async (userId: string, name: string) => {
    if (!moveCamp) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("camp_collab_person", { p_cohort: moveCamp.id, p_user: userId });
    setCollabMsg(error ? error.message : `Undangan dikirim ke ${name}. Camp muncul di Timeline Saya miliknya.`);
  };

  return (
    <div className="p-5 md:p-8 space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Camp Directory</h2>
          <p className="text-brand-muted mt-1">Directory of all camps and their crew members.</p>
        </div>
        {isSuperadmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" /> Add New Camp
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-500">Loading camps...</div>
      ) : notFound ? (
        <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-10 text-center flex flex-col items-center">
          <Tent className="w-10 h-10 text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Community not found</h3>
          <p className="text-sm text-gray-400">
            This link is broken. Open the community from the list again.
          </p>
        </div>
      ) : camps.length === 0 ? (
        <div className="bg-[#1a1d24] border border-[#333] rounded-xl p-10 text-center flex flex-col items-center">
          <Tent className="w-10 h-10 text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Camps Found</h3>
          <p className="text-sm text-gray-400 mb-6">There are currently no camps in the directory.</p>
          {isSuperadmin && (
            <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm">
              Create the first Camp
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp) => (
            <Link href={`/camp/${slug}/ongoing/${camp.id}`} key={camp.id}>
              <div className="bg-[#111] border border-[#333] hover:border-brand-gold/50 rounded-2xl p-6 transition-all hover:bg-[#15181e] group h-full flex flex-col cursor-pointer shadow-lg hover:shadow-brand-gold/10 relative">

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-brand-gold/10 p-3 rounded-xl text-brand-gold">
                    <Tent className="w-6 h-6" />
                  </div>
                  <span className="bg-[#222] text-xs font-bold px-3 py-1 rounded-full text-gray-300 border border-[#333]">
                    {camp.branch}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-gold transition-colors">
                  {camp.camp_name === "Other Event" ? camp.custom_name : camp.camp_name}
                </h3>
                <p className="text-brand-muted font-medium mb-2">
                  {camp.camp_name !== "Other Event" ? `Angkatan ${camp.angkatan}` : "Custom Event"}
                </p>
                <p className="text-xs text-gray-500 mb-6 flex items-center gap-1">
                  Start Date: {camp.start_date ? formatDate(camp.start_date) : "Not set"}
                </p>
                
                <div className="mt-auto pt-4 border-t border-[#222] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Crew: <span className="text-white font-semibold">{camp.camp_crew?.[0]?.count || 0} members</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSuperadmin && !camp._shared && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openCollab(camp, camp.camp_name === "Other Event" ? camp.custom_name : `${camp.camp_name} ${camp.angkatan}`);
                        }}
                        className="p-1.5 text-[#555] hover:text-brand-gold hover:bg-[#222] transition-colors rounded"
                        title="Collaboration"
                      >
                        <Handshake className="w-4 h-4" />
                      </button>
                    )}
                    {camp._shared && <span className="rounded-full border border-brand-gold/40 px-2 py-0.5 text-[10px] font-semibold text-brand-gold">Kolaborasi</span>}
                    {isSuperadmin && !camp._shared && (
                      <button
                        onClick={(e) => handleDeleteCamp(e, camp.id)}
                        className="p-1.5 text-[#555] hover:text-brand-gold hover:bg-[#222] transition-colors rounded"
                        title="Delete Camp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ArrowRight className="w-5 h-5 text-[#555] group-hover:text-brand-gold transition-colors" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

      <AddCampModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchCamps} communityId={communityId} />

      {moveCamp && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setMoveCamp(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#2a2d35] bg-[#16181d] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-white">Collaboration</h3>
              <button onClick={() => setMoveCamp(null)} className="text-brand-muted hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-brand-muted">
              Share <span className="text-white">{moveCamp.name}</span> with:
            </p>
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-black/30 p-1 text-xs font-semibold">
              {(["community", "person"] as const).map((t) => (
                <button key={t} onClick={() => { setCollabTab(t); setCollabMsg(""); }}
                  className={"rounded-md px-3 py-2 " + (collabTab === t ? "bg-brand-gold text-brand-dark" : "text-brand-muted")}>
                  {t === "community" ? "Another community" : "A person"}
                </button>
              ))}
            </div>
            {collabTab === "community" ? (
              <div className="max-h-64 space-y-1.5 overflow-y-auto">
                {communities.filter((c) => c.id !== communityId).map((c) => {
                  const on = collabIds.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => doCollabCommunity(c.id, !on)}
                      className="flex w-full items-center justify-between rounded-lg border border-[#333] px-3 py-2.5 text-left text-sm text-brand-light hover:bg-white/5">
                      {c.name}
                      <span className={"text-[11px] " + (on ? "text-brand-gold" : "text-brand-muted")}>{on ? "Shared - tap to remove" : "Share"}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <input value={personQ} onChange={(e) => searchPeople(e.target.value)} placeholder="Search a name..."
                  className="w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none" />
                <div className="mt-2 max-h-52 space-y-1.5 overflow-y-auto">
                  {personResults.map((p) => (
                    <button key={p.id} onClick={() => doCollabPerson(p.id, p.full_name || p.username || "")}
                      className="flex w-full items-center justify-between rounded-lg border border-[#333] px-3 py-2.5 text-left text-sm text-brand-light hover:bg-white/5">
                      {p.full_name || p.username}
                      <span className="text-[11px] text-brand-muted">Invite</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-brand-muted">The camp appears in their Timeline Saya as an invitation.</p>
              </div>
            )}
            {collabMsg && <p className="mt-3 text-xs text-brand-gold">{collabMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
