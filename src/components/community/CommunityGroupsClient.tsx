"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, MessagesSquare, Pencil, Plus, Search, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Kind = "city" | "sister_community";
type Status = "active" | "invited" | "requested";
type Person = { id: string; full_name: string | null; nama_panggilan: string | null; username: string | null };
type Group = { id: string; name: string; kind: Kind; area: string | null; description: string | null; leader_id: string | null; chat_group_id: string | null };
type Member = { id: string; group_id: string; user_id: string; status: Status; profile: Person | null };

const KIND_LABEL: Record<Kind, string> = { city: "City", sister_community: "Sister community" };
const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";
const btn = "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors";
const db = () => createClient() as any;
const nameOf = (p: Person | null | undefined) => p?.nama_panggilan || p?.full_name || p?.username || "Unnamed";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:rounded-3xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
        <h3 className="pr-8 text-lg font-bold text-white">{title}</h3>
        {children}
      </div>
    </div>
  );
}

/** Search the members of this community by name. */
function PersonPicker({ communityId, exclude = [], onPick }: { communityId: string; exclude?: string[]; onPick: (p: Person) => void }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Person[]>([]);
  const excludeKey = exclude.join(",");
  useEffect(() => {
    const t = setTimeout(async () => {
      let query = db()
        .from("community_memberships")
        .select("user_id, profiles!inner(id, full_name, nama_panggilan, username)")
        .eq("community_id", communityId)
        .limit(20);
      const term = q.trim().replace(/[%,()]/g, "");
      if (term) query = query.or(`full_name.ilike.%${term}%,nama_panggilan.ilike.%${term}%,username.ilike.%${term}%`, { referencedTable: "profiles" });
      const { data } = await query;
      setRows(((data ?? []) as { profiles: Person }[]).map((r) => r.profiles).filter((p) => p && !excludeKey.split(",").includes(p.id)));
    }, 250);
    return () => clearTimeout(t);
  }, [q, communityId, excludeKey]);
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className={`${input} pl-9`} autoFocus />
      </div>
      <div className="max-h-64 divide-y divide-[#2a2e37] overflow-y-auto rounded-lg border border-[#333]">
        {rows.length === 0 && <p className="p-3 text-sm text-brand-muted">No members found.</p>}
        {rows.map((p) => (
          <button key={p.id} onClick={() => onPick(p)} className="block w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/5">
            {nameOf(p)} {p.username && <span className="text-brand-muted">@{p.username}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Community Center → Group: sub-communities of one community (by city or by sister community).
 * Each Group has a leader and members, and its own chat in Messages → Group.
 * Community admins manage everything here; the database (RLS + functions) enforces who may do what.
 */
export default function CommunityGroupsClient({ communityId, communityName }: { communityId: string; communityName: string }) {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<null | { kind: "form"; group?: Group } | { kind: "invite" }>(null);
  const [form, setForm] = useState({ name: "", kind: "city" as Kind, area: "", description: "", leader: null as Person | null });

  const load = useCallback(async () => {
    const g = await db().from("community_groups").select("id, name, kind, area, description, leader_id, chat_group_id").eq("community_id", communityId).order("name");
    if (g.error) {
      setGroups([]);
      setError(g.error.code === "42P01" || g.error.message.includes("does not exist") ? "This feature is not active yet. Run supabase/147_community_groups.sql in Supabase." : g.error.message);
      return;
    }
    const list = (g.data ?? []) as Group[];
    setGroups(list);
    const ids = list.map((x) => x.id);
    if (!ids.length) return setMembers([]);
    const m = await db()
      .from("community_group_members")
      .select("id, group_id, user_id, status, profile:profiles!user_id(id, full_name, nama_panggilan, username)")
      .in("group_id", ids)
      .order("created_at");
    setMembers((m.data ?? []) as Member[]);
  }, [communityId]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(fn: string, args: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const { error: e } = await db().rpc(fn, args);
    setBusy(false);
    if (e) {
      setError(e.message);
      return false;
    }
    await load();
    return true;
  }

  function openForm(group?: Group) {
    const leader = group ? members.find((m) => m.group_id === group.id && m.user_id === group.leader_id)?.profile ?? null : null;
    setForm({ name: group?.name ?? "", kind: group?.kind ?? "city", area: group?.area ?? "", description: group?.description ?? "", leader });
    setModal({ kind: "form", group });
  }

  async function save() {
    if (form.name.trim().length < 2) return setError("Give the Group a name.");
    if (!form.leader) return setError("Pick a leader.");
    const args = { p_name: form.name, p_kind: form.kind, p_area: form.area, p_description: form.description, p_leader: form.leader.id };
    const g = modal?.kind === "form" ? modal.group : undefined;
    const ok = g ? await run("update_community_group", { p_group: g.id, ...args }) : await run("create_community_group", { p_community: communityId, ...args });
    if (ok) setModal(null);
  }

  const open = groups?.find((g) => g.id === openId) ?? null;
  const ofGroup = (id: string, s: Status) => members.filter((m) => m.group_id === id && m.status === s);

  if (open) {
    const active = ofGroup(open.id, "active");
    const requests = ofGroup(open.id, "requested");
    const invited = ofGroup(open.id, "invited");
    const leader = members.find((m) => m.group_id === open.id && m.user_id === open.leader_id)?.profile;
    return (
      <div className="space-y-5 p-4 md:p-6">
        <button onClick={() => setOpenId(null)} className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-white"><ChevronLeft className="h-4 w-4" /> All Groups</button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{open.name}</h2>
            <p className="mt-1 text-sm text-brand-muted">{KIND_LABEL[open.kind]}{open.area ? ` · ${open.area}` : ""} · Leader: <span className="text-brand-gold">{nameOf(leader)}</span></p>
            {open.description && <p className="mt-2 max-w-xl text-sm text-brand-light">{open.description}</p>}
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-muted"><MessagesSquare className="h-3.5 w-3.5" /> Chat: Messages → Group (members are added automatically)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openForm(open)} className={`${btn} border border-[#333] text-white hover:bg-white/5`}><Pencil className="h-4 w-4" /> Edit</button>
            <button
              onClick={async () => { if (confirm(`Delete "${open.name}" and its chat? This cannot be undone.`) && (await run("delete_community_group", { p_group: open.id }))) setOpenId(null); }}
              className={`${btn} border border-red-500/40 text-red-400 hover:bg-red-500/10`}
            ><Trash2 className="h-4 w-4" /> Delete</button>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        {requests.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Requests to join ({requests.length})</h3>
            {requests.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-[#333] bg-[#14171c] px-3 py-2.5">
                <span className="text-sm text-white">{nameOf(m.profile)}</span>
                <span className="flex gap-2">
                  <button disabled={busy} onClick={() => run("decide_community_group_request", { p_group: open.id, p_user: m.user_id, p_approve: true })} className={`${btn} bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25`}><Check className="h-4 w-4" /> Approve</button>
                  <button disabled={busy} onClick={() => run("decide_community_group_request", { p_group: open.id, p_user: m.user_id, p_approve: false })} className={`${btn} text-red-400 hover:bg-red-500/10`}><X className="h-4 w-4" /> Reject</button>
                </span>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Members ({active.length})</h3>
            <button onClick={() => setModal({ kind: "invite" })} className={`${btn} bg-brand-gold text-brand-dark hover:opacity-90`}><UserPlus className="h-4 w-4" /> Invite</button>
          </div>
          {active.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-[#333] bg-[#14171c] px-3 py-2.5">
              <span className="text-sm text-white">{nameOf(m.profile)} {m.user_id === open.leader_id && <span className="ml-2 rounded-full bg-brand-gold/20 px-2 py-0.5 text-[11px] font-bold text-brand-gold">Leader</span>}</span>
              {m.user_id !== open.leader_id && (
                <button disabled={busy} onClick={() => confirm(`Remove ${nameOf(m.profile)} from this Group?`) && run("remove_community_group_member", { p_group: open.id, p_user: m.user_id })} aria-label="Remove" className="rounded-lg p-2 text-brand-muted hover:bg-red-500/10 hover:text-red-400"><UserMinus className="h-4 w-4" /></button>
              )}
            </div>
          ))}
        </section>

        {invited.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Invited, waiting for an answer ({invited.length})</h3>
            {invited.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-dashed border-[#333] px-3 py-2.5">
                <span className="text-sm text-brand-light">{nameOf(m.profile)}</span>
                <button disabled={busy} onClick={() => run("remove_community_group_member", { p_group: open.id, p_user: m.user_id })} className={`${btn} text-brand-muted hover:text-white`}>Cancel invite</button>
              </div>
            ))}
          </section>
        )}

        {modal?.kind === "invite" && (
          <Modal title="Invite a member" onClose={() => setModal(null)}>
            <p className="text-xs text-brand-muted">They get an invitation to accept. Members of {communityName} only.</p>
            <PersonPicker communityId={communityId} exclude={members.filter((m) => m.group_id === open.id).map((m) => m.user_id)} onPick={async (p) => { if (await run("invite_to_community_group", { p_group: open.id, p_user: p.id })) setModal(null); }} />
          </Modal>
        )}
        {modal?.kind === "form" && formModal()}
      </div>
    );
  }

  function formModal() {
    const editing = modal?.kind === "form" && modal.group;
    return (
      <Modal title={editing ? "Edit Group" : "New Group"} onClose={() => setModal(null)}>
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs text-brand-muted">Name</label><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Surabaya" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-brand-muted">Divided by</label>
              <select className={input} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}>
                <option value="city">City</option>
                <option value="sister_community">Sister community</option>
              </select>
            </div>
            <div><label className="mb-1 block text-xs text-brand-muted">{form.kind === "city" ? "City" : "Sister community"}</label><input className={input} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
          </div>
          <div><label className="mb-1 block text-xs text-brand-muted">Description (optional)</label><textarea className={input} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <label className="mb-1 block text-xs text-brand-muted">Leader</label>
            {form.leader ? (
              <div className="flex items-center justify-between rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white">{nameOf(form.leader)}<button onClick={() => setForm({ ...form, leader: null })} className="text-brand-muted hover:text-white">Change</button></div>
            ) : (
              <PersonPicker communityId={communityId} onPick={(p) => setForm({ ...form, leader: p })} />
            )}
          </div>
          {error && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-300">{error}</p>}
          <button disabled={busy} onClick={save} className={`${btn} w-full justify-center bg-brand-gold text-brand-dark hover:opacity-90`}>{busy ? "Saving…" : editing ? "Save" : "Create Group"}</button>
        </div>
      </Modal>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Group</h2>
          <p className="text-sm text-brand-muted">Sub-communities of {communityName}, by city or sister community. Each has a leader and its own chat.</p>
        </div>
        <button onClick={() => openForm()} className={`${btn} bg-brand-gold text-brand-dark hover:opacity-90`}><Plus className="h-4 w-4" /> New Group</button>
      </div>
      {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {groups === null && <p className="text-sm text-brand-muted">Loading…</p>}
      {groups?.length === 0 && !error && <p className="rounded-xl border border-dashed border-[#333] p-8 text-center text-sm text-brand-muted">No Groups yet. Create the first one.</p>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups?.map((g) => {
          const leader = members.find((m) => m.group_id === g.id && m.user_id === g.leader_id)?.profile;
          const pending = ofGroup(g.id, "requested").length;
          return (
            <button key={g.id} onClick={() => { setError(null); setOpenId(g.id); }} className="rounded-2xl border border-[#333] bg-[#14171c] p-4 text-left transition-colors hover:border-brand-gold/60">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-white">{g.name}</h3>
                {pending > 0 && <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[11px] font-bold text-brand-dark">{pending} request{pending > 1 ? "s" : ""}</span>}
              </div>
              <p className="mt-1 text-xs text-brand-muted">{KIND_LABEL[g.kind]}{g.area ? ` · ${g.area}` : ""}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-brand-light"><Users className="h-4 w-4 text-brand-muted" /> {ofGroup(g.id, "active").length} members · Leader {nameOf(leader)}</p>
            </button>
          );
        })}
      </div>
      {modal?.kind === "form" && formModal()}
    </div>
  );
}
