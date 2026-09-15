import { NextResponse, type NextRequest } from "next/server";
import { PRODUCTS } from "@/config";
import { grantAccess } from "@/lib/server/access";
import { sendAccessEmail } from "@/lib/server/email";
import { demoCheckout, fetchOrder, productFromNotes, verifyPaymentSignature } from "@/lib/server/razorpay";
import { jsonError, rateLimit } from "@/lib/server/request";
import { store } from "@/lib/server/store";
import { paidEnabled } from "@/lib/site";

export const runtime = "nodejs";

/** Called by the checkout handler. Grants access only after the signature checks out. */
export async function POST(request: NextRequest) {
  if (!paidEnabled()) return jsonError("Not found", 404);
  const { blocked } = rateLimit(request, "payment");
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const orderId = String(body?.orderId ?? "");
  const paymentId = String(body?.paymentId ?? "");
  const signature = String(body?.signature ?? "");
  const stored = store().orders.get(orderId);

  // Local demo: no Razorpay keys and not production.
  if (orderId.startsWith("order_demo")) {
    if (!demoCheckout() || !stored) return jsonError("Payment could not be verified.", 400);
    stored.status = "paid";
    stored.razorpayPaymentId = "pay_demo";
    await grantAccess(stored.email, stored.product, orderId);
    return NextResponse.json({ ok: true, product: stored.product, orderId });
  }

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return jsonError("Payment could not be verified. If money left your account, email us with the order ID.", 400);
  }

  // The order may have been created on another server instance; Razorpay is the source of truth.
  let email = stored?.email;
  let product = stored?.product;
  if (!email || !product) {
    const order = await fetchOrder(orderId);
    email = order?.notes.email;
    product = productFromNotes(order?.notes.product) ?? undefined;
  }
  if (!email || !product) return jsonError("Payment verified, but we couldn't find the order. Email us with the order ID.", 404);

  if (stored) {
    stored.status = "paid";
    stored.razorpayPaymentId = paymentId;
  }
  await grantAccess(email, product, orderId);
  await sendAccessEmail(email, PRODUCTS[product].name, orderId);
  return NextResponse.json({ ok: true, product, orderId });
}
