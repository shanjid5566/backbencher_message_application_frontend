import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Configure PWA options
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Silence the Turbopack vs Webpack config error
  turbopack: {},
};

// Export the config wrapped with PWA
export default withPWA(nextConfig);