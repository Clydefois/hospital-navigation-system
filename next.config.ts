import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Turbopack to use Webpack instead (fixes WASM bindings issue)
  // Remove this when @next/swc-darwin-arm64 is properly installed
};

export default nextConfig;
