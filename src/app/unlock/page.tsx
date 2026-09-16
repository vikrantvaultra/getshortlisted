import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import { PayPanel } from "@/components/pay-panel";
import { BASE_PRODUCT, PRODUCTS } from "@/config";
import { demoCheckout } from "@/lib/server/razorpay";
import { paidEnabled, safeNextPath } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unlock", robots: { index: false } };

type Props = { searchParams: Promise<{ restore?: string; next?: string }> };

const PERKS = [
  "Compare: your resume next to 5 for your own role — 147 roles, from teacher and nurse to sales and software",
  "The typical range for your role, plus pages, section order, bullets and phrasing overlap — counted, not guessed",
  "Library: read every resume in full, filtered by field, role, company and level",
  "Anonymised — no names, contacts or exact dates",
];

/** Mostly reached from the "restore access" email link; the paywalls themselves sit on each result. */
export default async function UnlockPage({ searchParams }: Props) {
  if (!paidEnabled()) notFound();
  const { restore, next } = await searchParams;

  return (
    <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-14">
      <div className="grid items-start gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
        <div className="rise">
          <span className="sticker">Full access</span>
          <h1 className="mt-5 text-title font-extrabold">
            Read the resumes that <span className="marker">get shortlisted</span>.
          </h1>
          <p className="mt-4 text-lg text-soft">{PRODUCTS[BASE_PRODUCT].description}</p>
          <ul className="mt-7 space-y-3">
            {PERKS.map((perk, i) => (
              <li key={perk} className="rise flex items-start gap-3" style={{ ["--delay" as string]: `${100 + i * 70}ms` }}>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-pen-wash text-pen">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <span className="text-text">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
        <PayPanel
          className="self-start"
          demo={demoCheckout()}
          startWithRestore={restore === "1"}
          next={safeNextPath(next) ?? "/library"}
        />
      </div>
    </section>
  );
}
