import { cookies } from "next/headers";
import { PRODUCTS, type ProductId } from "@/config";
import type { LegacyProductId } from "./razorpay";
import { signPayload, verifyPayload } from "./crypto";

/**
 * Purchases are identified by email + order ID only. After a verified
 * payment we set a signed cookie listing what was bought and until when.
 * Nothing is stored server-side; access can be restored on another device
 * by re-checking the order with Razorpay (see /api/pay/restore).
 */

export const ACCESS_COOKIE = "gs_access";

type Grant = { product: ProductId | LegacyProductId; orderId: string; expiresAt: number };
type AccessPayload = { email: string; grants: Grant[] };

export async function readAccess(): Promise<AccessPayload | null> {
  const payload = verifyPayload<AccessPayload>((await cookies()).get(ACCESS_COOKIE)?.value);
  if (!payload) return null;
  return { ...payload, grants: payload.grants.filter((grant) => grant.expiresAt > Date.now()) };
}

/**
 * Any unexpired grant unlocks everything. Cookies from before the single
 * pass may still hold "library" / "compare" grants; those count too.
 */
export async function hasAccess(): Promise<boolean> {
  return !!(await readAccess())?.grants.length;
}

/** Adds a grant to the existing cookie, keeping any earlier ones. */
export async function grantAccess(email: string, product: ProductId, orderId: string, paidAt = Date.now()) {
  const existing = await readAccess();
  const grants = (existing?.email === email ? existing.grants : []).filter(
    (grant) => !(grant.product === product && grant.orderId === orderId),
  );
  const expiresAt = paidAt + PRODUCTS[product].accessDays * 24 * 60 * 60 * 1000;
  if (expiresAt <= Date.now()) return false;
  grants.push({ product, orderId, expiresAt });

  (await cookies()).set(ACCESS_COOKIE, signPayload({ email, grants } satisfies AccessPayload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.ceil((Math.max(...grants.map((grant) => grant.expiresAt)) - Date.now()) / 1000),
  });
  return true;
}
