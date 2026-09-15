import { NextResponse, type NextRequest } from "next/server";
import { grantAccess } from "@/lib/server/access";
import { demoCheckout, fetchOrder, productFromNotes, razorpayConfigured } from "@/lib/server/razorpay";
import { isEmail, jsonError, rateLimit } from "@/lib/server/request";
import { store } from "@/lib/server/store";
import { paidEnabled } from "@/lib/site";

export const runtime = "nodejs";

/** Email + order ID → access on this device. Checks Razorpay directly; no local record needed. */
export async function POST(request: NextRequest) {
  if (!paidEnabled()) return jsonError("Not found", 404);
  const { blocked } = rateLimit(request, "payment");
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
  const notFound = jsonError("We couldn't find a paid order with that email and order ID.", 404);
  if (!isEmail(email) || !orderId) return notFound;

  if (orderId.startsWith("order_demo")) {
    const order = store().orders.get(orderId);
    if (!demoCheckout() || !order || order.status !== "paid" || order.email !== email) return notFound;
    const granted = await grantAccess(email, order.product, orderId, Date.parse(order.createdAt));
    return granted ? NextResponse.json({ ok: true, product: order.product }) : jsonError("That purchase has expired.", 410);
  }

  if (!razorpayConfigured()) return notFound;
  const order = await fetchOrder(orderId).catch(() => null);
  const product = productFromNotes(order?.notes.product);
  if (!order || order.status !== "paid" || order.notes.email?.toLowerCase() !== email || !product) return notFound;

  const granted = await grantAccess(email, product, orderId, order.created_at * 1000);
  return granted ? NextResponse.json({ ok: true, product }) : jsonError("That purchase has expired.", 410);
}
