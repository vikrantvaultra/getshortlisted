import type { Level } from "@/config";
import type { ProfileTerm } from "@/lib/domain-terms";
import type { FieldId } from "@/lib/fields";

/** Shape of data/library/open-library.json, written by scripts/build-library.ts. */

/** The middle half of a measure across a domain's resumes. */
export type MeasureRange = { low: number; median: number; high: number; n: number };

export type DomainStats = {
  pageCount: MeasureRange | null;
  sectionCount: MeasureRange | null;
  projects: MeasureRange | null;
  bulletsPerProject: MeasureRange | null;
  averageWordsPerLine: MeasureRange | null;
  totalBullets: MeasureRange | null;
  wordCount: MeasureRange | null;
};

export type DomainEntry = {
  slug: string;
  /** Dataset label, e.g. "Nurse Practitioner". Display it through domainLabel(). */
  domain: string;
  field: FieldId;
  /** Resumes in the corpus for this domain, by kind. */
  real: number;
  synthetic: number;
  /** Enough resumes for a reliable profile; others can be picked but aren't auto-matched. */
  detectable: boolean;
  /** Set when this domain has too few readable resumes: the closest domain that has them. */
  readableFrom: string | null;
  /** Other domains, most similar first, same field ahead of the rest. */
  similar: string[];
  stats: DomainStats;
  profile: ProfileTerm[];
};

/** An AI-generated resume from an open dataset. Never a real person's. */
export type OpenResume = {
  id: string;
  domain: string;
  source: string;
  level: Level;
  pageCount: number;
  text: string;
};

export type OpenLibraryFile = {
  generatedAt: string;
  sources: Record<string, { dataset: string; license: string; url: string; kind: "real" | "synthetic" }>;
  domains: DomainEntry[];
  resumes: OpenResume[];
};
