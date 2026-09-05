"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { createCommunity, updateCommunity, deleteCommunity, addCommunityAdmin, removeCommunityAdmin } from "@/app/actions/community";
import { Plus, Trash2, Edit2, UserPlus, Shield } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";

export default function CommunityCenterClient({ initialCommunities, initialAdmins, allUsers }: { initialCommunities: any[], initialAdmins: any[], allUsers: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();
  
  // State for forms
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [motto, setMotto] = useState("");
  const [tagline, setTagline] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [adminCommunityId, setAdminCommunityId] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState("");
  const [adminRole, setAdminRole] = useState("admin");

  function openEdit(community: any) {
    setEditingCommunity(community);
    setName(community.name || "");
    setSlug(community.slug || "");
    setDescription(community.description || "");
    setLogoUrl(community.logo_url || "");
    setVision(community.vision || "");
    setMission(community.mission || "");
    setMotto(community.motto || "");
    setTagline(community.tagline || "");
    setIsPublic(community.is_public !== false);
  }

  function openAdd() {
    setIsAdding(true);
    setName(""); setSlug(""); setDescription(""); setLogoUrl(""); setVision(""); setMission(""); setMotto(""); setTagline(""); setIsPublic(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('communities')
      .upload(filePath, file);

    if (uploadError) {
      alert("Error uploading file: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('communities').getPublicUrl(filePath);
    setLogoUrl(data.publicUrl);
    setIsUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("logo_url", logoUrl);
    formData.append("vision", vision);
    formData.append("mission", mission);
    formData.append("motto", motto);
    formData.append("tagline", tagline);
    formData.append("is_public", isPublic.toString());
    
    if (editingCommunity) {
      const res = await updateCommunity(editingCommunity.id, formData);
      if (res.error) alert(res.error);
      else setEditingCommunity(null);
    } else {
      const res = await createCommunity(formData);
      if (res.error) alert(res.error);
      else setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this community entirely?")) return;
    const res = await deleteCommunity(id);
    if (res.error) alert(res.error);
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminCommunityId || !adminUserId) return;
    const res = await addCommunityAdmin(adminCommunityId, adminUserId, adminRole);
    if (res.error) alert(res.error);
    else {
      setAdminCommunityId(null);
      setAdminUserId("");
      setAdminRole("admin");
    }
  }

  async function handleRemoveAdmin(id: string) {
    if (!confirm("Remove this admin?")) return;
    const res = await removeCommunityAdmin(id);
    if (res.error) alert(res.error);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Community
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {initialCommunities.map(community => (
          <div key={community.id} className="card-3d p-6 flex flex-col h-full relative group">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button onClick={() => openEdit(community)} className="p-2 text-brand-muted hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(community.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-brand-gold">{community.name}</h2>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs text-brand-muted font-mono">/{community.slug}</p>
              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                community.is_public !== false 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {community.is_public !== false ? 'Public' : 'Private'}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-6 flex-grow">{community.description}</p>
            
            <div className="border-t border-[#333] pt-4 mt-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-brand-gold" /> Admins
                </h3>
                <button 
                  onClick={() => setAdminCommunityId(community.id)}
                  className="text-xs text-brand-gold hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> Add Admin
                </button>
              </div>
              
              <div className="space-y-2">
                {initialAdmins.filter(a => a.community_id === community.id).length === 0 && (
                  <p className="text-xs text-gray-500 italic">No admins assigned.</p>
                )}
                {initialAdmins.filter(a => a.community_id === community.id).map(admin => (
                  <div key={admin.id} className="flex justify-between items-center bg-[#15181e] p-2 rounded border border-[#222]">
                    <div>
                      <p className="text-sm font-medium text-white">{admin.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500">@{admin.profiles?.username} • {admin.role}</p>
                    </div>
                    <button onClick={() => handleRemoveAdmin(admin.id)} className="text-gray-500 hover:text-red-400 p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={isAdding || !!editingCommunity} onClose={() => { setIsAdding(false); setEditingCommunity(null); }} title={editingCommunity ? "Edit Community" : "Create Community"}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm text-brand-light mb-1">Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full input-3d text-sm" placeholder="e.g. Legio Maria" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">URL Slug</label>
            <input required value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full input-3d text-sm" placeholder="e.g. legiomaria" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Logo</label>
            <div className="flex gap-2 mb-2">
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/10 file:text-brand-gold hover:file:bg-brand-gold/20" />
              {isUploading && <span className="text-xs text-gray-400 self-center">Uploading...</span>}
            </div>
            <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full input-3d text-sm" placeholder="Or paste logo URL directly" />
            {logoUrl && (
              <img src={logoUrl} alt="Preview" className="h-10 mt-2 object-contain" />
            )}
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Tagline</label>
            <input value={tagline} onChange={e => setTagline(e.target.value)} className="w-full input-3d text-sm" placeholder="e.g. Empowering Catholic Families" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Motto</label>
            <input value={motto} onChange={e => setMotto(e.target.value)} className="w-full input-3d text-sm" placeholder="e.g. Faith, Hope, Love" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Description (Short)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full input-3d text-sm h-16" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Visi</label>
            <textarea value={vision} onChange={e => setVision(e.target.value)} className="w-full input-3d text-sm h-20" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Misi</label>
            <textarea value={mission} onChange={e => setMission(e.target.value)} className="w-full input-3d text-sm h-20" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 mt-4">
            <div className="pr-4">
              <label className="block text-sm font-bold text-brand-light">Community Access</label>
              <p className="text-[11px] text-brand-muted mt-1 leading-tight">
                {isPublic 
                  ? "Public: All members in ecosystem can enter."
                  : "Private: Just member admin adds who can enter."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                isPublic ? 'bg-brand-gold' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <Button type="submit" className="w-full mt-6">{editingCommunity ? "Save Changes" : "Create"}</Button>
        </form>
      </Modal>

      <Modal open={!!adminCommunityId} onClose={() => setAdminCommunityId(null)} title="Assign Admin">
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm text-brand-light mb-1">Select User</label>
            <select required value={adminUserId} onChange={e => setAdminUserId(e.target.value)} className="w-full input-3d text-sm">
              <option value="">-- Choose User --</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Role</label>
            <select value={adminRole} onChange={e => setAdminRole(e.target.value)} className="w-full input-3d">
              <option value="owner">Community Superadmin (Owner)</option>
              <option value="admin">Community Admin</option>
            </select>
          </div>
          <Button type="submit" className="w-full">Assign</Button>
        </form>
      </Modal>
    </div>
  );
}
