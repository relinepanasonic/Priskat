"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/actions/events";

export default function AdminDeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteEvent(eventId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg p-1.5 text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
