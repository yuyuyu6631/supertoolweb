import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function createNextConfig(phase: string): NextConfig {
  return {
    // Keep dev and build outputs separate so `next build` cannot poison the running dev server.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
