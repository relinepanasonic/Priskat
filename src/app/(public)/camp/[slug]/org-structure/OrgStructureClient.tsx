"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePath } from "@/lib/upload";
import { Plus, Edit2, Trash2, X, Check, Search, User, Camera, Loader2, Users } from "lucide-react";
import Image from "next/image";

type OrgMember = {
  id: string;
  level: number;
  role_title: string;
  order_index: number;
  user_id: string | null;
  member_name: string | null;
  photo_url: string | null;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
};

export default function OrgStructureClient({
  communityId,
  communityName,
  initialStructure,
  isAdmin,
  profiles,
}: {
  communityId: string;
  communityName: string;
  initialStructure: OrgMember[];
  isAdmin: boolean;
  profiles: Profile[];
}) {
  const [structure, setStructure] = useState<OrgMember[]>(initialStructure);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form State
  const [formLevel, setFormLevel] = useState(1);
  const [formRole, setFormRole] = useState("");
  const [formUserId, setFormUserId] = useState<string>("");
  const [formMemberName, setFormMemberName] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>("");
  const [searchProfile, setSearchProfile] = useState("");

  const supabase = createClient();

  const resetForm = () => {
    setFormLevel(1);
    setFormRole("");
    setFormUserId("");
    setFormMemberName("");
    setFormPhotoUrl("");
    setSearchProfile("");
    setShowAddForm(false);
    setIsEditing(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, "org-structure", storagePath(communityId, "org_" + Date.now() + "_" + file.name));
      setFormPhotoUrl(url);
    } catch (err) {
      console.error("Photo upload failed", err);
      alert("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleAdd = async () => {
    if (!formRole || formLevel < 1 || formLevel > 10) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("community_org_structure")
      .insert({
        community_id: communityId,
        level: formLevel,
        role_title: formRole,
        user_id: formUserId || null,
        member_name: formMemberName || null,
        photo_url: formPhotoUrl || null,
      })
      .select('*, profiles(id, full_name, username, avatar_url)')
      .single();

    if (!error && data) {
      setStructure((prev) => [...prev, data]);
      resetForm();
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string) => {
    if (!formRole || formLevel < 1 || formLevel > 10) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("community_org_structure")
      .update({
        level: formLevel,
        role_title: formRole,
        user_id: formUserId || null,
        member_name: formMemberName || null,
        photo_url: formPhotoUrl || null,
      })
      .eq("id", id)
      .select('*, profiles(id, full_name, username, avatar_url)')
      .single();

    if (!error && data) {
      setStructure((prev) => prev.map((item) => (item.id === id ? data : item)));
      resetForm();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member from the organization structure?")) return;
    setSaving(true);
    const { error } = await supabase.from("community_org_structure").delete().eq("id", id);
    if (!error) {
      setStructure((prev) => prev.filter((item) => item.id !== id));
    }
    setSaving(false);
  };

  const startEdit = (item: OrgMember) => {
    setIsEditing(item.id);
    setFormLevel(item.level);
    setFormRole(item.role_title);
    setFormUserId(item.user_id || "");
    setFormMemberName(item.member_name || "");
    setFormPhotoUrl(item.photo_url || "");
    setSearchProfile("");
    setShowAddForm(false);
  };

  // Group by level
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  const filteredProfiles = profiles.filter((p) => 
    p.full_name.toLowerCase().includes(searchProfile.toLowerCase()) || 
    (p.username && p.username.toLowerCase().includes(searchProfile.toLowerCase()))
  ).slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Organization Structure</h2>
          <p className="text-sm text-brand-muted flex items-center gap-1.5 mt-0.5">
            Levels 1 to 10 within {communityName}
            <span className="inline-flex items-center gap-1 text-brand-gold/80 text-xs font-medium">
              <Users className="h-3 w-3" /> {structure.length}
            </span>
          </p>
        </div>
        {isAdmin && !showAddForm && !isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-dark text-sm font-bold rounded-xl hover:bg-brand-gold/80 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Member</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {(showAddForm || isEditing) && (
        <div className="bg-[#1a1d24] border border-[#2a2d35] rounded-2xl p-5 md:p-6 mb-8 shadow-lg shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-white text-lg">{isEditing ? "Edit Member" : "Add Member to Structure"}</h3>
            <button onClick={resetForm} className="text-brand-muted hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Photo */}
            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 shrink-0">
              <label className={`relative w-24 h-24 rounded-full overflow-hidden bg-brand-bg border-2 flex items-center justify-center shrink-0 transition-colors ${formUserId ? "border-brand-border cursor-not-allowed" : "border-dashed border-brand-border hover:border-brand-gold/60 cursor-pointer group"}`}>
                {formUserId ? (
                  profiles.find(p => p.id === formUserId)?.avatar_url ? (
                    <Image src={profiles.find(p => p.id === formUserId)!.avatar_url!} alt="Member photo" fill className="object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-brand-muted" />
                  )
                ) : formPhotoUrl ? (
                  <Image src={formPhotoUrl} alt="Member photo" fill className="object-cover" />
                ) : (
                  <User className="h-8 w-8 text-brand-muted" />
                )}
                {!formUserId && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingPhoto ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                  </div>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} disabled={uploadingPhoto || !!formUserId} />
              </label>
              <div className="text-center sm:text-center">
                <p className="text-[11px] text-brand-muted leading-tight">
                  {formUserId ? "Using connected member's photo" : "Tap to upload a photo"}
                </p>
                {!formUserId && formPhotoUrl && (
                  <button onClick={() => setFormPhotoUrl("")} className="text-[11px] text-red-400 hover:underline mt-0.5">
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-light mb-1">Level (1-10)</label>
                <input
                  type="number"
                  min={1} max={10}
                  value={formLevel}
                  onChange={(e) => setFormLevel(parseInt(e.target.value))}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-light mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Pastor, Division Head..."
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-brand-light mb-1">Connect to Member (Optional)</label>

                {!formUserId ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                      <input
                        type="text"
                        placeholder="Search member by name..."
                        value={searchProfile}
                        onChange={(e) => setSearchProfile(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    {searchProfile && (
                      <div className="bg-brand-bg border border-brand-border rounded-lg max-h-40 overflow-y-auto">
                        {filteredProfiles.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setFormUserId(p.id); setFormMemberName(""); }}
                            className="w-full text-left flex items-center gap-3 p-2 hover:bg-brand-surface transition-colors border-b border-brand-border/50 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#222] flex items-center justify-center flex-shrink-0">
                              {p.avatar_url ? (
                                <Image src={p.avatar_url} alt={p.full_name} width={32} height={32} className="object-cover w-full h-full" />
                              ) : (
                                <User className="h-4 w-4 text-brand-muted" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium">{p.full_name}</p>
                              {p.username && <p className="text-xs text-brand-muted">@{p.username}</p>}
                            </div>
                          </button>
                        ))}
                        {filteredProfiles.length === 0 && (
                          <div className="p-3 text-center text-xs text-brand-muted">No members found</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-brand-bg border border-brand-gold/30 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#222] flex items-center justify-center">
                        {profiles.find(p => p.id === formUserId)?.avatar_url ? (
                          <Image src={profiles.find(p => p.id === formUserId)!.avatar_url!} alt="Avatar" width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <User className="h-5 w-5 text-brand-muted" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{profiles.find(p => p.id === formUserId)?.full_name}</p>
                        <p className="text-xs text-brand-gold">Selected Member</p>
                      </div>
                    </div>
                    <button onClick={() => setFormUserId("")} className="text-brand-muted hover:text-red-400 text-xs flex items-center gap-1">
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                )}
              </div>

              {!formUserId && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-brand-light mb-1">Manual Name (if not a member yet)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mgr. Ignatius Kardinal Suharyo"
                    value={formMemberName}
                    onChange={(e) => setFormMemberName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-brand-muted hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={() => isEditing ? handleUpdate(isEditing) : handleAdd()}
              disabled={saving || !formRole || uploadingPhoto}
              className="flex items-center gap-2 px-5 py-2 bg-brand-gold text-brand-dark text-sm font-bold rounded-lg hover:bg-brand-gold/80 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : (isEditing ? "Update" : "Add to Structure")}
            </button>
          </div>
        </div>
      )}

      {/* Structure Display */}
      <div className="space-y-12">
        {levels.map(level => {
          const members = structure.filter(s => s.level === level);
          if (members.length === 0 && !isAdmin) return null; // Hide empty levels for non-admins
          
          return (
            <div key={level} className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-bold shrink-0">
                  {level}
                </div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider whitespace-nowrap">Level {level}</h3>
                {members.length > 0 && (
                  <span className="text-[11px] text-brand-muted">{members.length} {members.length === 1 ? "member" : "members"}</span>
                )}
                <div className="h-px bg-brand-border flex-1" />
              </div>

              {members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.map(member => {
                    const photo = member.photo_url || member.profiles?.avatar_url || null;
                    const displayName = member.member_name ? member.member_name : (member.profiles ? member.profiles.full_name : "Unassigned");
                    return (
                      <div key={member.id} className="bg-[#1a1d24] border border-[#2a2d35] rounded-2xl p-5 flex flex-col items-center text-center relative group shadow-sm hover:border-brand-gold/30 hover:-translate-y-0.5 transition-all">
                        {isAdmin && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => startEdit(member)} className="text-brand-muted hover:text-brand-gold p-1.5 bg-brand-dark border border-brand-border rounded-md">
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button onClick={() => handleDelete(member.id)} className="text-brand-muted hover:text-red-400 p-1.5 bg-brand-dark border border-brand-border rounded-md">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-dark border-2 border-brand-gold/20 mb-3 flex items-center justify-center shrink-0">
                          {photo ? (
                            <Image src={photo} alt={displayName} width={80} height={80} className="object-cover w-full h-full" />
                          ) : (
                            <User className="h-8 w-8 text-brand-muted" />
                          )}
                        </div>
                        <h4 className="font-bold text-white text-base leading-tight mb-1.5">
                          {displayName}
                        </h4>
                        <p className="text-xs text-brand-gold font-medium px-3 py-1 bg-brand-gold/10 rounded-full inline-block">
                          {member.role_title}
                        </p>
                        {member.profiles?.username && (
                          <p className="text-[11px] text-brand-muted mt-2">@{member.profiles.username}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-brand-bg/30 border border-dashed border-brand-border rounded-2xl">
                  <p className="text-brand-muted text-sm">No members assigned to Level {level}</p>
                  {isAdmin && (
                    <button
                      onClick={() => { setFormLevel(level); setShowAddForm(true); }}
                      className="mt-2 text-xs font-bold text-brand-gold hover:underline"
                    >
                      + Add someone to this level
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

