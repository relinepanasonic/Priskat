import type { NextConfig } from 'next';

const nextConfig: any = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // the ticket drawing reads these files on the server
  outputFileTracingIncludes: {
    '/api/**': ['./src/assets/fonts/**', './public/logo.png'],
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
