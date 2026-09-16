import type { CollegeTier, Level } from "@/config";

/**
 * An approved, anonymised resume as shown in the Library and Compare.
 *
 * `redactedText` format: one line per bullet or entry. Section headers are on
 * their own line in CAPS (e.g. "PROJECTS"). Bullets start with "• ".
 * No names, phones, emails, URLs, or dates finer than a year.
 */
export type LibraryResume = {
  id: string;
  /**
   * Job domain, using the open datasets' labels ("Teacher", "Java Developer";
   * see DOMAIN_FIELDS). This is what a scanned resume is matched on.
   */
  domain: string;
  /** Null for open-dataset resumes, which aren't written for a company. */
  company: string | null;
  role: string;
  year: number | null;
  level: Level;
  collegeTier: CollegeTier;
  city: string | null;
  pageCount: number;
  redactedText: string;
  /** Offer proof was checked by the admin. */
  verified: boolean;
  /**
   * Written by us rather than submitted by a candidate — there is no real
   * person and no offer behind it. Sold to buyers as a "Model resume", shown
   * as "Sample" in admin, and never counted as a real verified resume in any
   * denominator. Must never render the "Offer verified" badge: see
   * src/app/library/[id]/page.tsx.
   */
  sample: boolean;
  /**
   * model        written by us for a company and role
   * open-dataset an AI-generated resume from an openly licensed dataset
   * submission   a real candidate's resume, approved by an admin
   */
  origin: ResumeOrigin;
  /** Open-dataset resumes: where it came from, for attribution. */
  source?: { dataset: string; license: string; url: string };
};

export type ResumeOrigin = "model" | "open-dataset" | "submission";
