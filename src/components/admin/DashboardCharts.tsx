"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const GOLD = "#D6B072";
const PALETTE = ["#D6B072", "#5BA4FF", "#8b5cf6", "#22c55e", "#f97316", "#ec4899", "#06b6d4", "#9CA3AF"];

export type Slice = { name: string; value: number };
export type DashboardChartData = {
  growth: { label: string; total: number; joined: number }[];
  gender: Slice[];
  campsByBranch: Slice[];
  campsByType: Slice[];
  eventsByStatus: Slice[];
  tasks: Slice[];
};

const tooltipStyle = { background: "#121417", border: "1px solid #333", borderRadius: 12, color: "#EAE5D9", fontSize: 12 };

function Card({ title, subtitle, children, empty }: { title: string; subtitle?: string; children: React.ReactNode; empty?: boolean }) {
  return (
    <section className="rounded-2xl border border-[#2a2d35] bg-[#14171d] p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-brand-muted">{subtitle}</p>}
      <div className="mt-3 h-56">
        {empty ? (
          <div className="flex h-full items-center justify-center text-sm text-brand-muted">Belum ada data</div>
        ) : children}
      </div>
    </section>
  );
}

function DonutChart({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="80%" paddingAngle={2} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function DashboardCharts({ data }: { data: DashboardChartData }) {
  // Draw in the browser only (recharts measures the container)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/5" />)}</div>;

  const has = (s: Slice[]) => s.some((x) => x.value > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Pertumbuhan anggota" subtitle="Total anggota, 6 bulan terakhir" empty={data.growth.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.growth} margin={{ left: -18, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2a2d35" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n === "total" ? "Total anggota" : "Bergabung"]} />
            <Area type="monotone" dataKey="total" stroke={GOLD} strokeWidth={2} fill="url(#goldFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Anggota baru per bulan" subtitle="6 bulan terakhir" empty={data.growth.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.growth} margin={{ left: -18, right: 8, top: 8 }}>
            <CartesianGrid stroke="#2a2d35" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="joined" name="Bergabung" fill="#5BA4FF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Komposisi anggota" subtitle="Berdasarkan jenis kelamin" empty={!has(data.gender)}>
        <DonutChart data={data.gender.filter((s) => s.value > 0)} />
      </Card>

      <Card title="Camp per cabang" subtitle="Cabang dengan camp terbanyak" empty={!has(data.campsByBranch)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.campsByBranch} layout="vertical" margin={{ left: 12, right: 12, top: 4 }}>
            <CartesianGrid stroke="#2a2d35" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={86} tick={{ fill: "#EAE5D9", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" name="Camp" fill={GOLD} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Jenis camp" subtitle="Camp yang pernah dijalankan" empty={!has(data.campsByType)}>
        <DonutChart data={data.campsByType} />
      </Card>

      <Card title="Event" subtitle="Berdasarkan status" empty={!has(data.eventsByStatus)}>
        <DonutChart data={data.eventsByStatus} />
      </Card>

      {has(data.tasks) && (
        <Card title="Tugas camp" subtitle="Progres seluruh tugas panitia">
          <DonutChart data={data.tasks} />
        </Card>
      )}
    </div>
  );
}
