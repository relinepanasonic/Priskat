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
            <select name="role" defaultValue={member.role} className="w-full rounded-lg bg-brand-bg border border-brand-border px-3 py-2 text-brand-light">
              <option value="member">Member</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Gender</label>
            <select name="gender" defaultValue={member.gender || ""} className="w-full rounded-lg bg-brand-bg border border-brand-border px-3 py-2 text-brand-light">
              <option value="">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-light mb-2">Completed Modules</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-brand-light">
                <input type="checkbox" name="modules" value="module_1" defaultChecked={member.completed_modules.includes("module_1")} className="rounded border-brand-border bg-brand-bg text-brand-gold focus:ring-brand-gold" />
                Pria Sejati / Wanita Berhikmat (Module 1)
              </label>
              <label className="flex items-center gap-2 text-sm text-brand-light">
                <input type="checkbox" name="modules" value="module_2" defaultChecked={member.completed_modules.includes("module_2")} className="rounded border-brand-border bg-brand-bg text-brand-gold focus:ring-brand-gold" />
                Bapa Sejati (Module 2 - Men only)
              </label>
              <label className="flex items-center gap-2 text-sm text-brand-light">
                <input type="checkbox" name="modules" value="module_3" defaultChecked={member.completed_modules.includes("module_3")} className="rounded border-brand-border bg-brand-bg text-brand-gold focus:ring-brand-gold" />
                Patriot (Module 3 - Men only)
              </label>
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
