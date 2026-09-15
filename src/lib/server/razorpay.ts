import { createHmac } from "node:crypto";
import { PRODUCTS, type ProductId } from "@/config";
import { safeEqual } from "./crypto";

/**
 * Razorpay over plain HTTPS (no SDK).
 *
 * Demo mode: when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing and we are
 * NOT in production, checkout is simulated so the paid flow can be tried
 * locally. In production, missing keys make checkout fail loudly instead.
 */

export function razorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function demoCheckout(): boolean {
  return !razorpayConfigured() && process.env.NODE_ENV !== "production";
}

function authHeader() {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: "created" | "attempted" | "paid";
  notes: Record<string, string>;
  created_at: number;
};

export async function createOrder(product: ProductId, email: string): Promise<RazorpayOrder> {
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: PRODUCTS[product].pricePaise,
      currency: "INR",
      receipt: `${product}-${Date.now()}`,
      notes: { product, email },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Razorpay order creation failed (${response.status})`);
  return (await response.json()) as RazorpayOrder;
}

export async function fetchOrder(orderId: string): Promise<RazorpayOrder | null> {
  if (!/^order_[A-Za-z0-9]+$/.test(orderId)) return null;
  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: authHeader() },
    signal: AbortSignal.timeout(8000),
  });
  return response.ok ? ((await response.json()) as RazorpayOrder) : null;
}

/** Checkout handler signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && value in PRODUCTS;
}

/** Orders created before the single ₹49 pass carry one of these in their notes. */
const LEGACY_PRODUCT_IDS = ["library", "compare"] as const;
export type LegacyProductId = (typeof LEGACY_PRODUCT_IDS)[number];

/** Maps an order's `notes.product` to today's product, so older paid orders still restore. */
export function productFromNotes(value: unknown): ProductId | null {
  if (isProductId(value)) return value;
  return LEGACY_PRODUCT_IDS.includes(value as LegacyProductId) ? "pass" : null;
}
