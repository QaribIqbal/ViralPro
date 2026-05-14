import type { NextConfig } from "next";

const allowedDevOrigins = [
  "192.168.1.3",
  "http://192.168.1.3:3000",
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
    ],
  },
};

export default nextConfig;
