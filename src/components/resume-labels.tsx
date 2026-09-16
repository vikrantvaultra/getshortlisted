import { ShieldIcon } from "@/components/icons";

/** Stands in for the person's name on every published resume. */
export const ANONYMOUS_CANDIDATE = "Anonymous candidate";

export function VerifiedBadge({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`chip bg-[#effaf3] text-[#0b6b35] ${compact ? "px-2 py-0.5 text-xs" : ""} ${className}`}>
      <ShieldIcon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> Offer verified
    </span>
  );
}
