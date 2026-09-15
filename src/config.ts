/**
 * Every tunable number in the product lives here. Change a value, restart,
 * done — nothing else in the codebase hardcodes these.
 */

// ─── Twin Score ──────────────────────────────────────────────────────────────

export const SCORING = {
  /** Words per shingle. Changing this invalidates the index: re-run `npm run corpus:ingest -- --rebuild`. */
  SHINGLE_SIZE: 5,
  /** Lines with fewer words than this are ignored (headers, dates, contact rows). */
  MIN_LINE_WORDS: 5,
  /** A shingle counts as "seen" when at least this many distinct documents contain it. */
  MIN_DOC_COUNT: 2,
  /** A line is "common" when at least this share of its shingles are "seen". */
  COMMON_LINE_RATIO: 0.6,
  /**
   * Comma/pipe-separated lists ("Python, Java, SQL, Git, Docker") are not
   * sentences. Scoring them would inflate the result with skill lists, so
   * they are dropped the same way short lines are.
   */
  DROP_LIST_LINES: true,
  /** A line is a list when it has this many separators and its chunks average ≤ LIST_MAX_WORDS_PER_ITEM words. */
  LIST_MIN_SEPARATORS: 3,
  LIST_MAX_WORDS_PER_ITEM: 2.5,
} as const;

// ─── Uploads ─────────────────────────────────────────────────────────────────

export const UPLOADS = {
  /**
   * Per-file limit. Note: Vercel serverless functions reject request bodies
   * over 4.5 MB before this check runs, and the submission form sends the
   * resume and the proof in one request.
   */
  MAX_BYTES: 5 * 1024 * 1024,
  /** Lines rendered onto the share card at most. */
  SHARE_CARD_MAX_LINES: 34,
} as const;

// ─── Rate limits (per hashed IP, fixed window) ───────────────────────────────

export const RATE_LIMITS = {
  upload: { limit: 5, windowSeconds: 60 * 60 },
  form: { limit: 20, windowSeconds: 60 * 60 },
  /** The paste-one-line checker on the home page. */
  lineCheck: { limit: 60, windowSeconds: 60 * 60 },
  shareCard: { limit: 30, windowSeconds: 60 * 60 },
  adminLogin: { limit: 10, windowSeconds: 15 * 60 },
  payment: { limit: 20, windowSeconds: 60 * 60 },
  /** `next dev` would lock you out after five test uploads. Production always enforces. */
  enforceInDevelopment: false,
} as const;

// ─── Paid features (v2) ──────────────────────────────────────────────────────

export const PRODUCTS = {
  /** One price unlocks everything paid: Compare and the full Library. */
  pass: {
    id: "pass",
    name: "Full access",
    pricePaise: 4900,
    accessDays: 30,
    description: "Compare your resume with five that got the offer, and read every resume in the library.",
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;

export const LIBRARY = {
  /** Resume cards per page. */
  PAGE_SIZE: 9,
  /** Wait this long after typing stops before searching. */
  SEARCH_DEBOUNCE_MS: 350,
} as const;

export const COMPARE = {
  /** Resumes placed next to the user's. Companies with fewer are not offered. */
  SET_SIZE: 5,
  /** Against a set of five, one containing document is enough for a shingle to count. */
  OVERLAP_MIN_DOCS: 1,
} as const;

// ─── Site ────────────────────────────────────────────────────────────────────

export const SITE = {
  name: "Get Shortlisted",
  domain: "getshortlisted.in",
  contactEmail: "hello@getshortlisted.in",
  grievanceEmail: "privacy@getshortlisted.in",
  emailFrom: "Get Shortlisted <hello@getshortlisted.in>",
} as const;

export const LEVELS = ["fresher", "experienced"] as const;
export type Level = (typeof LEVELS)[number];

export const COLLEGE_TIERS = ["Tier 1", "Tier 2", "Tier 3", "Not disclosed"] as const;
export type CollegeTier = (typeof COLLEGE_TIERS)[number];

export const EARLIEST_OFFER_YEAR = 2018;
