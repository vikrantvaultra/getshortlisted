import { COMPARE, LIBRARY, type Level } from "@/config";
import { LIBRARY_RESUMES } from "@/data/library-resumes";
import type { LibraryResume, ResumeOrigin } from "@/data/types";
import { domainLabel, type DomainOption, type FieldId } from "@/lib/fields";
import type { LibraryFilters } from "@/lib/library-query";
import { domainByName, domainBySlug, domainEntries, fieldOf, openLibrary } from "./domains";
import type { DomainEntry, DomainStats, MeasureRange } from "./open-library-types";
import { store } from "./store";

/**
 * Library = approved submissions + hand-written model resumes + AI-generated
 * resumes from the open datasets (one shelf per job domain).
 */

const ORIGIN_ORDER: Record<ResumeOrigin, number> = { submission: 0, model: 1, "open-dataset": 2 };

const globalCache = globalThis as unknown as { __openResumes?: LibraryResume[] };

function openResumes(): LibraryResume[] {
  if (!globalCache.__openResumes) {
    const { resumes, sources } = openLibrary();
    globalCache.__openResumes = resumes.map((resume) => {
      const source = sources[resume.source];
      return {
        id: resume.id,
        domain: resume.domain,
        company: null,
        role: domainLabel(resume.domain),
        year: null,
        level: resume.level,
        collegeTier: "Not disclosed",
        city: null,
        pageCount: resume.pageCount,
        redactedText: resume.text,
        verified: false,
        sample: true,
        origin: "open-dataset",
        source: source ? { dataset: source.dataset, license: source.license, url: source.url } : undefined,
      };
    });
  }
  return globalCache.__openResumes;
}

export function allResumes(): LibraryResume[] {
  const approved = [...store().resumes.values()];
  return [...approved, ...LIBRARY_RESUMES, ...openResumes()].sort(
    (a, b) =>
      ORIGIN_ORDER[a.origin] - ORIGIN_ORDER[b.origin] ||
      (b.year ?? 0) - (a.year ?? 0) ||
      (a.company ?? "").localeCompare(b.company ?? "") ||
      a.role.localeCompare(b.role),
  );
}

export function getResume(id: string): LibraryResume | undefined {
  return allResumes().find((resume) => resume.id === id);
}

export function resumeField(resume: LibraryResume): FieldId {
  return fieldOf(resume.domain);
}

/**
 * A domain's own resumes, topped up from its closest stocked domain when it
 * has fewer than a Compare set. `borrowedFrom` says whose shelf that was.
 */
export function shelf(entry: DomainEntry, pool = allResumes()) {
  const own = pool.filter((resume) => resume.domain === entry.domain);
  const donor = own.length < COMPARE.SET_SIZE && entry.readableFrom ? domainByName(entry.readableFrom) : undefined;
  const borrowed = donor ? pool.filter((resume) => resume.domain === donor.domain) : [];
  return { own, borrowed, borrowedFrom: borrowed.length ? donor!.domain : null };
}

/** Every domain, as the pickers show it, with the size of its shelf. */
export function domainOptions(): DomainOption[] {
  const all = allResumes();
  const counts = new Map<string, number>();
  for (const resume of all) counts.set(resume.domain, (counts.get(resume.domain) ?? 0) + 1);
  return domainEntries().map((entry) => {
    const readable = counts.get(entry.domain) ?? 0;
    return {
      slug: entry.slug,
      label: domainLabel(entry.domain),
      field: entry.field,
      total: entry.real + entry.synthetic,
      readable,
      borrowedFrom: readable < COMPARE.SET_SIZE && entry.readableFrom ? domainLabel(entry.readableFrom) : null,
    };
  });
}

/** Everything the current field/domain scope covers, before the finer filters. */
function scoped(filters: LibraryFilters) {
  const all = allResumes();
  const entry = domainBySlug(filters.domain);
  if (entry) {
    const { own, borrowed, borrowedFrom } = shelf(entry, all);
    return { entry, resumes: [...own, ...borrowed], ownCount: own.length, borrowedFrom };
  }
  const resumes = filters.field ? all.filter((resume) => resumeField(resume) === filters.field) : all;
  return { entry: undefined, resumes, ownCount: resumes.length, borrowedFrom: null };
}

/** Filters, then slices one page. Out-of-range pages are clamped to the last page. */
export function queryLibrary(filters: LibraryFilters, page: number) {
  const { entry, resumes, ownCount, borrowedFrom } = scoped(filters);
  const words = (filters.search ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const matches = resumes.filter((resume) => {
    if (filters.company && resume.company !== filters.company) return false;
    if (filters.year && resume.year !== filters.year) return false;
    if (filters.level && resume.level !== filters.level) return false;
    if (words.length) {
      // Every word must appear somewhere in the role, company, city or domain.
      const haystack = `${resume.role} ${resume.company ?? ""} ${resume.city ?? ""} ${domainLabel(resume.domain)}`.toLowerCase();
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    return true;
  });

  const pageSize = LIBRARY.PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const startIndex = (current - 1) * pageSize;
  return {
    resumes: matches.slice(startIndex, startIndex + pageSize),
    total: matches.length,
    page: current,
    pageCount,
    from: matches.length ? startIndex + 1 : 0,
    to: Math.min(startIndex + pageSize, matches.length),
    domain: entry,
    ownCount,
    borrowedFrom,
  };
}

/** Filter choices, narrowed to what the current field/domain actually contains. */
export function facets(filters: Pick<LibraryFilters, "field" | "domain"> = {}) {
  const { resumes } = scoped(filters);
  const unique = <T,>(values: T[]) => [...new Set(values)];
  const fieldCounts = new Map<FieldId, number>();
  for (const resume of allResumes()) fieldCounts.set(resumeField(resume), (fieldCounts.get(resumeField(resume)) ?? 0) + 1);
  return {
    companies: unique(resumes.map((r) => r.company).filter((c): c is string => !!c)).sort(),
    years: unique(resumes.map((r) => r.year).filter((y): y is number => y !== null)).sort((a, b) => b - a),
    fieldCounts: Object.fromEntries(fieldCounts) as Partial<Record<FieldId, number>>,
  };
}

// ─── Compare ─────────────────────────────────────────────────────────────────

/** Companies with at least a full set of resumes. */
export function compareCompanies(): string[] {
  const counts = new Map<string, number>();
  for (const resume of allResumes()) if (resume.company) counts.set(resume.company, (counts.get(resume.company) ?? 0) + 1);
  return [...counts]
    .filter(([, count]) => count >= COMPARE.SET_SIZE)
    .map(([company]) => company)
    .sort((a, b) => a.localeCompare(b));
}

/** A typical range is only shown when it's counted over enough resumes to mean something. */
export const MIN_RANGE_SAMPLE = 20;

export type CompareSet = {
  resumes: LibraryResume[];
  /** Set when the domain had too few readable resumes and the closest domain's were used. */
  borrowedFrom: string | null;
  /** Middle-half ranges across every resume in the domain, real and AI-generated. */
  ranges: Partial<Record<keyof DomainStats, MeasureRange>>;
};

/**
 * Five resumes to compare against.
 * - With a company: that company's resumes, same domain and field first.
 * - Otherwise: the domain's shelf (topped up from the closest domain if short).
 * Either way, the same level first, then the most recent.
 */
export function compareSet(entry: DomainEntry, options: { company?: string; level?: Level } = {}): CompareSet {
  const { company, level } = options;
  const all = allResumes();
  const byLevel = (a: LibraryResume, b: LibraryResume) =>
    Number(b.level === level) - Number(a.level === level) || ORIGIN_ORDER[a.origin] - ORIGIN_ORDER[b.origin] || (b.year ?? 0) - (a.year ?? 0);

  let resumes: LibraryResume[];
  let borrowedFrom: string | null = null;
  if (company) {
    resumes = all
      .filter((resume) => resume.company === company)
      .sort(
        (a, b) =>
          Number(b.domain === entry.domain) - Number(a.domain === entry.domain) ||
          Number(resumeField(b) === entry.field) - Number(resumeField(a) === entry.field) ||
          byLevel(a, b),
      );
  } else {
    const found = shelf(entry, all);
    // Own resumes always come before borrowed ones, whatever their level.
    resumes = [...found.own.sort(byLevel), ...found.borrowed.sort(byLevel)];
    borrowedFrom = found.own.length < COMPARE.SET_SIZE ? found.borrowedFrom : null;
  }

  const ranges: CompareSet["ranges"] = {};
  for (const [key, range] of Object.entries(entry.stats) as [keyof DomainStats, MeasureRange | null][]) {
    if (range && range.n >= MIN_RANGE_SAMPLE) ranges[key] = range;
  }
  return { resumes: resumes.slice(0, COMPARE.SET_SIZE), borrowedFrom, ranges };
}
