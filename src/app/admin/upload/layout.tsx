"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UploadAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFounder, setIsFounder] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (alive) setIsFounder(String(data?.role ?? "").toLowerCase() === "founder");
    })();
    return () => {
      alive = false;
    };
  }, []);

  const tabs = [
    { name: "Devotion Plans", href: "/admin/upload/devotions" },
    { name: "Prayers", href: "/admin/upload/prayers" },
    ...(isFounder
      ? [{ name: "Premium Banner", href: "/admin/upload/premium-banner" }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="h-6 w-6 text-brand-gold" />
        <h1 className="text-2xl font-bold text-white">Upload Center</h1>
      </div>
      <div className="flex space-x-2 border-b border-[#333] pb-2">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-t-lg font-bold text-sm ${pathname.startsWith(tab.href) ? "bg-brand-gold text-black" : "text-gray-400 hover:text-white"}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
