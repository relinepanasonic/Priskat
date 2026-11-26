import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import UpNavigation from "@/components/native/UpNavigation";
import AppSplash from "@/components/layout/AppSplash";
import { isCommunityCenterHost } from "@/lib/ccMode";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://apps.ruangiman.com"),
  title: {
    default: "Ruang Iman",
    template: "%s | Ruang Iman",
  },
  description:
    "Ruang Iman — Tempat Berkumpul, Belajar, dan Terhubung bagi Komunitas Katolik.",
  keywords: ["Ruang Iman", "community", "church", "catholic", "events", "news"],
  openGraph: {
    title: "Ruang Iman",
    description: "Tempat Berkumpul, Belajar, dan Terhubung bagi Komunitas Katolik.",
    siteName: "Ruang Iman",
    type: "website",
    images: [{ url: "https://apps.ruangiman.com/logo.png", width: 1000, height: 1000, alt: "Ruang Iman" }],
  },
  twitter: {
    card: "summary",
    title: "Ruang Iman",
    description: "Tempat Berkumpul, Belajar, dan Terhubung bagi Komunitas Katolik.",
    images: ["https://apps.ruangiman.com/logo.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ruang Iman",
    startupImage: "/loadingRI.png",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: "#051022" }}>
      <head>
        <link rel="preload" as="image" href="/loadingRI.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#121417] antialiased">
        <AppSplash variant={(await isCommunityCenterHost()) ? "cc" : "ri"} />
        <SupabaseProvider session={session}>
          <UpNavigation />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
