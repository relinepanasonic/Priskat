"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { createCommunity, updateCommunity, deleteCommunity, addCommunityAdmin, removeCommunityAdmin } from "@/app/actions/community";
import { Plus, Trash2, Edit2, UserPlus, Shield } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function CommunityCenterClient({ initialCommunities, initialAdmins, allUsers }: { initialCommunities: any[], initialAdmins: any[], allUsers: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  
  // State for forms
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [adminCommunityId, setAdminCommunityId] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState("");
  const [adminRole, setAdminRole] = useState("admin");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    
    const res = await createCommunity(formData);
    if (res.error) alert(res.error);
    else {
      setIsAdding(false);
      setName(""); setSlug(""); setDescription("");
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
          <div key={community.id} className="card-3d p-6 flex flex-col h-full relative">
            <button onClick={() => handleDelete(community.id)} className="absolute top-4 right-4 p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-brand-gold">{community.name}</h2>
            <p className="text-xs text-brand-muted font-mono mb-4">/{community.slug}</p>
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

      <Modal open={isAdding} onClose={() => setIsAdding(false)} title="Create Community">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-brand-light mb-1">Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full input-3d" placeholder="e.g. Legio Maria" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">URL Slug</label>
            <input required value={slug} onChange={e => setSlug(e.target.value)} className="w-full input-3d" placeholder="e.g. legiomaria" />
          </div>
          <div>
            <label className="block text-sm text-brand-light mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full input-3d h-24" />
          </div>
          <Button type="submit" className="w-full">Create</Button>
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
