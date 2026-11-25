import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: "/badge/:id.svg", destination: "/badge/:id" },
      { source: "/badge/:id/quality.svg", destination: "/badge/:id/quality" },
    ];
  },
};

export default nextConfig;