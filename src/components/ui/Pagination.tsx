"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Button from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  paramName?: string;
}

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
  paramName = "page",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-8"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 2
          )
          .reduce<(number | "...")[]>((acc, page, idx, arr) => {
            if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
              acc.push("...");
            }
            acc.push(page);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-stone-400">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => goToPage(item as number)}
                aria-current={item === currentPage ? "page" : undefined}
                className={[
                  "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                  item === currentPage
                    ? "bg-brand-blue text-white"
                    : "hover:bg-brand-blue-50 text-stone-700",
                ].join(" ")}
              >
                {item}
              </button>
            )
          )}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
