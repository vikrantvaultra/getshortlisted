import type { Metadata } from "next";
import Link from "next/link";
import { FileIcon } from "@/components/icons";
import { LegalHeader } from "@/components/legal-header";
import { PRODUCTS, SITE } from "@/config";
import { formatRupees } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: `The terms for using ${SITE.name}, a self-serve resume analysis software tool operated by ${SITE.operator}.`,
};

const UPDATED = "16 September 2026";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-14">
      <LegalHeader label="Terms and conditions" icon={<FileIcon className="h-4 w-4" />} updated={UPDATED}>
        The <span className="marker">rules</span> for using {SITE.name}.
      </LegalHeader>

      <div className="prose-legal mt-6">
        <section>
          <h2>Who we are</h2>
          <p>
            {SITE.name} ({SITE.domain}) is an online software tool operated by{" "}
            <a href={SITE.operatorUrl}>{SITE.operator}</a>, {SITE.city} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site you agree to
            these terms. If you don&apos;t agree, please don&apos;t use the site.
          </p>
        </section>

        <section>
          <h2>What the service is</h2>
          <p>
            {SITE.name} is self-serve software. It automatically analyses the resume you upload and compares it with an index of anonymised
            resumes. All results are calculated by the software. We don&apos;t write, edit or rewrite resumes, and we don&apos;t provide
            human writing, typing or secretarial services.
          </p>
          <ul>
            <li><strong>Free:</strong> the resume check on the home page.</li>
            <li>
              <strong>Paid:</strong> digital access to Compare and the Library, sold as a {PRODUCTS.pass.name} (
              {formatRupees(PRODUCTS.pass.pricePaise)}) or {PRODUCTS.lifetime.name} ({formatRupees(PRODUCTS.lifetime.pricePaise)}). See{" "}
              <Link href="/pricing">Pricing</Link>.
            </li>
          </ul>
        </section>

        <section>
          <h2>Payments</h2>
          <p>
            Prices are in Indian Rupees and include any applicable taxes. Payments are processed securely by Razorpay; we never see or store
            your card, UPI or bank details. Access starts as soon as the payment is confirmed. You don&apos;t need an account: your email and
            order ID are enough to restore access on another device from <Link href="/unlock?restore=1">Restore access</Link>.
          </p>
          <p>
            &ldquo;Lifetime&rdquo; means for as long as {SITE.name} is operated. Refunds are covered by our{" "}
            <Link href="/refund">Cancellation and refund policy</Link>.
          </p>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <ul>
            <li>Upload only resumes that you own or have permission to use.</li>
            <li>Don&apos;t try to identify the people behind anonymised resumes, or copy the Library in bulk.</li>
            <li>Don&apos;t share, resell or publish your paid access.</li>
            <li>Don&apos;t use bots or scrapers, or try to break or overload the site.</li>
          </ul>
          <p>We may suspend access that breaks these rules. If we do, we won&apos;t refund it.</p>
        </section>

        <section>
          <h2>Content and results</h2>
          <p>
            Scores and comparisons are statistics, not career advice, and they don&apos;t guarantee interviews or job offers. Resumes in the
            Library are for your reference only. The site, its software and its design belong to {SITE.operator}. How we handle your data is
            explained in our <Link href="/privacy">Privacy policy</Link>.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            The service is provided &ldquo;as is&rdquo;. As far as the law allows, our total liability for any claim is limited to the amount
            you paid us in the 12 months before the claim.
          </p>
        </section>

        <section>
          <h2>Changes, law and contact</h2>
          <p>
            We may update these terms and will change the date at the top when we do. These terms are governed by the laws of India, and the
            courts of Mumbai have jurisdiction. Questions? See <Link href="/contact">Contact us</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
