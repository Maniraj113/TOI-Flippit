import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    // Silences the "multiple lockfiles" workspace warning in builds
    root: process.cwd(),
  },
};

export default nextConfig;
