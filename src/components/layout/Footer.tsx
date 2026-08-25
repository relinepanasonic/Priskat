import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brand-blue-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-white font-bold text-sm">
                P
              </div>
              <span className="font-bold text-brand-blue">PriskatCFM</span>
            </div>
            <p className="text-sm text-stone-500">
              A community platform for Priskat CFM — stay connected, stay inspired.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-stone-800">Community</h3>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/news" className="hover:text-brand-blue transition-colors">News</Link></li>
              <li><Link href="/events" className="hover:text-brand-blue transition-colors">Events</Link></li>
              <li><Link href="/directory" className="hover:text-brand-blue transition-colors">Member Directory</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-stone-800">Account</h3>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/login" className="hover:text-brand-blue transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-brand-blue transition-colors">Join</Link></li>
              <li><Link href="/profile" className="hover:text-brand-blue transition-colors">My Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-100 pt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} PriskatCFM. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
