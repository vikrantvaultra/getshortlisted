import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AUTO_DOMAIN, DOMAIN_COOKIE } from "@/lib/fields";
import { compareCompanies, domainOptions } from "@/lib/server/library";
import { demoCheckout } from "@/lib/server/razorpay";
import { paidEnabled } from "@/lib/site";
import { CompareClient } from "./compare-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare" };

type Props = { searchParams: Promise<{ domain?: string }> };

/**
 * Open to everyone. The comparison runs first; the other resumes unlock after paying.
 * Opens on the role from the link, else the one remembered from the visitor's scan,
 * else reads it off the uploaded resume.
 */
export default async function ComparePage({ searchParams }: Props) {
  if (!paidEnabled()) notFound();
  const domains = domainOptions();
  const known = (slug: string | undefined) => (slug && domains.some((d) => d.slug === slug) ? slug : undefined);
  const fromLink = known((await searchParams).domain);
  const remembered = known((await cookies()).get(DOMAIN_COOKIE)?.value);
  return (
    <CompareClient
      domains={domains}
      companies={compareCompanies()}
      initialDomain={fromLink ?? remembered ?? AUTO_DOMAIN}
      fromScan={!!remembered && (fromLink ?? remembered) === remembered}
      demo={demoCheckout()}
    />
  );
}
