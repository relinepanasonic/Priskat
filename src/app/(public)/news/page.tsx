import { Hammer } from "lucide-react";
import Link from "next/link";

export default function UnderConstructionPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface border border-[#333] shadow-3d-inset">
        <Hammer className="h-10 w-10 text-brand-gold animate-pulse" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white tracking-wide">Under Construction</h2>
      <p className="mb-8 max-w-md text-brand-muted">
        This page is currently being built. Please check back later!
      </p>
      <Link
        href="/"
        className="rounded-full bg-brand-surface px-8 py-3 text-sm font-semibold text-brand-gold border border-[#333] shadow-3d active:translate-y-1 transition-all"
      >
        Return Home
      </Link>
    </div>
  );
}
