import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack(config) {
    config.output.chunkFilename = 'static/chunks/[name].[contenthash].js';
    return config;
  },
};

export default nextConfig;
