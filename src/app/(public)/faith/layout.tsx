import { getLanguage } from "@/lib/lang";
import FaithLayoutClient from "./FaithLayoutClient";

export default async function FaithLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLanguage();

  return (
    <FaithLayoutClient lang={lang}>
      {children}
    </FaithLayoutClient>
  );
}
