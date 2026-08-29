import { Hammer } from "lucide-react";

export const metadata = { title: "Group" };

export default function GroupPage() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface border border-[#333]">
        <Hammer className="h-10 w-10 text-brand-gold animate-pulse" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">Group — Coming Soon</h2>
      <p className="text-brand-muted max-w-xs">
        Telegram-style group chats with sub-channels are coming in the next update!
      </p>
    </div>
  );
}
