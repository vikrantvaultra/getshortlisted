import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ShieldIcon } from "@/components/icons";
import { PayPanel } from "@/components/pay-panel";
import { ResumeText } from "@/components/resume-text";
import { SampleTag } from "@/components/sample-tag";
import { PRODUCTS } from "@/config";
import { hasAccess } from "@/lib/server/access";
import { getResume } from "@/lib/server/library";
import { demoCheckout } from "@/lib/server/razorpay";
import { formatRupees, paidEnabled } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Library", robots: { index: false } };

export default async function LibraryResumePage({ params }: { params: Promise<{ id: string }> }) {
  if (!paidEnabled()) notFound();
  const unlocked = await hasAccess();
  const resume = getResume((await params).id);
  if (!resume) notFound();

  const meta: [string, string][] = [
    ["Offer year", String(resume.year)],
    ["Level", resume.level === "experienced" ? "Experienced" : "Fresher"],
    ["College", resume.collegeTier],
    ["City", resume.city],
    ["Length", `${resume.pageCount} page${resume.pageCount > 1 ? "s" : ""}`],
  ];

  return (
    <article className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
      <Link href="/library" className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-text">
        <ArrowLeftIcon className="h-4 w-4" /> Back to library
      </Link>
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
        <header className="panel rise p-5 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center gap-2">
            {resume.verified ? (
              <span className="chip bg-[#effaf3] text-[#0b6b35]">
                <ShieldIcon className="h-4 w-4" /> Offer verified
              </span>
            ) : (
              <span className="chip">Unverified</span>
            )}
            {resume.sample && <SampleTag className="" />}
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold">{resume.role}</h1>
          <p className="mt-1 font-display text-2xl font-semibold">
            <span className="marker">{resume.company}</span>
          </p>
          <dl className="mt-5 divide-y divide-edge rounded-2xl bg-wash px-4">
            {meta.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-soft">{label}</dt>
                <dd className="font-mono font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {resume.sample && <p className="mt-4 text-sm text-soft">Demo resume written for this build — not a real person&apos;s.</p>}
        </header>
        {unlocked ? (
          <div className="sheet-paper rise p-6 sm:p-10" style={{ ["--delay" as string]: "120ms" }}>
            <ResumeText text={resume.redactedText} />
          </div>
        ) : (
          <div className="relative min-h-[36rem] overflow-hidden rounded-[inherit]">
            <LockedSheet lines={outline(resume.redactedText)} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/90" />
            <div className="absolute inset-0 flex items-start justify-center px-3 pt-8 sm:pt-14">
              <PayPanel
                className="w-full max-w-sm"
                title={`Read this ${resume.company} resume in full`}
                price={formatRupees(PRODUCTS.pass.pricePaise)}
                accessDays={PRODUCTS.pass.accessDays}
                demo={demoCheckout()}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

type OutlineLine = { kind: "head" | "bullet" | "line"; width: number };

/** The resume's shape (section heads, line lengths) with none of its words. */
function outline(text: string): OutlineLine[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((line) => ({
      kind: /^[A-Z][A-Z0-9 &/,'()-]{2,}$/.test(line) ? "head" : /^[•\-*]\s/.test(line) ? "bullet" : "line",
      width: Math.round(Math.min(100, Math.max(25, line.length * 1.1))),
    }));
}

/** Blurred placeholder for a locked resume. Takes only the outline so the text can't reach the page payload. */
function LockedSheet({ lines }: { lines: OutlineLine[] }) {
  return (
    <div aria-hidden className="sheet-paper pointer-events-none p-6 blur-[3px] select-none sm:p-10">
      {lines.map((line, i) =>
        line.kind === "head" ? (
          <span key={i} className={`block h-2.5 w-32 rounded-full bg-pen/50 ${i ? "mt-7" : ""}`} />
        ) : (
          <span key={i} className={`block h-2.5 rounded-full ${line.kind === "bullet" ? "mt-2.5 ml-4 bg-edge-strong" : "mt-4 bg-text/40"}`} style={{ width: `${line.width}%` }} />
        ),
      )}
    </div>
  );
}
