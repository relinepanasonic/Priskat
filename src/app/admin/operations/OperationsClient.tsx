"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  Calendar,
  ExternalLink,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Smartphone,
  Sparkles,
  Store,
  Tent,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type PlatformMilestone = {
  id: string;
  platform: "website" | "android" | "ios" | "community_center" | "seller_center" | "admin_erp";
  title: string;
  version_tag: string | null;
  progress_pct: number;
  status: "planned" | "in_progress" | "live";
  notes: string | null;
};

export type StoreSummary = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string | null;
  last_activity_at: string;
  product_count: number;
};

const PLATFORMS: { value: PlatformMilestone["platform"]; label: string }[] = [
  { value: "website", label: "Website (apps.ruangiman.com)" },
  { value: "android", label: "Android App (Play Store)" },
  { value: "ios", label: "iOS App (App Store)" },
  { value: "community_center", label: "Community Center" },
  { value: "seller_center", label: "Seller Center" },
  { value: "admin_erp", label: "Admin ERP" },
];

export default function OperationsClient({
  initialMilestones,
  stores,
  stats,
  needsSql,
  lang = "id",
}: {
  initialMilestones: PlatformMilestone[];
  stores: StoreSummary[];
  stats: { events: number; campaigns: number; bots: number; products: number };
  needsSql: boolean;
  lang?: "id" | "en";
}) {
  const isEn = lang === "en";
  const db = () => createClient() as any;

  const [milestones, setMilestones] = useState<PlatformMilestone[]>(initialMilestones);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformMilestone | null>(null);
  const [platform, setPlatform] = useState<PlatformMilestone["platform"]>("website");
  const [title, setTitle] = useState("");
  const [versionTag, setVersionTag] = useState("");
  const [progressPct, setProgressPct] = useState(50);
  const [status, setStatus] = useState<PlatformMilestone["status"]>("in_progress");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setPlatform("website");
    setTitle("");
    setVersionTag("");
    setProgressPct(50);
    setStatus("in_progress");
    setNotes("");
    setErr(null);
    setModalOpen(true);
  }

  function openEdit(m: PlatformMilestone) {
    setEditing(m);
    setPlatform(m.platform);
    setTitle(m.title);
    setVersionTag(m.version_tag ?? "");
    setProgressPct(m.progress_pct);
    setStatus(m.status);
    setNotes(m.notes ?? "");
    setErr(null);
    setModalOpen(true);
  }

  async function saveMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        platform,
        title: title.trim(),
        version_tag: versionTag.trim() || null,
        progress_pct: Math.min(100, Math.max(0, Number(progressPct) || 0)),
        status,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { data, error } = await db()
          .from("erp_platform_milestones")
          .update(payload)
          .eq("id", editing.id)
          .select("*")
          .single();
        if (error || !data) throw new Error(error?.message || "Failed to update milestone.");
        setMilestones((prev) => prev.map((x) => (x.id === editing.id ? (data as PlatformMilestone) : x)));
      } else {
        const { data, error } = await db()
          .from("erp_platform_milestones")
          .insert(payload)
          .select("*")
          .single();
        if (error || !data) throw new Error(error?.message || "Failed to create milestone.");
        setMilestones((prev) => [...prev, data as PlatformMilestone]);
      }
      setModalOpen(false);
    } catch (error) {
      setErr((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteMilestone(m: PlatformMilestone) {
    if (!confirm(isEn ? `Delete "${m.title}"?` : `Hapus "${m.title}"?`)) return;
    const { error } = await db().from("erp_platform_milestones").delete().eq("id", m.id);
    if (!error) setMilestones((prev) => prev.filter((x) => x.id !== m.id));
  }

  const quickModules = [
    { href: "/admin/communities", label: isEn ? "Communities" : "Komunitas", sub: isEn ? "Manage all communities" : "Kelola semua komunitas", icon: Tent },
    { href: "/admin/members", label: isEn ? "Users & Roles" : "Pengguna & Peran", sub: isEn ? "Accounts & permissions" : "Akun & hak akses", icon: Users },
    { href: "/admin/events", label: isEn ? "Agenda & Events" : "Agenda & Acara", sub: `${stats.events} ${isEn ? "events" : "acara"}`, icon: Calendar },
    { href: "/admin/upload", label: isEn ? "Content & Upload" : "Konten & Unggah", sub: isEn ? "Devotions, prayers, banners" : "Renungan, doa, banner", icon: Upload },
    { href: "/admin/campaigns", label: isEn ? "Campaigns" : "Kampanye", sub: `${stats.campaigns} ${isEn ? "campaigns" : "kampanye"}`, icon: Sparkles },
    { href: "/admin/bots", label: "Bots", sub: `${stats.bots} ${isEn ? "active bots" : "bot aktif"}`, icon: Bot },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            {isEn ? "Operations Module" : "Modul Operasional"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            {isEn ? "Operations & Platform Progress" : "Operasional & Progres Platform"}
          </h1>
          <p className="mt-1 text-xs text-brand-muted">
            {isEn
              ? "Track website & mobile app releases, oversee Marketplace stores, and jump to any operational control."
              : "Pantau progres website & aplikasi mobile, awasi toko Marketplace, dan akses semua modul operasional."}
          </p>
        </div>
        {!needsSql && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark shadow-md hover:bg-brand-gold-hover"
          >
            <Plus className="h-4 w-4" />
            {isEn ? "Add Milestone" : "Tambah Progres"}
          </button>
        )}
      </div>

      {needsSql && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          {isEn
            ? "Run supabase/147_admin_erp.sql in Supabase SQL Editor to enable editing Website & App Progress milestones."
            : "Jalankan supabase/147_admin_erp.sql di Supabase SQL Editor untuk mengaktifkan penyimpanan & edit Progres Website/Aplikasi."}
        </div>
      )}

      {/* Website & Mobile App Progress Tracker */}
      <section className="rounded-2xl border border-white/10 bg-[#151921] p-5">
        <div className="flex items-center justify-between pb-3.5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Activity className="h-4 w-4 text-brand-gold" />
            {isEn ? "Website & Apps Progress Tracker" : "Pelacak Progres Website & Aplikasi"}
          </h2>
          <span className="text-xs text-brand-muted">
            {milestones.length} {isEn ? "platforms" : "platform"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {milestones.map((m) => {
            const isMobile = m.platform === "android" || m.platform === "ios";
            return (
              <div key={m.id} className="rounded-xl border border-white/10 bg-[#0f1217] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isMobile ? <Smartphone className="h-4 w-4 text-brand-gold" /> : <Globe className="h-4 w-4 text-brand-gold" />}
                      <p className="truncate text-sm font-bold text-white">{m.title}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {m.version_tag && (
                        <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-brand-light">
                          {m.version_tag}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        m.status === "live"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : m.status === "in_progress"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-white/10 text-gray-400"
                      }`}>
                        {m.status === "live" ? "Live" : m.status === "in_progress" ? (isEn ? "In Progress" : "Berjalan") : (isEn ? "Planned" : "Rencana")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(m)} className="rounded-lg border border-white/10 p-1.5 text-brand-muted hover:border-brand-gold hover:text-brand-gold">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => void deleteMilestone(m)} className="rounded-lg border border-red-500/25 p-1.5 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand-gold" style={{ width: `${m.progress_pct}%` }} />
                  </div>
                  <span className="font-mono text-xs font-bold text-brand-gold">{m.progress_pct}%</span>
                </div>
                {m.notes && <p className="mt-2 text-xs text-brand-muted">{m.notes}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Operational Modules Launcher */}
      <section className="rounded-2xl border border-white/10 bg-[#151921] p-5">
        <h2 className="mb-3.5 text-sm font-bold text-white">
          {isEn ? "Operational Modules" : "Modul Kontrol Operasional"}
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {quickModules.map(({ href, label, sub, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f1217] p-3.5 transition hover:border-brand-gold/45"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white group-hover:text-brand-gold sm:text-sm">{label}</p>
                <p className="truncate text-[11px] text-brand-muted">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Marketplace Stores Oversight */}
      <section className="rounded-2xl border border-white/10 bg-[#151921] p-5">
        <div className="flex items-center justify-between pb-3.5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Store className="h-4 w-4 text-brand-gold" />
            {isEn ? `Marketplace Stores (${stores.length} stores · ${stats.products} products)` : `Toko Marketplace (${stores.length} toko · ${stats.products} produk)`}
          </h2>
          <a
            href="https://apps.ruangiman.com/news/marketplace"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold hover:underline"
          >
            {isEn ? "Open Marketplace" : "Buka Marketplace"} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        {stores.length === 0 ? (
          <p className="text-xs text-brand-muted">{isEn ? "No stores registered yet." : "Belum ada toko terdaftar."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-2 pr-3">{isEn ? "Store" : "Toko"}</th>
                  <th className="py-2 pr-3">{isEn ? "Category" : "Kategori"}</th>
                  <th className="py-2 pr-3">{isEn ? "City" : "Kota"}</th>
                  <th className="py-2 pr-3">{isEn ? "Products" : "Produk"}</th>
                  <th className="py-2 text-right">{isEn ? "Link" : "Tautan"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3 font-semibold text-white">{s.name}</td>
                    <td className="py-2.5 pr-3 text-brand-muted">{s.category}</td>
                    <td className="py-2.5 pr-3 text-brand-muted">{s.city || "-"}</td>
                    <td className="py-2.5 pr-3 font-mono text-brand-gold">{s.product_count} / 30</td>
                    <td className="py-2.5 text-right">
                      <a
                        href={`https://apps.ruangiman.com/news/marketplace/${s.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand-gold hover:underline"
                      >
                        {isEn ? "View" : "Lihat"} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / Edit Milestone Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={saveMilestone}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-2xl border border-white/15 bg-[#151921] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editing ? (isEn ? "Edit Platform Progress" : "Edit Progres Platform") : (isEn ? "Add Platform Milestone" : "Tambah Progres Platform")}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-brand-light">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value as PlatformMilestone["platform"])} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none">
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Title *" : "Judul *"}</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Version / Build" : "Versi / Build"}</label>
                  <input value={versionTag} onChange={(e) => setVersionTag(e.target.value)} placeholder="v2.4 · Build 12" className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 font-mono text-white focus:border-brand-gold focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-brand-light">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as PlatformMilestone["status"])} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2.5 text-white focus:border-brand-gold focus:outline-none">
                    <option value="planned">{isEn ? "Planned" : "Rencana"}</option>
                    <option value="in_progress">{isEn ? "In Progress" : "Berjalan"}</option>
                    <option value="live">Live</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 flex items-center justify-between font-semibold text-brand-light">
                  <span>{isEn ? "Completion Progress" : "Persentase Progres"}</span>
                  <span className="font-mono text-brand-gold">{progressPct}%</span>
                </label>
                <input type="range" min={0} max={100} value={progressPct} onChange={(e) => setProgressPct(Number(e.target.value))} className="w-full accent-brand-gold" />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-brand-light">{isEn ? "Notes" : "Catatan"}</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0f1217] px-3 py-2 text-white focus:border-brand-gold focus:outline-none" />
              </div>
            </div>

            {err && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300">{err}</p>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-brand-light">
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button type="submit" disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gold py-2.5 text-xs font-bold text-brand-dark disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEn ? "Save" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
