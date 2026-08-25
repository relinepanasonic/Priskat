"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Props {
  categories: string[];
  current?: string;
}

export default function CategoryFilter({ categories, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setCategory(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setCategory(null)}
        className={[
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          !current
            ? "bg-brand-blue text-white"
            : "border border-stone-200 text-stone-600 hover:border-brand-blue hover:text-brand-blue",
        ].join(" ")}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            current === cat
              ? "bg-brand-blue text-white"
              : "border border-stone-200 text-stone-600 hover:border-brand-blue hover:text-brand-blue",
          ].join(" ")}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
