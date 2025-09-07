import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable build caching for faster rebuilds
  experimental: {
    // Enable build caching
    buildStability: true,
    // Optimize for Netlify deployment
    outputFileTracing: true,
  },
  // Configure output for static export if needed
  output: 'standalone',
  // Enable image optimization
  images: {
    unoptimized: true, // Required for Netlify
  },
};

export default nextConfig;