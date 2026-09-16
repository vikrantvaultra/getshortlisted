"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { LIBRARY, type Level } from "@/config";
import { FIELDS, fieldLabel, rememberDomain, type DomainOption, type FieldId } from "@/lib/fields";
import { ALL_DOMAINS, activeDomain, hasActiveFilters, libraryHref, type LibraryFilters } from "@/lib/library-query";
import { useLibraryNav } from "./library-nav";

type Props = {
  domains: DomainOption[];
  fieldCounts: Partial<Record<FieldId, number>>;
  companies: string[];
  years: number[];
  /** Current filters as parsed from the URL on the server — the source of truth. */
  filters: LibraryFilters;
};

const LEVEL_LABEL: Record<Level, string> = { fresher: "Fresher", experienced: "Experienced" };

/**
 * Filters apply as soon as they change — no "Filter" button to find.
 * Every control is driven by the URL, so Back, refresh and "Clear" always
 * show the right values.
 */
export function FilterBar({ domains, fieldCounts, companies, years, filters }: Props) {
  const { navigate } = useLibraryNav();
  const [search, setSearch] = useState(filters.search ?? "");
  const lastSearch = useRef(filters.search ?? "");

  const domainSlug = activeDomain(filters);
  const domain = domains.find((option) => option.slug === domainSlug);
  const field = domain?.field ?? filters.field;
  const domainChoices = field ? domains.filter((option) => option.field === field) : domains;

  // URL changed (Back/Forward, chip removed, Clear all): show what the URL says.
  useEffect(() => {
    const fromUrl = filters.search ?? "";
    if (fromUrl !== lastSearch.current) {
      lastSearch.current = fromUrl;
      setSearch(fromUrl);
    }
  }, [filters.search]);

  // Search as you type, after a short pause. Replace (not push) so typing doesn't flood history.
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === (filters.search ?? "").trim()) return;
    const timer = setTimeout(() => {
      lastSearch.current = trimmed;
      navigate(libraryHref({ ...filters, search: trimmed || undefined }), { replace: true });
    }, LIBRARY.SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, filters, navigate]);

  function apply(next: LibraryFilters) {
    // Any filter change starts again from page 1.
    navigate(libraryHref({ ...next, search: search.trim() || undefined }));
  }

  function chooseDomain(slug: string) {
    if (slug) rememberDomain(slug);
    // Company and year lists differ per domain; a stale one would match nothing.
    apply({ ...filters, domain: slug || ALL_DOMAINS, field: slug ? undefined : field, company: undefined, year: undefined });
  }

  function chooseField(id: FieldId | "") {
    apply({ ...filters, field: id || undefined, domain: ALL_DOMAINS, company: undefined, year: undefined });
  }

  const chips: { label: string; remove: LibraryFilters }[] = [];
  if (domain) chips.push({ label: domain.label, remove: { ...filters, domain: ALL_DOMAINS, field: domain.field } });
  else if (filters.field) chips.push({ label: fieldLabel(filters.field), remove: { ...filters, field: undefined, domain: ALL_DOMAINS } });
  if (filters.company) chips.push({ label: filters.company, remove: { ...filters, company: undefined } });
  if (filters.search) chips.push({ label: `“${filters.search}”`, remove: { ...filters, search: undefined } });
  if (filters.year) chips.push({ label: String(filters.year), remove: { ...filters, year: undefined } });
  if (filters.level) chips.push({ label: LEVEL_LABEL[filters.level], remove: { ...filters, level: undefined } });

  const active = (on: unknown) => (on ? "border-pen bg-pen-wash font-semibold" : "");

  return (
    <div className="mt-7">
      <form
        role="search"
        className="panel grid grid-cols-2 gap-2.5 p-3 lg:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          lastSearch.current = search.trim();
          navigate(libraryHref({ ...filters, search: search.trim() || undefined }));
        }}
      >
        <div className="relative col-span-2 lg:col-span-6">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input pr-10 pl-10"
            placeholder="Search role, company or city"
            aria-label="Search role, company or city"
            enterKeyHint="search"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-faint hover:bg-wash hover:text-text"
              aria-label="Clear search"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          name="field"
          value={field ?? ""}
          onChange={(event) => chooseField(event.target.value as FieldId | "")}
          className={`input col-span-2 lg:col-span-2 ${active(field)}`}
          aria-label="Field"
        >
          <option value="">All fields</option>
          {FIELDS.filter((option) => fieldCounts[option.id]).map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} ({fieldCounts[option.id]})
            </option>
          ))}
        </select>

        <select
          name="domain"
          value={domain?.slug ?? ""}
          onChange={(event) => chooseDomain(event.target.value)}
          className={`input col-span-2 lg:col-span-2 ${active(domain)}`}
          aria-label="Role"
        >
          <option value="">{field ? `All ${fieldLabel(field)} roles` : "All roles"}</option>
          {field
            ? domainChoices.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))
            : FIELDS.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {domains
                    .filter((option) => option.field === group.id)
                    .map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
              ))}
        </select>

        <select
          name="level"
          value={filters.level ?? ""}
          onChange={(event) => apply({ ...filters, level: (event.target.value || undefined) as Level | undefined })}
          className={`input ${companies.length || years.length ? "" : "col-span-2"} lg:col-span-2 ${active(filters.level)}`}
          aria-label="Level"
        >
          <option value="">Any level</option>
          <option value="fresher">Fresher</option>
          <option value="experienced">Experienced</option>
        </select>

        {companies.length > 0 && (
          <select
            name="company"
            value={filters.company ?? ""}
            onChange={(event) => apply({ ...filters, company: event.target.value || undefined })}
            className={`input lg:col-span-2 ${active(filters.company)}`}
            aria-label="Company"
          >
            <option value="">All companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        )}

        {years.length > 0 && (
          <select
            name="year"
            value={filters.year ? String(filters.year) : ""}
            onChange={(event) => apply({ ...filters, year: event.target.value ? Number(event.target.value) : undefined })}
            className={`input ${companies.length ? "col-span-2" : ""} lg:col-span-2 ${active(filters.year)}`}
            aria-label="Year"
          >
            <option value="">Any year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {hasActiveFilters(filters) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                if (chip.remove.search === undefined && filters.search) {
                  // Clear the box too, or the pending search would re-apply it.
                  lastSearch.current = "";
                  setSearch("");
                }
                navigate(libraryHref(chip.remove));
              }}
              className="flex items-center gap-1.5 rounded-full bg-pen px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-pen-dark"
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              lastSearch.current = "";
              setSearch("");
              navigate(libraryHref({ domain: ALL_DOMAINS }));
            }}
            className="px-2 py-1.5 text-sm font-semibold text-pen hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
