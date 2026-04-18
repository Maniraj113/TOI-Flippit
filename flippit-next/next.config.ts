import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: false,
  },
  turbopack: {
    root: path.resolve("."),
  },
} as any;

export default nextConfig;
