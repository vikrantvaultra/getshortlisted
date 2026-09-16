import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, LockIcon, SparkleIcon } from "@/components/icons";
import { ExampleResumeTag, ModelResumeTag, OriginTag } from "@/components/sample-tag";
import type { LibraryResume } from "@/data/types";
import { DOMAIN_COOKIE, domainLabel, fieldLabel } from "@/lib/fields";
import { hasActiveFilters, libraryHref, parseLibraryParams, type RawSearchParams } from "@/lib/library-query";
import { hasAccess } from "@/lib/server/access";
import { allResumes, domainOptions, facets, queryLibrary, resumeField as resumeFieldOf } from "@/lib/server/library";
import { paidEnabled } from "@/lib/site";
import { FilterBar } from "./_browser/filter-bar";
import { LibraryNav, ResultsFrame } from "./_browser/library-nav";
import { Pagination } from "./_browser/pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Library" };

type Props = { searchParams: Promise<RawSearchParams> };

export default async function LibraryPage({ searchParams }: Props) {
  if (!paidEnabled()) notFound();
  const raw = await searchParams;
  const unlocked = await hasAccess();
  const all = allResumes();
  const domains = domainOptions();
  const remembered = (await cookies()).get(DOMAIN_COOKIE)?.value;
  // Real submissions with offer proof checked. Drives whether the page may
  // claim placed candidates at all — it can't while the library is all examples.
  const placedCount = all.filter((r) => r.origin === "submission" && !r.sample && r.verified).length;

  // Company and year lists depend on the field/domain, so parse those first.
  const scope = parseLibraryParams(raw, { companies: [], years: [], domains: domains.map((d) => d.slug) }, remembered).filters;
  const { companies, years, fieldCounts } = facets(scope);
  const { filters, page, fromScan } = parseLibraryParams(raw, { companies, years, domains: domains.map((d) => d.slug) }, remembered);
  const result = queryLibrary(filters, page);
  const filtered = hasActiveFilters(filters);
  const domain = result.domain;
  const label = domain ? domainLabel(domain.domain) : filters.field ? fieldLabel(filters.field) : null;

  return (
    <LibraryNav>
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <p className="kicker">Library</p>
        <h1 className="mt-2 text-title font-extrabold">
          {label ? (
            <>
              <span className="marker">{label}</span> resumes to learn from
            </>
          ) : (
            <>
              Resumes that <span className="marker">get shortlisted</span>
            </>
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-soft">
          {placedCount > 0 ? (
            <>
              {placedCount} anonymised {placedCount === 1 ? "resume" : "resumes"} from people who got placed, each with the offer checked by
              hand, alongside example resumes for {domains.length} roles.
            </>
          ) : (
            <>
              Example resumes for {domains.length} roles, from teaching and nursing to sales and software. Pick your role to read resumes from your
              own line of work, then open any one to read it in full.
            </>
          )}
        </p>
        {fromScan && domain && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-pen-wash px-3 py-2 text-sm text-pen">
            <SparkleIcon className="h-4 w-4 shrink-0" />
            <span>
              Showing <strong className="font-semibold">{domainLabel(domain.domain)}</strong> resumes because that&apos;s what your scanned resume
              looks like. Not right? Pick another role below.
            </span>
          </p>
        )}
        {!unlocked && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-marker-soft px-3 py-2 text-sm text-marker-ink">
            <LockIcon className="h-4 w-4 shrink-0" /> Browse and filter freely. Open a resume to unlock the full text.
          </p>
        )}

        <FilterBar domains={domains} fieldCounts={fieldCounts} companies={companies} years={years} filters={filters} />

        {domain && result.borrowedFrom && (
          <div className="mt-4 rounded-2xl bg-wash px-4 py-3 text-sm text-soft">
            {result.ownCount === 0 ? (
              <>
                There are no readable {domainLabel(domain.domain)} resumes yet
              </>
            ) : (
              <>
                There {result.ownCount === 1 ? "is" : "are"} only {result.ownCount} readable {domainLabel(domain.domain)}{" "}
                {result.ownCount === 1 ? "resume" : "resumes"} so far
              </>
            )}
            , so the closest role&apos;s are included: <strong className="font-semibold text-text">{domainLabel(result.borrowedFrom)}</strong>.
            {domain.real + domain.synthetic >= 20 && (
              <>
                {" "}
                Compare still measures your resume against the typical {domainLabel(domain.domain)} resume, counted across{" "}
                {(domain.real + domain.synthetic).toLocaleString("en-IN")} of them.{" "}
                <Link href={`/compare?domain=${domain.slug}`} className="font-semibold text-pen hover:underline">
                  Compare yours
                </Link>
              </>
            )}
          </div>
        )}

        <ResultsFrame>
          <p className="mt-6 font-mono text-sm text-soft" aria-live="polite">
            {result.total === 0 ? (
              "No resumes found"
            ) : (
              <>
                Showing <span className="text-text">{result.from}–{result.to}</span> of <span className="text-text">{result.total}</span>
                {filtered ? ` matching (${all.length} in total)` : " resumes"}
              </>
            )}
          </p>

          {result.total === 0 ? (
            <div className="panel mt-4 p-10 text-center">
              <p className="font-display text-2xl font-extrabold">Nothing matches those filters</p>
              <p className="mt-1 text-soft">Try removing one, or search for something broader.</p>
              <Link href={libraryHref({ domain: "all" })} className="btn btn-outline mt-5">
                Clear all filters
              </Link>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.resumes.map((resume, i) => (
                <li key={resume.id} className="rise" style={{ ["--delay" as string]: `${Math.min(i * 35, 280)}ms` }}>
                  <Link href={`/library/${resume.id}`} className="group block h-full transition-transform hover:-translate-y-1">
                    <ResumeCard resume={unlocked ? resume : { ...resume, redactedText: "" }} locked={!unlocked} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Pagination filters={filters} page={result.page} pageCount={result.pageCount} />
          {result.pageCount > 1 && (
            <p className="mt-3 text-center font-mono text-xs text-faint">
              Page {result.page} of {result.pageCount}
            </p>
          )}
        </ResultsFrame>

        <SampleNotice resumes={result.resumes} />
      </section>
    </LibraryNav>
  );
}

function ResumeCard({ resume, locked }: { resume: LibraryResume; locked: boolean }) {
  // Locked cards never render resume text, only placeholder bars.
  const preview = locked
    ? []
    : resume.redactedText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[•\-*]\s/.test(line))
    .slice(0, 2)
    .map((line) => line.replace(/^[•\-*]\s+/, ""));

  return (
    <div className="sheet-paper flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-xl leading-tight font-extrabold">{resume.role}</p>
        <OriginTag resume={resume} className="shrink-0" />
      </div>
      <p className="mt-1 font-display text-lg font-semibold">
        <span className="marker">{resume.company ?? fieldLabel(resumeFieldOf(resume))}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {resume.year !== null && <span className="chip bg-white px-2.5 py-1 font-mono text-xs ring-1 ring-edge">{resume.year}</span>}
        <span className="chip bg-white px-2.5 py-1 text-xs capitalize ring-1 ring-edge">{resume.level}</span>
        {resume.collegeTier !== "Not disclosed" && <span className="chip bg-white px-2.5 py-1 text-xs ring-1 ring-edge">{resume.collegeTier}</span>}
      </div>
      {locked ? (
        <div aria-hidden className="mt-4 flex-1 space-y-2.5 pt-1 blur-[2px]">
          <span className="block h-2 w-11/12 rounded-full bg-edge-strong" />
          <span className="block h-2 w-3/4 rounded-full bg-edge-strong" />
          <span className="block h-2 w-5/6 rounded-full bg-edge-strong" />
        </div>
      ) : (
        <ul className="mt-4 flex-1 space-y-1.5 text-sm text-soft">
          {preview.map((line) => (
            <li key={line} className="line-clamp-2">
              {line}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-edge pt-3 text-sm">
        <span className="font-mono text-faint">
          {resume.pageCount}p{resume.city ? ` · ${resume.city}` : ""}
        </span>
        <span className="flex items-center gap-1 font-semibold text-pen">
          {locked && <LockIcon className="h-3.5 w-3.5" />}
          Read <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

function SampleNotice({ resumes }: { resumes: LibraryResume[] }) {
  const models = resumes.filter((r) => r.sample && r.origin !== "open-dataset").length;
  const generated = resumes.filter((r) => r.origin === "open-dataset").length;
  if (!models && !generated) return null;
  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-2 rounded-2xl bg-wash px-4 py-3 text-center text-sm text-soft">
      {models > 0 && (
        <p>
          <ModelResumeTag className="mr-1" />s are written by us for a specific company and role, to show the structure a shortlisted resume has.
        </p>
      )}
      {generated > 0 && (
        <p>
          <ExampleResumeTag className="mr-1" /> resumes come from{" "}
          <Link href="/sources" className="font-semibold text-text underline">
            openly licensed datasets
          </Link>{" "}
          of generated resumes
          and show how resumes in each role are usually written. None is a real person&apos;s.
        </p>
      )}
      <p>
        Only resumes with an <strong className="font-semibold text-text">Offer verified</strong> badge are real submissions with offer proof checked.
      </p>
    </div>
  );
}
