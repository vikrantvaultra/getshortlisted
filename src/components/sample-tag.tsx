/**
 * Admin-only provenance label. Marks hardcoded content written for this build
 * so an operator can tell it apart from a real approved submission at a glance.
 * Never rendered on a buyer-facing page — see ModelResumeTag for that.
 */
export function SampleTag({ className = "ml-2" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center rounded-md bg-wash px-1.5 py-0.5 align-middle font-mono text-[0.65rem] font-medium tracking-wide text-soft uppercase ring-1 ring-edge`}
      title="Written for this build — not a real person's resume"
    >
      Sample
    </span>
  );
}

/**
 * Buyer-facing label for the same content. These resumes are written to show
 * the structure a shortlisted resume has, so they're sold as model resumes —
 * never as a real person's, and never next to an "Offer verified" badge.
 */
export function ModelResumeTag({ className = "ml-2" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center rounded-md bg-wash px-2 py-0.5 align-middle font-mono text-[0.65rem] font-medium tracking-wide text-soft uppercase ring-1 ring-edge`}
      title="Written by us to show the structure and specificity that clears a screen"
    >
      Model resume
    </span>
  );
}
