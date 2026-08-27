"use client";

import { useState, useEffect } from "react";
import { fetchBibleVerse } from "@/lib/bible/api";

export default function BibleVerseDisplay({ reference, language }: { reference: string, language: "id" | "en" }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    fetchBibleVerse(reference, language).then(res => {
      if (isMounted) {
        setText(res);
        setLoading(false);
      }
    });
    
    return () => { isMounted = false; };
  }, [reference, language]);

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col gap-2 w-full mt-4">
        <div className="h-4 bg-[#333] rounded w-full"></div>
        <div className="h-4 bg-[#333] rounded w-5/6"></div>
        <div className="h-4 bg-[#333] rounded w-4/6"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 text-[17px] leading-relaxed text-brand-light">
      <p>{text}</p>
    </div>
  );
}
