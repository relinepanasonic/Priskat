"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DatabaseAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Alumni DB", href: "/admin/database/alumni" },
    { name: "Devotion Plans", href: "/admin/database/devotions" },
    { name: "Prayers", href: "/admin/database/prayers" },
  ];

  return (
    <div className="space-y-6">
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
