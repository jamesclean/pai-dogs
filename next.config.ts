import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page here reads live data (dogs, sightings, the admin cookie),
  // so we use plain dynamic rendering rather than Cache Components.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
