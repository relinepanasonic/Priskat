"use client";

import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types/database.types";

interface Props {
  memberId: string;
  currentRole: UserRole;
}

const ROLES: UserRole[] = ["member", "moderator", "admin"];

export default function RoleChangeButton({ memberId, currentRole }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole;
    if (newRole === currentRole) return;
    if (!confirm(`Change this member's role to "${newRole}"?`)) return;

    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", memberId);
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end">
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-lg border border-brand-border px-2 py-1 text-sm text-brand-light focus:border-brand-blue focus:outline-none disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
}
