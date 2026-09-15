import { NextResponse, type NextRequest } from "next/server";
import { EARLIEST_OFFER_YEAR, LEVELS, UPLOADS, type Level } from "@/config";
import { extractResumeUpload, UploadError } from "@/lib/extract/extract";
import { detectFileType, MIME_TYPES, PROOF_TYPES } from "@/lib/extract/magic";
import { randomId, randomToken } from "@/lib/server/crypto";
import { sendSubmissionConfirmation } from "@/lib/server/email";
import { cleanText, isEmail, jsonError, rateLimit } from "@/lib/server/request";
import { saveFile, store } from "@/lib/server/store";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: NextRequest) {
  const { blocked } = rateLimit(request, "upload");
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("That upload didn't come through. If the files are large, try smaller ones.");
  }

  const resume = form.get("resume");
  const proof = form.get("proof");
  if (!(resume instanceof File)) return jsonError("Add your resume.");
  if (!(proof instanceof File)) return jsonError("Add your offer proof.");

  const company = cleanText(form.get("company"), 80);
  const role = cleanText(form.get("role"), 80);
  const year = Number(form.get("year"));
  const level = form.get("level") as Level;
  const email = cleanText(form.get("email"), 254).toLowerCase();
  const college = cleanText(form.get("college"), 120);
  const city = cleanText(form.get("city"), 60);
  // Each consent is read separately. Anything other than the exact string "true" means no.
  const consentCorpus = form.get("consentCorpus") === "true";
  const consentPublic = form.get("consentPublic") === "true";

  if (!company || !role) return jsonError("Add the company and role.");
  if (!Number.isInteger(year) || year < EARLIEST_OFFER_YEAR || year > new Date().getFullYear() + 1) {
    return jsonError("Choose the year of the offer.");
  }
  if (!LEVELS.includes(level)) return jsonError("Choose fresher or experienced.");
  if (!isEmail(email)) return jsonError("That email doesn't look right.");
  if (!consentCorpus && !consentPublic) {
    return jsonError("Tick at least one box — otherwise there's nothing we're allowed to do with your resume.");
  }

  try {
    const resumeBytes = new Uint8Array(await resume.arrayBuffer());
    const extracted = await extractResumeUpload(resumeBytes);

    const proofBytes = new Uint8Array(await proof.arrayBuffer());
    if (proofBytes.byteLength > UPLOADS.MAX_BYTES) return jsonError("The offer proof is over 5 MB.", 413);
    const proofType = detectFileType(proofBytes);
    if (!proofType || !PROOF_TYPES.includes(proofType)) {
      return jsonError("Offer proof must be a screenshot (PNG, JPG, WebP) or a PDF.", 415);
    }

    const id = randomId("sub");
    const deleteToken = randomToken();
    store().submissions.set(id, {
      id,
      createdAt: new Date().toISOString(),
      status: "pending",
      fileId: saveFile(`${id}-resume.${extracted.type}`, MIME_TYPES[extracted.type as "pdf" | "docx"], resumeBytes),
      proofId: saveFile(`${id}-proof.${proofType}`, MIME_TYPES[proofType], proofBytes),
      extractedText: extracted.text,
      pageCount: extracted.pageCount,
      company,
      role,
      year,
      level,
      college,
      city,
      submitterEmail: email,
      consentCorpus,
      consentPublic,
      rejectReason: null,
      reviewedAt: null,
      deleteToken,
      sample: false,
      indexedHashes: null,
      resumeId: null,
    });

    const emailed = await sendSubmissionConfirmation(email, deleteToken, company);
    return NextResponse.json({ ok: true, deletePath: `/delete/${deleteToken}`, emailed });
  } catch (error) {
    if (error instanceof UploadError) return jsonError(error.message, error.status);
    console.error("[submit] unexpected failure");
    return jsonError("Something went wrong saving your submission. Please try again.", 500);
  }
}
