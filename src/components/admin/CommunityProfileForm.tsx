"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Shield, Trash2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { updateCommunityProfile } from "@/app/actions/community";
import UserPicker, { type PickedUser } from "@/components/events/workspace/UserPicker";
import { Card, Field, Switch, inputCls } from "@/components/events/workspace/ui";

type Community = { id: string; name: string; slug: string | null; description: string | null; logo_url: string | null; vision: string | null; mission: string | null; motto: string | null; tagline: string | null; is_public: boolean | null };
type AdminRow = { id: string; user_id: string; role: string; profiles: { full_name: string | null; username: string | null } | null };

const isOwner = (r: string) => r === "owner" || r === "superadmin";

/**
 * The community profile: only the community's Super admin (or the site) edits it; an Admin sees it.
 * Below it, the people who run the community: a Super admin adds and removes the Admins of this community.
 */
export default function CommunityProfileForm({ community, admins, canEdit }: { community: Community; admins: AdminRow[]; canEdit: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(community.name ?? "");
  const [tagline, setTagline] = useState(community.tagline ?? "");
  const [motto, setMotto] = useState(community.motto ?? "");
  const [description, setDescription] = useState(community.description ?? "");
  const [vision, setVision] = useState(community.vision ?? "");
  const [mission, setMission] = useState(community.mission ?? "");
  const [logo, setLogo] = useState(community.logo_url ?? "");
  const [isPublic, setIsPublic] = useState(community.is_public !== false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [newAdmin, setNewAdmin] = useState<PickedUser | null>(null);

  async function uploadLogo(file: File) {
    setUploading(true); setMsg(null);
    try {
      // the community's own folder in the org-structure bucket: its admins may write there
      setLogo(await uploadImage(file, "org-structure", `${community.id}/logo-${Date.now()}.webp`));
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message || "Logo belum bisa diunggah." });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true); setMsg(null);
    const fd = new FormData();
    fd.append("name", name); fd.append("description", description); fd.append("logo_url", logo); fd.append("vision", vision);
    fd.append("mission", mission); fd.append("motto", motto); fd.append("tagline", tagline); fd.append("is_public", String(isPublic));
    const res = await updateCommunityProfile(community.id, fd);
    setBusy(false);
    if (res.error) { setMsg({ ok: false, text: res.error }); return; }
    setMsg({ ok: true, text: "Profil komunitas tersimpan." });
    router.refresh();
  }

  async function addAdmin() {
    if (!newAdmin) return;
    const { error } = await (createClient() as any).from("community_admins").insert({ community_id: community.id, user_id: newAdmin.id, role: "admin" });
    if (error) { setMsg({ ok: false, text: /duplicate|unique/i.test(error.message) ? "Orang ini sudah admin komunitas." : error.message }); return; }
    setNewAdmin(null); setMsg({ ok: true, text: "Admin ditambahkan." }); router.refresh();
  }
  async function removeAdmin(a: AdminRow) {
    if (!confirm(`Cabut ${a.profiles?.full_name ?? "admin"} dari admin komunitas ini?`)) return;
    const { error } = await (createClient() as any).from("community_admins").delete().eq("id", a.id);
    if (error) { setMsg({ ok: false, text: error.message }); return; }
    router.refresh();
  }

  const dis = !canEdit;
  const field = `${inputCls} ${dis ? "cursor-not-allowed opacity-70" : ""}`;

  return (
    <div className="space-y-5">
      {!canEdit && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-200">Kamu admin komunitas ini: kamu bisa melihat profilnya. Yang mengubah profil adalah Super admin komunitas.</p>}

      <Card title="Profil komunitas">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10">
            {logo ? <Image src={logo} alt="" width={80} height={80} className="h-full w-full object-contain" /> : <ImagePlus className="h-7 w-7 text-gray-500" />}
          </div>
          {canEdit && (
            <label className={`cursor-pointer rounded-xl border border-[#333] px-4 py-2.5 text-sm font-semibold text-brand-light hover:bg-white/5 ${uploading ? "opacity-60" : ""}`}>
              {uploading ? "Mengunggah..." : logo ? "Ganti logo" : "Unggah logo"}
              <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { const x = e.target.files?.[0]; if (x) void uploadLogo(x); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <Field label="Nama komunitas"><input value={name} onChange={(e) => setName(e.target.value)} disabled={dis} className={field} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tagline"><input value={tagline} onChange={(e) => setTagline(e.target.value)} disabled={dis} className={field} /></Field>
          <Field label="Motto"><input value={motto} onChange={(e) => setMotto(e.target.value)} disabled={dis} className={field} /></Field>
        </div>
        <Field label="Deskripsi"><textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={dis} rows={4} className={`${field} rounded-2xl`} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Visi"><textarea value={vision} onChange={(e) => setVision(e.target.value)} disabled={dis} rows={3} className={`${field} rounded-2xl`} /></Field>
          <Field label="Misi"><textarea value={mission} onChange={(e) => setMission(e.target.value)} disabled={dis} rows={3} className={`${field} rounded-2xl`} /></Field>
        </div>
        <Switch checked={isPublic} onChange={(v) => canEdit && setIsPublic(v)} label="Komunitas terbuka" hint="Kalau mati, komunitas ini privat dan orang harus meminta bergabung." />
        {msg && <p className={`rounded-lg px-3 py-2 text-xs ${msg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{msg.text}</p>}
        {canEdit && <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan profil"}</button>}
      </Card>

      <Card title="Yang menjalankan komunitas" hint="Super admin mengubah profil dan mengatur admin. Admin mengurus anggota, Komsel, dan event.">
        <ul className="divide-y divide-[#2a2d35] rounded-xl border border-[#2a2d35]">
          {admins.length === 0 && <li className="px-4 py-4 text-center text-sm text-brand-muted">Belum ada admin.</li>}
          {admins.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{a.profiles?.full_name ?? "-"}</p>
                <p className="truncate text-xs text-brand-muted">@{a.profiles?.username ?? ""}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${isOwner(a.role) ? "bg-brand-gold/15 text-brand-gold" : "bg-white/10 text-brand-light"}`}><Shield className="h-3 w-3" /> {isOwner(a.role) ? "Super admin" : "Admin"}</span>
                {canEdit && !isOwner(a.role) && <button onClick={() => void removeAdmin(a)} aria-label="Cabut admin" className="rounded p-1.5 text-[#777] hover:bg-red-400/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>}
              </div>
            </li>
          ))}
        </ul>
        {canEdit && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-light">Tambah admin</p>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1"><UserPicker value={newAdmin} onChange={setNewAdmin} placeholder="Cari nama anggota" /></div>
              <button onClick={() => void addAdmin()} disabled={!newAdmin} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-gold px-4 text-sm font-bold text-brand-dark disabled:opacity-50"><UserPlus className="h-4 w-4" /> Tambah</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
