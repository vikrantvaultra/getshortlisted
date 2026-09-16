import type { IndexStats } from "@/lib/server/phrase-index";

const n = (value: number) => value.toLocaleString("en-IN");
const plural = (value: number, one: string, many: string) => `${n(value)} ${value === 1 ? one : many}`;

/** Public denominator: the exact total, never rounded. */
export function indexSentence(stats: IndexStats): string {
  return `Measured against ${plural(stats.totalDocuments, "resume", "resumes")}.`;
}

/** Admin-only: the same total broken down by source. */
export function indexBreakdown(stats: IndexStats): string {
  const parts = [
    `${n(stats.openRealDocuments)} real (open datasets)`,
    `${n(stats.openSyntheticDocuments)} generated examples (open datasets)`,
    `${n(stats.seedDocuments)} generated reference`,
    `${n(stats.verifiedDocuments)} real verified submissions`,
  ];
  if (stats.sampleDocuments > 0) parts.push(`${n(stats.sampleDocuments)} demo`);
  return `Index: ${plural(stats.totalDocuments, "resume", "resumes")} (${parts.join(", ")}).`;
}

export function IndexStatement({ stats, className = "" }: { stats: IndexStats; className?: string }) {
  return <p className={className}>{indexSentence(stats)}</p>;
}
