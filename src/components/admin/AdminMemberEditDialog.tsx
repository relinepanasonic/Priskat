"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { adminUpdateMember, adminDeleteMember } from "@/app/actions/admin";
import type { UserRole, UserGender } from "@/lib/types/database.types";
import { Edit2, Trash2 } from "lucide-react";

interface Props {
  member: {
    id: string;
    full_name: string;
    role: UserRole;
    gender: UserGender | null;
    completed_modules: string[];
    community_id?: string | null;
  };
  callerRole: UserRole;
  communities: { id: string; name: string }[];
}

export default function AdminMemberEditDialog({ member, callerRole, communities }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await adminUpdateMember(member.id, formData);
      setOpen(false);
    });
  }

  function handleDelete() {
    if (!window.confirm(`Are you absolutely sure you want to delete ${member.full_name}? This action cannot be undone.`)) {
      return;
    }
    
    startDeleteTransition(async () => {
      const res = await adminDeleteMember(member.id);
      if (res.error) {
        alert(res.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-brand-muted hover:text-brand-gold transition-colors"
      >
        <Edit2 className="h-4 w-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Edit ${member.full_name}`}>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Role</label>
            <select name="role" defaultValue={member.role} className="w-full input-3d text-sm" disabled={member.role === 'founder'}>
              {callerRole === "founder" && <option value="superadmin">Superadmin</option>}
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="member">Member</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Main Community</label>
            <select name="community_id" defaultValue={member.community_id || ""} className="w-full input-3d text-sm" disabled={member.role === 'founder'}>
              <option value="">-- No Community --</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Gender</label>
            <select name="gender" defaultValue={member.gender || ""} className="w-full input-3d text-sm">
              <option value="">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-light mb-2">CFM Community (Formerly Alumni)</label>
            <div className="grid grid-cols-2 gap-2">
              {["Pria Sejati", "Youngman", "Bapa Sejati", "Patriot", "Wanita Berhikmat", "Young Woman"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-brand-light bg-[#1a1d24] p-2 rounded-lg border border-[#333]">
                  <input 
                    type="checkbox" 
                    name="modules" 
                    value={opt} 
                    defaultChecked={member.completed_modules.includes(opt)} 
                    className="rounded border-[#555] bg-brand-bg text-brand-gold focus:ring-brand-gold" 
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 mt-6 border-t border-[#333]">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isPending}
              className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete User"}
            </button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isDeleting || isPending}>Cancel</Button>
              <Button type="submit" loading={isPending} disabled={isDeleting}>Save Changes</Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
