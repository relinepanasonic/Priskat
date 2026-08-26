"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { adminUpdateMember } from "@/app/actions/admin";
import type { UserRole, UserGender } from "@/lib/types/database.types";
import { Edit2 } from "lucide-react";

interface Props {
  member: {
    id: string;
    full_name: string;
    role: UserRole;
    gender: UserGender | null;
    completed_modules: string[];
  };
}

export default function AdminMemberEditDialog({ member }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await adminUpdateMember(member.id, formData);
      setOpen(false);
    });
  }

  const isMale = member.gender === "male";
  const isFemale = member.gender === "female";

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
            <select name="role" defaultValue={member.role} className="w-full input-3d text-sm">
              <option value="superadmin">Superadmin</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
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
            <label className="block text-sm font-medium text-brand-light mb-2">Alumni (Completed Modules)</label>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
