import Link from "next/link";

/** Wordmark: "shortlisted" with its middle run under a marker stroke. */
export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2 font-display text-[1.2rem] sm:text-[1.35rem] leading-none whitespace-nowrap font-extrabold tracking-tight" aria-label="Get Shortlisted — home">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[0.6rem] bg-pen text-white shadow-[0_3px_0_#1b3fd6] transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      </span>
      <span>
        get<span className="marker ml-[0.06em]">shortlisted</span>
      </span>
    </Link>
  );
}
