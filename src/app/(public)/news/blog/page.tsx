import { Newspaper } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="flex h-[500px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface border border-[#333] shadow-3d-inset">
        <Newspaper className="h-10 w-10 text-brand-gold animate-pulse" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white tracking-wide">CFM Blog</h2>
      <p className="mb-8 max-w-md text-brand-muted">
        Blog feature is coming soon!
      </p>
    </div>
  );
}
