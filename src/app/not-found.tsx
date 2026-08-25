import Link from "next/link";
import { Hammer } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface shadow-3d">
        <Hammer className="h-10 w-10 text-brand-gold" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-white">Under Construction</h1>
      <p className="mb-8 text-brand-muted max-w-sm">
        We are still building this feature. Please check back later!
      </p>
      <Link
        href="/"
        className="rounded-full bg-brand-gold px-8 py-3 font-semibold text-brand-dark shadow-glow-gold transition-transform hover:scale-105"
      >
        Go Back Home
      </Link>
    </div>
  );
}
