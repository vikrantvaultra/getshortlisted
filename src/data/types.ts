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
  company: string;
  role: string;
  year: number;
  level: Level;
  collegeTier: CollegeTier;
  city: string;
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
};
