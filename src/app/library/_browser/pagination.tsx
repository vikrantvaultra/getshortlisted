"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { libraryHref, type LibraryFilters } from "@/lib/library-query";
import { useLibraryNav } from "./library-nav";

type Props = { filters: LibraryFilters; page: number; pageCount: number };

/** 1 … 4 5 6 … 10 — always first, last, and the pages around the current one. */
function pageItems(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    const previous = sorted[i - 1];
    if (previous !== undefined && p - previous > 1) items.push(p - previous === 2 ? previous + 1 : "gap");
    items.push(p);
  });
  return items;
}

/** Real links (work without JavaScript), enhanced to load in place and scroll to the results. */
export function Pagination({ filters, page, pageCount }: Props) {
  const { navigate } = useLibraryNav();
  if (pageCount <= 1) return null;

  const go = (event: React.MouseEvent<HTMLAnchorElement>, target: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; // let "open in new tab" work
    event.preventDefault();
    navigate(libraryHref(filters, target), { scrollToResults: true });
  };

  const edge = "flex h-11 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-between gap-2 sm:justify-center">
      {page > 1 ? (
        <a href={libraryHref(filters, page - 1)} onClick={(e) => go(e, page - 1)} className={`${edge} border border-edge-strong bg-white hover:border-text`} rel="prev">
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </a>
      ) : (
        <span className={`${edge} border border-edge text-faint`} aria-hidden>
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      <ol className="flex items-center gap-1">
        {pageItems(page, pageCount).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`} className="w-6 text-center font-mono text-faint" aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span aria-current="page" className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-text px-2 font-mono text-sm font-medium text-white">
                  {item}
                </span>
              ) : (
                <a
                  href={libraryHref(filters, item)}
                  onClick={(e) => go(e, item)}
                  className="flex h-11 min-w-11 items-center justify-center rounded-xl px-2 font-mono text-sm font-medium text-soft transition-colors hover:bg-wash hover:text-text"
                  aria-label={`Page ${item}`}
                >
                  {item}
                </a>
              )}
            </li>
          ),
        )}
      </ol>

      {page < pageCount ? (
        <a href={libraryHref(filters, page + 1)} onClick={(e) => go(e, page + 1)} className={`${edge} bg-pen text-white hover:bg-pen-dark`} rel="next">
          <span className="hidden sm:inline">Next</span>
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      ) : (
        <span className={`${edge} border border-edge text-faint`} aria-hidden>
          <span className="hidden sm:inline">Next</span>
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
