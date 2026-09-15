import type { CollegeTier } from "@/config";
import { indexSubmissionText, unindexSubmission } from "./phrase-index";
import { randomId } from "./crypto";
import { store, type Submission } from "./store";

export function listSubmissions(): Submission[] {
  return [...store().submissions.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSubmission(id: string): Submission | undefined {
  return store().submissions.get(id);
}

export function findByDeleteToken(token: string): Submission | undefined {
  return [...store().submissions.values()].find((submission) => submission.deleteToken === token);
}

export type ApproveInput = { redactedText: string; collegeTier: CollegeTier };

/**
 * Approve = offer proof verified. Each consent is applied on its own:
 *   consentCorpus → the redacted text is indexed (source 'submission')
 *   consentPublic → the redacted text is published to the Library
 */
export function approveSubmission(id: string, input: ApproveInput): Submission {
  const submission = store().submissions.get(id);
  if (!submission) throw new Error("Submission not found.");
  if (submission.status !== "pending") throw new Error(`Submission is already ${submission.status}.`);
  const redactedText = input.redactedText.trim();
  if (!redactedText) throw new Error("Redacted text is empty.");

  const kind = submission.sample ? "sample" : "verified";
  if (submission.consentCorpus) submission.indexedHashes = indexSubmissionText(redactedText, kind);

  if (submission.consentPublic) {
    const resumeId = randomId("res");
    store().resumes.set(resumeId, {
      id: resumeId,
      submissionId: submission.id,
      createdAt: new Date().toISOString(),
      company: submission.company,
      role: submission.role,
      year: submission.year,
      level: submission.level,
      collegeTier: input.collegeTier,
      city: submission.city,
      pageCount: submission.pageCount,
      redactedText,
      verified: true,
      sample: submission.sample,
    });
    submission.resumeId = resumeId;
  }

  submission.status = "approved";
  submission.reviewedAt = new Date().toISOString();
  // The original file and proof aren't needed once reviewed; keep only the redacted outputs.
  purgeFiles(submission);
  return submission;
}

/** Rejected submissions keep their metadata (for the record) but lose the documents and text. */
export function rejectSubmission(id: string, reason: string): Submission {
  const submission = store().submissions.get(id);
  if (!submission) throw new Error("Submission not found.");
  if (submission.status !== "pending") throw new Error(`Submission is already ${submission.status}.`);
  submission.status = "rejected";
  submission.rejectReason = reason.trim() || "No reason given";
  submission.reviewedAt = new Date().toISOString();
  submission.extractedText = "";
  purgeFiles(submission);
  return submission;
}

/** Hard delete: submission, files, published resume, and its phrase counts. */
export function deleteSubmission(id: string) {
  const submission = store().submissions.get(id);
  if (!submission) return;
  if (submission.indexedHashes) unindexSubmission(submission.indexedHashes, submission.sample ? "sample" : "verified");
  if (submission.resumeId) store().resumes.delete(submission.resumeId);
  purgeFiles(submission);
  store().submissions.delete(id);
}

function purgeFiles(submission: Submission) {
  if (submission.fileId) store().files.delete(submission.fileId);
  // Samples keep their generated proof so the demo stays reviewable.
  if (!submission.sample) store().files.delete(submission.proofId);
}
