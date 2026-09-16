import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ShieldIcon } from "@/components/icons";
import { PayPanel } from "@/components/pay-panel";
import { ResumeText } from "@/components/resume-text";
import { OriginTag } from "@/components/sample-tag";
import { domainLabel, domainSlug, fieldLabel } from "@/lib/fields";
import { hasAccess } from "@/lib/server/access";
import { getResume, resumeField } from "@/lib/server/library";
import { demoCheckout } from "@/lib/server/razorpay";
import { paidEnabled } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Library", robots: { index: false } };

export default async function LibraryResumePage({ params }: { params: Promise<{ id: string }> }) {
  if (!paidEnabled()) notFound();
  const unlocked = await hasAccess();
  const resume = getResume((await params).id);
  if (!resume) notFound();

  // A model resume's year/level/college describe the profile it was written for,
  // not a person who holds the offer. Label them as a target, never as a fact.
  const meta: [string, string][] = [
    ["Role", domainLabel(resume.domain)],
    ["Field", fieldLabel(resumeField(resume))],
  ];
  if (resume.year !== null) {
    meta.push(!resume.sample ? ["Offer year", String(resume.year)] : ["Written for", `${resume.year} cycle`]);
  }
  meta.push(["Level", resume.level === "experienced" ? "Experienced" : "Fresher"]);
  if (resume.collegeTier !== "Not disclosed") meta.push(["College", resume.collegeTier]);
  if (resume.city) meta.push(["City", resume.city]);
  meta.push(["Length", `${resume.pageCount} page${resume.pageCount > 1 ? "s" : ""}${resume.origin === "open-dataset" ? " (est.)" : ""}`]);
  const title = resume.company ? `${resume.company} resume` : `${domainLabel(resume.domain)} resume`;

  return (
    <article className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
      <Link
        href={`/library?domain=${domainSlug(resume.domain)}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft hover:text-text"
      >
        <ArrowLeftIcon className="h-4 w-4" /> More {domainLabel(resume.domain)} resumes
      </Link>
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
        <header className="panel rise p-5 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center gap-2">
            {/* "Offer verified" means an admin checked real offer proof. A written
                model resume has no offer behind it, so it never gets that badge. */}
            {resume.sample ? (
              <OriginTag resume={resume} className="" />
            ) : resume.verified ? (
              <span className="chip bg-[#effaf3] text-[#0b6b35]">
                <ShieldIcon className="h-4 w-4" /> Offer verified
              </span>
            ) : (
              <span className="chip">Unverified</span>
            )}
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold">{resume.role}</h1>
          <p className="mt-1 font-display text-2xl font-semibold">
            <span className="marker">{resume.company ?? fieldLabel(resumeField(resume))}</span>
          </p>
          <dl className="mt-5 divide-y divide-edge rounded-2xl bg-wash px-4">
            {meta.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-soft">{label}</dt>
                <dd className="font-mono font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {resume.sample && resume.origin !== "open-dataset" && (
            <p className="mt-4 text-sm text-soft">
              Written to show the structure, specificity and length that clears a first-round screen for this role.
            </p>
          )}
          {resume.origin === "open-dataset" && (
            <p className="mt-4 text-sm text-soft">
              A generated example of how {domainLabel(resume.domain)} resumes are usually written — not a real person&apos;s, and not a
              guarantee of an offer. Names and contact details are removed.
              {resume.source && (
                <>
                  {" "}
                  Source:{" "}
                  <a href={resume.source.url} className="underline" target="_blank" rel="noreferrer">
                    {resume.source.dataset}
                  </a>{" "}
                  ({resume.source.license}).
                </>
              )}
            </p>
          )}
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
                title={`Read this ${title} in full`}
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
