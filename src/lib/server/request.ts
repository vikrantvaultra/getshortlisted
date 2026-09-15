import { NextResponse, type NextRequest } from "next/server";
import { RATE_LIMITS } from "@/config";
import { hashIp } from "./crypto";
import { store } from "./store";

type Bucket = Exclude<keyof typeof RATE_LIMITS, "enforceInDevelopment">;

export function clientIpHash(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return hashIp(ip);
}

/**
 * Fixed-window rate limit per hashed IP. In-memory: it resets on restart and
 * is per server instance — fine for a single-server deployment, and the
 * reason a shared store (e.g. Upstash) would be needed at scale.
 */
export function rateLimit(request: NextRequest | Request, bucket: Bucket): { ipHash: string; blocked: NextResponse | null } {
  const ipHash = clientIpHash(request);
  if (process.env.NODE_ENV !== "production" && !RATE_LIMITS.enforceInDevelopment) return { ipHash, blocked: null };

  const { limit, windowSeconds } = RATE_LIMITS[bucket];
  const key = `${bucket}:${ipHash}`;
  const now = Date.now();
  const entry = store().rateLimits.get(key);

  if (!entry || entry.resetAt <= now) {
    store().rateLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ipHash, blocked: null };
  }
  entry.count++;
  if (entry.count <= limit) return { ipHash, blocked: null };

  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  const minutes = Math.ceil(retryAfter / 60);
  return {
    ipHash,
    blocked: NextResponse.json(
      { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    ),
  };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL.test(value);
}

export function cleanText(value: unknown, maxLength = 120): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}
