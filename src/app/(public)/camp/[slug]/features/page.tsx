import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Church,
  CircleDot,
  Cross,
  Crown,
  Flame,
  HandHeart,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  ShoppingBag,
  Sparkles,
  Store,
  Tent,
  Users,
} from "lucide-react";
import { getCommunityPageContext } from "@/lib/ciServer";
import { isRuangImanCommunity } from "@/lib/community";
import { getLanguage } from "@/lib/lang";
import FeatureReturnLink from "@/components/community/FeatureReturnLink";

export const dynamic = "force-dynamic";
export const metadata = { title: "Features — Ruang Iman" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

type FeatureItem = {
  icon: typeof BookOpen;
  title: string;
  subtitle?: string;
  href: string;
  why: string;
  bestFor: string[];
};

type FeatureSection = {
  badge: string;
  heading: string;
  intro: string;
  items: FeatureItem[];
};

export default async function RuangImanFeaturesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ community }, lang] = await Promise.all([getCommunityPageContext(slug), getLanguage()]);
  if (!community) redirect("/camp");
  if (!isRuangImanCommunity(community.name, community.slug)) {
    redirect(`/camp/${slug}/tentang`);
  }

  const isEn = lang === "en";

  const sections: FeatureSection[] = isEn
    ? [
        {
          badge: "01 · Spiritual Growth",
          heading: "Daily Prayer & Scripture Companions",
          intro: "Designed to make daily Catholic prayer calm, accessible, and deeply rooted in Church tradition.",
          items: [
            {
              icon: BookOpen,
              title: "Catholic Bible & Smart Search",
              href: "/faith/bible",
              why: "Clean book-like reading view with instant verse search, Deuterocanonical books included, and bookmarking—zero clutter or ads.",
              bestFor: ["Daily Readers", "Bible Study & Komsel", "Youth (OMK)"],
            },
            {
              icon: Calendar,
              title: "Daily Mass Readings & Reflections",
              href: "/faith/bible/bacaan",
              why: "Automatic daily liturgical readings (First Reading, Responsorial Psalm, Gospel Acclamation, Gospel) plus Daily Reflection so you are always prepared for Mass.",
              bestFor: ["Daily Mass Goers", "Lectors & Liturgists", "Busy Professionals"],
            },
            {
              icon: Sparkles,
              title: "Novel-Style Lives of the Saints & Calendar",
              href: "/faith/saints",
              why: "Curated saint biographies written in an engaging book format with audio read-aloud and a 7-day calendar strip to discover today's patron saints.",
              bestFor: ["Families & Parents", "Catechists", "Youth & Seekers"],
            },
            {
              icon: CircleDot,
              title: "Guided Rosary & Stations of the Cross",
              href: "/faith/prayers/rosario",
              why: "Step-by-step mysteries and 14 stations right on your phone—perfect for praying during commutes, personal quiet time, or family prayer nights.",
              bestFor: ["Families", "Marian Devotees", "Lent & October Prayer"],
            },
            {
              icon: HandHeart,
              title: "Prayer Intentions & SOS Prayer",
              href: "/faith/intensi",
              why: "Never carry a heavy burden alone. Post a prayer request and let brothers and sisters across Indonesia lift your intention up immediately.",
              bestFor: ["Anyone in Need", "Intercessory Teams", "Prayer Warriors"],
            },
            {
              icon: Flame,
              title: "Daily Streak & Bible Challenge",
              href: "/faith",
              why: "Gentle spiritual habit building with daily streaks, friendly Bible quizzes, and midnight recovery reminders so faith becomes a joyful daily rhythm.",
              bestFor: ["OMK & Students", "New Habit Builders", "Friendly Communities"],
            },
          ],
        },
        {
          badge: "02 · Community & Fellowship",
          heading: "Built for Real Catholic Communities",
          intro: "Everything a community needs to stay alive, organized, and welcoming—before, during, and after every gathering.",
          items: [
            {
              icon: Tent,
              title: "Catholic Communities & Komsel Directory",
              href: "/camp",
              why: "Discover Catholic Indonesia, Ruang Iman, CFM, and local communities with clear Tentang pages, active events, and Komsel (Connect Groups).",
              bestFor: ["Newcomers & Movers", "OMK & Young Adults", "Community Leaders"],
            },
            {
              icon: MessageCircle,
              title: "Thought Feed & Friend Connections",
              href: "/community/thought",
              why: "A peaceful, faith-centered social feed without toxic algorithms—share reflections, photos, songs, and encourage friends in Christ.",
              bestFor: ["All Believers", "Small Groups", "Alumni & Camp Friends"],
            },
            {
              icon: Mail,
              title: "Real-Time Private & Group Chat",
              href: "/community/messages",
              why: "Built-in direct messaging and community group chats with rich push notifications—connect directly with friends, leaders, or marketplace sellers.",
              bestFor: ["Event Committees", "Komsel Members", "Buyers & Sellers"],
            },
            {
              icon: Music,
              title: "Worship Songs & Vinyl Mini Player",
              href: "/community/songs",
              why: "Curate and play your favorite Catholic praise and worship songs directly on your profile and inside Connect.",
              bestFor: ["Choirs & Worship Teams", "Personal Prayer Time", "Youth"],
            },
          ],
        },
        {
          badge: "03 · Faith Bulletin & Marketplace",
          heading: "Practical Tools for Everyday Catholic Life",
          intro: "Bridging spiritual life with everyday needs—finding Mass anywhere and supporting fellow believers' businesses.",
          items: [
            {
              icon: Church,
              title: "Indonesia Church & Mass Schedule Directory",
              href: "/news/schedule",
              why: "Search parishes and Mass schedules by province, city, or church name—invaluable when traveling for work or holidays.",
              bestFor: ["Travelers", "Families", "Students Away from Home"],
            },
            {
              icon: ShoppingBag,
              title: "Ruang Iman Marketplace (Free Stores)",
              href: "/news/marketplace",
              why: "100% free stores (up to 30 products, 5 photos each, auto SKU, variants, Favorites, direct App Chat & WhatsApp checkout) with fair rotation so every UMKM gets seen.",
              bestFor: ["Catholic UMKM & Home Sellers", "Parish Bazaars", "Supporters of Local Goods"],
            },
            {
              icon: Crown,
              title: "Agenda, Wall of Fame & Catholic Blog",
              href: "/news/events",
              why: "One place for upcoming retreats and seminars, celebrating faithful prayer habits on the Wall of Fame, and reading fresh Catholic articles.",
              bestFor: ["Event Organizers", "Active Members", "Curious Readers"],
            },
          ],
        },
        {
          badge: "04 · Backoffice Ecosystem",
          heading: "Professional Tools for Leaders & Sellers",
          intro: "Dedicated web portals connected to the exact same Ruang Iman account and live database.",
          items: [
            {
              icon: Users,
              title: "Community Center",
              subtitle: "communitycenter.ruangiman.com",
              href: "/camp",
              why: "Manage members, events, QR attendance check-in, promotional posters, and event photo albums with automatic blur cleanup—saving committees hours of manual work.",
              bestFor: ["Community Admins", "Retreat & Camp Committees", "Komsel Coordinators"],
            },
            {
              icon: Store,
              title: "Seller Center",
              subtitle: "sellercenter.ruangiman.com",
              href: "/news/marketplace",
              why: "Clean Shopee-style operational backoffice for store owners to upload products, update stock/prices inline, and answer buyer chats quickly.",
              bestFor: ["UMKM Owners", "Religious Goods Shops", "Food & Beverage Sellers"],
            },
            {
              icon: LayoutDashboard,
              title: "Admin ERP",
              subtitle: "admin.ruangiman.com",
              href: "/news/donation",
              why: "Executive dashboard tracking website & mobile app progress, community operations, and transparent donations accounting.",
              bestFor: ["Ministry Founders", "Operations Team", "Stewardship & Finance"],
            },
          ],
        },
      ]
    : [
        {
          badge: "01 · Pertumbuhan Rohani",
          heading: "Teman Doa & Firman Setiap Hari",
          intro: "Dirancang agar kehidupan doa Katolik terasa tenang, mudah dijangkau, dan berakar kuat pada tradisi Gereja.",
          items: [
            {
              icon: BookOpen,
              title: "Alkitab Katolik & Pencarian Cepat",
              href: "/faith/bible",
              why: "Tampilan baca senyaman buku lengkap dengan Deuterokanonika, pencarian ayat instan, dan bebas iklan agar fokus penuh pada Firman.",
              bestFor: ["Pembaca Harian", "Komsel & Pendalaman Kitab Suci", "OMK"],
            },
            {
              icon: Calendar,
              title: "Bacaan Misa & Renungan Harian",
              href: "/faith/bible/bacaan",
              why: "Otomatis menyajikan Bacaan Pertama, Mazmur Tanggapan, Bait Pengantar Injil, Injil, dan Renungan Harian sehingga selalu siap menyambut Ekaristi.",
              bestFor: ["Umat Misa Harian", "Lektor & Liturgi", "Pekerja Sibuk"],
            },
            {
              icon: Sparkles,
              title: "Pustaka Novel & Kalender Santo-Santa",
              href: "/faith/saints",
              why: "Kisah hidup para kudus dalam format buku yang hangat, dilengkapi fitur baca bersuara (Read-Aloud) dan kalender harian 7 hari.",
              bestFor: ["Keluarga & Orang Tua", "Katekis", "Generasi Muda"],
            },
            {
              icon: CircleDot,
              title: "Panduan Rosario & Jalan Salib",
              href: "/faith/prayers/rosario",
              why: "Panduan peristiwa Rosario dan 14 Perhentian Jalan Salib yang rapi di genggaman—praktis untuk doa pribadi, perjalanan, maupun doa keluarga.",
              bestFor: ["Keluarga Katolik", "Pencinta Devosi Maria", "Masa Prapaskah & Oktober"],
            },
            {
              icon: HandHeart,
              title: "Intensi Doa & SOS Doa",
              href: "/faith/intensi",
              why: "Tidak perlu memikul beban sendirian. Bagikan intensi doamu dan biarkan saudara seiman di seluruh Indonesia ikut mendoakan secara langsung.",
              bestFor: ["Umat yang Membutuhkan Doa", "Tim Pendoa", "Keluarga"],
            },
            {
              icon: Flame,
              title: "Daily Streak & Tantangan Alkitab",
              href: "/faith",
              why: "Membangun kebiasaan rohani harian secara menyenangkan melalui streak doa, kuis Alkitab singkat, dan pengingat hangat setiap hari.",
              bestFor: ["OMK & Pelajar", "Pembangun Kebiasaan Doa", "Komunitas"],
            },
          ],
        },
        {
          badge: "02 · Komunitas & Persaudaraan",
          heading: "Dirancang untuk Komunitas Katolik yang Hidup",
          intro: "Semua kebutuhan komunitas agar tetap terhubung, terorganisir, dan hangat—sebelum, saat, dan sesudah pertemuan.",
          items: [
            {
              icon: Tent,
              title: "Direktori Komunitas & Komsel",
              href: "/camp",
              why: "Temukan Catholic Indonesia, Ruang Iman, CFM, hingga komunitas lokal dengan halaman Tentang, Agenda aktif, dan Komsel (Connect Group).",
              bestFor: ["Perantau & Pendatang Baru", "OMK & Dewasa Muda", "Pengurus Komunitas"],
            },
            {
              icon: MessageCircle,
              title: "Thought Feed & Pertemanan Seiman",
              href: "/community/thought",
              why: "Linimasa persaudaraan yang damai tanpa algoritma bising—berbagi refleksi iman, foto kegiatan, dan saling menguatkan.",
              bestFor: ["Seluruh Umat", "Anggota Komsel", "Alumni Camp & Retret"],
            },
            {
              icon: Mail,
              title: "Chat Pribadi & Grup Real-Time",
              href: "/community/messages",
              why: "Pesan langsung dan grup komunitas dengan notifikasi push—mudah menghubungi teman, panitia acara, maupun penjual di Marketplace.",
              bestFor: ["Panitia Acara", "Anggota Komsel", "Pembeli & Penjual"],
            },
            {
              icon: Music,
              title: "Lagu Rohani & Pemutar Vinyl",
              href: "/community/songs",
              why: "Simpan dan dengarkan lagu-lagu pujian Katolik favoritmu langsung dari profil Beranda maupun tab Koneksi.",
              bestFor: ["Tim Pujian & Koor", "Saat Teduh Pribadi", "OMK"],
            },
          ],
        },
        {
          badge: "03 · Warta Iman & Marketplace Umat",
          heading: "Solusi Praktis untuk Kehidupan Umat Sehari-hari",
          intro: "Menghubungkan iman dengan kebutuhan nyata—dari mencari jadwal Misa hingga saling berbagi rezeki antar saudara seiman.",
          items: [
            {
              icon: Church,
              title: "Direktori Gereja & Jadwal Misa se-Indonesia",
              href: "/news/schedule",
              why: "Cari paroki dan jadwal Misa berdasarkan provinsi, kota, atau nama gereja—sangat membantu saat dinas luar kota atau liburan keluarga.",
              bestFor: ["Pelancong & Pekerja Dinas", "Keluarga", "Mahasiswa Perantau"],
            },
            {
              icon: ShoppingBag,
              title: "Marketplace Umat (Buka Toko Gratis)",
              href: "/news/marketplace",
              why: "Buka toko 100% gratis (hingga 30 produk, 5 foto, SKU otomatis, varian, Favorit, Beli via Chat/WA, Share ke Thought) dengan rotasi adil agar semua UMKM terlihat.",
              bestFor: ["Pelaku UMKM Katolik", "Bazar Paroki", "Umat yang Ingin Berbagi Rezeki"],
            },
            {
              icon: Crown,
              title: "Agenda, Wall of Fame & Blog Katolik",
              href: "/news/events",
              why: "Satu tempat untuk melihat agenda retret & seminar mendatang, mengapresiasi ketekunan doa di Wall of Fame, dan membaca artikel katekese.",
              bestFor: ["Penyelenggara Acara", "Anggota Aktif", "Pembaca Katekese"],
            },
          ],
        },
        {
          badge: "04 · Ekosistem Backoffice",
          heading: "Perangkat Profesional untuk Pengurus & Penjual",
          intro: "Portal web khusus yang terhubung langsung dengan akun dan database Ruang Iman yang sama.",
          items: [
            {
              icon: Users,
              title: "Community Center",
              subtitle: "communitycenter.ruangiman.com",
              href: "/camp",
              why: "Kelola anggota, acara, absensi QR, poster promosi, hingga album foto acara dengan deteksi foto buram otomatis—menghemat waktu panitia secara drastis.",
              bestFor: ["Admin Komunitas", "Panitia Camp & Retret", "Koordinator Komsel"],
            },
            {
              icon: Store,
              title: "Seller Center",
              subtitle: "sellercenter.ruangiman.com",
              href: "/news/marketplace",
              why: "Backoffice operasional bergaya Shopee yang ringkas untuk mengunggah produk, mengubah harga/stok dengan cepat, dan membalas chat pembeli.",
              bestFor: ["Pemilik Toko UMKM", "Penjual Benda Rohani", "Usaha Kuliner Umat"],
            },
            {
              icon: LayoutDashboard,
              title: "Admin ERP",
              subtitle: "admin.ruangiman.com",
              href: "/news/donation",
              why: "Panel kendali eksekutif untuk memantau progres website & aplikasi mobile, operasional komunitas, dan pembukuan donasi yang tertib.",
              bestFor: ["Pendiri Pelayanan", "Tim Operasional", "Pengelola Keuangan"],
            },
          ],
        },
      ];

  return (
    <div className="space-y-6 overflow-x-hidden p-3.5 pb-14 sm:p-4 md:space-y-8 md:p-6">
      {/* Header */}
      <section
        className="relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-9"
        style={{
          background: "radial-gradient(circle at top left, rgba(214,176,114,0.2), transparent 55%), linear-gradient(150deg, #171f33 0%, #0d1017 80%)",
          border: `1px solid ${GOLD}38`,
        }}
      >
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]" style={{ color: GOLD }}>
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          {isEn ? "Ruang Iman Feature Guide" : "Panduan Fitur Ruang Iman"}
        </p>
        <h1 className="mt-2 text-xl font-bold leading-snug text-white sm:text-2xl md:text-4xl" style={serif}>
          {isEn ? "Every Feature, Why It Matters & Who It Blesses Most" : "Semua Fitur Kami, Keunggulannya & Siapa yang Paling Terbantu"}
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#EAE5D9]/85 sm:text-sm">
          {isEn
            ? "Ruang Iman brings together daily Catholic spirituality, thriving community management, and practical fellowship tools—all 100% free and crafted for maximum impact."
            : "Ruang Iman menyatukan kehidupan rohani Katolik harian, manajemen komunitas yang rapi, dan ekosistem persaudaraan yang nyata—semuanya 100% gratis dan dirancang untuk dampak maksimal."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/camp/${slug}/tentang`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-brand-gold/50"
          >
            {isEn ? "About Ruang Iman" : "Tentang Ruang Iman"}
          </Link>
          <Link
            href="/faith"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark hover:bg-brand-gold-hover"
          >
            {isEn ? "Start Exploring" : "Mulai Jelajahi"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      {sections.map((sec) => (
        <section key={sec.badge} className="space-y-3.5">
          <div className="border-b border-white/10 pb-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]" style={{ color: GOLD }}>
              {sec.badge}
            </p>
            <h2 className="mt-1 text-lg font-bold text-white sm:text-xl md:text-2xl" style={serif}>
              {sec.heading}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted sm:text-sm">{sec.intro}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {sec.items.map((item) => (
              <FeatureReturnLink
                key={item.title}
                href={item.href}
                returnTo={`/camp/${slug}/features`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151921] p-4 transition hover:-translate-y-0.5 hover:border-brand-gold/45 hover:bg-[#191e28] sm:p-5"
              >
                <div className="flex min-w-0 items-start justify-between gap-2.5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold sm:h-10 sm:w-10">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-[15px] font-bold leading-snug text-white group-hover:text-brand-gold sm:text-base" style={serif}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="mt-0.5 truncate font-mono text-[10px] text-brand-gold/75">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-brand-gold" />
                </div>

                {/* Why it's great */}
                <div className="mt-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold/80">
                    {isEn ? "Why it's great" : "Mengapa fitur ini unggul"}
                  </p>
                  <p className="mt-1 break-words text-xs leading-relaxed text-[#EAE5D9]/85 sm:text-[13px]">
                    {item.why}
                  </p>
                </div>

                {/* Best for / Maximal Impact */}
                <div className="mt-auto pt-3.5">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {isEn ? "Maximal impact for" : "Dampak maksimal untuk"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.bestFor.map((who) => (
                      <span
                        key={who}
                        className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand-gold"
                      >
                        {who}
                      </span>
                    ))}
                  </div>
                </div>
              </FeatureReturnLink>
            ))}
          </div>
        </section>
      ))}

      {/* Quick Cross-Link */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand-gold/30 bg-[#151921] p-5 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold sm:flex">
            <Cross className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">
              {isEn ? "Want to bring your Catholic community onto Ruang Iman?" : "Ingin membawa komunitas Katolikmu bergabung di Ruang Iman?"}
            </p>
            <p className="text-xs text-brand-muted">
              {isEn ? "Every community gets its own workspace, events, Komsel, and Community Center." : "Setiap komunitas mendapatkan ruang sendiri, manajemen acara, Komsel, dan Community Center."}
            </p>
          </div>
        </div>
        <Link
          href="/news/donation"
          className="shrink-0 rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-bold text-brand-dark hover:bg-brand-gold-hover"
        >
          {isEn ? "Support Ministry" : "Dukung Pelayanan"}
        </Link>
      </div>
    </div>
  );
}
