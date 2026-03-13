import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      // Remote Supabase Storage (dev + prod): e.g. https://<project-ref>.supabase.co
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Local Supabase Storage (Docker): http://127.0.0.1:54321
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
