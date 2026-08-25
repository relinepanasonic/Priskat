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

  function toggle() {
    const nextLang = currentLang === "id" ? "en" : "id";
    startTransition(async () => {
      await setLanguageCookie(nextLang);
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="flex items-center justify-center px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-xs font-bold text-brand-gold hover:bg-brand-surface-hover transition-colors shadow-3d-inset disabled:opacity-50"
    >
      {currentLang.toUpperCase()}
    </button>
  );
}

