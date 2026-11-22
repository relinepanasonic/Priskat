import type { NextConfig } from 'next';

const nextConfig: any = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 3D prayer garden (Intensi Doa) lives in its own Vercel project and is served under /intensidoa.
  async rewrites() {
    const garden = 'https://ruang-iman-intensidoa.vercel.app';
    return {
      beforeFiles: [
        { source: '/intensidoa', destination: `${garden}/intensidoa` },
        { source: '/intensidoa/:path+', destination: `${garden}/intensidoa/:path+` },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
