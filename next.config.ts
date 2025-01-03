import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '6gp5kxvz73lvqfna.public.blob.vercel-storage.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
