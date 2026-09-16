import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compareCompanies } from "@/lib/server/library";
import { demoCheckout } from "@/lib/server/razorpay";
import { paidEnabled } from "@/lib/site";
import { CompareClient } from "./compare-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare" };

/** Open to everyone. The comparison runs first; the placed resumes unlock after paying. */
export default function ComparePage() {
  if (!paidEnabled()) notFound();
  return (
    <CompareClient
      companies={compareCompanies().map((c) => c.company)}
      demo={demoCheckout()}
    />
  );
}
