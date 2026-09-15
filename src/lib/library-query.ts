import { LEVELS, type Level } from "@/config";

/**
 * Library filters live in the URL, so Back/Forward, refresh and shared links
 * always show the same results. Shared by the server page and client controls.
 */

export type LibraryFilters = {
  company?: string;
  search?: string;
  year?: number;
  level?: Level;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/**
 * Reads filters from the URL and drops anything invalid (unknown company,
 * year with no resumes, bad level) instead of silently matching nothing.
 */
export function parseLibraryParams(raw: RawSearchParams, facets: { companies: string[]; years: number[] }) {
  const companyParam = first(raw.company).toLowerCase();
  const company = facets.companies.find((name) => name.toLowerCase() === companyParam);
  // `role` is accepted for links made before search also covered company names.
  const search = (first(raw.q) || first(raw.role)).slice(0, 80) || undefined;
  const yearNumber = Number(first(raw.year));
  const year = facets.years.includes(yearNumber) ? yearNumber : undefined;
  const levelParam = first(raw.level).toLowerCase();
  const level = LEVELS.find((value) => value === levelParam);
  const pageNumber = Number.parseInt(first(raw.page), 10);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  return { filters: { company, search, year, level } satisfies LibraryFilters, page };
}

/** Builds a clean URL: only set filters, and page only when it isn't 1. */
export function libraryHref(filters: LibraryFilters, page = 1): string {
  const params = new URLSearchParams();
  if (filters.company) params.set("company", filters.company);
  if (filters.search?.trim()) params.set("q", filters.search.trim());
  if (filters.year) params.set("year", String(filters.year));
  if (filters.level) params.set("level", filters.level);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

export function hasActiveFilters(filters: LibraryFilters): boolean {
  return Boolean(filters.company || filters.search?.trim() || filters.year || filters.level);
}
