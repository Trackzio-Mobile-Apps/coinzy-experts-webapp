import type { NextConfig } from "next";

const expertApiBaseUrl =
  process.env.NEXT_PUBLIC_EXPERT_API_BASE_URL ??
  process.env.EXPERT_API_BASE_URL ??
  "";

const expertSocketUrl =
  process.env.NEXT_PUBLIC_EXPERT_SOCKET_URL ?? expertApiBaseUrl;

const nextConfig: NextConfig = {
  // Expose expert API URL to the browser for Socket.IO without duplicating .env.local.
  env: {
    NEXT_PUBLIC_EXPERT_API_BASE_URL: expertApiBaseUrl,
    NEXT_PUBLIC_EXPERT_SOCKET_URL: expertSocketUrl,
  },
  // Hide the Next.js Dev Tools "N" badge in local development.
  devIndicators: false,
};

export default nextConfig;
