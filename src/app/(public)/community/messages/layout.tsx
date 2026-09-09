import { getLanguage } from "@/lib/lang";
import MessagesTabs from "./MessagesTabs";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLanguage();
  const isEn = lang === "en";

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-64px)] overflow-hidden bg-brand-dark">
      <MessagesTabs isEn={isEn} />
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
