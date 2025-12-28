import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.vercel.app' },
    ],
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;