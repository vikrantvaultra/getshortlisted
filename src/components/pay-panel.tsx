"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeftIcon, CheckIcon, LockIcon, RefreshIcon, SparkleIcon } from "@/components/icons";

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { email: string };
  theme: { color: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
};
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadCheckoutScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type PayPanelProps = {
  price: string;
  accessDays: number;
  demo: boolean;
  /** Heading above the price, e.g. "Your comparison is ready". */
  title?: string;
  startWithRestore?: boolean;
  /**
   * What happens once access is granted. Defaults to re-rendering the current
   * page, which now sees the access cookie and shows the unlocked content.
   */
  onPaid?: () => void;
  /** Where to go once access is granted, when there's nothing on this page to reveal. */
  next?: string;
  className?: string;
};

/** The one checkout on the site: ₹49 unlocks Compare and the Library together. */
export function PayPanel({ price, accessDays, demo, title, startWithRestore = false, onPaid, next, className = "" }: PayPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"buy" | "restore">(startWithRestore ? "restore" : "buy");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function done() {
    if (onPaid) onPaid();
    else if (next) router.push(next);
    else router.refresh();
  }

  async function post(url: string, body: unknown) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
    return data;
  }

  async function buy(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const order = await post("/api/pay/order", { product: "pass", email });
      if (order.demo) {
        await post("/api/pay/verify", { orderId: order.orderId });
        done();
        return;
      }
      if (!(await loadCheckoutScript()) || !window.Razorpay) throw new Error("Couldn't load the payment window. Check your connection.");
      new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        prefill: { email: order.email },
        theme: { color: "#151412" },
        handler: async (response) => {
          try {
            await post("/api/pay/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            done();
          } catch (verifyError) {
            setError(`${verifyError instanceof Error ? verifyError.message : "Verification failed."} Order ID: ${response.razorpay_order_id}`);
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (buyError) {
      setError(buyError instanceof Error ? buyError.message : "Something went wrong.");
      setBusy(false);
    }
  }

  async function restore(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/pay/restore", { email, orderId });
      done();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className={`panel pop relative overflow-hidden text-left ${className}`}>
      {mode === "buy" ? (
        <form onSubmit={buy}>
          <div className="border-b-2 border-dashed border-edge bg-marker-soft px-6 pt-6 pb-5">
            {title && <p className="font-display text-xl leading-tight font-extrabold">{title}</p>}
            <p className={`kicker ${title ? "mt-3" : ""}`}>Full access · one-time</p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-5xl font-medium tracking-tight">{price}</span>
              <span className="text-sm font-medium text-marker-ink">for {accessDays} days</span>
            </p>
            <p className="mt-2 text-sm text-marker-ink">Unlocks Compare and the whole Library.</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm font-semibold text-marker-ink">
              {["No account needed", "No subscription"].map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 shrink-0" /> {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <label htmlFor="pay-email" className="field-label">
                Email for your receipt
              </label>
              <input
                id="pay-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="rounded-xl bg-[#fdecec] px-3 py-2 text-sm font-medium text-warn">
                {error}
              </p>
            )}
            <button type="submit" className="btn w-full" disabled={busy}>
              <LockIcon className="h-4 w-4" />
              {busy ? "Opening payment…" : `Pay ${price}`}
            </button>
            {demo && (
              <p className="flex items-start gap-2 rounded-xl bg-pen-wash px-3 py-2.5 text-sm text-pen-dark">
                <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Demo checkout — no Razorpay keys are set, so no money moves and access is instant. Disabled in production.</span>
              </p>
            )}
            <p className="text-center text-sm text-soft">
              Already paid?{" "}
              <button type="button" className="font-semibold text-pen underline-offset-4 hover:underline" onClick={() => setMode("restore")}>
                Restore access
              </button>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={restore} className="space-y-4 p-6">
          <button type="button" className="-ml-1 flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-text" onClick={() => setMode("buy")}>
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pen-wash text-pen">
              <RefreshIcon />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold">Restore access</p>
              <p className="text-sm text-soft">Use the email you paid with and your order ID.</p>
            </div>
          </div>
          <div>
            <label htmlFor="restore-email" className="field-label">
              Email
            </label>
            <input id="restore-email" type="email" required className="input" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="restore-order" className="field-label">
              Order ID
            </label>
            <input id="restore-order" required className="input font-mono" placeholder="order_…" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-[#fdecec] px-3 py-2 text-sm font-medium text-warn">
              {error}
            </p>
          )}
          <button type="submit" className="btn w-full" disabled={busy}>
            {busy ? "Checking…" : "Restore my access"}
          </button>
        </form>
      )}
    </div>
  );
}
