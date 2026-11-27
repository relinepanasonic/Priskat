import { getLanguage } from "@/lib/lang";
import CommunityLayoutClient from "./CommunityLayoutClient";

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLanguage();
  return <CommunityLayoutClient lang={lang}>{children}</CommunityLayoutClient>;
}
