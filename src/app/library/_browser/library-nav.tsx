"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useTransition } from "react";

type Navigate = (href: string, options?: { replace?: boolean; scrollToResults?: boolean }) => void;

const LibraryNavContext = createContext<{ navigate: Navigate; pending: boolean } | null>(null);

/**
 * Shares one navigation transition between the filter bar, the results and
 * the pagination, so the results can dim while the next page loads.
 */
export function LibraryNav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback<Navigate>(
    (href, options = {}) => {
      if (options.scrollToResults) document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      startTransition(() => {
        if (options.replace) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [router],
  );

  return <LibraryNavContext.Provider value={{ navigate, pending }}>{children}</LibraryNavContext.Provider>;
}

export function useLibraryNav() {
  const context = useContext(LibraryNavContext);
  if (!context) throw new Error("useLibraryNav must be used inside <LibraryNav>");
  return context;
}

/** Dims the results while a filter or page change is loading. */
export function ResultsFrame({ children }: { children: React.ReactNode }) {
  const { pending } = useLibraryNav();
  return (
    <div id="results" aria-busy={pending} className="relative scroll-mt-24">
      {pending && (
        <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center">
          <span className="fade flex items-center gap-2 rounded-full bg-text px-4 py-2 text-sm font-semibold text-white shadow-lg">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Updating…
          </span>
        </div>
      )}
      <div className={`transition-opacity duration-200 ${pending ? "pointer-events-none opacity-40" : "opacity-100"}`}>{children}</div>
    </div>
  );
}
