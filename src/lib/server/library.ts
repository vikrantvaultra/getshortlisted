import { COMPARE, LIBRARY, type Level } from "@/config";
import { LIBRARY_RESUMES } from "@/data/library-resumes";
import type { LibraryResume } from "@/data/types";
import type { LibraryFilters } from "@/lib/library-query";
import { store } from "./store";

/** Library = hardcoded sample resumes + submissions approved in this process with public consent. */
export function allResumes(): LibraryResume[] {
  const approved = [...store().resumes.values()];
  return [...approved, ...LIBRARY_RESUMES].sort((a, b) => b.year - a.year || a.company.localeCompare(b.company));
}

export function getResume(id: string): LibraryResume | undefined {
  return allResumes().find((resume) => resume.id === id);
}

/** Filters, then slices one page. Out-of-range pages are clamped to the last page. */
export function queryLibrary(filters: LibraryFilters, page: number) {
  const words = (filters.search ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const matches = allResumes().filter((resume) => {
    if (filters.company && resume.company !== filters.company) return false;
    if (filters.year && resume.year !== filters.year) return false;
    if (filters.level && resume.level !== filters.level) return false;
    if (words.length) {
      // Every word must appear somewhere in the role, company or city.
      const haystack = `${resume.role} ${resume.company} ${resume.city}`.toLowerCase();
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
  };
}

export function facets() {
  const resumes = allResumes();
  const unique = <T,>(values: T[]) => [...new Set(values)];
  return {
    companies: unique(resumes.map((r) => r.company)).sort(),
    years: unique(resumes.map((r) => r.year)).sort((a, b) => b - a),
  };
}

export function compareCompanies(): { company: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const resume of allResumes()) counts.set(resume.company, (counts.get(resume.company) ?? 0) + 1);
  return [...counts]
    .filter(([, count]) => count >= COMPARE.SET_SIZE)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => a.company.localeCompare(b.company));
}

/** Five resumes for a company: same level first, then most recent. */
export function compareSet(company: string, level?: Level): LibraryResume[] {
  return allResumes()
    .filter((resume) => resume.company === company)
    .sort((a, b) => Number(b.level === level) - Number(a.level === level) || b.year - a.year)
    .slice(0, COMPARE.SET_SIZE);
}
