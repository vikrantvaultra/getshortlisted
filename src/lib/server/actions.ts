import { headers } from "next/headers";
import type { RATE_LIMITS } from "@/config";
import { rateLimit } from "./request";

/** Rate limiting for server actions, which don't receive a Request. Returns true when blocked. */
export async function rateLimitAction(bucket: Exclude<keyof typeof RATE_LIMITS, "enforceInDevelopment">): Promise<boolean> {
  const request = new Request("http://internal/", { headers: await headers() });
  return rateLimit(request, bucket).blocked !== null;
}
