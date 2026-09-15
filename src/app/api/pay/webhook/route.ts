import { NextResponse, type NextRequest } from "next/server";
import { PRODUCTS } from "@/config";
import { sendAccessEmail } from "@/lib/server/email";
import { productFromNotes, verifyWebhookSignature } from "@/lib/server/razorpay";
import { store } from "@/lib/server/store";
import { paidEnabled } from "@/lib/site";

export const runtime = "nodejs";

type WebhookEvent = {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string; email?: string; notes?: Record<string, string> } };
    order?: { entity: { id: string; amount: number; notes?: Record<string, string>; created_at: number } };
  };
};

/**
 * Razorpay webhook (configure for `order.paid` and `payment.failed`).
 * Safety net for when the browser closes before /api/pay/verify runs: the
 * buyer still gets the order-ID email and can restore access with it.
 */
export async function POST(request: NextRequest) {
  if (!paidEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const payment = event.payload.payment?.entity;
  const orderEntity = event.payload.order?.entity;
  const orderId = orderEntity?.id ?? payment?.order_id;
  if (!orderId) return NextResponse.json({ ok: true });

  const notes = { ...payment?.notes, ...orderEntity?.notes };
  const existing = store().orders.get(orderId);

  if (event.event === "payment.failed") {
    if (existing && existing.status !== "paid") existing.status = "failed";
    return NextResponse.json({ ok: true });
  }

  if (event.event === "order.paid" || event.event === "payment.captured") {
    const email = existing?.email ?? notes.email;
    const product = existing?.product ?? productFromNotes(notes.product);
    if (!email || !product) return NextResponse.json({ ok: true });

    const alreadyPaid = existing?.status === "paid";
    store().orders.set(orderId, {
      id: orderId,
      email,
      product,
      amountPaise: orderEntity?.amount ?? existing?.amountPaise ?? PRODUCTS[product].pricePaise,
      razorpayOrderId: orderId,
      razorpayPaymentId: payment?.id ?? existing?.razorpayPaymentId ?? null,
      status: "paid",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    // Razorpay retries webhooks; only email once per order on this instance.
    if (!alreadyPaid && event.event === "order.paid") await sendAccessEmail(email, PRODUCTS[product].name, orderId);
  }

  return NextResponse.json({ ok: true });
}
