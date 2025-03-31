import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**', // Adjust if your Strapi upload path is different
      },
    ],
  },
  /* other config options can go here */
};

export default nextConfig;
