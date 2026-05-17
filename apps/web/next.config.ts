import type { NextConfig } from "next";

const allowedDevOrigins = [
  "localhost",
  "localhost:3000",
  "192.168.1.3",
  "192.168.1.3:3000",
];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dlizgvaguwmzxhbebcux.supabase.co",
      },
    ],
  },
};

export default nextConfig;
