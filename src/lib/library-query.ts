import { LEVELS, type Level } from "@/config";
import { isFieldId, type FieldId } from "@/lib/fields";

/**
 * Library filters live in the URL, so Back/Forward, refresh and shared links
 * always show the same results. Shared by the server page and client controls.
 */

export type LibraryFilters = {
  /** Broad field ("teaching"). Ignored when a domain is set: the domain implies it. */
  field?: FieldId;
  /**
   * Domain slug ("teacher"), or "all" to show every domain. Left out, the
   * page falls back to the domain remembered from the visitor's scan.
   */
  domain?: string;
  company?: string;
  search?: string;
  year?: number;
  level?: Level;
};

export const ALL_DOMAINS = "all";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

type Facets = { companies: string[]; years: number[]; domains: string[] };

/**
 * Reads filters from the URL and drops anything invalid (unknown company,
 * year with no resumes, bad level) instead of silently matching nothing.
 * `rememberedDomain` (from the scan cookie) applies only when the URL names
 * neither a field nor a domain.
 */
export function parseLibraryParams(raw: RawSearchParams, facets: Facets, rememberedDomain?: string) {
  const fieldParam = first(raw.field);
  const field = isFieldId(fieldParam) ? fieldParam : undefined;
  const domainParam = first(raw.domain).toLowerCase();
  let domain: string | undefined;
  if (domainParam === ALL_DOMAINS) domain = ALL_DOMAINS;
  else if (facets.domains.includes(domainParam)) domain = domainParam;
  else if (!field && !domainParam && rememberedDomain && facets.domains.includes(rememberedDomain)) domain = rememberedDomain;
  const fromScan = !!domain && domain !== ALL_DOMAINS && domain === rememberedDomain;

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
  const filters: LibraryFilters = {
    field: domain && domain !== ALL_DOMAINS ? undefined : field,
    domain,
    company,
    search,
    year,
    level,
  };
  return { filters, page, fromScan };
}

/** Builds a clean URL: only set filters, and page only when it isn't 1. */
export function libraryHref(filters: LibraryFilters, page = 1): string {
  const params = new URLSearchParams();
  if (filters.domain) params.set("domain", filters.domain);
  if (filters.field && (!filters.domain || filters.domain === ALL_DOMAINS)) {
    params.set("field", filters.field);
    params.delete("domain");
  }
  if (filters.company) params.set("company", filters.company);
  if (filters.search?.trim()) params.set("q", filters.search.trim());
  if (filters.year) params.set("year", String(filters.year));
  if (filters.level) params.set("level", filters.level);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

export function activeDomain(filters: LibraryFilters): string | undefined {
  return filters.domain && filters.domain !== ALL_DOMAINS ? filters.domain : undefined;
}

export function hasActiveFilters(filters: LibraryFilters): boolean {
  return Boolean(activeDomain(filters) || filters.field || filters.company || filters.search?.trim() || filters.year || filters.level);
}
