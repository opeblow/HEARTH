import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Split hosting: STATIC_EXPORT=1 produces a static `out/` for Cloudflare Pages
// (the API stays on a Node host such as Render).
const isStaticExport = process.env.STATIC_EXPORT === "1";

/**
 * Strict Content-Security-Policy. No inline scripts except the Next.js
 * runtime (which we allow via 'unsafe-inline' only for styles/framework in
 * dev). In production we keep script-src locked to self + the Next runtime.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Next.js injects small inline bootstrap scripts; nonces require dynamic
  // rendering of every route. We accept 'unsafe-inline' for scripts only in
  // development, and rely on strict-dynamic + hashes in production builds.
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "interest-cohort=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  ...(isStaticExport ? { output: "export" as const, images: { unoptimized: true } } : {}),
  experimental: {
    // Tree-shake barrel imports (icons/motion/utils) down to the modules we
    // actually use — smaller client bundles, faster cold renders.
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
  },
  // Static export is served by the CDN with public/_headers instead.
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/api/(.*)",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
          ];
        },
      }),
};

export default nextConfig;
