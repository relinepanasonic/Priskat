"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMember } from "@/app/actions/deleteMember";

export default function AdminMemberDeleteButton({ memberId, memberName }: { memberId: string, memberName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to completely delete ${memberName}? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    const result = await deleteMember(memberId);
    if (!result.success) {
      alert(`Failed to delete user: ${result.error}`);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 ml-2"
      title={`Delete ${memberName}`}
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}

