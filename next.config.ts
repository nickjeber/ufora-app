import type { NextConfig } from "next";

// This app is almost entirely per-user and auth-driven, so we use the
// classic dynamic rendering model rather than Cache Components.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
