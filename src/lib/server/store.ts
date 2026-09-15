import type { CollegeTier, Level, ProductId } from "@/config";
import type { LibraryResume } from "@/data/types";
import { SAMPLE_SUBMISSIONS, sampleProofSvg } from "@/data/sample-submissions";
import { randomId, randomToken } from "./crypto";

/**
 * The app's only state. There is deliberately no database: everything lives
 * in this process's memory and starts from the hardcoded seed data in
 * src/data. Restarting the server resets it.
 *
 * Mirrors the tables in the original data model (submissions, resumes, scans,
 * waitlist, orders) so moving to Postgres later is a mechanical change.
 */

export type StoredFile = { id: string; name: string; mime: string; bytes: Uint8Array };

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  createdAt: string;
  status: SubmissionStatus;
  fileId: string | null;
  proofId: string;
  /** Needed for review and anonymisation. Deleted along with the submission. */
  extractedText: string;
  pageCount: number;
  company: string;
  role: string;
  year: number;
  level: Level;
  college: string;
  city: string;
  submitterEmail: string;
  consentCorpus: boolean;
  consentPublic: boolean;
  rejectReason: string | null;
  reviewedAt: string | null;
  deleteToken: string;
  /** Hardcoded demo submission, not a real person. */
  sample: boolean;
  /** Phrase hashes added to the index on approval, so deletion can decrement exactly those. */
  indexedHashes: string[] | null;
  resumeId: string | null;
};

export type ApprovedResume = LibraryResume & { submissionId: string; createdAt: string; collegeTier: CollegeTier };

/** Twin Score runs. Never holds the resume, its text, or its lines. */
export type Scan = {
  id: string;
  createdAt: string;
  commonCount: number;
  totalCount: number;
  percentage: number;
  phraseCount: number;
  matchedCount: number;
  ipHash: string;
  referrer: string | null;
  shareCardGenerated: boolean;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  createdAt: string;
  source: string;
  targetCompany: string | null;
};

export type Order = {
  id: string;
  email: string;
  product: ProductId;
  amountPaise: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: "created" | "paid" | "failed";
  createdAt: string;
};

type State = {
  submissions: Map<string, Submission>;
  files: Map<string, StoredFile>;
  resumes: Map<string, ApprovedResume>;
  scans: Scan[];
  waitlist: WaitlistEntry[];
  orders: Map<string, Order>;
  rateLimits: Map<string, { count: number; resetAt: number }>;
  /** Phrase doc_counts contributed by approved submissions, on top of the committed seed index. */
  phraseOverlay: Map<string, number>;
  overlayDocuments: { verified: number; sample: number };
  startedAt: string;
};

function createState(): State {
  const state: State = {
    submissions: new Map(),
    files: new Map(),
    resumes: new Map(),
    scans: [],
    waitlist: [],
    orders: new Map(),
    rateLimits: new Map(),
    phraseOverlay: new Map(),
    overlayDocuments: { verified: 0, sample: 0 },
    startedAt: new Date().toISOString(),
  };

  for (const sample of SAMPLE_SUBMISSIONS) {
    const proofId = randomId("file");
    state.files.set(proofId, {
      id: proofId,
      name: `${sample.id}-offer-proof.svg`,
      mime: "image/svg+xml",
      bytes: new TextEncoder().encode(sampleProofSvg(sample.company, sample.role, sample.year)),
    });
    state.submissions.set(sample.id, {
      ...sample,
      status: "pending",
      fileId: null,
      proofId,
      rejectReason: null,
      reviewedAt: null,
      deleteToken: randomToken(),
      sample: true,
      indexedHashes: null,
      resumeId: null,
    });
  }

  return state;
}

// Survives Next.js dev hot reloads; one instance per server process.
const globalStore = globalThis as unknown as { __getShortlistedState?: State };

export function store(): State {
  globalStore.__getShortlistedState ??= createState();
  return globalStore.__getShortlistedState;
}

export function saveFile(name: string, mime: string, bytes: Uint8Array): string {
  const id = randomId("file");
  store().files.set(id, { id, name, mime, bytes });
  return id;
}
