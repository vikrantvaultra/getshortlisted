import { NextResponse, type NextRequest } from "next/server";
import { PRODUCTS, SITE } from "@/config";
import { randomId } from "@/lib/server/crypto";
import { createOrder, demoCheckout, isProductId, razorpayConfigured } from "@/lib/server/razorpay";
import { isEmail, jsonError, rateLimit } from "@/lib/server/request";
import { store } from "@/lib/server/store";
import { paidEnabled } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!paidEnabled()) return jsonError("Not found", 404);
  const { blocked } = rateLimit(request, "payment");
  if (blocked) return blocked;

  const body = await request.json().catch(() => null);
  const product = body?.product ?? "pass";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isProductId(product)) return jsonError("Unknown product.");
  if (!isEmail(email)) return jsonError("Enter the email you'd like the receipt sent to.");

  const { pricePaise, name, description } = PRODUCTS[product];

  if (demoCheckout()) {
    const orderId = randomId("order_demo").replace("order_demo_", "order_demo");
    store().orders.set(orderId, {
      id: orderId,
      email,
      product,
      amountPaise: pricePaise,
      razorpayOrderId: orderId,
      razorpayPaymentId: null,
      status: "created",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ demo: true, orderId });
  }

  if (!razorpayConfigured()) return jsonError("Payments aren't configured yet.", 503);

  try {
    const order = await createOrder(product, email);
    store().orders.set(order.id, {
      id: order.id,
      email,
      product,
      amountPaise: order.amount,
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      status: "created",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({
      demo: false,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: SITE.name,
      description: `${name} — ${description}`,
      email,
    });
  } catch {
    return jsonError("Couldn't start the payment. Try again in a minute.", 502);
  }
}
