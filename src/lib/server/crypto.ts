import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Secret for HMAC-signed tokens (admin cookie, access cookie, share links).
 * Set SIGNING_SECRET in production. Without it a random per-process secret
 * is used, which means cookies stop working whenever the server restarts.
 */
let secret: string | null = null;

function signingSecret(): string {
  if (secret) return secret;
  if (process.env.SIGNING_SECRET) secret = process.env.SIGNING_SECRET;
  else if (process.env.NODE_ENV === "production") {
    console.warn("[config] SIGNING_SECRET is not set — using a random per-process secret.");
    secret = randomBytes(32).toString("hex");
  } else secret = "getshortlisted-development-secret";
  return secret;
}

export function hmac(value: string, key: string = signingSecret()): string {
  return createHmac("sha256", key).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

export function randomId(prefix: string): string {
  return `${prefix}_${randomBytes(9).toString("base64url")}`;
}

/** `payload.signature`, where payload is base64url JSON. */
export function signPayload(data: unknown): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function verifyPayload<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, hmac(payload))) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

/** IPs are never stored in the clear. */
export function hashIp(ip: string): string {
  return hmac(`ip:${ip}`).slice(0, 24);
}
