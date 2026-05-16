import type { NextConfig } from "next";

const allowedDevOrigins = [
  "http://localhost:3000",
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
