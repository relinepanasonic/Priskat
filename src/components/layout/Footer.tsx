import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brand-blue-100 bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Ruang Iman" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-bold text-brand-gold">Ruang Iman</span>
            </div>
            <p className="text-sm text-brand-muted">
              Tempat Berkumpul, Belajar, dan Terhubung bagi Komunitas Katolik.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Community</h3>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><Link href="/news" className="hover:text-brand-gold transition-colors">News</Link></li>
              <li><Link href="/events" className="hover:text-brand-gold transition-colors">Events</Link></li>
              <li><Link href="/directory" className="hover:text-brand-gold transition-colors">Member Directory</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Account</h3>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li><Link href="/login" className="hover:text-brand-gold transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-brand-gold transition-colors">Join</Link></li>
              <li><Link href="/profile" className="hover:text-brand-gold transition-colors">My Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-brand-border pt-6 text-center text-xs text-brand-muted">
          © {new Date().getFullYear()} Ruang Iman. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
