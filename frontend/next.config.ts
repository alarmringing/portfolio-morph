import type { NextConfig } from "next";

const STRAPI_HOST = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const url = new URL(STRAPI_HOST);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        hostname: url.hostname,
        port: url.port || '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;