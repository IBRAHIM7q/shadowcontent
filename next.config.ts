import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure output for static export if needed
  output: 'standalone',
  // Enable image optimization
  images: {
    unoptimized: true, // Required for Netlify
  },
};

export default nextConfig;