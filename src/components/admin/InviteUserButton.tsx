"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import InvitePanel from "@/components/layout/InvitePanel";

export default function InviteUserButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
      >
        <UserPlus className="h-4 w-4" />
        Invite New User
      </button>

      {isOpen && <InvitePanel onClose={() => setIsOpen(false)} />}
    </>
  );
}

