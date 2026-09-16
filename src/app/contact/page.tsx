import type { Metadata } from "next";
import Link from "next/link";
import { LinkIcon } from "@/components/icons";
import { LegalHeader } from "@/components/legal-header";
import { SITE } from "@/config";

export const metadata: Metadata = {
  title: "Contact us",
  description: `How to reach ${SITE.name}, operated by ${SITE.operator}, ${SITE.city}.`,
};

export default function ContactPage() {
  const rows: [string, React.ReactNode][] = [
    ["Operated by", <a key="op" href={SITE.operatorUrl}>{SITE.operator}</a>],
    ["Location", SITE.city],
    ["Email", <a key="em" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>],
    ["Phone", <a key="ph" href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>],
    ["Privacy and grievances", <a key="gr" href={`mailto:${SITE.grievanceEmail}`}>{SITE.grievanceEmail}</a>],
    ["Support hours", "Monday to Saturday, 10am–6pm IST"],
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-14">
      <LegalHeader label="Contact us" icon={<LinkIcon className="h-4 w-4" />}>
        Talk to a <span className="marker">person</span>.
      </LegalHeader>

      <dl className="rise panel prose-legal mt-9 divide-y divide-edge px-5" style={{ ["--delay" as string]: "100ms" }}>
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="font-semibold text-text">{label}</dt>
            <dd className="text-soft">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-soft">
        We reply to emails within 2 working days. For payment problems, include your Razorpay order or payment ID. See our{" "}
        <Link href="/refund" className="underline underline-offset-4">refund policy</Link> and{" "}
        <Link href="/terms" className="underline underline-offset-4">terms</Link>.
      </p>
    </article>
  );
}
