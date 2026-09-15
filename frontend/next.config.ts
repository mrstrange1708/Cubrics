import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Static learn/logo assets never change between deploys; cache optimized copies for 31 days
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
