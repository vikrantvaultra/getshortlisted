import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/config";
import { compareCompanies } from "@/lib/server/library";
import { demoCheckout } from "@/lib/server/razorpay";
import { formatRupees, paidEnabled } from "@/lib/site";
import { CompareClient } from "./compare-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare" };

/** Open to everyone. The comparison runs first; the placed resumes unlock after paying. */
export default function ComparePage() {
  if (!paidEnabled()) notFound();
  return (
    <CompareClient
      companies={compareCompanies().map((c) => c.company)}
      price={formatRupees(PRODUCTS.pass.pricePaise)}
      accessDays={PRODUCTS.pass.accessDays}
      demo={demoCheckout()}
    />
  );
}
