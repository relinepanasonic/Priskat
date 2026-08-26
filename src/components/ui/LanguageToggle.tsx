"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguageCookie } from "@/app/actions/lang";

interface Props {
  currentLang: "id" | "en";
}

export default function LanguageToggle({ currentLang }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  function setLang(nextLang: "id" | "en") {
    startTransition(async () => {
      await setLanguageCookie(nextLang);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center rounded-full bg-[#1e1e1e] border border-[#333] p-1 shadow-inner">
      <button
        onClick={() => { if (currentLang !== "id") setLang("id"); }}
        disabled={isPending}
        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
          currentLang === "id"
            ? "bg-brand-gold text-brand-dark shadow-md"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        ID
      </button>
      <button
        onClick={() => { if (currentLang !== "en") setLang("en"); }}
        disabled={isPending}
        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
          currentLang === "en"
            ? "bg-brand-gold text-brand-dark shadow-md"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}

