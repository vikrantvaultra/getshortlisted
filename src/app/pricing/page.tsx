import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, SparkleIcon } from "@/components/icons";
import { LegalHeader } from "@/components/legal-header";
import { PRODUCTS, SITE, type ProductId } from "@/config";
import { formatDays, formatRupees } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${SITE.name} pricing: a free resume check, plus one-time paid access to Compare and the Library. No subscription.`,
};

const FREE_PERKS = ["Upload a resume and get its score in seconds", "See which lines appear in other resumes", "No signup, and your file is never saved"];

const PAID_PERKS = [
  "Everything in Free",
  "Compare your resume with five for your own role",
  "Read every anonymised resume in the Library",
  "One-time payment, no auto-renewal",
];

const PAID: ProductId[] = ["pass", "lifetime"];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-14">
      <LegalHeader label="Pricing" icon={<SparkleIcon className="h-4 w-4" />}>
        Simple, <span className="marker">one-time</span> pricing.
      </LegalHeader>
      <p className="mt-4 max-w-2xl text-lg text-soft">
        {SITE.name} is self-serve resume analysis software. Every result is calculated automatically. Prices are in Indian Rupees and
        include taxes.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <Plan name="Free" price="₹0" note="Resume check" perks={FREE_PERKS} href="/" cta="Check a resume" />
        {PAID.map((id) => {
          const p = PRODUCTS[id];
          return (
            <Plan
              key={id}
              name={p.name}
              price={formatRupees(p.pricePaise)}
              note={p.lifetime ? "one-time · no expiry" : `one-time · ${formatDays(p.accessDays)}`}
              perks={PAID_PERKS}
              href="/unlock"
              cta="Get access"
              featured={p.lifetime}
            />
          );
        })}
      </div>

      <p className="mt-8 text-sm text-soft">
        Payments are processed securely by Razorpay (UPI, cards, net banking and wallets). Access starts immediately. Read the{" "}
        <Link href="/refund" className="underline underline-offset-4">refund policy</Link> and{" "}
        <Link href="/terms" className="underline underline-offset-4">terms</Link>.
      </p>
    </section>
  );
}

function Plan(props: { name: string; price: string; note: string; perks: string[]; href: string; cta: string; featured?: boolean }) {
  return (
    <div className={`panel flex flex-col p-6 ${props.featured ? "ring-2 ring-pen" : ""}`}>
      <h2 className="text-lg font-bold">{props.name}</h2>
      <p className="mt-3 text-4xl font-extrabold">{props.price}</p>
      <p className="mt-1 font-mono text-sm text-soft">{props.note}</p>
      <ul className="mt-6 flex-1 space-y-2.5">
        {props.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-[0.95rem]">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-pen" />
            {perk}
          </li>
        ))}
      </ul>
      <Link href={props.href} className={`btn mt-6 w-full ${props.featured ? "" : "btn-outline"}`}>
        {props.cta}
      </Link>
    </div>
  );
}
