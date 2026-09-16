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

/**
 * Both products unlock exactly the same thing — Compare and the full Library.
 * They differ only in how long access lasts, so the choice is a price anchor,
 * never a feature gate. Keep it that way: a tier that withheld a feature would
 * make the cheaper price a bait.
 */
export const PRODUCTS = {
  pass: {
    id: "pass",
    name: "30-day pass",
    pricePaise: 4900,
    accessDays: 30,
    lifetime: false,
    description: "Compare your resume with five built to the shortlisted standard, and read every resume in the library.",
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime access",
    pricePaise: 19900,
    /**
     * "Lifetime" is sold as the lifetime of the service, which is what the
     * copy says. 100 years is simply a far-future expiry — the access cookie
     * is capped at MAX_COOKIE_DAYS regardless, and a buyer re-opens access on
     * any device with their email + order ID via /unlock?restore=1.
     */
    accessDays: 365 * 100,
    lifetime: true,
    description: "Compare your resume with five built to the shortlisted standard, and read every resume in the library. No expiry.",
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;

/** The pass a buyer gets by default, and the price every other tier anchors against. */
export const BASE_PRODUCT: ProductId = "pass";

/**
 * Browsers cap cookie lifetime near 400 days (Chrome enforces it), so a
 * lifetime grant can't live in the cookie alone. Access is restored from
 * Razorpay instead; this constant keeps us honest with what we set.
 */
export const MAX_COOKIE_DAYS = 400;

/**
 * Smallest number of passes that costs strictly more than the given product.
 * Drives the anchor line, so the claim stays true if either price changes.
 */
export function passesToBeat(product: ProductId): number {
  return Math.floor(PRODUCTS[product].pricePaise / PRODUCTS.pass.pricePaise) + 1;
}

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
