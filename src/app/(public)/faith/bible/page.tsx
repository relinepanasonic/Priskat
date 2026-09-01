import { getLanguage } from "@/lib/lang";
import BibleIndexClient from "@/components/faith/BibleIndexClient";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA } from "@/lib/bibleBooks";

export const metadata = {
  title: "Bible - Ruang Iman",
  description: "Read the Holy Bible",
};

export default async function BiblePage() {
  const lang = await getLanguage();
  const isId = lang === "id";

  return (
    <div className="w-full h-full pb-8 px-4 pt-6">
      <BibleIndexClient 
        isId={isId}
        oldTestament={OLD_TESTAMENT}
        newTestament={NEW_TESTAMENT}
        deuterocanonica={DEUTEROCANONICA}
      />
    </div>
  );
}
