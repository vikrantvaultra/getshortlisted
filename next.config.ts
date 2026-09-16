import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a verification build (NEXT_DIST_DIR=.next-build) run without clobbering a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Parsers run in Node (never Edge) and stay out of the bundle.
  serverExternalPackages: ["unpdf", "mammoth"],
  // The phrase index, the role library and share-card fonts are read from disk at runtime.
  outputFileTracingIncludes: {
    "/api/score": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin", "./data/library/open-library.json"],
    "/api/compare": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin", "./data/library/open-library.json"],
    "/compare": ["./data/library/open-library.json"],
    "/library": ["./data/library/open-library.json"],
    "/library/[id]": ["./data/library/open-library.json"],
    "/score": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin"],
    "/": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin", "./data/index/top-lines.json", "./data/library/open-library.json"],
    "/api/line": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin"],
    "/sources": ["./data/index/open-sources.json", "./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin"],
    "/admin": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin"],
    "/admin/submissions/[id]": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin", "./data/library/open-library.json"],
    "/delete/[token]": ["./data/index/phrase-index.json", "./data/index/phrase-index.bin", "./data/index/wording-index.bin"],
    "/api/share-card": ["./assets/fonts/**"],
  },
  outputFileTracingExcludes: {
    "*": ["./data/index/phrase-text.json", "./data/index/ingested-files.json", "./corpus/**"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
