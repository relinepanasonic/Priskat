import NewsLayoutClient from "./NewsLayoutClient";
import { getLanguage } from "@/lib/lang";

export default async function NewsLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLanguage();
  return <NewsLayoutClient lang={lang}>{children}</NewsLayoutClient>;
}
