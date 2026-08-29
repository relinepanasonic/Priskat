import { Hammer } from "lucide-react";
import { getLanguage } from "@/lib/lang";

export const metadata = { title: "Group" };

export default async function GroupPage() {
  const lang = await getLanguage();
  const isEn = lang === "en";

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface border border-[#333]">
        <Hammer className="h-10 w-10 text-brand-gold animate-pulse" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">{isEn ? "Group — Coming Soon" : "Grup — Segera Hadir"}</h2>
      <p className="text-brand-muted max-w-xs">
        {isEn ? "Telegram-style group chats with sub-channels are coming in the next update!" : "Obrolan grup ala Telegram dengan sub-saluran akan hadir di pembaruan berikutnya!"}
      </p>
    </div>
  );
}

