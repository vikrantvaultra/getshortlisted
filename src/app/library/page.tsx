import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, LockIcon } from "@/components/icons";
import { SampleTag } from "@/components/sample-tag";
import type { LibraryResume } from "@/data/types";
import { hasAccess } from "@/lib/server/access";
import { hasActiveFilters, parseLibraryParams, type RawSearchParams } from "@/lib/library-query";
import { allResumes, facets, queryLibrary } from "@/lib/server/library";
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
  const { companies, years } = facets();

  const facetValues = { companies, years };
  const { filters, page } = parseLibraryParams(raw, facetValues);
  const result = queryLibrary(filters, page);
  const filtered = hasActiveFilters(filters);

  return (
    <LibraryNav>
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <p className="kicker">Library</p>
        <h1 className="mt-2 text-title font-extrabold">
          Resumes that <span className="marker">got the offer</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-soft">
          Real resumes from people who got placed, anonymised and with the offer checked by hand. Filter by company, role, year and level, then
          open any one to read it in full.
        </p>
        {!unlocked && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-marker-soft px-3 py-2 text-sm text-marker-ink">
            <LockIcon className="h-4 w-4 shrink-0" /> Browse and filter freely. Open a resume to unlock the full text.
          </p>
        )}

        <FilterBar companies={companies} years={years} filters={filters} />

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
              <Link href="/library" className="btn btn-outline mt-5">
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

        <SampleNotice count={result.resumes.filter((r) => r.sample).length} />
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
        {resume.sample && <SampleTag className="shrink-0" />}
      </div>
      <p className="mt-1 font-display text-lg font-semibold">
        <span className="marker">{resume.company}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="chip bg-white px-2.5 py-1 font-mono text-xs ring-1 ring-edge">{resume.year}</span>
        <span className="chip bg-white px-2.5 py-1 text-xs capitalize ring-1 ring-edge">{resume.level}</span>
        <span className="chip bg-white px-2.5 py-1 text-xs ring-1 ring-edge">{resume.collegeTier}</span>
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
          {resume.pageCount}p · {resume.city}
        </span>
        <span className="flex items-center gap-1 font-semibold text-pen">
          {locked && <LockIcon className="h-3.5 w-3.5" />}
          Read <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

function SampleNotice({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <p className="mx-auto mt-10 max-w-2xl rounded-2xl bg-wash px-4 py-3 text-center text-sm text-soft">
      {count} of these are marked <SampleTag className="mx-0.5" />: demo resumes written for this build, not real people&apos;s. They show how
      the library works and will be replaced by verified submissions.
    </p>
  );
}
