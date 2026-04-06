import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: isDev,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withSerwist(nextConfig);
