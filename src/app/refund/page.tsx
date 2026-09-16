import type { Metadata } from "next";
import Link from "next/link";
import { RefreshIcon } from "@/components/icons";
import { LegalHeader } from "@/components/legal-header";
import { SITE } from "@/config";

export const metadata: Metadata = {
  title: "Cancellation and refund policy",
  description: `When ${SITE.name} payments can be cancelled or refunded, and how long refunds take.`,
};

const UPDATED = "16 September 2026";

export default function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-14">
      <LegalHeader label="Cancellation and refunds" icon={<RefreshIcon className="h-4 w-4" />} updated={UPDATED}>
        Cancellation and <span className="marker">refund policy</span>.
      </LegalHeader>

      <div className="prose-legal mt-6">
        <section>
          <h2>Digital access, delivered instantly</h2>
          <p>
            {SITE.name} sells one-time digital access with no subscription. Nothing renews automatically, so there is nothing to cancel after
            you pay. Access starts the moment your payment is confirmed, so we don&apos;t refund purchases once access is unlocked, except in
            the cases below.
          </p>
        </section>

        <section>
          <h2>When we refund in full</h2>
          <ul>
            <li><strong>Failed payment:</strong> money was taken from your account, but access was never unlocked.</li>
            <li><strong>Duplicate payment:</strong> you were charged more than once for the same purchase.</li>
            <li>
              <strong>Service not delivered:</strong> a fault on our side stopped you from using what you paid for, and we couldn&apos;t fix it
              within 3 working days of your report.
            </li>
          </ul>
        </section>

        <section>
          <h2>How to ask for a refund</h2>
          <p>
            Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> within 7 days of the payment, with the email address you
            paid with and your Razorpay order or payment ID. We reply within 2 working days.
          </p>
          <p>
            Approved refunds go back to your original payment method through Razorpay and usually arrive within{" "}
            <strong>5–7 working days</strong>, depending on your bank.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            {SITE.name} is operated by <a href={SITE.operatorUrl}>{SITE.operator}</a>, {SITE.city}. Phone:{" "}
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>. See also our <Link href="/terms">Terms</Link> and{" "}
            <Link href="/contact">Contact</Link> pages.
          </p>
        </section>
      </div>
    </article>
  );
}
